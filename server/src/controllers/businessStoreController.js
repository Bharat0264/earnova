import Product from '../models/Product.js'
import Order from '../models/Order.js'

const allowed = ['name', 'description', 'shortDesc', 'price', 'mrp', 'category', 'brand', 'stock', 'images', 'thumbnail', 'highlights', 'specs', 'published', 'isActive', 'sku']
const payloadFor = (body, partial = false) => {
  const payload = Object.fromEntries(Object.entries(body).filter(([key, value]) => allowed.includes(key) && value !== undefined))
  for (const key of ['price', 'mrp', 'stock']) if (payload[key] !== undefined) payload[key] = Number(payload[key])
  if (!partial) {
    for (const key of ['name', 'description', 'price', 'category', 'brand']) if (payload[key] === undefined || payload[key] === '') throw new Error(`${key} is required.`)
    payload.referralIncome = 0
    payload.published = Boolean(payload.published)
  }
  if (payload.stock !== undefined && (!Number.isFinite(payload.stock) || payload.stock < 0)) throw new Error('Stock must be a non-negative number.')
  if (payload.price !== undefined && (!Number.isFinite(payload.price) || payload.price < 0)) throw new Error('Price must be a non-negative number.')
  return payload
}

export const listStoreProducts = async (req, res) => {
  const products = await Product.find({ business: req.business._id }).sort('-createdAt').lean()
  res.json({ success: true, products })
}

export const createStoreProduct = async (req, res) => {
  try {
    const product = await Product.create({ ...payloadFor(req.body), business: req.business._id })
    res.status(201).json({ success: true, product })
  } catch (error) { res.status(400).json({ success: false, message: error.message }) }
}

export const updateStoreProduct = async (req, res) => {
  try {
    const product = await Product.findOneAndUpdate({ _id: req.params.productId, business: req.business._id }, { $set: payloadFor(req.body, true) }, { new: true, runValidators: true })
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' })
    res.json({ success: true, product })
  } catch (error) { res.status(400).json({ success: false, message: error.message }) }
}

export const listStoreOrders = async (req, res) => {
  const products = await Product.find({ business: req.business._id }).select('_id').lean()
  const ids = products.map(product => product._id)
  const orders = ids.length ? await Order.find({ 'items.product': { $in: ids } }).populate('user', 'name email').sort('-createdAt').lean() : []
  const scoped = orders.map(order => ({ ...order, items: order.items.filter(item => ids.some(id => String(id) === String(item.product))) }))
  res.json({ success: true, orders: scoped })
}

const transitions = { PENDING: ['PROCESSING', 'CANCELLED'], PROCESSING: ['READY_TO_SHIP', 'CANCELLED'], READY_TO_SHIP: ['SHIPPED', 'CANCELLED'], SHIPPED: ['OUT_FOR_DELIVERY'], OUT_FOR_DELIVERY: ['DELIVERED'], DELIVERED: [], CANCELLED: [], RETURN_REQUESTED: ['RETURNED'], RETURNED: [] }
export const updateStoreOrderFulfilment = async (req, res) => {
  const next = String(req.body.fulfilmentStatus || '')
  if (!Object.values(transitions).flat().includes(next)) return res.status(400).json({ success: false, message: 'Invalid fulfilment transition.' })
  const products = await Product.find({ business: req.business._id }).select('_id').lean()
  const ids = products.map(product => product._id)
  const order = await Order.findOne({ _id: req.params.orderId, 'items.product': { $in: ids } })
  if (!order) return res.status(404).json({ success: false, message: 'Order not found.' })
  const current = order.fulfilmentStatus || 'PENDING'
  if (!transitions[current]?.includes(next)) return res.status(400).json({ success: false, message: `Cannot move fulfilment from ${current} to ${next}.` })
  order.fulfilmentStatus = next
  if (req.body.trackingId) order.trackingId = String(req.body.trackingId).slice(0, 160)
  if (req.body.courier) order.courier = String(req.body.courier).slice(0, 120)
  order.statusHistory.push({ status: next, note: `Fulfilment updated to ${next}.`, changedBy: req.user._id, changedAt: new Date() })
  if (next === 'SHIPPED') { order.status = 'shipped'; order.shippedAt = new Date() }
  if (next === 'DELIVERED') { order.status = 'delivered'; order.deliveredAt = new Date() }
  await order.save()
  res.json({ success: true, order })
}
