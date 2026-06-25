import crypto from 'crypto'
import Razorpay from 'razorpay'
import FreelancerProfile from '../models/FreelancerProfile.js'
import FreelanceJob from '../models/FreelanceJob.js'

const SERVICE_FEE_RATE = 10
const cleanSkills = (value) => {
  const values = Array.isArray(value) ? value : String(value || '').split(',')
  return [...new Set(values.map(item => item.trim()).filter(Boolean))].slice(0, 20)
}
const getRazorpay = () => {
  const keyId = process.env.RAZORPAY_KEY_ID?.trim()
  const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim()
  if (!keyId || !keySecret) {
    const err = new Error('Razorpay keys are missing. Add them before accepting freelance escrow payments.')
    err.status = 500
    throw err
  }
  return { keyId, instance: new Razorpay({ key_id: keyId, key_secret: keySecret }) }
}

export const upsertFreelancerProfile = async (req, res) => {
  try {
    const required = ['name', 'email', 'whatsapp', 'city', 'title', 'bio', 'experience']
    const missing = required.filter(key => !String(req.body[key] || '').trim())
    if (missing.length) return res.status(400).json({ success: false, message: `Missing: ${missing.join(', ')}` })

    const profile = await FreelancerProfile.findOneAndUpdate(
      { user: req.user._id },
      {
        ...req.body,
        user: req.user._id,
        skills: cleanSkills(req.body.skills),
        hourlyRate: Math.max(Number(req.body.hourlyRate) || 0, 0),
        status: 'pending',
      },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    )
    res.status(201).json({ success: true, profile, message: 'Freelancer profile submitted for Earnova verification.' })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

export const getMyFreelancerProfile = async (req, res) => {
  try {
    const profile = await FreelancerProfile.findOne({ user: req.user._id }).lean()
    res.json({ success: true, profile })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

export const createJob = async (req, res) => {
  try {
    const required = ['clientName', 'clientEmail', 'clientWhatsapp', 'title', 'category', 'description', 'duration']
    const missing = required.filter(key => !String(req.body[key] || '').trim())
    const freelancerAmount = Math.round(Number(req.body.freelancerAmount))
    if (missing.length) return res.status(400).json({ success: false, message: `Missing: ${missing.join(', ')}` })
    if (!Number.isFinite(freelancerAmount) || freelancerAmount < 100) {
      return res.status(400).json({ success: false, message: 'Job amount must be at least ₹100.' })
    }

    const serviceFee = Math.round(freelancerAmount * SERVICE_FEE_RATE / 100)
    const job = await FreelanceJob.create({
      ...req.body,
      client: req.user._id,
      skills: cleanSkills(req.body.skills),
      freelancerAmount,
      serviceFeeRate: SERVICE_FEE_RATE,
      serviceFee,
      totalPayable: freelancerAmount + serviceFee,
      statusHistory: [{ status: 'awaiting-payment', note: 'Job created. Escrow payment is pending.' }],
    })
    res.status(201).json({ success: true, job, message: 'Job created. Complete escrow payment to publish it.' })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

export const createJobPaymentOrder = async (req, res) => {
  try {
    const job = await FreelanceJob.findOne({ _id: req.params.id, client: req.user._id })
    if (!job) return res.status(404).json({ success: false, message: 'Job not found.' })
    if (job.paymentStatus !== 'pending') return res.status(400).json({ success: false, message: 'This job is already funded.' })

    const { keyId, instance } = getRazorpay()
    const order = await instance.orders.create({
      amount: job.totalPayable * 100,
      currency: 'INR',
      receipt: job.jobId,
      notes: { jobId: job.jobId, purpose: 'freelance-escrow' },
    })
    job.razorpayOrderId = order.id
    await job.save()
    res.json({ success: true, orderId: order.id, amount: order.amount, currency: order.currency, keyId, jobId: job.jobId })
  } catch (err) {
    res.status(err.status || err.statusCode || 500).json({ success: false, message: err.message })
  }
}

export const verifyJobPayment = async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body
    const job = await FreelanceJob.findOne({ _id: req.params.id, client: req.user._id, razorpayOrderId })
    if (!job) return res.status(404).json({ success: false, message: 'Job payment record not found.' })
    const expected = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`).digest('hex')
    if (expected !== razorpaySignature) return res.status(400).json({ success: false, message: 'Payment verification failed.' })

    job.razorpayPaymentId = razorpayPaymentId
    job.razorpaySignature = razorpaySignature
    job.paymentStatus = 'paid-to-escrow'
    job.status = 'open'
    job.fundedAt = new Date()
    job.statusHistory.push({ status: 'open', note: 'Full job amount and Earnova service fee received into escrow.' })
    await job.save()
    res.json({ success: true, job, message: 'Payment secured. Your job is now live.' })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

export const getMyJobs = async (req, res) => {
  try {
    const jobs = await FreelanceJob.find({ client: req.user._id }).sort('-createdAt').lean()
    res.json({ success: true, jobs })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

export const releaseCompletedJob = async (req, res) => {
  try {
    const job = await FreelanceJob.findById(req.params.id)
    if (!job) return res.status(404).json({ success: false, message: 'Job not found.' })
    if (job.paymentStatus !== 'paid-to-escrow' || !['in-progress', 'submitted'].includes(job.status)) {
      return res.status(400).json({ success: false, message: 'Only funded, completed work can be released.' })
    }

    job.paymentStatus = 'released'
    job.status = 'completed'
    job.completedAt = job.completedAt || new Date()
    job.releasedAt = new Date()
    job.statusHistory.push({
      status: 'completed',
      note: `₹${job.freelancerAmount.toLocaleString('en-IN')} marked as released to the freelancer.`,
    })
    await job.save()
    res.json({ success: true, job, message: 'Freelancer payment marked as released.' })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}
