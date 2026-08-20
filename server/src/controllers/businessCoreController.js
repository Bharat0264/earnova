import mongoose from 'mongoose'
import Business from '../models/Business.js'
import BusinessMember from '../models/BusinessMember.js'
import BusinessCustomer from '../models/BusinessCustomer.js'
import BusinessLead from '../models/BusinessLead.js'
import BusinessProduct from '../models/BusinessProduct.js'
import BusinessActivity from '../models/BusinessActivity.js'
import { isValidEmail, isValidIndianPhone, normalizeEmail } from '../utils/validation.js'
import { moneyPaise } from '../services/businessAnalytics.js'

const escapeRegex = value => String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const pagination = query => {
  const page = Math.max(1, Number.parseInt(query.page, 10) || 1)
  const limit = Math.min(100, Math.max(1, Number.parseInt(query.limit, 10) || 20))
  return { page, limit, skip: (page - 1) * limit }
}

const recordActivity = payload => BusinessActivity.create(payload).catch(error => {
  console.warn('[Business activity]', error.message)
})

export const listBusinesses = async (req, res) => {
  try {
    if (req.user.role === 'admin') {
      const businesses = await Business.find({ status: 'active' }).sort('-createdAt').limit(100).lean()
      return res.json({ success: true, businesses: businesses.map(business => ({ ...business, membershipRole: 'admin' })) })
    }

    const memberships = await BusinessMember.find({ user: req.user._id, status: 'active' })
      .populate({ path: 'business', match: { status: 'active' } })
      .sort('-createdAt')
      .lean()
    const businesses = memberships
      .filter(membership => membership.business)
      .map(membership => ({ ...membership.business, membershipRole: membership.role }))
    res.json({ success: true, businesses })
  } catch (error) {
    console.error('[Business list]', error.message)
    res.status(500).json({ success: false, message: 'Could not load businesses.' })
  }
}

export const createBusiness = async (req, res) => {
  const session = await mongoose.startSession()
  try {
    const name = String(req.body.name || '').trim()
    const industry = String(req.body.industry || '').trim()
    const email = normalizeEmail(req.body.email)
    const phone = String(req.body.phone || '').trim()
    if (name.length < 2 || name.length > 140 || !industry || industry.length > 100) {
      return res.status(400).json({ success: false, message: 'Business name and industry are required.' })
    }
    if ((email && !isValidEmail(email)) || !isValidIndianPhone(phone)) {
      return res.status(400).json({ success: false, message: 'Enter a valid business email and Indian mobile number.' })
    }

    let business
    await session.withTransaction(async () => {
      ;[business] = await Business.create([{
        owner: req.user._id,
        name,
        industry,
        businessType: req.body.businessType || 'proprietorship',
        stage: ['idea', 'starting', 'launching', 'operating', 'growing'].includes(req.body.stage) ? req.body.stage : 'starting',
        businessModel: ['online', 'offline', 'hybrid', 'unspecified'].includes(req.body.businessModel) ? req.body.businessModel : 'unspecified',
        description: String(req.body.description || '').trim(),
        location: String(req.body.location || '').trim(),
        website: String(req.body.website || '').trim(),
        goals: Array.isArray(req.body.goals) ? req.body.goals.slice(0, 10).map(goal => String(goal).trim()).filter(Boolean) : [],
        gstin: String(req.body.gstin || '').trim().toUpperCase(),
        phone,
        email,
        address: String(req.body.address || '').trim(),
      }], { session })
      await BusinessMember.create([{
        business: business._id,
        user: req.user._id,
        role: 'owner',
        status: 'active',
        joinedAt: new Date(),
      }], { session })
    })

    await recordActivity({
      business: business._id,
      actor: req.user._id,
      type: 'business.created',
      entityType: 'Business',
      entityId: business._id,
      summary: `Created business workspace ${business.name}.`,
    })
    res.status(201).json({ success: true, business: { ...business.toObject(), membershipRole: 'owner' } })
  } catch (error) {
    console.error('[Business create]', error.message)
    res.status(400).json({ success: false, message: 'Could not create the business workspace.' })
  } finally {
    await session.endSession()
  }
}

export const getBusiness = async (req, res) => {
  res.json({
    success: true,
    business: {
      ...req.business.toObject(),
      membershipRole: req.businessMembership.role,
    },
  })
}

export const updateBusiness = async (req, res) => {
  try {
    const allowed = ['name', 'industry', 'businessType', 'businessModel', 'stage', 'description', 'location', 'website', 'goals', 'gstin', 'phone', 'email', 'address']
    const updates = {}
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = typeof req.body[key] === 'string' ? req.body[key].trim() : req.body[key]
    }
    const business = await Business.findByIdAndUpdate(req.business._id, updates, { new: true, runValidators: true })
    await recordActivity({
      business: business._id,
      actor: req.user._id,
      type: 'business.updated',
      entityType: 'Business',
      entityId: business._id,
      summary: 'Updated business profile.',
    })
    res.json({ success: true, business: { ...business.toObject(), membershipRole: req.businessMembership.role } })
  } catch {
    res.status(400).json({ success: false, message: 'Could not update business details.' })
  }
}

export const listCustomers = async (req, res) => {
  try {
    const { page, limit, skip } = pagination(req.query)
    const search = String(req.query.search || '').trim()
    const filter = { business: req.business._id }
    if (search) {
      const regex = new RegExp(escapeRegex(search), 'i')
      filter.$or = [{ name: regex }, { email: regex }, { phone: regex }, { company: regex }]
    }
    const [customers, total] = await Promise.all([
      BusinessCustomer.find(filter).sort('-createdAt').skip(skip).limit(limit).lean(),
      BusinessCustomer.countDocuments(filter),
    ])
    res.json({ success: true, customers, total, page, pages: Math.max(1, Math.ceil(total / limit)) })
  } catch {
    res.status(500).json({ success: false, message: 'Could not load customers.' })
  }
}

export const createCustomer = async (req, res) => {
  try {
    const name = String(req.body.name || '').trim()
    const email = normalizeEmail(req.body.email)
    const phone = String(req.body.phone || '').trim()
    if (name.length < 2 || name.length > 140 || (email && !isValidEmail(email)) || !isValidIndianPhone(phone)) {
      return res.status(400).json({ success: false, message: 'Enter a valid customer name, email and Indian mobile number.' })
    }
    const duplicateClauses = []
    if (email) duplicateClauses.push({ email })
    if (phone) duplicateClauses.push({ phone })
    if (duplicateClauses.length && await BusinessCustomer.exists({ business: req.business._id, $or: duplicateClauses })) {
      return res.status(409).json({ success: false, message: 'A customer with this email or phone already exists.' })
    }
    const customer = await BusinessCustomer.create({
      business: req.business._id,
      name,
      email,
      phone,
      company: String(req.body.company || '').trim(),
      address: String(req.body.address || '').trim(),
      notes: String(req.body.notes || '').trim(),
      tags: Array.isArray(req.body.tags) ? req.body.tags.slice(0, 20) : [],
      createdBy: req.user._id,
      lastActivityAt: new Date(),
    })
    await recordActivity({
      business: req.business._id,
      actor: req.user._id,
      type: 'customer.created',
      entityType: 'BusinessCustomer',
      entityId: customer._id,
      summary: `Added customer ${customer.name}.`,
    })
    res.status(201).json({ success: true, customer })
  } catch {
    res.status(400).json({ success: false, message: 'Could not add the customer.' })
  }
}

export const listLeads = async (req, res) => {
  try {
    const { page, limit, skip } = pagination(req.query)
    const filter = { business: req.business._id }
    if (req.query.stage) filter.stage = req.query.stage
    if (req.query.search) {
      const regex = new RegExp(escapeRegex(req.query.search), 'i')
      filter.$or = [{ name: regex }, { company: regex }, { email: regex }, { phone: regex }, { source: regex }]
    }
    const [leads, total] = await Promise.all([
      BusinessLead.find(filter).sort({ followUpAt: 1, createdAt: -1 }).skip(skip).limit(limit).lean(),
      BusinessLead.countDocuments(filter),
    ])
    res.json({ success: true, leads, total, page, pages: Math.max(1, Math.ceil(total / limit)) })
  } catch {
    res.status(500).json({ success: false, message: 'Could not load leads.' })
  }
}

export const createLead = async (req, res) => {
  try {
    const valuePaise = moneyPaise(req.body.estimatedValuePaise ?? 0)
    const name = String(req.body.name || '').trim()
    if (name.length < 2 || valuePaise === null) {
      return res.status(400).json({ success: false, message: 'Lead name and estimated value are invalid.' })
    }
    const lead = await BusinessLead.create({
      business: req.business._id,
      name,
      company: String(req.body.company || '').trim(),
      email: normalizeEmail(req.body.email),
      phone: String(req.body.phone || '').trim(),
      stage: req.body.stage || 'new',
      source: String(req.body.source || '').trim(),
      estimatedValuePaise: valuePaise,
      followUpAt: req.body.followUpAt || undefined,
      notes: String(req.body.notes || '').trim(),
      assignedTo: req.body.assignedTo || req.user._id,
      createdBy: req.user._id,
    })
    await recordActivity({
      business: req.business._id,
      actor: req.user._id,
      type: 'lead.created',
      entityType: 'BusinessLead',
      entityId: lead._id,
      summary: `Added lead ${lead.name}.`,
    })
    res.status(201).json({ success: true, lead })
  } catch {
    res.status(400).json({ success: false, message: 'Could not add the lead.' })
  }
}

export const updateLead = async (req, res) => {
  try {
    const allowed = ['stage', 'followUpAt', 'notes', 'assignedTo', 'estimatedValuePaise', 'source']
    const updates = {}
    for (const key of allowed) if (req.body[key] !== undefined) updates[key] = req.body[key]
    if (updates.estimatedValuePaise !== undefined) {
      updates.estimatedValuePaise = moneyPaise(updates.estimatedValuePaise)
      if (updates.estimatedValuePaise === null) return res.status(400).json({ success: false, message: 'Invalid estimated value.' })
    }
    const lead = await BusinessLead.findOneAndUpdate(
      { _id: req.params.leadId, business: req.business._id },
      updates,
      { new: true, runValidators: true }
    )
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found.' })
    if (lead.stage === 'won' && !lead.convertedCustomer) {
      const contactClauses = [
        ...(lead.email ? [{ email: lead.email }] : []),
        ...(lead.phone ? [{ phone: lead.phone }] : []),
      ]
      let customer = contactClauses.length
        ? await BusinessCustomer.findOne({ business: req.business._id, $or: contactClauses })
        : null
      if (!customer) {
        customer = await BusinessCustomer.create({
          business: req.business._id,
          name: lead.name,
          email: lead.email,
          phone: lead.phone,
          company: lead.company,
          notes: `Converted from lead${lead.source ? ` (${lead.source})` : ''}.`,
          createdBy: req.user._id,
          lastActivityAt: new Date(),
        })
      }
      lead.convertedCustomer = customer._id
      await lead.save()
    }
    await recordActivity({
      business: req.business._id,
      actor: req.user._id,
      type: 'lead.updated',
      entityType: 'BusinessLead',
      entityId: lead._id,
      summary: `Updated lead ${lead.name} to ${lead.stage}.`,
    })
    res.json({ success: true, lead })
  } catch {
    res.status(400).json({ success: false, message: 'Could not update the lead.' })
  }
}

export const listBusinessProducts = async (req, res) => {
  try {
    const { page, limit, skip } = pagination(req.query)
    const filter = { business: req.business._id, active: true }
    if (req.query.lowStock === 'true') filter.$expr = { $lte: ['$currentQuantity', '$reorderLevel'] }
    if (req.query.search) {
      const regex = new RegExp(escapeRegex(req.query.search), 'i')
      filter.$or = [{ sku: regex }, { name: regex }, { category: regex }, { supplier: regex }]
    }
    const [products, total] = await Promise.all([
      BusinessProduct.find(filter).sort('-createdAt').skip(skip).limit(limit).lean(),
      BusinessProduct.countDocuments(filter),
    ])
    res.json({ success: true, products, total, page, pages: Math.max(1, Math.ceil(total / limit)) })
  } catch {
    res.status(500).json({ success: false, message: 'Could not load inventory.' })
  }
}

export const createBusinessProduct = async (req, res) => {
  try {
    const purchasePricePaise = moneyPaise(req.body.purchasePricePaise ?? 0)
    const sellingPricePaise = moneyPaise(req.body.sellingPricePaise)
    const currentQuantity = Number(req.body.currentQuantity ?? 0)
    const reorderLevel = Number(req.body.reorderLevel ?? 0)
    if (!String(req.body.sku || '').trim() || !String(req.body.name || '').trim() || sellingPricePaise === null ||
      purchasePricePaise === null || !Number.isInteger(currentQuantity) || currentQuantity < 0 ||
      !Number.isInteger(reorderLevel) || reorderLevel < 0) {
      return res.status(400).json({ success: false, message: 'SKU, name, prices and stock values are required.' })
    }
    const product = await BusinessProduct.create({
      business: req.business._id,
      sku: String(req.body.sku).trim().toUpperCase(),
      name: String(req.body.name).trim(),
      category: String(req.body.category || '').trim(),
      purchasePricePaise,
      sellingPricePaise,
      currentQuantity,
      reorderLevel,
      supplier: String(req.body.supplier || '').trim(),
      createdBy: req.user._id,
    })
    await recordActivity({
      business: req.business._id,
      actor: req.user._id,
      type: 'product.created',
      entityType: 'BusinessProduct',
      entityId: product._id,
      summary: `Added inventory item ${product.name}.`,
    })
    res.status(201).json({ success: true, product })
  } catch (error) {
    res.status(error?.code === 11000 ? 409 : 400).json({
      success: false,
      message: error?.code === 11000 ? 'This SKU already exists.' : 'Could not add the inventory item.',
    })
  }
}

export const adjustInventory = async (req, res) => {
  try {
    const adjustment = Number(req.body.adjustment)
    if (!Number.isInteger(adjustment) || adjustment === 0) {
      return res.status(400).json({ success: false, message: 'Adjustment must be a non-zero whole number.' })
    }
    const product = await BusinessProduct.findOne({ _id: req.params.productId, business: req.business._id, active: true })
    if (!product) return res.status(404).json({ success: false, message: 'Inventory item not found.' })
    if (product.currentQuantity + adjustment < 0) {
      return res.status(409).json({ success: false, message: 'Adjustment would make stock negative.' })
    }
    product.currentQuantity += adjustment
    await product.save()
    await recordActivity({
      business: req.business._id,
      actor: req.user._id,
      type: 'inventory.adjusted',
      entityType: 'BusinessProduct',
      entityId: product._id,
      summary: `Adjusted ${product.name} stock by ${adjustment}.`,
      metadata: { adjustment, reason: String(req.body.reason || '').trim().slice(0, 300) },
    })
    res.json({ success: true, product })
  } catch {
    res.status(400).json({ success: false, message: 'Could not adjust inventory.' })
  }
}
