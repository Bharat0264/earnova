import crypto   from 'crypto'
import Razorpay from 'razorpay'
import Order    from '../models/Order.js'
import User     from '../models/User.js'
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

/* ────────────────────────────────────────
   POST /api/payment/create-order
────────────────────────────────────────── */
export const createRazorpayOrder = async (req, res) => {
  try {
    const { cartItems } = req.body
    if (!cartItems?.length) {
      return res.status(400).json({ success: false, message: 'Cart is empty.' })
    }

    const { total } = calcAmounts(cartItems)
    const { keyId } = requireRazorpayConfig()
    const instance  = getRazorpay()

    const rzpOrder = await instance.orders.create({
      amount:   total * 100,   // paise
      currency: 'INR',
      receipt:  `earn_${Date.now()}`,
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
      cartItems,
    } = req.body

    /* 1. Verify Razorpay signature */
    const expected = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex')

    if (expected !== razorpaySignature) {
      return res.status(400).json({ success: false, message: 'Payment verification failed. Signature mismatch.' })
    }

    /* 2. Prevent duplicate orders */
    const existing = await Order.findOne({ razorpayPaymentId })
    if (existing) {
      return res.json({ success: true, order: existing, message: 'Order already exists.' })
    }

    /* 3. Calculate amounts */
    const { subtotal, gst, shipping, total } = calcAmounts(cartItems)

    /* 4. Determine referral info */
    const fullUser = await User.findById(req.user._id)

    /* 5. Create DB order */
    const order = await Order.create({
      user:    req.user._id,
      items:   cartItems.map(item => ({
        product:  item._id,
        name:     item.name,
        image:    item.thumbnail || item.images?.[0] || '',
        price:    item.price,
        quantity: item.quantity,
        gstRate:  item.gstRate ?? 18,
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
      status:        'placed',
      statusHistory: [{ status: 'placed', note: 'Paid via Razorpay' }],
      referredBy:    fullUser.referredBy || null,
    })

    /* 6. Credit referral commission */
    if (fullUser.referredBy) {
      const avgCommission = cartItems.reduce(
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

    /* 7. Send confirmation email (non-blocking) */
    sendOrderConfirmation(order, fullUser)
      .catch(err => console.warn('[Email] order-confirm failed:', err.message))

    res.status(201).json({ success: true, order })
  } catch (err) {
    console.error('[Payment] verify failed:', err.message)
    res.status(500).json({ success: false, message: 'Order creation failed: ' + err.message })
  }
}

/* ────────────────────────────────────────
   POST /api/payment/webhook
   Raw body required — configured in route
────────────────────────────────────────── */
export const handleWebhook = async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature']
    const expected  = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET || '')
      .update(req.body)
      .digest('hex')

    if (signature && expected !== signature) {
      return res.status(400).json({ message: 'Invalid webhook signature' })
    }

    const event = JSON.parse(req.body.toString())

    switch (event.event) {
      case 'payment.captured': {
        const paymentId = event.payload.payment.entity.id
        await Order.findOneAndUpdate(
          { razorpayPaymentId: paymentId },
          { paymentStatus: 'paid', status: 'processing',
            $push: { statusHistory: { status: 'processing', note: 'Payment captured via webhook' } } }
        )
        break
      }
      case 'payment.failed': {
        const paymentId = event.payload.payment.entity.id
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
