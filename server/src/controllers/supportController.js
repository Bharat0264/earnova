import mongoose from 'mongoose'
import CACase from '../models/CACase.js'
import Order from '../models/Order.js'
import SupportTicket from '../models/SupportTicket.js'
import SupportTicketMessage from '../models/SupportTicketMessage.js'
import SupportStatusHistory from '../models/SupportStatusHistory.js'
import SupportInternalNote from '../models/SupportInternalNote.js'
import SupportAttachment from '../models/SupportAttachment.js'
import AuditLog from '../models/AuditLog.js'
import Notification from '../models/Notification.js'
import { SUPPORT_ISSUES } from '../config/caSupport.js'
import { createPublicReference } from '../utils/references.js'
import { getAuthorizedBusinessIds, userCanAccessBusiness } from '../services/caPermissions.js'

const OPEN_STATUSES = [
  'submitted', 'under_review', 'assigned', 'more_information_required', 'waiting_for_customer',
  'waiting_for_provider', 'waiting_for_ca_firm', 'waiting_for_payment_review', 'escalated', 'reopened',
]

const PAGE_LIMIT = 50
const normalize = value => String(value || '').trim()

export const calculateSupportRouting = ({ serviceCategory, issueCategory, customerImpact }) => {
  const issue = normalize(issueCategory).toLowerCase()
  let supportQueue = {
    ca: 'ca_case_support',
    business: 'business_workspace_support',
    commerce: 'commerce_support',
    freelancing: 'freelancing_disputes',
    energy: 'energy_support',
    payments: 'payment_review',
    referrals: 'referral_review',
    account: 'account_support',
    projects: 'commerce_support',
  }[serviceCategory] || 'general_support'
  let priority = customerImpact === 'low' ? 'low' : customerImpact === 'high' ? 'high' : 'normal'

  if (/security|account takeover|unauthorized access|sensitive-document exposure|suspicious transaction/.test(issue)) {
    supportQueue = 'security_incident_review'
    priority = 'security_critical'
  } else if (/privacy|data loss/.test(issue)) {
    supportQueue = 'privacy_data_requests'
    priority = customerImpact === 'critical' ? 'urgent' : 'high'
  } else if (/amount deducted|duplicate payment|professional-conduct|misconduct/.test(issue)) {
    priority = 'high'
    if (/professional/.test(issue)) supportQueue = 'ca_professional_escalation'
  } else if (customerImpact === 'critical') {
    priority = 'urgent'
  }
  return { priority, supportQueue }
}

const createUniqueTicketReference = async () => {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const reference = createPublicReference('SUP')
    if (!await SupportTicket.exists({ ticketNumber: reference })) return reference
  }
  throw Object.assign(new Error('Could not allocate a ticket reference. Please retry.'), { status: 503 })
}

const resolveRelatedEntity = async ({ type, reference, userId }) => {
  const relatedEntityType = type || 'none'
  if (relatedEntityType === 'none' || !reference) return { relatedEntityType: 'none' }
  if (relatedEntityType === 'ca_case') {
    const businessIds = await getAuthorizedBusinessIds(userId)
    const query = mongoose.Types.ObjectId.isValid(reference)
      ? { $or: [{ _id: reference }, { reference }] }
      : { reference }
    const foundCase = await CACase.findOne({
      $and: [
        query,
        { $or: [{ customer: userId }, ...(businessIds.length ? [{ business: { $in: businessIds } }] : [])] },
      ],
    }).select('_id reference firm')
    if (!foundCase) throw Object.assign(new Error('The selected CA case is not available to this account.'), { status: 403 })
    return { relatedEntityType, relatedEntityId: foundCase._id, relatedPublicReference: foundCase.reference, assignedFirm: foundCase.firm }
  }
  if (relatedEntityType === 'order') {
    const query = mongoose.Types.ObjectId.isValid(reference)
      ? { $or: [{ _id: reference }, { orderId: reference }] }
      : { orderId: reference }
    const order = await Order.findOne({ ...query, user: userId }).select('_id orderId')
    if (!order) throw Object.assign(new Error('The selected order is not available to this account.'), { status: 403 })
    return { relatedEntityType, relatedEntityId: order._id, relatedPublicReference: order.orderId }
  }
  throw Object.assign(new Error('This related item type is not available for support linking yet.'), { status: 400 })
}

export const createSupportTicket = async (req, res, next) => {
  try {
    const serviceCategory = normalize(req.body.serviceCategory).toLowerCase()
    const issueCategory = normalize(req.body.issueCategory)
    if (!SUPPORT_ISSUES[serviceCategory]?.includes(issueCategory)) {
      return res.status(400).json({ success: false, message: 'Choose a valid issue category for this service.' })
    }
    const subject = normalize(req.body.subject)
    const description = normalize(req.body.description)
    if (subject.length < 5 || description.length < 20) {
      return res.status(400).json({ success: false, message: 'Provide a clear subject and at least 20 characters of detail.' })
    }

    const related = await resolveRelatedEntity({
      type: normalize(req.body.relatedEntityType).toLowerCase(),
      reference: normalize(req.body.relatedEntityReference),
      userId: req.user._id,
    })
    const duplicate = await SupportTicket.findOne({
      user: req.user._id,
      issueCategory,
      relatedEntityType: related.relatedEntityType,
      relatedEntityId: related.relatedEntityId || { $exists: false },
      status: { $in: OPEN_STATUSES },
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    }).select('ticketNumber subject status updatedAt').sort({ createdAt: -1 }).lean()
    if (duplicate && req.body.continueDespiteDuplicate !== true) {
      return res.status(409).json({
        success: false,
        code: 'POSSIBLE_DUPLICATE',
        message: 'A similar open ticket already exists. Continue that conversation or confirm that this is a separate issue.',
        existingTicket: duplicate,
      })
    }

    const routing = calculateSupportRouting({
      serviceCategory,
      issueCategory,
      customerImpact: normalize(req.body.customerImpact).toLowerCase(),
    })
    if (req.body.businessId && !await userCanAccessBusiness(req.user._id, req.body.businessId)) {
      return res.status(403).json({ success: false, message: 'You cannot link this business.' })
    }
    const ticketNumber = await createUniqueTicketReference()
    const ticket = await SupportTicket.create({
      ticketNumber,
      user: req.user._id,
      business: req.body.businessId || undefined,
      serviceCategory,
      issueCategory,
      subject,
      description,
      customerImpact: ['low', 'normal', 'high', 'critical'].includes(req.body.customerImpact) ? req.body.customerImpact : 'normal',
      ...related,
      ...routing,
      status: 'submitted',
      nextAction: 'Earnova support will review the request and route it to the appropriate team.',
    })
    await Promise.all([
      SupportTicketMessage.create({
        ticket: ticket._id,
        author: req.user._id,
        authorType: 'customer',
        message: description,
      }),
      SupportStatusHistory.create({
        ticket: ticket._id,
        previousStatus: null,
        newStatus: 'submitted',
        changedBy: req.user._id,
        actorRole: 'customer',
        reason: 'Support request submitted.',
        customerVisible: true,
      }),
      AuditLog.create({
        actor: req.user._id,
        action: 'support_ticket.created',
        resourceType: 'SupportTicket',
        resourceId: ticket._id,
        summary: `Created support ticket ${ticketNumber}`,
        requestId: req.id,
        metadata: { serviceCategory, issueCategory, relatedEntityType: related.relatedEntityType, priority: routing.priority },
      }),
      Notification.create({
        user: req.user._id,
        type: 'support_ticket_submitted',
        title: `Support request ${ticketNumber} submitted`,
        message: 'Your request was received. Open the ticket for its current status and next action.',
        link: `/app/support/${ticketNumber}`,
        metadata: { ticketId: String(ticket._id) },
      }),
    ])
    res.status(201).json({ success: true, ticket })
  } catch (error) {
    next(error)
  }
}

export const listMySupportTickets = async (req, res, next) => {
  try {
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1)
    const limit = Math.min(PAGE_LIMIT, Math.max(1, Number.parseInt(req.query.limit, 10) || 20))
    const filter = { user: req.user._id }
    if (req.query.service) filter.serviceCategory = normalize(req.query.service).slice(0, 80)
    if (req.query.status) filter.status = normalize(req.query.status).slice(0, 80)
    if (req.query.q) filter.ticketNumber = new RegExp(normalize(req.query.q).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
    const [tickets, total] = await Promise.all([
      SupportTicket.find(filter).select('-assignedAgent -assignedFirm').sort({ updatedAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      SupportTicket.countDocuments(filter),
    ])
    res.json({ success: true, tickets, pagination: { page, limit, total, pages: Math.ceil(total / limit) } })
  } catch (error) {
    next(error)
  }
}

export const getMySupportTicket = async (req, res, next) => {
  try {
    const identity = mongoose.Types.ObjectId.isValid(req.params.ticketId)
      ? { $or: [{ _id: req.params.ticketId }, { ticketNumber: req.params.ticketId }] }
      : { ticketNumber: req.params.ticketId }
    const ticket = await SupportTicket.findOne({ ...identity, user: req.user._id }).select('-assignedAgent').lean()
    if (!ticket) return res.status(404).json({ success: false, message: 'Support ticket not found.' })
    const [messages, history, attachments] = await Promise.all([
      SupportTicketMessage.find({ ticket: ticket._id }).populate('author', 'name').sort({ createdAt: 1 }).lean(),
      SupportStatusHistory.find({ ticket: ticket._id, customerVisible: true }).select('previousStatus newStatus reason createdAt').sort({ createdAt: 1 }).lean(),
      SupportAttachment.find({ ticket: ticket._id, deletedAt: null }).select('-storageKey -checksum').sort({ createdAt: -1 }).lean(),
    ])
    res.json({ success: true, ticket, messages, history, attachments })
  } catch (error) {
    next(error)
  }
}

export const listAgentQueue = async (req, res, next) => {
  try {
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1)
    const limit = Math.min(PAGE_LIMIT, Math.max(1, Number.parseInt(req.query.limit, 10) || 20))
    const filter = {}
    if (req.user.role !== 'admin') filter.assignedAgent = req.user._id
    if (req.query.queue) filter.supportQueue = normalize(req.query.queue).slice(0, 100)
    if (req.query.status) filter.status = normalize(req.query.status).slice(0, 80)
    const [tickets, total] = await Promise.all([
      SupportTicket.find(filter).populate('user', 'name email').sort({ priority: -1, createdAt: 1 }).skip((page - 1) * limit).limit(limit).lean(),
      SupportTicket.countDocuments(filter),
    ])
    res.json({ success: true, tickets, pagination: { page, limit, total, pages: Math.ceil(total / limit) } })
  } catch (error) {
    next(error)
  }
}

export const getAgentTicket = async (req, res, next) => {
  try {
    const filter = { _id: req.params.ticketId, ...(req.user.role === 'admin' ? {} : { assignedAgent: req.user._id }) }
    const ticket = await SupportTicket.findOne(filter).populate('user', 'name email').lean()
    if (!ticket) return res.status(404).json({ success: false, message: 'Assigned support ticket not found.' })
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
