import ProjectListing from '../models/ProjectListing.js'

const splitList = value => {
  const values = Array.isArray(value) ? value : String(value || '').split(',')
  return [...new Set(values.map(item => item.trim()).filter(Boolean))].slice(0, 30)
}

const toAmount = value => Math.round(Number(value) || 0)

const SELLER_FEE = 0

export const submitProjectListing = async (req, res) => {
  try {
    const required = [
      'sellerName', 'sellerEmail', 'sellerWhatsapp', 'title', 'category',
      'shortDescription', 'details', 'liveDemoUrl', 'documentationSummary', 'price',
    ]
    const missing = required.filter(key => !String(req.body[key] || '').trim())
    const price = toAmount(req.body.price)

    if (missing.length) return res.status(400).json({ success: false, message: `Missing: ${missing.join(', ')}` })
    if (price < 100) return res.status(400).json({ success: false, message: 'Project price must be at least INR 100.' })

    const earnovaFee = SELLER_FEE
    const listing = await ProjectListing.create({
      seller: req.user._id,
      sellerName: String(req.body.sellerName).trim(),
      sellerEmail: String(req.body.sellerEmail).toLowerCase().trim(),
      sellerWhatsapp: String(req.body.sellerWhatsapp).trim(),
      title: String(req.body.title).trim(),
      category: String(req.body.category).trim(),
      shortDescription: String(req.body.shortDescription).trim(),
      details: String(req.body.details).trim(),
      techStack: splitList(req.body.techStack),
      liveDemoUrl: String(req.body.liveDemoUrl).trim(),
      documentationSummary: String(req.body.documentationSummary).trim(),
      documentationUrl: String(req.body.documentationUrl || '').trim(),
      deliveryNotes: String(req.body.deliveryNotes || '').trim(),
      price,
      earnovaFee,
      sellerPayout: Math.max(price - earnovaFee, 0),
      status: 'pending',
    })

    res.status(201).json({
      success: true,
      listing,
      message: 'Project submitted for Earnova admin approval. Share the live working demo on WhatsApp for faster review.',
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

export const getApprovedProjects = async (_req, res) => {
  try {
    const projects = await ProjectListing.find({ status: 'approved' })
      .select('-razorpaySignature -buyerWhatsapp')
      .sort('-approvedAt -createdAt')
      .lean()
    res.json({ success: true, projects })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

export const getProjectListing = async (req, res) => {
  try {
    const listing = await ProjectListing.findOne({ _id: req.params.id, status: { $in: ['approved', 'sold'] } })
      .select('-razorpaySignature -buyerWhatsapp')
      .lean()
    if (!listing) return res.status(404).json({ success: false, message: 'Project listing not found.' })
    res.json({ success: true, listing })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

export const getMyProjectListings = async (req, res) => {
  try {
    const listings = await ProjectListing.find({ seller: req.user._id })
      .sort('-createdAt')
      .lean()
    res.json({ success: true, listings })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}
