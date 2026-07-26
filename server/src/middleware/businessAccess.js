import mongoose from 'mongoose'
import Business from '../models/Business.js'
import BusinessMember from '../models/BusinessMember.js'

export const loadBusinessAccess = async (req, res, next) => {
  try {
    const businessId = req.params.businessId
    if (!mongoose.isValidObjectId(businessId)) {
      return res.status(400).json({ success: false, message: 'Invalid business ID.' })
    }

    const business = await Business.findOne({ _id: businessId, status: 'active' })
    if (!business) return res.status(404).json({ success: false, message: 'Business not found.' })

    if (req.user.role === 'admin') {
      req.business = business
      req.businessMembership = { role: 'admin', status: 'active' }
      return next()
    }

    const membership = await BusinessMember.findOne({
      business: business._id,
      user: req.user._id,
      status: 'active',
    })
    if (!membership) {
      return res.status(403).json({ success: false, message: 'You do not have access to this business.' })
    }

    req.business = business
    req.businessMembership = membership
    next()
  } catch (error) {
    console.error('[Business access]', error.message)
    res.status(500).json({ success: false, message: 'Could not verify business access.' })
  }
}

export const requireBusinessRole = (...roles) => (req, res, next) => {
  if (req.user?.role === 'admin' || roles.includes(req.businessMembership?.role)) return next()
  return res.status(403).json({ success: false, message: 'Your business role cannot perform this action.' })
}
