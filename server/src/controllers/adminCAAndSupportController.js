import CAFirm from '../models/CAFirm.js'
import CAFirmMember from '../models/CAFirmMember.js'
import CAService from '../models/CAService.js'
import CACase from '../models/CACase.js'
import SupportTicket from '../models/SupportTicket.js'
import SupportTicketMessage from '../models/SupportTicketMessage.js'
import SupportInternalNote from '../models/SupportInternalNote.js'
import SupportStatusHistory from '../models/SupportStatusHistory.js'
import AuditLog from '../models/AuditLog.js'
import User from '../models/User.js'
import { SUPPORT_QUEUES } from '../config/caSupport.js'

const paging = query => ({
  page: Math.max(1, Number.parseInt(query.page, 10) || 1),
  limit: Math.min(100, Math.max(1, Number.parseInt(query.limit, 10) || 25)),
})

const paged = async (model, filter, query, populate = null, select = '') => {
  const { page, limit } = paging(query)
  let cursor = model.find(filter).select(select).sort({ updatedAt: -1 }).skip((page - 1) * limit).limit(limit)
  if (populate) cursor = cursor.populate(populate)
  const [records, total] = await Promise.all([cursor.lean(), model.countDocuments(filter)])
  return { records, pagination: { page, limit, total, pages: Math.ceil(total / limit) } }
}

export const adminListFirms = async (req, res, next) => {
  try {
    const filter = req.query.status ? { status: req.query.status } : {}
    const result = await paged(CAFirm, filter, req.query)
    res.json({ success: true, firms: result.records, pagination: result.pagination })
  } catch (error) {
    next(error)
  }
}

export const adminCreateFirm = async (req, res, next) => {
  try {
    const firm = await CAFirm.create({
      slug: String(req.body.slug || '').trim().toLowerCase(),
      legalName: req.body.legalName,
      displayName: req.body.displayName,
      description: req.body.description,
      email: req.body.email,
      phone: req.body.phone,
      city: req.body.city,
      state: req.body.state,
      serviceSlugs: Array.isArray(req.body.serviceSlugs) ? req.body.serviceSlugs : [],
      status: req.body.status === 'verified' ? 'verified' : 'pending',
      acceptingCases: req.body.status === 'verified' && req.body.acceptingCases === true,
      verifiedAt: req.body.status === 'verified' ? new Date() : null,
      verifiedBy: req.body.status === 'verified' ? req.user._id : null,
    })
    await AuditLog.create({
      actor: req.user._id, action: 'ca_firm.created', resourceType: 'CAFirm', resourceId: firm._id,
      summary: `Created CA firm ${firm.displayName}`, requestId: req.id,
    })
    res.status(201).json({ success: true, firm })
  } catch (error) {
    next(error)
  }
}

export const adminUpdateFirm = async (req, res, next) => {
  try {
    const allowed = ['status', 'acceptingCases', 'verificationSummary', 'serviceSlugs', 'caseAccessPolicy', 'description']
    const update = Object.fromEntries(allowed.filter(key => req.body[key] !== undefined).map(key => [key, req.body[key]]))
    if (update.status === 'verified') {
      update.verifiedAt = new Date()
      update.verifiedBy = req.user._id
    }
    const firm = await CAFirm.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true })
    if (!firm) return res.status(404).json({ success: false, message: 'CA firm not found.' })
    await AuditLog.create({
      actor: req.user._id, action: 'ca_firm.updated', resourceType: 'CAFirm', resourceId: firm._id,
      summary: `Updated CA firm ${firm.displayName}`, requestId: req.id, metadata: { fields: Object.keys(update) },
    })
    res.json({ success: true, firm })
  } catch (error) {
    next(error)
  }
}

export const adminAddFirmMember = async (req, res, next) => {
  try {
    const [firm, user] = await Promise.all([
      CAFirm.findById(req.params.id),
      User.findOne({ email: String(req.body.email || '').trim().toLowerCase(), isActive: true }),
    ])
    if (!firm || !user) return res.status(404).json({ success: false, message: 'Firm and active Earnova user are required.' })
    const member = await CAFirmMember.findOneAndUpdate(
      { firm: firm._id, user: user._id },
      {
        platformRole: req.body.platformRole,
        professionalDesignation: String(req.body.professionalDesignation || '').trim(),
        designationVerified: req.body.designationVerified === true,
        status: 'active',
        joinedAt: new Date(),
        invitedBy: req.user._id,
      },
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
    )
    await AuditLog.create({
      actor: req.user._id, action: 'ca_firm.member_added_by_admin', resourceType: 'CAFirmMember', resourceId: member._id,
      summary: `Added a firm member to ${firm.displayName}`, requestId: req.id,
      metadata: { firmId: String(firm._id), platformRole: member.platformRole, designationVerified: member.designationVerified },
    })
    res.status(201).json({ success: true, member })
  } catch (error) {
    next(error)
  }
}

export const adminListFirmMembers = async (req, res, next) => {
  try {
    const filter = req.query.firm ? { firm: req.query.firm } : {}
    const result = await paged(CAFirmMember, filter, req.query, [{ path: 'user', select: 'name email' }, { path: 'firm', select: 'displayName slug' }])
    res.json({ success: true, professionals: result.records, pagination: result.pagination })
  } catch (error) {
    next(error)
  }
}

export const adminListCAServices = async (req, res, next) => {
  try {
    const result = await paged(CAService, {}, req.query)
    res.json({ success: true, services: result.records, pagination: result.pagination })
  } catch (error) {
    next(error)
  }
}

export const adminListCACases = async (req, res, next) => {
  try {
    const filter = {}
    if (req.query.status) filter.status = req.query.status
    if (req.query.firm) filter.firm = req.query.firm
    const result = await paged(CACase, filter, req.query, [
      { path: 'customer', select: 'name email' },
      { path: 'firm', select: 'displayName slug' },
      { path: 'service', select: 'name slug' },
    ])
    res.json({ success: true, cases: result.records, pagination: result.pagination })
  } catch (error) {
    next(error)
  }
}

export const adminAssignCaseFirm = async (req, res, next) => {
  try {
    const firm = await CAFirm.findOne({ _id: req.body.firmId, status: 'verified', acceptingCases: true })
    if (!firm) return res.status(400).json({ success: false, message: 'Choose a verified firm accepting cases.' })
    const foundCase = await CACase.findById(req.params.id)
    if (!foundCase) return res.status(404).json({ success: false, message: 'CA case not found.' })
    if (!firm.serviceSlugs.includes(foundCase.serviceSlug)) return res.status(400).json({ success: false, message: 'This firm does not offer the case service.' })
    foundCase.firm = firm._id
    foundCase.nextActionOwner = 'firm'
    foundCase.nextAction = 'The assigned firm will review the request and confirm the next step.'
    await foundCase.save()
    await AuditLog.create({
      actor: req.user._id, action: 'ca_case.firm_assigned', resourceType: 'CACase', resourceId: foundCase._id,
      summary: `Assigned ${foundCase.reference} to ${firm.displayName}`, requestId: req.id,
      metadata: { firmId: String(firm._id) },
    })
    res.json({ success: true, case: foundCase })
  } catch (error) {
    next(error)
  }
}

export const adminCAAuditLogs = async (req, res, next) => {
  try {
    const { page, limit } = paging(req.query)
    const filter = { action: /^ca_/ }
    const [logs, total] = await Promise.all([
      AuditLog.find(filter).select('-metadata').populate('actor', 'name email').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      AuditLog.countDocuments(filter),
    ])
    res.json({ success: true, logs, pagination: { page, limit, total, pages: Math.ceil(total / limit) } })
  } catch (error) {
    next(error)
  }
}

export const adminSupportDashboard = async (_req, res, next) => {
  try {
    const [byStatus, byPriority, byService, unassigned, waitingCustomer] = await Promise.all([
      SupportTicket.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      SupportTicket.aggregate([{ $group: { _id: '$priority', count: { $sum: 1 } } }]),
      SupportTicket.aggregate([{ $group: { _id: '$serviceCategory', count: { $sum: 1 } } }]),
      SupportTicket.countDocuments({ assignedAgent: null, status: { $nin: ['resolved', 'closed'] } }),
      SupportTicket.countDocuments({ status: 'waiting_for_customer' }),
    ])
    res.json({
      success: true,
      metrics: {
        byStatus: Object.fromEntries(byStatus.map(item => [item._id, item.count])),
        byPriority: Object.fromEntries(byPriority.map(item => [item._id, item.count])),
        byService: Object.fromEntries(byService.map(item => [item._id, item.count])),
        unassigned,
        waitingCustomer,
      },
      queues: SUPPORT_QUEUES,
    })
  } catch (error) {
    next(error)
  }
}

export const adminListSupportTickets = async (req, res, next) => {
  try {
    const filter = {}
    if (req.query.status) filter.status = req.query.status
    if (req.query.queue) filter.supportQueue = req.query.queue
    if (req.query.priority) filter.priority = req.query.priority
    const result = await paged(SupportTicket, filter, req.query, [
      { path: 'user', select: 'name email' },
      { path: 'assignedAgent', select: 'name email' },
      { path: 'assignedFirm', select: 'displayName slug' },
    ])
    res.json({ success: true, tickets: result.records, pagination: result.pagination })
  } catch (error) {
    next(error)
  }
}

export const adminGetSupportTicket = async (req, res, next) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id)
      .populate('user', 'name email').populate('assignedAgent', 'name email').lean()
    if (!ticket) return res.status(404).json({ success: false, message: 'Support ticket not found.' })
    const [messages, history, internalNotes] = await Promise.all([
      SupportTicketMessage.find({ ticket: ticket._id }).populate('author', 'name').sort({ createdAt: 1 }).lean(),
      SupportStatusHistory.find({ ticket: ticket._id }).sort({ createdAt: 1 }).lean(),
      SupportInternalNote.find({ ticket: ticket._id }).populate('author', 'name').sort({ createdAt: 1 }).lean(),
    ])
    res.json({ success: true, ticket, messages, history, internalNotes })
  } catch (error) {
    next(error)
  }
}
