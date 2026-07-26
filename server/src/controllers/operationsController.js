import ProviderProfile from '../models/ProviderProfile.js'
import ServiceRequest from '../models/ServiceRequest.js'
import EnergyEnquiry from '../models/EnergyEnquiry.js'
import Notification from '../models/Notification.js'
import SupportTicket from '../models/SupportTicket.js'
import SupportTicketMessage from '../models/SupportTicketMessage.js'
import SupportStatusHistory from '../models/SupportStatusHistory.js'
import AuditLog from '../models/AuditLog.js'
import PlatformEvent from '../models/PlatformEvent.js'
import Plan from '../models/Plan.js'
import BusinessSubscription from '../models/BusinessSubscription.js'
import { createPublicReference } from '../utils/references.js'

const providerTypes = ['freelancer', 'ca_consultant', 'business_consultant', 'project_seller', 'energy_partner']
const money = value => Number.isFinite(Number(value)) && Number(value) >= 0 ? Math.round(Number(value)) : null
const audit = (req, payload) => AuditLog.create({ actor: req.user._id, requestId: req.id, ...payload }).catch(() => {})
const notify = payload => Notification.create(payload).catch(() => {})

export const listProviders = async (req, res) => {
  const filter = { verificationStatus: 'verified', availability: { $ne: 'unavailable' } }
  if (req.query.type) filter.providerType = req.query.type
  const providers = await ProviderProfile.find(filter).populate('user', 'name avatar').sort({ ratingAverage: -1, completedJobs: -1 }).limit(100).lean()
  res.json({ success: true, providers })
}

export const getMyProviderProfile = async (req, res) => {
  const profile = await ProviderProfile.findOne({ user: req.user._id }).lean()
  res.json({ success: true, profile })
}

export const saveMyProviderProfile = async (req, res) => {
  try {
    const allowedByAccount = {
      freelancer: ['freelancer'],
      ca_consultant: ['ca_consultant', 'business_consultant'],
      product_seller: ['project_seller'],
      energy_partner: ['energy_partner'],
    }
    const providerType = req.body.providerType || req.user.accountType
    if (!providerTypes.includes(providerType) || (!allowedByAccount[req.user.accountType]?.includes(providerType) && req.user.role !== 'admin') ||
      !String(req.body.title || '').trim() || !String(req.body.description || '').trim()) {
      return res.status(400).json({ success: false, message: 'Provider type, title and description are required.' })
    }
    const profile = await ProviderProfile.findOneAndUpdate(
      { user: req.user._id },
      {
        user: req.user._id,
        providerType,
        title: String(req.body.title).trim(),
        description: String(req.body.description).trim(),
        skills: Array.isArray(req.body.skills) ? req.body.skills.slice(0, 30) : [],
        categories: Array.isArray(req.body.categories) ? req.body.categories.slice(0, 20) : [],
        location: String(req.body.location || '').trim(),
        serviceAreas: Array.isArray(req.body.serviceAreas) ? req.body.serviceAreas.slice(0, 30) : [],
        pricingMethod: req.body.pricingMethod || 'quote',
        startingPricePaise: money(req.body.startingPricePaise) || 0,
        experienceYears: Number(req.body.experienceYears || 0),
        portfolioUrls: Array.isArray(req.body.portfolioUrls) ? req.body.portfolioUrls.slice(0, 20) : [],
        availability: req.body.availability || 'available',
        verificationStatus: 'pending',
      },
      { new: true, upsert: true, runValidators: true }
    )
    res.json({ success: true, profile })
  } catch {
    res.status(400).json({ success: false, message: 'Could not save provider profile.' })
  }
}

export const listMyServiceRequests = async (req, res) => {
  const profile = await ProviderProfile.findOne({ user: req.user._id })
  const filter = profile && req.query.view === 'provider'
    ? { $or: [{ assignedProvider: profile._id }, { status: { $in: ['open', 'proposal_received'] }, category: { $in: profile.categories } }] }
    : { customer: req.user._id }
  const requests = await ServiceRequest.find(filter)
    .populate('assignedProvider', 'title providerType')
    .populate('proposals.provider', 'title providerType')
    .sort('-updatedAt').limit(100).lean()
  res.json({ success: true, requests, providerProfile: profile })
}

export const createServiceRequest = async (req, res) => {
  const budgetPaise = money(req.body.budgetPaise)
  if (!String(req.body.title || '').trim() || !String(req.body.requirements || '').trim() || !String(req.body.category || '').trim() || budgetPaise === null) {
    return res.status(400).json({ success: false, message: 'Category, title, requirements and a valid budget are required.' })
  }
  const request = await ServiceRequest.create({
    customer: req.user._id,
    category: String(req.body.category).trim(),
    title: String(req.body.title).trim(),
    requirements: String(req.body.requirements).trim(),
    budgetPaise,
    status: 'open',
  })
  await audit(req, { action: 'service_request.created', resourceType: 'ServiceRequest', resourceId: request._id, summary: 'Created a service request.' })
  res.status(201).json({ success: true, request })
}

export const submitProposal = async (req, res) => {
  const profile = await ProviderProfile.findOne({ user: req.user._id, verificationStatus: 'verified' })
  if (!profile) return res.status(403).json({ success: false, message: 'A verified provider profile is required.' })
  const amountPaise = money(req.body.amountPaise)
  const deliveryDays = Number(req.body.deliveryDays)
  if (amountPaise === null || !Number.isInteger(deliveryDays) || deliveryDays < 1 || !String(req.body.message || '').trim()) {
    return res.status(400).json({ success: false, message: 'Proposal message, amount and delivery days are required.' })
  }
  const request = await ServiceRequest.findOne({ _id: req.params.id, status: { $in: ['open', 'proposal_received'] } })
  if (!request) return res.status(404).json({ success: false, message: 'Open request not found.' })
  if (request.proposals.some(proposal => proposal.provider.equals(profile._id))) {
    return res.status(409).json({ success: false, message: 'You already submitted a proposal.' })
  }
  request.proposals.push({ provider: profile._id, message: req.body.message, amountPaise, deliveryDays })
  request.status = 'proposal_received'
  await request.save()
  await notify({ user: request.customer, type: 'proposal_received', title: 'New service proposal', message: `A provider submitted a proposal for ${request.title}.`, link: '/app/services' })
  res.status(201).json({ success: true, request })
}

const customerTransitions = {
  proposal_received: ['cancelled'],
  accepted: ['in_progress', 'cancelled', 'disputed'],
  in_progress: ['submitted', 'revision_requested', 'disputed'],
  submitted: ['completed', 'revision_requested', 'disputed'],
  revision_requested: ['in_progress', 'submitted', 'disputed'],
}

export const updateServiceRequest = async (req, res) => {
  const request = await ServiceRequest.findById(req.params.id)
  if (!request) return res.status(404).json({ success: false, message: 'Service request not found.' })
  const isCustomer = request.customer.equals(req.user._id)
  const profile = await ProviderProfile.findOne({ user: req.user._id })
  const isProvider = profile && request.assignedProvider?.equals(profile._id)
  if (!isCustomer && !isProvider && req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Access denied.' })

  if (req.body.proposalId && isCustomer && ['open', 'proposal_received'].includes(request.status)) {
    const proposal = request.proposals.id(req.body.proposalId)
    if (!proposal || proposal.status !== 'submitted') return res.status(400).json({ success: false, message: 'Proposal is unavailable.' })
    proposal.status = 'accepted'
    request.proposals.forEach(item => { if (!item._id.equals(proposal._id)) item.status = 'rejected' })
    request.selectedProposal = proposal._id
    request.assignedProvider = proposal.provider
    request.status = 'accepted'
    request.paymentStatus = 'recorded'
  } else if (req.body.status) {
    const allowed = req.user.role === 'admin'
      || (isCustomer && (customerTransitions[request.status] || []).includes(req.body.status))
      || (isProvider && ['accepted', 'in_progress', 'revision_requested'].includes(request.status) && ['in_progress', 'submitted'].includes(req.body.status))
    if (!allowed) return res.status(400).json({ success: false, message: 'Invalid service-request transition.' })
    request.status = req.body.status
    if (req.body.completionNote) request.completionNote = String(req.body.completionNote).slice(0, 3000)
  }
  await request.save()
  const provider = request.assignedProvider && await ProviderProfile.findById(request.assignedProvider)
  const recipient = isCustomer ? provider?.user : request.customer
  if (recipient) await notify({ user: recipient, type: 'service_update', title: 'Service request updated', message: `${request.title} is now ${request.status.replaceAll('_', ' ')}.`, link: '/app/services' })
  await audit(req, { action: 'service_request.updated', resourceType: 'ServiceRequest', resourceId: request._id, summary: `Updated service request to ${request.status}.` })
  res.json({ success: true, request })
}

export const reviewServiceRequest = async (req, res) => {
  const rating = Number(req.body.rating)
  const request = await ServiceRequest.findOne({ _id: req.params.id, customer: req.user._id, status: 'completed', 'review.rating': { $exists: false } })
  if (!request || !Number.isInteger(rating) || rating < 1 || rating > 5) return res.status(400).json({ success: false, message: 'Completed request and rating from 1 to 5 are required.' })
  request.review = { rating, comment: String(req.body.comment || '').slice(0, 1200), submittedAt: new Date() }
  await request.save()
  const profile = await ProviderProfile.findById(request.assignedProvider)
  if (profile) {
    profile.ratingAverage = ((profile.ratingAverage * profile.ratingCount) + rating) / (profile.ratingCount + 1)
    profile.ratingCount += 1
    profile.completedJobs += 1
    await profile.save()
  }
  res.json({ success: true, request })
}

export const createEnergyEnquiry = async (req, res) => {
  try {
    const enquiry = await EnergyEnquiry.create({
      user: req.user._id,
      useType: req.body.useType,
      monthlyBillPaise: money(req.body.monthlyBillPaise),
      propertyType: req.body.propertyType,
      roofAvailability: req.body.roofAvailability,
      location: req.body.location,
      preferredContactTime: req.body.preferredContactTime,
      phone: req.body.phone,
      estimateDisclaimerAccepted: req.body.estimateDisclaimerAccepted === true,
    })
    await notify({ user: req.user._id, type: 'energy_enquiry', title: 'Energy enquiry received', message: 'We recorded your requirements. All estimates remain approximate.', link: '/app/services' })
    res.status(201).json({ success: true, enquiry })
  } catch {
    res.status(400).json({ success: false, message: 'Complete all energy requirement fields and accept the estimate disclaimer.' })
  }
}

export const listMyEnergyEnquiries = async (req, res) => {
  const enquiries = await EnergyEnquiry.find({ user: req.user._id }).sort('-createdAt').limit(100).lean()
  res.json({ success: true, enquiries })
}

export const listNotifications = async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id }).sort('-createdAt').limit(100).lean()
  res.json({ success: true, notifications, unread: notifications.filter(item => !item.readAt).length })
}

export const markNotificationRead = async (req, res) => {
  const notification = await Notification.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, { readAt: new Date() }, { new: true })
  if (!notification) return res.status(404).json({ success: false, message: 'Notification not found.' })
  res.json({ success: true, notification })
}

export const listMyTickets = async (req, res) => {
  const tickets = await SupportTicket.find({ user: req.user._id }).sort('-updatedAt').limit(100).lean()
  res.json({ success: true, tickets })
}

export const createTicket = async (req, res) => {
  if (!req.body.category || !req.body.subject || !req.body.description) return res.status(400).json({ success: false, message: 'Category, subject and description are required.' })
  const ticket = await SupportTicket.create({
    ticketNumber: createPublicReference('SUP'),
    user: req.user._id,
    serviceCategory: req.body.category === 'account' ? 'account' : 'business',
    issueCategory: 'Other',
    supportQueue: req.body.category === 'account' ? 'account_support' : 'business_workspace_support',
    priority: req.body.priority || 'normal',
    subject: req.body.subject,
    description: req.body.description,
  })
  await Promise.all([
    SupportTicketMessage.create({ ticket: ticket._id, author: req.user._id, authorType: 'customer', message: req.body.description }),
    SupportStatusHistory.create({ ticket: ticket._id, previousStatus: null, newStatus: 'submitted', changedBy: req.user._id, actorRole: 'customer', reason: 'Support request submitted.', customerVisible: true }),
  ])
  res.status(201).json({ success: true, ticket })
}

export const replyToTicket = async (req, res) => {
  const ticket = await SupportTicket.findOne({ _id: req.params.id, user: req.user._id, status: { $ne: 'closed' } })
  if (!ticket || !String(req.body.message || '').trim()) return res.status(400).json({ success: false, message: 'Open ticket and reply are required.' })
  await SupportTicketMessage.create({ ticket: ticket._id, author: req.user._id, authorType: 'customer', message: req.body.message })
  ticket.status = 'reopened'
  await ticket.save()
  res.json({ success: true, ticket })
}

export const listPlans = async (_req, res) => {
  let plans = await Plan.find({ active: true }).sort('pricePaise').lean()
  if (!plans.length) plans = [
    { key: 'starter', name: 'Starter', pricePaise: 0, interval: 'none', features: ['One business', 'Manual entry', 'Basic dashboard'], limits: { businesses: 1, aiQuestions: 10 } },
    { key: 'growth', name: 'Growth', pricePaise: 14900, interval: 'month', features: ['CSV import', 'CRM', 'Inventory', 'More AI'], limits: { businesses: 1, aiQuestions: 100 } },
    { key: 'pro', name: 'Pro', pricePaise: 49900, interval: 'month', features: ['Multiple businesses', 'Advanced permissions', 'Priority support'], limits: { businesses: 5, aiQuestions: 1000 } },
  ]
  res.json({ success: true, plans })
}

export const getMySubscription = async (req, res) => {
  const subscription = await BusinessSubscription.findOne({ user: req.user._id }).sort('-createdAt').lean()
  res.json({ success: true, subscription })
}

export const trackPlatformEvent = async (req, res) => {
  const allowed = ['workspace_viewed', 'service_request_started', 'energy_enquiry_started', 'checkout_started', 'support_opened']
  if (!allowed.includes(req.body.event)) return res.status(400).json({ success: false, message: 'Unsupported event.' })
  const permittedProperties = ['page', 'module', 'source']
  const properties = Object.fromEntries(
    permittedProperties
      .filter(key => typeof req.body.properties?.[key] === 'string')
      .map(key => [key, req.body.properties[key].slice(0, 120)])
  )
  await PlatformEvent.create({ user: req.user?._id, event: req.body.event, properties })
  res.status(202).json({ success: true })
}
