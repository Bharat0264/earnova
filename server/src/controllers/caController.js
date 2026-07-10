import crypto from 'crypto'
import Razorpay from 'razorpay'
import CAProfile from '../models/CAProfile.js'
import CATaxJob from '../models/CATaxJob.js'
import User from '../models/User.js'
import Withdrawal from '../models/Withdrawal.js'

const EARNOVA_CA_FEE = 49

const CA_SERVICE_PACKAGES = {
  'simple-salaried': {
    label: 'Simple salaried',
    amount: 1250,
    amountMax: 1250,
  },
  'investors-traders': {
    label: 'Investors & Traders',
    amount: 3000,
    amountMax: 3000,
  },
  'freelancers-small-business': {
    label: 'Freelancers & Small Business',
    amount: 4250,
    amountMax: 4250,
  },
  'corporate-tax-audits': {
    label: 'Corporate and Tax Audits',
    amount: 15000,
    amountMax: 50000,
  },
}

const getPackage = value => CA_SERVICE_PACKAGES[value] ? value : 'simple-salaried'

const getRazorpay = () => {
  const keyId = process.env.RAZORPAY_KEY_ID?.trim()
  const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim()
  if (!keyId || !keySecret) {
    const err = new Error('Razorpay keys are missing. Add them before accepting CA service payments.')
    err.status = 500
    throw err
  }
  return { keyId, instance: new Razorpay({ key_id: keyId, key_secret: keySecret }) }
}

const splitList = value => {
  const values = Array.isArray(value) ? value : String(value || '').split(',')
  return [...new Set(values.map(item => item.trim()).filter(Boolean))].slice(0, 30)
}

const cleanDocuments = value => {
  const docs = Array.isArray(value) ? value : []
  return docs
    .map(doc => ({
      label: String(doc?.label || '').trim(),
      url: String(doc?.url || '').trim(),
    }))
    .filter(doc => doc.label && doc.url)
    .slice(0, 30)
}

const toNumber = value => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

const getVerifiedCAProfileForUser = async (userId) => {
  const profile = await CAProfile.findOne({ user: userId })
  if (!profile) {
    const err = new Error('Create your Earnova CA profile before accessing assigned work.')
    err.status = 404
    throw err
  }
  if (profile.status !== 'verified') {
    const err = new Error('Your CA profile must be verified by admin before assigned work is available.')
    err.status = 403
    throw err
  }
  return profile
}

const getCAWalletTotals = async (profileId, userId) => {
  const [earnedAgg, withdrawnAgg] = await Promise.all([
    CATaxJob.aggregate([
      { $match: { assignedCA: profileId, caPayoutCreditedAt: { $ne: null } } },
      { $group: { _id: null, total: { $sum: '$caPayoutAmount' } } },
    ]),
    Withdrawal.aggregate([
      { $match: { user: userId, source: 'ca', status: { $ne: 'failed' } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
  ])

  const totalEarned = earnedAgg[0]?.total || 0
  const heldOrPaid = withdrawnAgg[0]?.total || 0
  return {
    totalEarned,
    walletBalance: Math.max(totalEarned - heldOrPaid, 0),
  }
}

export const upsertCAProfile = async (req, res) => {
  try {
    const required = [
      'name', 'email', 'whatsapp', 'city', 'state', 'membershipNumber',
      'qualification', 'govtIdType', 'idCardUrl', 'govtIdUrl', 'caCertificateUrl',
    ]
    const missing = required.filter(key => !String(req.body[key] || '').trim())
    if (missing.length) {
      return res.status(400).json({ success: false, message: `Missing: ${missing.join(', ')}` })
    }
    if (req.body.consentToVerify !== true) {
      return res.status(400).json({ success: false, message: 'Verification consent is required.' })
    }

    const profile = await CAProfile.findOneAndUpdate(
      { user: req.user._id },
      {
        ...req.body,
        user: req.user._id,
        email: String(req.body.email).toLowerCase().trim(),
        yearsExperience: Math.max(toNumber(req.body.yearsExperience), 0),
        specializations: splitList(req.body.specializations),
        servicesOffered: splitList(req.body.servicesOffered),
        status: 'pending',
        verifiedAt: null,
        verifiedBy: null,
      },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    )

    res.status(201).json({
      success: true,
      profile,
      message: 'CA application submitted. Earnova admin will manually verify the documents and WhatsApp details.',
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

export const getMyCAProfile = async (req, res) => {
  try {
    const profile = await CAProfile.findOne({ user: req.user._id }).lean()
    res.json({ success: true, profile })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

export const createTaxJob = async (req, res) => {
  try {
    const required = ['clientName', 'clientEmail', 'clientWhatsapp', 'pan', 'assessmentYear']
    const missing = required.filter(key => !String(req.body[key] || '').trim())
    if (missing.length) {
      return res.status(400).json({ success: false, message: `Missing: ${missing.join(', ')}` })
    }

    const servicePackage = getPackage(req.body.servicePackage)
    const pricing = CA_SERVICE_PACKAGES[servicePackage]
    const isAdminClient = req.user?.role === 'admin'
    const caPayoutAmount = Math.max(pricing.amount - EARNOVA_CA_FEE, 0)
    const caPayoutAmountMax = Math.max(pricing.amountMax - EARNOVA_CA_FEE, 0)

    const job = await CATaxJob.create({
      ...req.body,
      client: req.user._id,
      servicePackage,
      serviceLabel: pricing.label,
      serviceAmount: pricing.amount,
      serviceAmountMax: pricing.amountMax,
      earnovaFee: EARNOVA_CA_FEE,
      caPayoutAmount,
      caPayoutAmountMax,
      paymentStatus: isAdminClient ? 'admin-waived' : 'pending',
      clientEmail: String(req.body.clientEmail).toLowerCase().trim(),
      pan: String(req.body.pan).toUpperCase().trim(),
      aadhaarLast4: String(req.body.aadhaarLast4 || '').trim().slice(-4),
      incomeSources: splitList(req.body.incomeSources),
      documents: cleanDocuments(req.body.documents),
      bankInterest: Math.max(toNumber(req.body.bankInterest), 0),
      capitalGains: toNumber(req.body.capitalGains),
      rentalIncome: toNumber(req.body.rentalIncome),
      businessIncome: toNumber(req.body.businessIncome),
      foreignIncome: toNumber(req.body.foreignIncome),
      deductions80C: Math.max(toNumber(req.body.deductions80C), 0),
      deductions80D: Math.max(toNumber(req.body.deductions80D), 0),
      homeLoanInterest: Math.max(toNumber(req.body.homeLoanInterest), 0),
      turnover: Math.max(toNumber(req.body.turnover), 0),
      statusHistory: [{
        status: 'submitted',
        note: isAdminClient
          ? 'Admin submitted CA work without payment requirement.'
          : `Client submitted tax/accounting work. CA service payment is pending. Earnova fee is ₹${EARNOVA_CA_FEE} inside the package price.`,
      }],
    })

    res.status(201).json({
      success: true,
      job,
      message: isAdminClient
        ? 'Tax work submitted. Earnova will assign a verified CA after document review.'
        : 'Tax work submitted. Complete Razorpay payment to activate CA review.',
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

export const createTaxJobPaymentOrder = async (req, res) => {
  try {
    const job = await CATaxJob.findOne({ _id: req.params.id, client: req.user._id })
    if (!job) return res.status(404).json({ success: false, message: 'CA tax job not found.' })
    if (req.user?.role === 'admin' || job.paymentStatus === 'admin-waived') {
      return res.status(400).json({ success: false, message: 'Admin-created CA jobs do not require payment.' })
    }
    if (job.paymentStatus !== 'pending') {
      return res.status(400).json({ success: false, message: 'This CA service payment is already completed.' })
    }

    const { keyId, instance } = getRazorpay()
    const order = await instance.orders.create({
      amount: job.serviceAmount * 100,
      currency: 'INR',
      receipt: job.jobId,
      notes: {
        jobId: job.jobId,
        purpose: 'ca-service-payment',
        package: job.servicePackage,
        earnovaFee: String(job.earnovaFee),
        caPayout: String(job.caPayoutAmount),
      },
    })

    job.razorpayOrderId = order.id
    await job.save()

    res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId,
      jobId: job.jobId,
    })
  } catch (err) {
    res.status(err.status || err.statusCode || 500).json({ success: false, message: err.message })
  }
}

export const verifyTaxJobPayment = async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body
    const job = await CATaxJob.findOne({ _id: req.params.id, client: req.user._id, razorpayOrderId })
    if (!job) return res.status(404).json({ success: false, message: 'CA payment record not found.' })

    const expected = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex')
    if (expected !== razorpaySignature) {
      return res.status(400).json({ success: false, message: 'Payment verification failed.' })
    }

    job.razorpayPaymentId = razorpayPaymentId
    job.razorpaySignature = razorpaySignature
    job.paymentStatus = 'paid'
    job.paidAt = new Date()
    job.statusHistory.push({
      status: 'submitted',
      note: `CA service payment received for ${job.serviceLabel}. Earnova keeps ₹${job.earnovaFee}; verified CA payout is ₹${job.caPayoutAmount}.`,
    })
    await job.save()

    res.json({ success: true, job, message: 'Payment confirmed. Earnova CA review is now active.' })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

export const getMyTaxJobs = async (req, res) => {
  try {
    const jobs = await CATaxJob.find({ client: req.user._id })
      .populate('assignedCA', 'name email whatsapp firmName membershipNumber city state status')
      .sort('-createdAt')
      .lean()
    res.json({ success: true, jobs })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

export const getMyCAWork = async (req, res) => {
  try {
    const profile = await CAProfile.findOne({ user: req.user._id }).lean()
    if (!profile) {
      return res.json({
        success: true,
        profile: null,
        jobs: [],
        withdrawals: [],
        walletBalance: 0,
        totalEarned: 0,
      })
    }

    const [jobs, withdrawals, walletTotals] = await Promise.all([
      CATaxJob.find({ assignedCA: profile._id })
        .populate('client', 'name email phone')
        .sort('-updatedAt')
        .lean(),
      Withdrawal.find({ user: req.user._id, source: 'ca' })
        .sort('-createdAt')
        .limit(50)
        .lean(),
      getCAWalletTotals(profile._id, req.user._id),
    ])

    res.json({
      success: true,
      profile,
      jobs,
      withdrawals,
      walletBalance: walletTotals.walletBalance,
      totalEarned: walletTotals.totalEarned,
    })
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message })
  }
}

export const submitAssignedTaxJob = async (req, res) => {
  try {
    const profile = await getVerifiedCAProfileForUser(req.user._id)
    const job = await CATaxJob.findOne({ _id: req.params.id, assignedCA: profile._id })
    if (!job) return res.status(404).json({ success: false, message: 'Assigned CA tax job not found.' })
    if (!['paid', 'admin-waived'].includes(job.paymentStatus)) {
      return res.status(400).json({ success: false, message: 'CA payout can be credited only after client payment is confirmed.' })
    }
    if (job.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Cancelled CA work cannot be submitted.' })
    }

    const completionDocuments = cleanDocuments(req.body.completionDocuments)
    job.status = 'completed'
    job.completedAt = job.completedAt || new Date()
    job.caNotes = String(req.body.caNotes || job.caNotes || '').trim()
    job.completionNotes = String(req.body.completionNotes || '').trim()
    job.completionDocuments = completionDocuments

    if (!job.caPayoutCreditedAt) {
      await User.findByIdAndUpdate(req.user._id, { $inc: { walletBalance: job.caPayoutAmount || 0 } })
      job.caPayoutCreditedAt = new Date()
      job.statusHistory.push({
        status: 'completed',
        note: `CA submitted completed work. CA wallet credited INR ${job.caPayoutAmount || 0}.`,
      })
    } else {
      job.statusHistory.push({ status: 'completed', note: 'CA resubmitted completion details.' })
    }

    await job.save()

    const updatedUser = await User.findById(req.user._id).select('-password')
    res.json({
      success: true,
      job,
      user: updatedUser?.toPublicJSON ? updatedUser.toPublicJSON() : updatedUser,
      message: 'Work submitted. CA payout has been added to your wallet.',
    })
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message })
  }
}

export const requestCAWithdrawal = async (req, res) => {
  try {
    const profile = await getVerifiedCAProfileForUser(req.user._id)
    const { amount, upiId, accountName } = req.body
    const user = await User.findById(req.user._id)
    const numAmount = Number(amount)
    const walletTotals = await getCAWalletTotals(profile._id, req.user._id)

    if (!numAmount || numAmount < 100) {
      return res.status(400).json({ success: false, message: 'Minimum withdrawal amount is INR 100.' })
    }
    if (numAmount > walletTotals.walletBalance || numAmount > user.walletBalance) {
      return res.status(400).json({
        success: false,
        message: `Insufficient CA wallet balance. Available: INR ${walletTotals.walletBalance}.`,
      })
    }
    if (!upiId?.trim() || !accountName?.trim()) {
      return res.status(400).json({ success: false, message: 'UPI ID and account holder name are required.' })
    }

    user.walletBalance -= numAmount
    await user.save()

    const withdrawal = await Withdrawal.create({
      user: user._id,
      source: 'ca',
      caProfile: profile._id,
      amount: numAmount,
      upiId: upiId.trim(),
      accountName: accountName.trim(),
    })

    res.status(201).json({
      success: true,
      withdrawal,
      newBalance: user.walletBalance,
      message: 'CA withdrawal request submitted. Admin will pay your UPI account and update the status.',
    })
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message })
  }
}
