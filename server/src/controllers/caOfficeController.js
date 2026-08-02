import CACase from '../models/CACase.js'
import CACaseAssignment from '../models/CACaseAssignment.js'
import CACaseDocument from '../models/CACaseDocument.js'
import CACaseStatusHistory from '../models/CACaseStatusHistory.js'
import CAFirm from '../models/CAFirm.js'
import CAFirmMember from '../models/CAFirmMember.js'
import CAService from '../models/CAService.js'
import AuditLog from '../models/AuditLog.js'
import SupportTicket from '../models/SupportTicket.js'
import User from '../models/User.js'
import crypto from 'crypto'
import Razorpay from 'razorpay'
import { CA_SERVICE_CATALOG } from '../config/caSupport.js'
import {
  buildCustomerCaseScope, findVerifiedFirm, getAuthorizedBusinessIds,
  getFirmAccessibleCaseIds, isValidObjectId, userCanAccessBusiness,
} from '../services/caPermissions.js'
import { createPublicReference } from '../utils/references.js'
import { maskPan } from '../utils/masking.js'
import { isValidIndianPhone } from '../utils/validation.js'
import { calculateFeeAmount, getCurrentPlatformFee } from '../services/platformFees.js'

const pageParams = query => ({
  page: Math.max(1, Number.parseInt(query.page, 10) || 1),
  limit: Math.min(50, Math.max(1, Number.parseInt(query.limit, 10) || 20)),
})

const publicServiceFields = 'slug name category summary whoNeedsIt eligibility deliverables exclusions requiredDocuments pricingMode startingPrice handlingTime externalDependency addOns consultationRequired refundPolicy faq workflowKey'
const publicFirmFields = 'slug displayName description city state serviceSlugs verificationSummary verifiedAt acceptingCases'

const findService = async slug => {
  const stored = await CAService.findOne({ slug, active: true })
  if (stored) return stored
  const configured = CA_SERVICE_CATALOG.find(item => item.slug === slug)
  if (!configured) return null
  return CAService.findOneAndUpdate(
    { slug },
    { ...configured, active: true },
    { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
  )
}

const casePublicPopulate = query => query
  .populate('service', 'slug name category pricingMode startingPrice handlingTime consultationRequired')
  .populate('firm', publicFirmFields)

const toCustomerCase = value => {
  if (!value) return value
  const item = { ...value }
  if (item.quote) {
    item.quote = { ...item.quote }
    delete item.quote.providerPlatformFeePaise
    delete item.quote.providerPayoutPaise
    delete item.quote.feeVersion
    delete item.quote.raisedBy
  }
  delete item.contactWhatsapp
  return item
}

const calculateFeePaise = (basePaise, fee) => fee?.type === 'fixed'
  ? calculateFeeAmount(basePaise / 100, fee) * 100
  : calculateFeeAmount(basePaise, fee)

const createUniqueCaseReference = async () => {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const reference = createPublicReference('CA')
    if (!await CACase.exists({ reference })) return reference
  }
  throw Object.assign(new Error('Could not allocate a case reference. Please retry.'), { status: 503 })
}

const getRazorpay = () => {
  const keyId = process.env.RAZORPAY_KEY_ID?.trim()
  const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim()
  if (!keyId || !keySecret) throw Object.assign(new Error('CA service payments are not configured.'), { status: 503 })
  return { keyId, keySecret, instance: new Razorpay({ key_id: keyId, key_secret: keySecret }) }
}

const buildTaxIntake = body => {
  const allowedIncome = ['salary', 'house_property', 'business', 'capital_gains', 'interest', 'foreign_income', 'other']
  const allowedDeductions = ['80c', '80d', 'home_loan', 'donations', 'nps', 'education_loan', 'other']
  const pickMany = (value, allowed) => [...new Set((Array.isArray(value) ? value : []).filter(item => allowed.includes(item)))]
  return {
    assessmentYear: String(body.assessmentYear || '').trim().slice(0, 20),
    taxpayerType: ['individual', 'huf', 'proprietor'].includes(body.taxpayerType) ? body.taxpayerType : undefined,
    residentialStatus: ['resident', 'nri', 'not_sure'].includes(body.residentialStatus) ? body.residentialStatus : undefined,
    incomeSources: pickMany(body.incomeSources, allowedIncome),
    deductionClaims: pickMany(body.deductionClaims, allowedDeductions),
    filingReason: ['regular', 'refund', 'loss_carry_forward', 'notice', 'revised', 'not_sure'].includes(body.filingReason) ? body.filingReason : undefined,
    hasForm16: Boolean(body.hasForm16), hasAisTis: Boolean(body.hasAisTis),
    hasCapitalGains: Boolean(body.hasCapitalGains), hasForeignAssets: Boolean(body.hasForeignAssets),
    taxPosition: ['refund_expected', 'tax_payable', 'not_sure'].includes(body.taxPosition) ? body.taxPosition : undefined,
    declarationAccepted: body.declarationAccepted === true,
  }
}

export const listCAServices = async (req, res, next) => {
  try {
    const filter = { active: true }
    if (req.query.category) filter.category = String(req.query.category).slice(0, 100)
    let services = await CAService.find(filter).select(publicServiceFields).sort({ sortOrder: 1, name: 1 }).lean()
    if (!services.length) {
      services = CA_SERVICE_CATALOG
        .filter(item => !filter.category || item.category === filter.category)
        .map(item => ({ ...item, active: true }))
    }
    res.set('Cache-Control', 'public, max-age=120')
    res.json({ success: true, services })
  } catch (error) {
    next(error)
  }
}

export const getCAService = async (req, res, next) => {
  try {
    const service = await CAService.findOne({ slug: req.params.serviceSlug, active: true }).select(publicServiceFields).lean()
      || CA_SERVICE_CATALOG.find(item => item.slug === req.params.serviceSlug)
    if (!service) return res.status(404).json({ success: false, message: 'CA service not found.' })
    const firms = await CAFirm.find({ status: 'verified', acceptingCases: true, serviceSlugs: req.params.serviceSlug })
      .select(publicFirmFields).sort({ displayName: 1 }).limit(12).lean()
    res.json({ success: true, service, firms })
  } catch (error) {
    next(error)
  }
}

export const listVerifiedFirms = async (req, res, next) => {
  try {
    const { page, limit } = pageParams(req.query)
    const filter = { status: 'verified' }
    if (req.query.service) filter.serviceSlugs = String(req.query.service).slice(0, 120)
    const [firms, total] = await Promise.all([
      CAFirm.find(filter).select(publicFirmFields).sort({ acceptingCases: -1, displayName: 1 }).skip((page - 1) * limit).limit(limit).lean(),
      CAFirm.countDocuments(filter),
    ])
    res.json({ success: true, firms, pagination: { page, limit, total, pages: Math.ceil(total / limit) } })
  } catch (error) {
    next(error)
  }
}

export const getVerifiedFirm = async (req, res, next) => {
  try {
    const firm = await CAFirm.findOne({ slug: req.params.firmSlug, status: 'verified' }).select(publicFirmFields).lean()
    if (!firm) return res.status(404).json({ success: false, message: 'Verified firm not found.' })
    const professionals = await CAFirmMember.find({
      firm: firm._id, status: 'active', designationVerified: true,
    }).populate('user', 'name').select('user professionalDesignation').limit(20).lean()
    res.json({ success: true, firm, professionals })
  } catch (error) {
    next(error)
  }
}

export const createCACase = async (req, res, next) => {
  try {
    const serviceSlug = String(req.body.serviceSlug || '').trim().toLowerCase()
    const service = await findService(serviceSlug)
    if (!service) return res.status(400).json({ success: false, message: 'Choose a valid CA service.' })
    const intakeSummary = String(req.body.intakeSummary || '').trim()
    if (intakeSummary.length < 20) return res.status(400).json({ success: false, message: 'Provide at least 20 characters about the required work.' })
    const contactWhatsapp = String(req.body.contactWhatsapp || '').trim()
    if (!contactWhatsapp || !isValidIndianPhone(contactWhatsapp)) {
      return res.status(400).json({ success: false, message: 'Provide a valid Indian WhatsApp number.' })
    }
    const taxIntake = serviceSlug === 'income-tax-return-filing' ? buildTaxIntake(req.body.taxIntake || {}) : undefined
    if (taxIntake && (!taxIntake.assessmentYear || !taxIntake.taxpayerType || !taxIntake.incomeSources.length || !taxIntake.declarationAccepted)) {
      return res.status(400).json({ success: false, message: 'Complete the ITR profile and confirm that the information is accurate.' })
    }

    let business = null
    if (req.body.businessId) {
      if (!await userCanAccessBusiness(req.user._id, req.body.businessId)) {
        return res.status(403).json({ success: false, message: 'You cannot link this business.' })
      }
      business = req.body.businessId
    }

    let firm = null
    if (req.body.firmId) {
      firm = await findVerifiedFirm(req.body.firmId)
      if (!firm || !firm.serviceSlugs.includes(serviceSlug)) {
        return res.status(400).json({ success: false, message: 'Choose a verified firm that offers this service.' })
      }
    }

    const reference = await createUniqueCaseReference()
    const status = service.consultationRequired ? 'consultation_requested' : 'documents_requested'
    const nextAction = service.consultationRequired
      ? 'Choose a consultation time after the assigned firm confirms availability.'
      : 'Upload the requested documents after the assigned firm confirms the checklist.'
    const createdCase = await CACase.create({
      reference,
      customer: req.user._id,
      business,
      service: service._id,
      serviceSlug,
      firm: firm?._id,
      intakeSummary,
      contactPhone: String(req.body.contactPhone || req.user.phone || '').trim(),
      contactWhatsapp,
      maskedPan: maskPan(req.body.pan),
      taxIntake,
      status,
      workflowKey: service.workflowKey,
      nextActionOwner: firm ? 'firm' : 'firm',
      nextAction: firm ? nextAction : 'Documents can be uploaded now. Earnova will assign an eligible verified CA before any payment is requested.',
    })
    await CACaseStatusHistory.create({
      case: createdCase._id,
      previousStatus: null,
      newStatus: status,
      changedBy: req.user._id,
      actorRole: 'customer',
      reason: 'Customer started the CA service request.',
      customerVisible: true,
    })
    await AuditLog.create({
      actor: req.user._id,
      action: 'ca_case.created',
      resourceType: 'CACase',
      resourceId: createdCase._id,
      summary: `Created CA case ${reference}`,
      requestId: req.id,
      metadata: { serviceSlug, assignedFirm: Boolean(firm) },
    })
    const populated = await casePublicPopulate(CACase.findById(createdCase._id)).lean()
    res.status(201).json({ success: true, case: toCustomerCase(populated) })
  } catch (error) {
    next(error)
  }
}

export const listMyCACases = async (req, res, next) => {
  try {
    const { page, limit } = pageParams(req.query)
    const businessIds = await getAuthorizedBusinessIds(req.user._id)
    const filter = buildCustomerCaseScope(req.user._id, businessIds)
    if (req.query.status) filter.status = String(req.query.status).slice(0, 80)
    const [cases, total] = await Promise.all([
      casePublicPopulate(CACase.find(filter)).sort({ updatedAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      CACase.countDocuments(filter),
    ])
    res.json({ success: true, cases: cases.map(toCustomerCase), pagination: { page, limit, total, pages: Math.ceil(total / limit) } })
  } catch (error) {
    next(error)
  }
}

export const getMyCACase = async (req, res, next) => {
  try {
    const businessIds = await getAuthorizedBusinessIds(req.user._id)
    const identityFilter = isValidObjectId(req.params.caseId)
      ? { $or: [{ _id: req.params.caseId }, { reference: req.params.caseId }] }
      : { reference: req.params.caseId }
    const foundCase = await casePublicPopulate(CACase.findOne({
      $and: [identityFilter, buildCustomerCaseScope(req.user._id, businessIds)],
    })).lean()
    if (!foundCase) return res.status(404).json({ success: false, message: 'CA case not found.' })
    const [history, documents, assignments] = await Promise.all([
      CACaseStatusHistory.find({ case: foundCase._id, customerVisible: true }).select('previousStatus newStatus reason createdAt').sort({ createdAt: 1 }).lean(),
      CACaseDocument.find({ case: foundCase._id, deletedAt: null }).select('-storageKey -checksum').sort({ createdAt: -1 }).lean(),
      CACaseAssignment.find({ case: foundCase._id, active: true }).populate({ path: 'member', select: 'platformRole professionalDesignation designationVerified user', populate: { path: 'user', select: 'name' } }).select('assignmentRole member').lean(),
    ])
    res.json({ success: true, case: toCustomerCase(foundCase), history, documents, assignments })
  } catch (error) {
    next(error)
  }
}

export const getFirmDashboard = async (req, res, next) => {
  try {
    const accessibleIds = await getFirmAccessibleCaseIds(req.firmMembership)
    const filter = { firm: req.firm._id, ...(accessibleIds ? { _id: { $in: accessibleIds } } : {}) }
    const [statusCounts, recentCases, teamSize, approachingUpdates, escalatedSupportIssues, workload] = await Promise.all([
      CACase.aggregate([{ $match: filter }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
      casePublicPopulate(CACase.find(filter)).sort({ updatedAt: -1 }).limit(10).lean(),
      CAFirmMember.countDocuments({ firm: req.firm._id, status: 'active' }),
      CACase.countDocuments({
        ...filter,
        expectedNextUpdateAt: { $gte: new Date(), $lte: new Date(Date.now() + 48 * 60 * 60 * 1000) },
        status: { $nin: ['completed', 'cancelled', 'refunded'] },
      }),
      SupportTicket.countDocuments({ assignedFirm: req.firm._id, status: 'escalated' }),
      CACaseAssignment.aggregate([
        { $match: { firm: req.firm._id, active: true } },
        { $group: { _id: '$member', activeCases: { $sum: 1 } } },
        { $sort: { activeCases: -1 } },
        { $limit: 10 },
      ]),
    ])
    const counts = Object.fromEntries(statusCounts.map(item => [item._id, item.count]))
    res.json({
      success: true,
      firm: { _id: req.firm._id, displayName: req.firm.displayName, slug: req.firm.slug },
      membership: { role: req.firmMembership.platformRole, designation: req.firmMembership.designationVerified ? req.firmMembership.professionalDesignation : null },
      widgets: {
        newCases: (counts.consultation_requested || 0) + (counts.documents_requested || 0),
        unassignedCases: 0,
        casesAwaitingDocuments: counts.documents_requested || 0,
        documentsAwaitingReview: counts.documents_uploaded || 0,
        customerActionsPending: (counts.customer_approval_required || 0) + (counts.customer_clarification_required || 0),
        firmActionsPending: (counts.work_in_progress || 0) + (counts.professional_review || 0),
        externalResponsesPending: counts.external_response_pending || 0,
        consultationsToday: 0,
        casesNearingInternalDeadlines: approachingUpdates,
        escalatedSupportIssues,
        teamWorkload: workload,
        completedCases: counts.completed || 0,
        teamSize,
        revenuePayoutSummary: { currency: 'INR', collected: 0, payout: 0, status: 'not_available_phase_1' },
      },
      cases: recentCases,
    })
  } catch (error) {
    next(error)
  }
}

export const listFirmCases = async (req, res, next) => {
  try {
    const { page, limit } = pageParams(req.query)
    const accessibleIds = await getFirmAccessibleCaseIds(req.firmMembership)
    const filter = { firm: req.firm._id, ...(accessibleIds ? { _id: { $in: accessibleIds } } : {}) }
    if (req.query.status) filter.status = String(req.query.status).slice(0, 80)
    const [cases, total] = await Promise.all([
      casePublicPopulate(CACase.find(filter)).populate('customer', 'name email').sort({ updatedAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      CACase.countDocuments(filter),
    ])
    res.json({ success: true, cases, pagination: { page, limit, total, pages: Math.ceil(total / limit) } })
  } catch (error) {
    next(error)
  }
}

export const getFirmCase = async (req, res, next) => {
  try {
    const accessibleIds = await getFirmAccessibleCaseIds(req.firmMembership)
    const identity = isValidObjectId(req.params.caseId) ? { $or: [{ _id: req.params.caseId }, { reference: req.params.caseId }] } : { reference: req.params.caseId }
    const filter = { $and: [{ firm: req.firm._id }, identity, ...(accessibleIds ? [{ _id: { $in: accessibleIds } }] : [])] }
    const canViewWhatsapp = req.firmMembership.designationVerified === true
    const query = CACase.findOne(filter).select(canViewWhatsapp ? '+contactWhatsapp' : '')
    const foundCase = await casePublicPopulate(query).populate('customer', 'name email').lean()
    if (!foundCase) return res.status(404).json({ success: false, message: 'Firm case not found.' })
    const [history, assignments, documents] = await Promise.all([
      CACaseStatusHistory.find({ case: foundCase._id }).sort({ createdAt: 1 }).lean(),
      CACaseAssignment.find({ case: foundCase._id, active: true }).populate({ path: 'member', populate: { path: 'user', select: 'name email' } }).lean(),
      CACaseDocument.find({ case: foundCase._id, deletedAt: null }).select('-storageKey -checksum').lean(),
    ])
    res.json({ success: true, case: foundCase, history, assignments, documents })
  } catch (error) {
    next(error)
  }
}

export const raiseCaseQuote = async (req, res, next) => {
  try {
    if (!req.firmMembership.designationVerified) {
      return res.status(403).json({ success: false, message: 'Only an administrator-verified CA professional can raise a quote.' })
    }
    const accessibleIds = await getFirmAccessibleCaseIds(req.firmMembership)
    const filter = { firm: req.firm._id, $and: [{ _id: req.params.caseId }, ...(accessibleIds ? [{ _id: { $in: accessibleIds } }] : [])] }
    const foundCase = await CACase.findOne(filter)
    if (!foundCase) return res.status(404).json({ success: false, message: 'Assigned CA case not found.' })
    if (foundCase.paymentStatus === 'paid') return res.status(400).json({ success: false, message: 'A paid case cannot be requoted.' })

    const professionalFeePaise = Math.round(Number(req.body.professionalFeePaise))
    const scope = String(req.body.scope || '').trim()
    if (!Number.isInteger(professionalFeePaise) || professionalFeePaise < 10000 || professionalFeePaise > 50000000) {
      return res.status(400).json({ success: false, message: 'Enter a professional fee between INR 100 and INR 5,00,000.' })
    }
    if (scope.length < 20) return res.status(400).json({ success: false, message: 'Describe the quoted work in at least 20 characters.' })

    const feeSetting = await getCurrentPlatformFee('ca')
    const customerPlatformFeePaise = calculateFeePaise(professionalFeePaise, feeSetting.customerFee)
    const providerPlatformFeePaise = calculateFeePaise(professionalFeePaise, feeSetting.providerFee)
    const previousStatus = foundCase.status
    foundCase.quote = {
      professionalFeePaise,
      customerPlatformFeePaise,
      providerPlatformFeePaise,
      totalPaise: professionalFeePaise + customerPlatformFeePaise,
      providerPayoutPaise: Math.max(professionalFeePaise - providerPlatformFeePaise, 0),
      currency: 'INR', scope, feeVersion: feeSetting.version || 1,
      raisedBy: req.user._id, raisedAt: new Date(), status: 'issued',
    }
    foundCase.paymentStatus = 'pending'
    foundCase.status = 'awaiting_payment'
    foundCase.nextActionOwner = 'customer'
    foundCase.nextAction = 'Review the CA quote and pay securely in Earnova before work begins.'
    await foundCase.save()
    await Promise.all([
      CACaseStatusHistory.create({ case: foundCase._id, previousStatus, newStatus: 'awaiting_payment', changedBy: req.user._id, actorRole: 'firm_member', reason: 'Verified CA raised a quote for customer approval.', customerVisible: true }),
      AuditLog.create({ actor: req.user._id, action: 'ca_case.quote_raised', resourceType: 'CACase', resourceId: foundCase._id, summary: `Raised quote for ${foundCase.reference}`, requestId: req.id, metadata: { totalPaise: foundCase.quote.totalPaise, feeVersion: foundCase.quote.feeVersion } }),
    ])
    res.json({ success: true, case: foundCase, message: 'Quote sent to the customer for payment.' })
  } catch (error) { next(error) }
}

export const completeCaseWork = async (req, res, next) => {
  try {
    if (!req.firmMembership.designationVerified) return res.status(403).json({ success: false, message: 'Only an administrator-verified CA professional can complete this work.' })
    const accessibleIds = await getFirmAccessibleCaseIds(req.firmMembership)
    const filter = { firm: req.firm._id, $and: [{ _id: req.params.caseId }, ...(accessibleIds ? [{ _id: { $in: accessibleIds } }] : [])] }
    const foundCase = await CACase.findOne(filter)
    if (!foundCase) return res.status(404).json({ success: false, message: 'Assigned CA case not found.' })
    if (foundCase.paymentStatus !== 'paid') return res.status(400).json({ success: false, message: 'Customer payment must be confirmed before completing the work.' })
    const completionSummary = String(req.body.completionSummary || '').trim()
    if (completionSummary.length < 20) return res.status(400).json({ success: false, message: 'Provide a customer-visible completion summary of at least 20 characters.' })
    const previousStatus = foundCase.status
    foundCase.completionSummary = completionSummary
    foundCase.status = 'completed'
    foundCase.completedAt = new Date()
    foundCase.nextActionOwner = 'none'
    foundCase.nextAction = 'The quoted CA work is complete. Review the completion summary and secure case documents.'
    await foundCase.save()
    await Promise.all([
      CACaseStatusHistory.create({ case: foundCase._id, previousStatus, newStatus: 'completed', changedBy: req.user._id, actorRole: 'firm_member', reason: 'Verified CA marked the paid work complete.', customerVisible: true }),
      AuditLog.create({ actor: req.user._id, action: 'ca_case.completed', resourceType: 'CACase', resourceId: foundCase._id, summary: `Completed ${foundCase.reference}`, requestId: req.id }),
    ])
    res.json({ success: true, case: foundCase, message: 'CA work marked complete.' })
  } catch (error) { next(error) }
}

export const createCasePaymentOrder = async (req, res, next) => {
  try {
    const foundCase = await CACase.findOne({ _id: req.params.caseId, customer: req.user._id })
    if (!foundCase) return res.status(404).json({ success: false, message: 'CA case not found.' })
    if (!['pending', 'failed'].includes(foundCase.paymentStatus) || foundCase.quote?.status !== 'issued') {
      return res.status(400).json({ success: false, message: 'This case does not have an unpaid active quote.' })
    }
    const { keyId, instance } = getRazorpay()
    const order = await instance.orders.create({ amount: foundCase.quote.totalPaise, currency: 'INR', receipt: foundCase.reference, notes: { caseReference: foundCase.reference, purpose: 'ca-case-quote' } })
    foundCase.razorpayOrderId = order.id
    foundCase.paymentStatus = 'pending'
    await foundCase.save()
    res.json({ success: true, keyId, orderId: order.id, amount: order.amount, currency: order.currency, caseReference: foundCase.reference })
  } catch (error) { next(error) }
}

export const verifyCasePayment = async (req, res, next) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body
    const foundCase = await CACase.findOne({ _id: req.params.caseId, customer: req.user._id, razorpayOrderId })
    if (!foundCase) return res.status(404).json({ success: false, message: 'CA quote payment not found.' })
    const { keySecret } = getRazorpay()
    const expected = crypto.createHmac('sha256', keySecret).update(`${razorpayOrderId}|${razorpayPaymentId}`).digest('hex')
    if (!razorpaySignature || expected !== razorpaySignature) return res.status(400).json({ success: false, message: 'Payment verification failed.' })
    if (foundCase.paymentStatus === 'paid' && foundCase.razorpayPaymentId === razorpayPaymentId) {
      return res.json({ success: true, case: toCustomerCase(foundCase.toObject()), message: 'Payment was already confirmed. CA work can begin.' })
    }
    if (foundCase.paymentStatus !== 'pending') return res.status(400).json({ success: false, message: 'This quote is not awaiting payment.' })
    foundCase.razorpayPaymentId = razorpayPaymentId
    foundCase.paymentStatus = 'paid'
    foundCase.quote.status = 'paid'
    foundCase.paidAt = new Date()
    foundCase.status = 'payment_received'
    foundCase.nextActionOwner = 'firm'
    foundCase.nextAction = 'Payment confirmed. The assigned CA will now complete the quoted work.'
    await foundCase.save()
    await CACaseStatusHistory.create({ case: foundCase._id, previousStatus: 'awaiting_payment', newStatus: 'payment_received', changedBy: req.user._id, actorRole: 'customer', reason: 'Customer paid the CA quote through Earnova.', customerVisible: true })
    res.json({ success: true, case: foundCase, message: 'Payment confirmed. CA work can begin.' })
  } catch (error) { next(error) }
}

export const assignCaseMember = async (req, res, next) => {
  try {
    const foundCase = await CACase.findOne({ _id: req.params.caseId, firm: req.firm._id })
    if (!foundCase) return res.status(404).json({ success: false, message: 'Firm case not found.' })
    const member = await CAFirmMember.findOne({ _id: req.body.memberId, firm: req.firm._id, status: 'active' })
    if (!member) return res.status(400).json({ success: false, message: 'Choose an active member of this firm.' })
    const allowedRoles = ['lead_professional', 'case_manager', 'accountant', 'reviewer', 'support_owner']
    if (!allowedRoles.includes(req.body.assignmentRole)) return res.status(400).json({ success: false, message: 'Choose a valid assignment role.' })
    const assignment = await CACaseAssignment.findOneAndUpdate(
      { case: foundCase._id, member: member._id, assignmentRole: req.body.assignmentRole },
      { firm: req.firm._id, active: true, assignedBy: req.user._id, assignedAt: new Date(), removedAt: null },
      { upsert: true, new: true, runValidators: true }
    )
    await AuditLog.create({
      actor: req.user._id,
      action: 'ca_case.member_assigned',
      resourceType: 'CACase',
      resourceId: foundCase._id,
      summary: `Assigned a firm member to ${foundCase.reference}`,
      requestId: req.id,
      metadata: { assignmentRole: req.body.assignmentRole, firmId: String(req.firm._id) },
    })
    res.json({ success: true, assignment })
  } catch (error) {
    next(error)
  }
}

export const getFirmTeam = async (req, res, next) => {
  try {
    const members = await CAFirmMember.find({ firm: req.firm._id, status: { $ne: 'removed' } })
      .populate('user', 'name email').select('user platformRole professionalDesignation designationVerified status joinedAt').sort({ platformRole: 1, createdAt: 1 }).lean()
    res.json({ success: true, firm: { _id: req.firm._id, displayName: req.firm.displayName }, members })
  } catch (error) {
    next(error)
  }
}

export const addFirmMember = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: String(req.body.email || '').trim().toLowerCase(), isActive: true }).select('_id name email')
    if (!user) return res.status(404).json({ success: false, message: 'An active Earnova user with this email is required.' })
    const allowedRoles = ['firm_owner', 'firm_administrator', 'partner_ca', 'ca_employee', 'accountant', 'article_assistant', 'case_manager', 'reviewer', 'billing_administrator', 'support_coordinator']
    if (!allowedRoles.includes(req.body.platformRole)) return res.status(400).json({ success: false, message: 'Choose a valid firm platform role.' })
    const member = await CAFirmMember.findOneAndUpdate(
      { firm: req.firm._id, user: user._id },
      {
        platformRole: req.body.platformRole,
        professionalDesignation: String(req.body.professionalDesignation || '').trim(),
        designationVerified: false,
        status: 'active',
        joinedAt: new Date(),
        invitedBy: req.user._id,
      },
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
    ).populate('user', 'name email')
    await AuditLog.create({
      actor: req.user._id, action: 'ca_firm.member_added', resourceType: 'CAFirmMember', resourceId: member._id,
      summary: `Added a member to ${req.firm.displayName}`, requestId: req.id,
      metadata: { firmId: String(req.firm._id), platformRole: member.platformRole },
    })
    res.status(201).json({ success: true, member })
  } catch (error) {
    next(error)
  }
}
