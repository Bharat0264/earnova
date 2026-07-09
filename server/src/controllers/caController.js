import CAProfile from '../models/CAProfile.js'
import CATaxJob from '../models/CATaxJob.js'

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

    const job = await CATaxJob.create({
      ...req.body,
      client: req.user._id,
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
      statusHistory: [{ status: 'submitted', note: 'Client submitted tax/accounting work for Earnova CA review.' }],
    })

    res.status(201).json({
      success: true,
      job,
      message: 'Tax work submitted. Earnova will assign a verified CA after document review.',
    })
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
