import mongoose from 'mongoose'
import Business from '../models/Business.js'
import BusinessMember from '../models/BusinessMember.js'
import CAFirm from '../models/CAFirm.js'
import CAFirmMember from '../models/CAFirmMember.js'
import CACaseAssignment from '../models/CACaseAssignment.js'

const FIRM_ADMIN_ROLES = new Set(['firm_owner', 'firm_administrator'])

export const isValidObjectId = value => mongoose.Types.ObjectId.isValid(value)

export const buildCustomerCaseScope = (userId, businessIds = []) => ({
  $or: [
    { customer: userId },
    ...(businessIds.length ? [{ business: { $in: businessIds } }] : []),
  ],
})

export const canFirmMemberAccessCase = ({ member, firm, assignedMemberIds = [] }) => {
  if (!member || member.status !== 'active') return false
  if (String(member.firm) !== String(firm?._id || firm)) return false
  if (FIRM_ADMIN_ROLES.has(member.platformRole)) return true
  return assignedMemberIds.map(String).includes(String(member._id))
}

export const getAuthorizedBusinessIds = async userId => {
  const [owned, memberships] = await Promise.all([
    Business.find({ owner: userId, status: 'active' }).distinct('_id'),
    BusinessMember.find({ user: userId, status: 'active' }).distinct('business'),
  ])
  return [...new Set([...owned, ...memberships].map(String))]
}

export const userCanAccessBusiness = async (userId, businessId) => {
  if (!isValidObjectId(businessId)) return false
  const count = await Promise.all([
    Business.countDocuments({ _id: businessId, owner: userId, status: 'active' }),
    BusinessMember.countDocuments({ business: businessId, user: userId, status: 'active' }),
  ])
  return count.some(Boolean)
}

export const getActiveFirmMembership = userId =>
  CAFirmMember.findOne({ user: userId, status: 'active' }).populate('firm')

export const requireFirmMember = async (req, res, next) => {
  try {
    const membership = await getActiveFirmMembership(req.user._id)
    if (!membership || !membership.firm || membership.firm.status !== 'verified') {
      return res.status(403).json({ success: false, message: 'Verified firm membership is required.' })
    }
    req.firmMembership = membership
    req.firm = membership.firm
    next()
  } catch (error) {
    next(error)
  }
}

export const getFirmAccessibleCaseIds = async membership => {
  if (FIRM_ADMIN_ROLES.has(membership.platformRole)) return null
  return CACaseAssignment.find({ firm: membership.firm._id, member: membership._id, active: true }).distinct('case')
}

export const requireFirmAdministrator = (req, res, next) => {
  if (!FIRM_ADMIN_ROLES.has(req.firmMembership?.platformRole)) {
    return res.status(403).json({ success: false, message: 'Firm administrator access is required.' })
  }
  next()
}

export const findVerifiedFirm = firmId => {
  if (!isValidObjectId(firmId)) return null
  return CAFirm.findOne({ _id: firmId, status: 'verified', acceptingCases: true })
}
