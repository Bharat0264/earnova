import crypto from 'crypto'
import mongoose from 'mongoose'
import BusinessActivity from '../models/BusinessActivity.js'
import BusinessCustomer from '../models/BusinessCustomer.js'
import BusinessExpense from '../models/BusinessExpense.js'
import BusinessInvoice from '../models/BusinessInvoice.js'
import BusinessLead from '../models/BusinessLead.js'
import BusinessProduct from '../models/BusinessProduct.js'
import BusinessSale from '../models/BusinessSale.js'
import { snapshot } from './capabilityController.js'
import { isolateFault, verificationPlan } from '../services/capabilityEngine.js'
import {
  buildBusinessRecommendations,
  calculateDocumentTotals,
  calculateLine,
  getDateRange,
  moneyPaise,
} from '../services/businessAnalytics.js'

const escapeRegex = value => String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const pageOptions = query => {
  const page = Math.max(1, Number.parseInt(query.page, 10) || 1)
  const limit = Math.min(100, Math.max(1, Number.parseInt(query.limit, 10) || 20))
  return { page, limit, skip: (page - 1) * limit }
}

const referenceNumber = prefix =>
  `${prefix}-${new Date().toISOString().slice(0, 10).replaceAll('-', '')}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`

const logActivity = payload => BusinessActivity.create(payload).catch(error => {
  console.warn('[Business activity]', error.message)
})

const dateFilter = (field, query) => {
  const { startDate, endDate, preset } = getDateRange(query)
  return { filter: { [field]: { $gte: startDate, $lte: endDate } }, startDate, endDate, preset }
}

export const listSales = async (req, res) => {
  try {
    const { page, limit, skip } = pageOptions(req.query)
    const range = dateFilter('saleDate', req.query)
    const filter = { business: req.business._id, ...range.filter }
    if (req.query.paymentStatus) filter.paymentStatus = req.query.paymentStatus
    if (req.query.search) {
      const regex = new RegExp(escapeRegex(req.query.search), 'i')
      filter.$or = [{ saleNumber: regex }, { customerName: regex }, { 'items.name': regex }, { 'items.sku': regex }]
    }
    const [sales, total] = await Promise.all([
      BusinessSale.find(filter).populate('customer', 'name company').sort('-saleDate').skip(skip).limit(limit).lean(),
      BusinessSale.countDocuments(filter),
    ])
    res.json({ success: true, sales, total, page, pages: Math.max(1, Math.ceil(total / limit)) })
  } catch (error) {
    res.status(400).json({ success: false, message: error.message || 'Could not load sales.' })
  }
}

export const createSale = async (req, res) => {
  const session = await mongoose.startSession()
  try {
    if (!Array.isArray(req.body.items) || !req.body.items.length || req.body.items.length > 100) {
      return res.status(400).json({ success: false, message: 'Add between 1 and 100 sale items.' })
    }

    let sale
    await session.withTransaction(async () => {
      const customer = req.body.customerId
        ? await BusinessCustomer.findOne({ _id: req.body.customerId, business: req.business._id }).session(session)
        : null
      if (req.body.customerId && !customer) throw new Error('Customer not found.')

      const lines = []
      for (const item of req.body.items) {
        const product = await BusinessProduct.findOne({
          _id: item.productId,
          business: req.business._id,
          active: true,
        }).session(session)
        if (!product) throw new Error('One of the selected inventory items was not found.')
        const calculated = calculateLine({
          quantity: item.quantity,
          unitPricePaise: product.sellingPricePaise,
          discountPaise: item.discountPaise,
          taxRateBps: item.taxRateBps,
          integerQuantity: true,
        })
        if (product.currentQuantity < calculated.quantity) {
          throw new Error(`${product.name} has only ${product.currentQuantity} unit(s) available.`)
        }
        product.currentQuantity -= calculated.quantity
        await product.save({ session })
        lines.push({
          product: product._id,
          name: product.name,
          sku: product.sku,
          ...calculated,
        })
      }

      const totals = calculateDocumentTotals(lines)
      ;[sale] = await BusinessSale.create([{
        business: req.business._id,
        saleNumber: referenceNumber('SAL'),
        customer: customer?._id,
        customerName: customer?.name || String(req.body.customerName || '').trim(),
        items: lines,
        ...totals,
        paymentStatus: req.body.paymentStatus || 'paid',
        paymentMethod: req.body.paymentMethod || 'cash',
        saleDate: req.body.saleDate || new Date(),
        notes: String(req.body.notes || '').trim(),
        createdBy: req.user._id,
      }], { session })

      if (customer) {
        customer.totalRevenuePaise += totals.totalPaise
        customer.orderCount += 1
        customer.lastActivityAt = new Date()
        await customer.save({ session })
      }
    })

    await logActivity({
      business: req.business._id,
      actor: req.user._id,
      type: 'sale.created',
      entityType: 'BusinessSale',
      entityId: sale._id,
      summary: `Recorded sale ${sale.saleNumber}.`,
      metadata: { totalPaise: sale.totalPaise },
    })
    res.status(201).json({ success: true, sale })
  } catch (error) {
    res.status(400).json({ success: false, message: error.message || 'Could not record the sale.' })
  } finally {
    await session.endSession()
  }
}

export const listExpenses = async (req, res) => {
  try {
    const { page, limit, skip } = pageOptions(req.query)
    const range = dateFilter('expenseDate', req.query)
    const filter = { business: req.business._id, ...range.filter }
    if (req.query.category) filter.category = req.query.category
    if (req.query.search) {
      const regex = new RegExp(escapeRegex(req.query.search), 'i')
      filter.$or = [{ category: regex }, { vendor: regex }, { notes: regex }]
    }
    const [expenses, total] = await Promise.all([
      BusinessExpense.find(filter).sort('-expenseDate').skip(skip).limit(limit).lean(),
      BusinessExpense.countDocuments(filter),
    ])
    res.json({ success: true, expenses, total, page, pages: Math.max(1, Math.ceil(total / limit)) })
  } catch (error) {
    res.status(400).json({ success: false, message: error.message || 'Could not load expenses.' })
  }
}

export const createExpense = async (req, res) => {
  try {
    const amountPaise = moneyPaise(req.body.amountPaise)
    const category = String(req.body.category || '').trim()
    if (!category || amountPaise === null || amountPaise < 1) {
      return res.status(400).json({ success: false, message: 'Category and a positive expense amount are required.' })
    }
    const expense = await BusinessExpense.create({
      business: req.business._id,
      category,
      amountPaise,
      vendor: String(req.body.vendor || '').trim(),
      expenseDate: req.body.expenseDate || new Date(),
      paymentMethod: req.body.paymentMethod || 'cash',
      notes: String(req.body.notes || '').trim(),
      receipt: req.body.receipt,
      recurring: Boolean(req.body.recurring),
      createdBy: req.user._id,
    })
    await logActivity({
      business: req.business._id,
      actor: req.user._id,
      type: 'expense.created',
      entityType: 'BusinessExpense',
      entityId: expense._id,
      summary: `Recorded ${expense.category} expense.`,
      metadata: { amountPaise: expense.amountPaise },
    })
    res.status(201).json({ success: true, expense })
  } catch {
    res.status(400).json({ success: false, message: 'Could not record the expense.' })
  }
}

export const listInvoices = async (req, res) => {
  try {
    const { page, limit, skip } = pageOptions(req.query)
    const filter = { business: req.business._id }
    if (req.query.status) filter.status = req.query.status
    if (req.query.search) {
      const regex = new RegExp(escapeRegex(req.query.search), 'i')
      filter.$or = [{ invoiceNumber: regex }, { 'customerSnapshot.name': regex }]
    }
    const [invoices, total] = await Promise.all([
      BusinessInvoice.find(filter).populate('customer', 'name company').sort('-issueDate').skip(skip).limit(limit).lean(),
      BusinessInvoice.countDocuments(filter),
    ])
    res.json({ success: true, invoices, total, page, pages: Math.max(1, Math.ceil(total / limit)) })
  } catch {
    res.status(500).json({ success: false, message: 'Could not load invoices.' })
  }
}

export const createInvoice = async (req, res) => {
  try {
    const customer = await BusinessCustomer.findOne({
      _id: req.body.customerId,
      business: req.business._id,
    })
    if (!customer) return res.status(400).json({ success: false, message: 'Select a valid customer.' })
    if (!Array.isArray(req.body.items) || !req.body.items.length || req.body.items.length > 100) {
      return res.status(400).json({ success: false, message: 'Add between 1 and 100 invoice items.' })
    }
    const lines = req.body.items.map(item => ({
      description: String(item.description || '').trim(),
      ...calculateLine(item),
    }))
    if (lines.some(line => !line.description)) {
      return res.status(400).json({ success: false, message: 'Every invoice line needs a description.' })
    }
    const issueDate = new Date(req.body.issueDate || Date.now())
    const dueDate = new Date(req.body.dueDate)
    if (Number.isNaN(dueDate.getTime()) || dueDate < issueDate) {
      return res.status(400).json({ success: false, message: 'Due date must be on or after the issue date.' })
    }
    const invoice = await BusinessInvoice.create({
      business: req.business._id,
      invoiceNumber: referenceNumber('INV'),
      customer: customer._id,
      customerSnapshot: {
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
      },
      items: lines,
      ...calculateDocumentTotals(lines),
      issueDate,
      dueDate,
      status: req.body.status || 'draft',
      notes: String(req.body.notes || '').trim(),
      createdBy: req.user._id,
    })
    await logActivity({
      business: req.business._id,
      actor: req.user._id,
      type: 'invoice.created',
      entityType: 'BusinessInvoice',
      entityId: invoice._id,
      summary: `Created invoice ${invoice.invoiceNumber}.`,
      metadata: { totalPaise: invoice.totalPaise },
    })
    res.status(201).json({ success: true, invoice })
  } catch (error) {
    res.status(400).json({ success: false, message: error.message || 'Could not create the invoice.' })
  }
}

export const updateInvoiceStatus = async (req, res) => {
  try {
    const allowed = ['draft', 'sent', 'partial', 'paid', 'cancelled']
    if (!allowed.includes(req.body.status)) {
      return res.status(400).json({ success: false, message: 'Invalid invoice status.' })
    }
    const update = {
      status: req.body.status,
      paidAt: req.body.status === 'paid' ? new Date() : null,
    }
    const invoice = await BusinessInvoice.findOneAndUpdate(
      { _id: req.params.invoiceId, business: req.business._id },
      update,
      { new: true, runValidators: true }
    )
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found.' })
    await logActivity({
      business: req.business._id,
      actor: req.user._id,
      type: 'invoice.updated',
      entityType: 'BusinessInvoice',
      entityId: invoice._id,
      summary: `Marked ${invoice.invoiceNumber} as ${invoice.status}.`,
    })
    res.json({ success: true, invoice })
  } catch {
    res.status(400).json({ success: false, message: 'Could not update the invoice.' })
  }
}

const collectMetrics = async (businessId, query = {}) => {
  const { startDate, endDate, preset } = getDateRange(query)
  const now = new Date()
  const business = new mongoose.Types.ObjectId(businessId)
  const saleMatch = { business, saleDate: { $gte: startDate, $lte: endDate }, paymentStatus: { $ne: 'refunded' } }
  const expenseMatch = { business, expenseDate: { $gte: startDate, $lte: endDate } }

  const [
    salesAgg,
    expenseAgg,
    customerCount,
    lowStockCount,
    overdueAgg,
    outstandingAgg,
    followUpsDue,
    pipelineAgg,
    topProducts,
    recentActivity,
  ] = await Promise.all([
    BusinessSale.aggregate([{ $match: saleMatch }, { $group: { _id: null, revenuePaise: { $sum: '$totalPaise' }, orderCount: { $sum: 1 } } }]),
    BusinessExpense.aggregate([{ $match: expenseMatch }, { $group: { _id: null, expensePaise: { $sum: '$amountPaise' }, count: { $sum: 1 } } }]),
    BusinessCustomer.countDocuments({ business }),
    BusinessProduct.countDocuments({ business, active: true, $expr: { $lte: ['$currentQuantity', '$reorderLevel'] } }),
    BusinessInvoice.aggregate([
      { $match: { business, status: { $in: ['sent', 'partial', 'overdue'] }, dueDate: { $lt: now } } },
      { $group: { _id: null, total: { $sum: '$totalPaise' } } },
    ]),
    BusinessInvoice.aggregate([
      { $match: { business, status: { $in: ['draft', 'sent', 'partial', 'overdue'] } } },
      { $group: { _id: null, total: { $sum: '$totalPaise' } } },
    ]),
    BusinessLead.countDocuments({ business, stage: { $nin: ['won', 'lost'] }, followUpAt: { $lte: now } }),
    BusinessLead.aggregate([
      { $match: { business, stage: { $nin: ['won', 'lost'] } } },
      { $group: { _id: null, value: { $sum: '$estimatedValuePaise' }, count: { $sum: 1 } } },
    ]),
    BusinessSale.aggregate([
      { $match: saleMatch },
      { $unwind: '$items' },
      { $group: { _id: '$items.name', quantity: { $sum: '$items.quantity' }, revenuePaise: { $sum: '$items.lineTotalPaise' } } },
      { $sort: { revenuePaise: -1 } },
      { $limit: 5 },
    ]),
    BusinessActivity.find({ business }).sort('-createdAt').limit(8).lean(),
  ])

  const revenuePaise = salesAgg[0]?.revenuePaise || 0
  const expensePaise = expenseAgg[0]?.expensePaise || 0
  const metrics = {
    revenuePaise,
    expensePaise,
    profitPaise: revenuePaise - expensePaise,
    orderCount: salesAgg[0]?.orderCount || 0,
    expenseCount: expenseAgg[0]?.count || 0,
    customerCount,
    lowStockCount,
    overdueInvoicePaise: overdueAgg[0]?.total || 0,
    outstandingInvoicePaise: outstandingAgg[0]?.total || 0,
    followUpsDue,
    pipelineValuePaise: pipelineAgg[0]?.value || 0,
    openLeadCount: pipelineAgg[0]?.count || 0,
  }
  return {
    metrics,
    recommendations: buildBusinessRecommendations(metrics),
    topProducts,
    recentActivity,
    period: { preset, start: startDate.toISOString(), end: endDate.toISOString() },
  }
}

export const getBusinessOverview = async (req, res) => {
  try {
    res.json({ success: true, ...(await collectMetrics(req.business._id, req.query)) })
  } catch (error) {
    res.status(400).json({ success: false, message: error.message || 'Could not load analytics.' })
  }
}

export const askBusinessAssistant = async (req, res) => {
  try {
    const question = String(req.body.question || '').trim().slice(0, 500)
    if (question.length < 3) {
      return res.status(400).json({ success: false, message: 'Ask a specific business question.' })
    }
    const insight = await collectMetrics(req.business._id, req.body)
    const q = question.toLowerCase()
    const intent = /(sell online|store ready|business status|blocking my business|ready to sell)/.test(q) ? 'SELL_ONLINE' : /(payments? working|recheck payments?)/.test(q) ? 'PAYMENT_ACCEPTANCE' : /(website working|verify my website)/.test(q) ? 'PUBLIC_WEB_PRESENCE' : /(delivery unavailable|fulfil|fulfill)/.test(q) ? 'FULFILMENT' : null
    if (intent) {
      const engine = await snapshot(req.business._id)
      const fault = isolateFault(intent, engine.states)
      const wantsReverify = /(check again|reverify|recheck|verify)/.test(q)
      return res.json({ success: true, answer: { question, summary: `${intent.replaceAll('_', ' ')} is ${engine.states[intent].replaceAll('_', ' ').toLowerCase()}.`, confidence: 'Engine-derived', limitation: 'Capability state is determined by Earnova verification evidence.', engine: { capability: intent, state: engine.states[intent], reasonChain: fault.chain, plannedChecks: wantsReverify ? verificationPlan(intent, engine.states) : undefined, actions: wantsReverify ? ['REQUEST_REVERIFY'] : ['OPEN_STATUS', 'OPEN_RECOVERY_PLAN'] } } })
    }
    const { metrics } = insight
    let summary
    let supportingMetrics
    let recommendedAction

    if (/(stock|inventory|reorder)/.test(q)) {
      summary = `${metrics.lowStockCount} active inventory item(s) are at or below their reorder level.`
      supportingMetrics = { lowStockCount: metrics.lowStockCount, topProducts: insight.topProducts }
      recommendedAction = 'Review low-stock items against recent product sales before replenishing.'
    } else if (/(expense|cost|profit|margin)/.test(q)) {
      summary = `Recorded profit is ₹${(metrics.profitPaise / 100).toLocaleString('en-IN')} for the selected period.`
      supportingMetrics = {
        revenuePaise: metrics.revenuePaise,
        expensePaise: metrics.expensePaise,
        profitPaise: metrics.profitPaise,
      }
      recommendedAction = 'Check the largest cost categories and ensure every expense is recorded before acting.'
    } else if (/(lead|pipeline|follow.?up)/.test(q)) {
      summary = `${metrics.openLeadCount} open leads represent ₹${(metrics.pipelineValuePaise / 100).toLocaleString('en-IN')} in recorded pipeline value.`
      supportingMetrics = {
        openLeadCount: metrics.openLeadCount,
        pipelineValuePaise: metrics.pipelineValuePaise,
        followUpsDue: metrics.followUpsDue,
      }
      recommendedAction = 'Prioritize due follow-ups and qualified leads with the highest recorded value.'
    } else if (/(invoice|payment|cash.?flow|overdue)/.test(q)) {
      summary = `Outstanding invoices total ₹${(metrics.outstandingInvoicePaise / 100).toLocaleString('en-IN')}.`
      supportingMetrics = {
        outstandingInvoicePaise: metrics.outstandingInvoicePaise,
        overdueInvoicePaise: metrics.overdueInvoicePaise,
      }
      recommendedAction = 'Follow up on overdue invoices first and update statuses when payments arrive.'
    } else {
      summary = `Revenue is ₹${(metrics.revenuePaise / 100).toLocaleString('en-IN')} from ${metrics.orderCount} recorded sale(s) in this period.`
      supportingMetrics = {
        revenuePaise: metrics.revenuePaise,
        orderCount: metrics.orderCount,
        customerCount: metrics.customerCount,
        profitPaise: metrics.profitPaise,
      }
      recommendedAction = insight.recommendations[0]?.action
    }

    await logActivity({
      business: req.business._id,
      actor: req.user._id,
      type: 'assistant.asked',
      entityType: 'BusinessInsight',
      summary: 'Generated a data-grounded business answer.',
      metadata: { preset: insight.period.preset, confidence: metrics.orderCount || metrics.expenseCount ? 'data_grounded' : 'limited_data' },
    })

    res.json({
      success: true,
      answer: {
        question,
        summary,
        supportingMetrics,
        recommendedAction,
        confidence: metrics.orderCount || metrics.expenseCount ? 'Data-grounded' : 'Limited data',
        limitation: 'This answer uses only records saved in the selected Earnova business workspace.',
        dataPeriod: insight.period,
      },
    })
  } catch (error) {
    res.status(400).json({ success: false, message: error.message || 'Could not answer that question.' })
  }
}
