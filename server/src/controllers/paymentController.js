import crypto   from 'crypto'
import Razorpay from 'razorpay'
import Order    from '../models/Order.js'
import User     from '../models/User.js'
import Product  from '../models/Product.js'
import CATaxJob from '../models/CATaxJob.js'
import ProjectListing from '../models/ProjectListing.js'
import PaymentAttempt from '../models/PaymentAttempt.js'
import BusinessSubscription from '../models/BusinessSubscription.js'
import { sendOrderConfirmation } from '../utils/email.js'

const requireRazorpayConfig = () => {
  const keyId = process.env.RAZORPAY_KEY_ID?.trim()
  const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim()

  if (!keyId || !keySecret) {
    const err = new Error(
      'Razorpay keys are missing. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in Render Environment Variables.'
    )
    err.status = 500
    throw err
  }

  return { keyId, keySecret }
}

const getRazorpay = () => {
  const { keyId, keySecret } = requireRazorpayConfig()
  return new Razorpay({
    key_id:     keyId,
    key_secret: keySecret,
  })
}

const paymentSetupMessage = (err) => {
  if (err?.statusCode === 401 || err?.status === 401) {
    return 'Razorpay authentication failed. Check RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in server/.env.'
  }
  return err.message || 'Could not initiate payment. Please try again.'
}

/* ── Pricing helpers ── */
const calcAmounts = (cartItems) => {
  const subtotal = cartItems.reduce((s, i) => s + i.price * i.quantity, 0)
  return { subtotal, gst: 0, shipping: 0, total: subtotal }
}

const hydrateCartItems = async (cartItems, userId) => {
  const serviceItems = await Promise.all(cartItems
    .filter(item => item.itemType === 'service' || item.serviceKey)
    .map(async item => {
      if (item.serviceKey === BUSINESS_CART_SERVICE.serviceKey || item._id === BUSINESS_CART_SERVICE._id) {
        return { ...BUSINESS_CART_SERVICE }
      }

      if (item.serviceKey === 'caTaxJob') {
        const taxJobId = item.taxJobId || item.serviceRef
        const job = await CATaxJob.findOne({ _id: taxJobId, client: userId })
        if (!job) throw new Error('CA tax job not found for this cart item.')
        if (job.paymentStatus !== 'pending') throw new Error('This CA service payment is already completed or unavailable.')

        return {
          _id: `earnova-ca-service-${job._id}`,
          itemType: 'service',
          serviceKey: 'caTaxJob',
          serviceRef: job._id.toString(),
          name: `Earnova CA Services - ${job.serviceLabel}`,
          image: '/favicon.svg',
          price: job.serviceAmount,
          quantity: 1,
          gstRate: 0,
          category: 'earnova-services',
          memberIncome: 0,
          referralCommission: 0,
        }
      }

      if (item.serviceKey === 'projectListing') {
        const listingId = item.projectListingId || item.serviceRef
        const listing = await ProjectListing.findOne({ _id: listingId, status: 'approved' })
        if (!listing) throw new Error('Project listing is unavailable or already sold.')

        return {
          _id: `earnova-project-${listing._id}`,
          itemType: 'service',
          serviceKey: 'projectListing',
          serviceRef: listing._id.toString(),
          buyerWhatsapp: String(item.buyerWhatsapp || '').trim(),
          name: `Earnova Project - ${listing.title}`,
          image: '/favicon.svg',
          price: listing.price,
          quantity: 1,
          gstRate: 0,
          category: 'earnova-projects',
          memberIncome: 0,
          referralCommission: 0,
        }
      }

      throw new Error(`Service unavailable: ${item.name || item.serviceKey || item._id}`)
    }))

  const ids = cartItems
    .filter(item => !(item.itemType === 'service' || item.serviceKey))
    .map(i => i._id || i.product)
    .filter(Boolean)
  const products = await Product.find({ _id: { $in: ids }, isActive: true }).lean()
  const byId = new Map(products.map(p => [p._id.toString(), p]))

  const productItems = cartItems
    .filter(item => !(item.itemType === 'service' || item.serviceKey))
    .map(item => {
    const product = byId.get(String(item._id || item.product))
    if (!product) throw new Error(`Product unavailable: ${item.name || item._id}`)
    const quantity = Math.max(Number(item.quantity) || 1, 1)
    return {
      product: product._id,
      itemType: 'product',
      name: product.name,
      image: product.thumbnail || product.images?.[0] || '',
      price: product.price,
      quantity,
      gstRate: product.gstRate ?? 18,
      category: product.category,
      memberIncome: product.referralIncome || 0,
      referralCommission: product.referralCommission ?? 5,
    }
  })

  return [...productItems, ...serviceItems]
}

const hasEcommerceMemberBenefits = (user) => {
  if (user?.role === 'admin') return true
  const access = user?.featureAccess
  return access instanceof Map ? access.get('ecommerce') === true : access?.ecommerce === true
}

const BUSINESS_SUBSCRIPTION_PRICE = 19
const BUSINESS_CART_SERVICE = {
  _id: 'earnova-business-solutions-monthly',
  itemType: 'service',
  serviceKey: 'businessSolutions',
  name: 'Earnova Business Solutions - Monthly Access',
  image: '/favicon.svg',
  price: BUSINESS_SUBSCRIPTION_PRICE,
  quantity: 1,
  gstRate: 0,
  category: 'earnova-services',
  memberIncome: 0,
  referralCommission: 0,
}

const activateBusinessSubscription = async ({ user, razorpayOrderId, razorpayPaymentId }) => {
  const current = await BusinessSubscription.findOne({ user: user._id })
  const now = new Date()
  const startsAt = current?.expiresAt && current.expiresAt > now ? current.expiresAt : now
  const expiresAt = new Date(startsAt.getTime() + 30 * 24 * 60 * 60 * 1000)
  const subscription = await BusinessSubscription.findOneAndUpdate(
    { user: user._id },
    {
      user: user._id,
      plan: 'business-solutions-monthly',
      amount: BUSINESS_SUBSCRIPTION_PRICE,
      status: 'active',
      startsAt: now,
      expiresAt,
      razorpayOrderId,
      razorpayPaymentId,
    },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  )
  user.featureAccess.set('businessSolutions', true)
  user.businessAccessExpiresAt = expiresAt
  await user.save()
  return subscription
}

/* ────────────────────────────────────────
   POST /api/payment/create-order
────────────────────────────────────────── */
export const createRazorpayOrder = async (req, res) => {
  try {
    const { cartItems } = req.body
    if (!cartItems?.length) {
      return res.status(400).json({ success: false, message: 'Cart is empty.' })
    }

    const dbCartItems = await hydrateCartItems(cartItems, req.user._id)
    const { total } = calcAmounts(dbCartItems)
    const { keyId } = requireRazorpayConfig()
    const instance  = getRazorpay()

    const rzpOrder = await instance.orders.create({
      amount:   total * 100,   // paise
      currency: 'INR',
      receipt:  `earn_${Date.now()}`,
      notes: {
        userId: req.user._id.toString(),
        cartType: dbCartItems.some(item => item.itemType === 'service') ? 'service-cart' : 'product-cart',
        services: dbCartItems.filter(item => item.serviceKey).map(item => item.serviceKey).join(','),
      },
    })

    await PaymentAttempt.create({
      razorpayOrderId: rzpOrder.id,
      user: req.user._id,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
      cartItems: dbCartItems,
    })

    res.json({
      success:  true,
      orderId:  rzpOrder.id,
      amount:   rzpOrder.amount,
      currency: rzpOrder.currency,
      keyId,
    })
  } catch (err) {
    const message = paymentSetupMessage(err)
    console.error('[Payment] create-order failed:', message)
    res.status(err.status || err.statusCode || 500).json({ success: false, message })
  }
}

/* ────────────────────────────────────────
   POST /api/payment/verify
────────────────────────────────────────── */
export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      shippingAddress,
    } = req.body

    /* 1. Verify Razorpay signature */
    const expected = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex')

    if (expected !== razorpaySignature) {
      return res.status(400).json({ success: false, message: 'Payment verification failed. Signature mismatch.' })
    }

    const attempt = await PaymentAttempt.findOne({ razorpayOrderId, user: req.user._id })
    if (!attempt) return res.status(404).json({ success: false, message: 'Payment order was not created for this account.' })
    const payment = await getRazorpay().payments.fetch(razorpayPaymentId)
    if (payment.order_id !== razorpayOrderId || Number(payment.amount) !== Number(attempt.amount) || payment.currency !== attempt.currency || !['authorized', 'captured'].includes(payment.status)) {
      return res.status(400).json({ success: false, message: 'Razorpay payment details do not match this order.' })
    }

    /* 2. Resume safely when the browser retries verification. */
    const existing = await Order.findOne({ razorpayPaymentId })
    if (existing && attempt.status === 'fulfilled') {
      const includesBusiness = existing.items?.some(item => item.serviceKey === 'businessSolutions')
      const refreshedUser = includesBusiness ? await User.findById(req.user._id) : null
      return res.json({ success: true, order: existing, user: refreshedUser?.toPublicJSON(), message: 'Payment was already completed.' })
    }

    /* 3. Calculate amounts */
    const dbCartItems = attempt.cartItems
    const { subtotal, gst, shipping, total } = calcAmounts(dbCartItems)

    /* 4. Determine referral info */
    const fullUser = await User.findById(req.user._id)
    const memberIncomeRecipient = hasEcommerceMemberBenefits(fullUser) ? 'member' : 'admin'
    const includesBusinessAccess = dbCartItems.some(item => item.serviceKey === 'businessSolutions')
    const caTaxJobRefs = dbCartItems
      .filter(item => item.serviceKey === 'caTaxJob' && item.serviceRef)
      .map(item => item.serviceRef)
    const projectPurchases = dbCartItems
      .filter(item => item.serviceKey === 'projectListing' && item.serviceRef)
      .map(item => ({ listingId: item.serviceRef, buyerWhatsapp: item.buyerWhatsapp }))

    /* 5. Create DB order */
    const order = existing || await Order.create({
      user:    req.user._id,
      items:   dbCartItems.map(item => ({
        product:  item.product,
        itemType: item.itemType || 'product',
        serviceKey: item.serviceKey,
        serviceRef: item.serviceRef,
        buyerWhatsapp: item.buyerWhatsapp,
        name:     item.name,
        image:    item.image,
        price:    item.price,
        quantity: item.quantity,
        gstRate:  item.gstRate ?? 18,
        category: item.category,
        memberIncome: item.memberIncome,
      })),
      subtotal,
      gstAmount:      gst,
      shippingCharge: shipping,
      total,
      shippingAddress,
      paymentMethod:      'razorpay',
      paymentStatus:      'paid',
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      status:        'processing',
      processedAt:   new Date(),
      statusHistory: [{ status: 'processing', note: 'Payment verified and captured via Razorpay.' }],
      referredBy:    fullUser.referredBy || null,
      memberIncomeRecipient,
    })

    /* 6. Credit referral commission */
    if (fullUser.referredBy && !order.commissionPaid) {
      const avgCommission = dbCartItems.reduce(
        (s, i) => s + ((i.referralCommission ?? 5) * i.price * i.quantity) / 100, 0
      )
      const commission = Math.round(avgCommission)
      await User.findByIdAndUpdate(fullUser.referredBy, {
        $inc: { referralEarnings: commission, walletBalance: commission },
      })
      order.commissionRate   = 5
      order.commissionAmount = commission
      order.commissionPaid   = true
      await order.save()
    }

    if (includesBusinessAccess) {
      await activateBusinessSubscription({ user: fullUser, razorpayOrderId, razorpayPaymentId })
      order.statusHistory.push({ status: 'processing', note: 'Business Solutions access enabled after Razorpay confirmation.' })
      await order.save()
    }

    if (caTaxJobRefs.length) {
      const jobs = await CATaxJob.find({ _id: { $in: caTaxJobRefs }, client: req.user._id, paymentStatus: 'pending' })
      for (const job of jobs) {
        job.razorpayOrderId = razorpayOrderId
        job.razorpayPaymentId = razorpayPaymentId
        job.razorpaySignature = razorpaySignature
        job.paymentStatus = 'paid'
        job.assignedCA = job.selectedCA
        job.paidAt = new Date()
        job.statusHistory.push({
          status: 'submitted',
          note: `CA service payment received through cart for ${job.serviceLabel}. Earnova keeps ₹${job.earnovaFee}; verified CA payout is ₹${job.caPayoutAmount}.`,
        })
        await job.save()
      }
      order.statusHistory.push({ status: 'processing', note: 'CA service payment confirmed after Razorpay cart checkout.' })
      await order.save()
    }

    if (projectPurchases.length) {
      for (const purchase of projectPurchases) {
        const listing = await ProjectListing.findOneAndUpdate(
          { _id: purchase.listingId, status: 'approved' },
          {
            $set: {
              status: 'sold',
              soldAt: new Date(),
              buyer: req.user._id,
              buyerName: fullUser.name,
              buyerEmail: fullUser.email,
              buyerWhatsapp: purchase.buyerWhatsapp || fullUser.phone || '',
              razorpayOrderId,
              razorpayPaymentId,
              razorpaySignature,
              sellerCreditedAt: new Date(),
            },
          },
          { new: true }
        )

        if (listing) {
          await User.findByIdAndUpdate(listing.seller, {
            $inc: { walletBalance: listing.sellerPayout || 0 },
          })
          order.statusHistory.push({
            status: 'processing',
            note: `Project ${listing.listingId} sold. Seller wallet credited INR ${listing.sellerPayout || 0}. Buyer WhatsApp: ${listing.buyerWhatsapp || 'not provided'}.`,
          })
          await order.save()
        }
      }
    }

    order.status = 'processing'
    order.processedAt = order.processedAt || new Date()
    await order.save()

    attempt.razorpayPaymentId = razorpayPaymentId
    attempt.status = 'fulfilled'
    attempt.paidAt = attempt.paidAt || new Date()
    attempt.fulfilledAt = new Date()
    attempt.order = order._id
    await attempt.save()

    /* 7. Send confirmation email (non-blocking) */
    sendOrderConfirmation(order, fullUser)
      .catch(err => console.warn('[Email] order-confirm failed:', err.message))

    res.status(existing ? 200 : 201).json({ success: true, order, user: includesBusinessAccess ? fullUser.toPublicJSON() : undefined })
  } catch (err) {
    console.error('[Payment] verify failed:', err.message)
    res.status(500).json({ success: false, message: 'Order creation failed: ' + err.message })
  }
}

export const createCodOrder = async (req, res) => {
  try {
    const { shippingAddress, cartItems } = req.body
    if (!cartItems?.length) {
      return res.status(400).json({ success: false, message: 'Cart is empty.' })
    }

    const dbCartItems = await hydrateCartItems(cartItems, req.user._id)
    const nonSolar = dbCartItems.find(item => item.category !== 'solar-panels')
    if (nonSolar) {
      return res.status(400).json({
        success: false,
        message: 'Pay on delivery is available only for solar products. Please use prepaid payment for other items.',
      })
    }

    const { subtotal, gst, shipping, total } = calcAmounts(dbCartItems)
    const fullUser = await User.findById(req.user._id)
    const memberIncomeRecipient = hasEcommerceMemberBenefits(fullUser) ? 'member' : 'admin'

    const order = await Order.create({
      user: req.user._id,
      items: dbCartItems.map(item => ({
        product: item.product,
        name: item.name,
        image: item.image,
        price: item.price,
        quantity: item.quantity,
        gstRate: item.gstRate ?? 18,
        category: item.category,
        memberIncome: item.memberIncome,
      })),
      subtotal,
      gstAmount: gst,
      shippingCharge: shipping,
      total,
      shippingAddress,
      paymentMethod: 'cod',
      paymentStatus: 'pending',
      status: 'placed',
      statusHistory: [{ status: 'placed', note: 'Pay on delivery order received' }],
      referredBy: fullUser.referredBy || null,
      memberIncomeRecipient,
    })

    sendOrderConfirmation(order, fullUser)
      .catch(err => console.warn('[Email] order-confirm failed:', err.message))

    res.status(201).json({ success: true, order })
  } catch (err) {
    console.error('[Payment] cod-order failed:', err.message)
    res.status(500).json({ success: false, message: 'Order creation failed: ' + err.message })
  }
}

/* ────────────────────────────────────────
   POST /api/payment/webhook
   Raw body required — configured in route
────────────────────────────────────────── */
export const createBusinessSubscriptionOrder = async (req, res) => {
  try {
    const { keyId } = requireRazorpayConfig()
    const instance = getRazorpay()

    const rzpOrder = await instance.orders.create({
      amount: BUSINESS_SUBSCRIPTION_PRICE * 100,
      currency: 'INR',
      receipt: `earn_biz_${Date.now()}`,
      notes: {
        userId: req.user._id.toString(),
        userEmail: req.user.email || '',
        userPhone: req.user.phone || '',
        plan: 'business-solutions-monthly',
        service: 'Earnova Business Solutions',
        billingCycle: 'monthly',
      },
    })

    res.json({
      success: true,
      orderId: rzpOrder.id,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
      keyId,
    })
  } catch (err) {
    const message = paymentSetupMessage(err)
    console.error('[Payment] business subscription create failed:', message)
    res.status(err.status || err.statusCode || 500).json({ success: false, message })
  }
}

export const verifyBusinessSubscription = async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({ success: false, message: 'Payment details are missing.' })
    }

    const expected = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex')

    if (expected !== razorpaySignature) {
      return res.status(400).json({ success: false, message: 'Payment verification failed. Signature mismatch.' })
    }

    const instance = getRazorpay()
    const [payment, order] = await Promise.all([
      instance.payments.fetch(razorpayPaymentId),
      instance.orders.fetch(razorpayOrderId),
    ])
    if (payment.order_id !== razorpayOrderId || Number(payment.amount) !== BUSINESS_SUBSCRIPTION_PRICE * 100 || !['authorized', 'captured'].includes(payment.status) || String(order.notes?.userId || '') !== req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Subscription payment does not match this account or plan.' })
    }

    const user = await User.findById(req.user._id)
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' })

    const subscriptionRecord = await activateBusinessSubscription({ user, razorpayOrderId, razorpayPaymentId })

    res.json({
      success: true,
      user: user.toPublicJSON(),
      subscription: {
        plan: 'business-solutions-monthly',
        amount: BUSINESS_SUBSCRIPTION_PRICE,
        paymentId: razorpayPaymentId,
        status: 'active',
        startsAt: subscriptionRecord.startsAt,
        expiresAt: subscriptionRecord.expiresAt,
      },
    })
  } catch (err) {
    console.error('[Payment] business subscription verify failed:', err.message)
    res.status(500).json({ success: false, message: 'Subscription activation failed: ' + err.message })
  }
}

export const handleWebhook = async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature']
    if (!signature || !process.env.RAZORPAY_WEBHOOK_SECRET) {
      return res.status(400).json({ message: 'Webhook signature configuration is missing.' })
    }
    const expected  = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET || '')
      .update(req.body)
      .digest('hex')

    if (expected !== signature) {
      return res.status(400).json({ message: 'Invalid webhook signature' })
    }

    const event = JSON.parse(req.body.toString())

    switch (event.event) {
      case 'payment.captured': {
        const paymentEntity = event.payload.payment.entity
        const paymentId = paymentEntity.id
        await PaymentAttempt.findOneAndUpdate(
          { razorpayOrderId: paymentEntity.order_id },
          { status: 'paid', razorpayPaymentId: paymentId, paidAt: new Date() }
        )
        await Order.findOneAndUpdate(
          { razorpayPaymentId: paymentId },
          { paymentStatus: 'paid', status: 'processing',
            $push: { statusHistory: { status: 'processing', note: 'Payment captured via webhook' } } }
        )
        break
      }
      case 'payment.failed': {
        const paymentEntity = event.payload.payment.entity
        const paymentId = paymentEntity.id
        await PaymentAttempt.findOneAndUpdate(
          { razorpayOrderId: paymentEntity.order_id },
          { status: 'failed', razorpayPaymentId: paymentId }
        )
        await Order.findOneAndUpdate(
          { razorpayPaymentId: paymentId },
          { paymentStatus: 'failed',
            $push: { statusHistory: { status: 'cancelled', note: 'Payment failed' } } }
        )
        break
      }
      default:
        break
    }

    res.status(200).json({ received: true })
  } catch (err) {
    console.error('[Webhook] error:', err.message)
    res.status(500).json({ message: err.message })
  }
}
