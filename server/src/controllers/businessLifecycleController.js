import BusinessRoadmapItem from '../models/BusinessRoadmapItem.js'
import BusinessEvent from '../models/BusinessEvent.js'
import BusinessProduct from '../models/BusinessProduct.js'
import BusinessSale from '../models/BusinessSale.js'
import BusinessBlueprint from '../models/BusinessBlueprint.js'
import { getRecommendation, roadmapTemplate } from '../services/businessLifecycle.js'

const recordEvent = (business, actor, eventType, metadata = {}) => BusinessEvent.create({ business, actor, eventType, metadata }).catch(() => {})

export const initializeRoadmap = async (req, res) => {
  try {
    const operations = roadmapTemplate().map(item => ({
      updateOne: {
        filter: { business: req.business._id, stepKey: item.stepKey },
        update: { $setOnInsert: { business: req.business._id, ...item } },
        upsert: true,
      },
    }))
    await BusinessRoadmapItem.bulkWrite(operations, { ordered: false })
    await recordEvent(req.business._id, req.user._id, 'ROADMAP_INITIALIZED')
    const roadmap = await BusinessRoadmapItem.find({ business: req.business._id }).sort('createdAt').lean()
    res.status(201).json({ success: true, roadmap })
  } catch {
    res.status(400).json({ success: false, message: 'Could not initialize the business roadmap.' })
  }
}

export const getLifecycle = async (req, res) => {
  try {
    const [roadmap, productCount, orderCount] = await Promise.all([
      BusinessRoadmapItem.find({ business: req.business._id }).sort('createdAt').lean(),
      BusinessProduct.countDocuments({ business: req.business._id, active: true }),
      BusinessSale.countDocuments({ business: req.business._id }),
    ])
    const completed = roadmap.filter(item => item.status === 'COMPLETED').length
    const progress = roadmap.length ? Math.round((completed / roadmap.length) * 100) : 0
    res.json({
      success: true,
      roadmap,
      progress,
      state: req.business.state || {},
      counts: { products: productCount, orders: orderCount },
      recommendation: getRecommendation({ state: req.business.state, productCount, orderCount }),
    })
  } catch {
    res.status(500).json({ success: false, message: 'Could not load business lifecycle.' })
  }
}

export const updateRoadmapItem = async (req, res) => {
  try {
    const status = String(req.body.status || '')
    if (!['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'BLOCKED', 'NOT_APPLICABLE'].includes(status)) return res.status(400).json({ success: false, message: 'Invalid roadmap status.' })
    const roadmapItem = await BusinessRoadmapItem.findOneAndUpdate(
      { _id: req.params.roadmapItemId, business: req.business._id },
      { status, progress: status === 'COMPLETED' ? 100 : (status === 'NOT_STARTED' ? 0 : 50), completedAt: status === 'COMPLETED' ? new Date() : undefined },
      { new: true, runValidators: true }
    )
    if (!roadmapItem) return res.status(404).json({ success: false, message: 'Roadmap item not found.' })
    await recordEvent(req.business._id, req.user._id, 'ROADMAP_STEP_UPDATED', { stepKey: roadmapItem.stepKey, status })
    res.json({ success: true, roadmapItem })
  } catch {
    res.status(400).json({ success: false, message: 'Could not update roadmap item.' })
  }
}

export const getBlueprint = async (req, res) => {
  const blueprint = await BusinessBlueprint.findOne({ business: req.business._id }).lean()
  res.json({ success: true, blueprint })
}

export const upsertBlueprint = async (req, res) => {
  try {
    const allowed = ['identity', 'businessModel', 'goals', 'digitalPresence', 'payments', 'products', 'suppliers', 'fulfilment', 'customers', 'compliance', 'marketing', 'operations']
    const updates = Object.fromEntries(allowed.filter(key => req.body[key] && typeof req.body[key] === 'object').map(key => [key, req.body[key]]))
    const blueprint = await BusinessBlueprint.findOneAndUpdate({ business: req.business._id }, { $set: updates, $setOnInsert: { business: req.business._id } }, { new: true, upsert: true, runValidators: true })
    await recordEvent(req.business._id, req.user._id, 'BUSINESS_BLUEPRINT_UPDATED')
    res.json({ success: true, blueprint })
  } catch { res.status(400).json({ success: false, message: 'Could not save business blueprint.' }) }
}

export const listBusinessEvents = async (req, res) => {
  const events = await BusinessEvent.find({ business: req.business._id }).sort('-createdAt').limit(50).lean()
  res.json({ success: true, events })
}
