import Business from '../models/Business.js'
import AuditLog from '../models/AuditLog.js'

const STATUSES = ['pending', 'under_review', 'verified', 'rejected', 'suspended']

export const listBusinessVerifications = async (req, res, next) => {
  try {
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1)
    const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 50))
    const filter = {}
    if (req.query.status && req.query.status !== 'all') filter.verificationStatus = req.query.status
    if (req.query.q) {
      const query = new RegExp(String(req.query.q).trim(), 'i')
      filter.$or = [{ name: query }, { industry: query }, { gstin: query }, { email: query }, { phone: query }]
    }

    const [businesses, total] = await Promise.all([
      Business.find(filter)
        .populate('owner', 'name email phone')
        .populate('reviewedBy verifiedBy', 'name email')
        .sort({ updatedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Business.countDocuments(filter),
    ])

    res.json({
      success: true,
      businesses: businesses.map(item => ({
        ...item,
        verificationStatus: item.verificationStatus || 'pending',
        verificationSubmittedAt: item.verificationSubmittedAt || item.createdAt,
      })),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    })
  } catch (error) {
    next(error)
  }
}

export const updateBusinessVerification = async (req, res, next) => {
  try {
    const status = String(req.body.status || '').trim()
    const note = String(req.body.note || '').trim()
    if (!STATUSES.includes(status)) {
      return res.status(400).json({ success: false, message: 'Choose a valid business verification status.' })
    }
    if (['rejected', 'suspended'].includes(status) && !note) {
      return res.status(400).json({ success: false, message: 'A review note is required when rejecting or suspending a business.' })
    }

    const now = new Date()
    const update = {
      verificationStatus: status,
      verificationNote: note,
      reviewedAt: now,
      reviewedBy: req.user._id,
      verifiedAt: status === 'verified' ? now : null,
      verifiedBy: status === 'verified' ? req.user._id : null,
    }
    const business = await Business.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true })
      .populate('owner', 'name email phone')
      .populate('reviewedBy verifiedBy', 'name email')
    if (!business) return res.status(404).json({ success: false, message: 'Business not found.' })

    await AuditLog.create({
      actor: req.user._id,
      action: 'business.verification_updated',
      resourceType: 'Business',
      resourceId: business._id,
      summary: `Business verification changed to ${status.replace('_', ' ')}`,
      requestId: req.id,
      metadata: { status },
    })
    res.json({ success: true, business })
  } catch (error) {
    next(error)
  }
}
