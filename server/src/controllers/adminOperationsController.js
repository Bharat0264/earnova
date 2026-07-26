import mongoose from 'mongoose'
import Business from '../models/Business.js'
import User from '../models/User.js'
import ProviderProfile from '../models/ProviderProfile.js'
import ServiceRequest from '../models/ServiceRequest.js'
import EnergyEnquiry from '../models/EnergyEnquiry.js'
import SupportTicket from '../models/SupportTicket.js'
import SupportTicketMessage from '../models/SupportTicketMessage.js'
import SupportInternalNote from '../models/SupportInternalNote.js'
import BusinessSubscription from '../models/BusinessSubscription.js'
import AuditLog from '../models/AuditLog.js'
import PlatformEvent from '../models/PlatformEvent.js'
import Notification from '../models/Notification.js'
import ReferralLedger from '../models/ReferralLedger.js'

const resources = {
  businesses: { model: Business, sort: '-createdAt', populate: 'owner' },
  providers: { model: ProviderProfile, sort: '-createdAt', populate: 'user' },
  services: { model: ServiceRequest, sort: '-updatedAt', populate: 'customer assignedProvider' },
  energy: { model: EnergyEnquiry, sort: '-createdAt', populate: 'user assignedPartner' },
  support: { model: SupportTicket, sort: '-updatedAt', populate: 'user assignedAgent' },
  subscriptions: { model: BusinessSubscription, sort: '-updatedAt', populate: 'user business' },
  audit: { model: AuditLog, sort: '-createdAt', populate: 'actor' },
  referrals: { model: ReferralLedger, sort: '-createdAt', populate: 'referrer order' },
}

const safeUser = { path: 'owner', select: 'name email role accountType' }

export const listAdminOperations = async (req, res) => {
  const config = resources[req.params.resource]
  if (!config) return res.status(404).json({ success: false, message: 'Admin resource not found.' })
  const page = Math.max(1, Number(req.query.page) || 1)
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 30))
  const query = config.model.find({}).sort(config.sort).skip((page - 1) * limit).limit(limit)
  if (config.populate) {
    for (const path of config.populate.split(' ')) query.populate(path === 'owner' ? safeUser : { path, select: 'name email title providerType' })
  }
  const [items, total] = await Promise.all([query.lean(), config.model.countDocuments()])
  res.json({ success: true, items, total, page })
}

export const updateAdminOperation = async (req, res) => {
  const resource = req.params.resource
  const id = req.params.id
  let item
  let summary
  if (resource === 'providers') {
    const allowed = ['pending', 'verified', 'rejected', 'suspended']
    if (!allowed.includes(req.body.verificationStatus)) return res.status(400).json({ success: false, message: 'Invalid verification status.' })
    item = await ProviderProfile.findByIdAndUpdate(id, {
      verificationStatus: req.body.verificationStatus,
      adminNote: String(req.body.adminNote || '').slice(0, 1000),
      verifiedBy: req.user._id,
      verifiedAt: req.body.verificationStatus === 'verified' ? new Date() : undefined,
    }, { new: true })
    summary = `Provider marked ${req.body.verificationStatus}.`
    if (item) await Notification.create({ user: item.user, type: 'provider_verification', title: 'Provider verification updated', message: summary, link: '/partner/overview' })
  } else if (resource === 'services') {
    item = await ServiceRequest.findByIdAndUpdate(id, { status: req.body.status }, { new: true, runValidators: true })
    summary = `Service request marked ${req.body.status}.`
  } else if (resource === 'energy') {
    item = await EnergyEnquiry.findByIdAndUpdate(id, {
      status: req.body.status,
      assignedPartner: req.body.assignedPartner || undefined,
      quoteAmountPaise: req.body.quoteAmountPaise,
      quoteNote: String(req.body.quoteNote || '').slice(0, 2000),
    }, { new: true, runValidators: true })
    summary = `Energy enquiry marked ${req.body.status}.`
    if (item) await Notification.create({ user: item.user, type: 'energy_update', title: 'Energy enquiry updated', message: `${summary} Estimates remain approximate.`, link: '/app/services' })
  } else if (resource === 'support') {
    item = await SupportTicket.findById(id)
    if (item) {
      if (req.body.status) item.status = req.body.status
      if (req.body.assignedAgent) item.assignedAgent = req.body.assignedAgent
      if (req.body.reply && req.body.internal) {
        await SupportInternalNote.create({ ticket: item._id, author: req.user._id, note: req.body.reply })
      } else if (req.body.reply) {
        await SupportTicketMessage.create({ ticket: item._id, author: req.user._id, authorType: 'agent', message: req.body.reply })
      }
      await item.save()
    }
    summary = `Support ticket updated to ${item?.status || 'unknown'}.`
  } else if (resource === 'subscriptions') {
    item = await BusinessSubscription.findByIdAndUpdate(id, {
      billingStatus: req.body.billingStatus,
      status: ['cancelled', 'expired'].includes(req.body.billingStatus) ? req.body.billingStatus : 'active',
      cancelledAt: req.body.billingStatus === 'cancelled' ? new Date() : undefined,
    }, { new: true, runValidators: true })
    summary = `Subscription marked ${req.body.billingStatus}.`
  } else if (resource === 'referrals') {
    const status = req.body.status
    if (!['approved', 'reversed'].includes(status)) return res.status(400).json({ success: false, message: 'Referral can only be approved or reversed.' })
    const session = await mongoose.startSession()
    try {
      await session.withTransaction(async () => {
        item = await ReferralLedger.findOne({ _id: id, status: 'pending' }).session(session)
        if (!item) return
        if (status === 'approved' && item.approveAfter > new Date()) throw new Error('Approval period has not ended.')
        item.status = status
        if (status === 'approved') {
          item.approvedAt = new Date()
          await User.findByIdAndUpdate(item.referrer, { $inc: { referralEarnings: item.commissionAmountPaise / 100, walletBalance: item.commissionAmountPaise / 100 } }, { session })
        } else {
          item.reversedAt = new Date()
          item.reversalReason = String(req.body.reversalReason || 'Reversed by administrator').slice(0, 500)
        }
        await item.save({ session })
      })
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message || 'Could not update referral commission.' })
    } finally {
      await session.endSession()
    }
    summary = `Referral commission marked ${status}.`
  } else {
    return res.status(400).json({ success: false, message: 'This admin resource is read-only.' })
  }
  if (!item) return res.status(404).json({ success: false, message: 'Record not found.' })
  await AuditLog.create({ actor: req.user._id, action: `admin.${resource}.updated`, resourceType: item.constructor.modelName, resourceId: item._id, summary, requestId: req.id })
  res.json({ success: true, item })
}

export const getPlatformAnalytics = async (_req, res) => {
  const [businesses, providers, serviceRequests, energyEnquiries, openTickets, subscriptions, events] = await Promise.all([
    Business.countDocuments({ status: 'active' }),
    ProviderProfile.countDocuments({ verificationStatus: 'verified' }),
    ServiceRequest.countDocuments(),
    EnergyEnquiry.countDocuments(),
    SupportTicket.countDocuments({ status: { $nin: ['resolved', 'closed'] } }),
    BusinessSubscription.countDocuments({ status: 'active' }),
    PlatformEvent.aggregate([{ $group: { _id: '$event', count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
  ])
  res.json({ success: true, metrics: { businesses, providers, serviceRequests, energyEnquiries, openTickets, subscriptions, events } })
}
