import AnalyticsEvent from '../models/AnalyticsEvent.js'
import Product from '../models/Product.js'
import Order from '../models/Order.js'

const allowed = new Set(['STORE_VIEW', 'PRODUCT_VIEW', 'ADD_TO_CART', 'CHECKOUT_STARTED'])
const safeSession = value => String(value || '').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 120)

export const trackEvent = async (req, res) => {
  try {
    const eventType = String(req.body.eventType || '')
    const sessionId = safeSession(req.body.sessionId)
    if (!allowed.has(eventType) || !sessionId) return res.status(400).json({ success: false, message: 'Invalid analytics event.' })
    const product = req.body.productId ? await Product.findById(req.body.productId).select('business').lean() : null
    const businessId = req.body.businessId || product?.business
    if (!businessId) return res.status(204).end()
    const exists = await AnalyticsEvent.findOne({ business: businessId, sessionId, eventType, product: product?._id, createdAt: { $gte: new Date(Date.now() - 30 * 60 * 1000) } })
    if (!exists) await AnalyticsEvent.create({ business: businessId, sessionId, user: req.user?._id, eventType, product: product?._id })
    res.status(201).json({ success: true })
  } catch { res.status(400).json({ success: false, message: 'Could not record analytics event.' }) }
}

export const businessAnalytics = async (req, res) => {
  const business = req.business._id
  const [events, orders, topProducts, recentOrders] = await Promise.all([
    AnalyticsEvent.aggregate([{ $match: { business } }, { $group: { _id: '$eventType', count: { $sum: 1 }, visitors: { $addToSet: '$sessionId' } } }]),
    Order.aggregate([{ $unwind: '$items' }, { $lookup: { from: 'products', localField: 'items.product', foreignField: '_id', as: 'product' } }, { $unwind: '$product' }, { $match: { 'product.business': business, paymentStatus: 'paid' } }, { $group: { _id: '$_id', total: { $first: '$total' } } }, { $group: { _id: null, orders: { $sum: 1 }, revenue: { $sum: '$total' } } }]),
    Order.aggregate([{ $unwind: '$items' }, { $lookup: { from: 'products', localField: 'items.product', foreignField: '_id', as: 'product' } }, { $unwind: '$product' }, { $match: { 'product.business': business, paymentStatus: 'paid' } }, { $group: { _id: '$items.product', name: { $first: '$items.name' }, quantity: { $sum: '$items.quantity' }, revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } } }, { $sort: { revenue: -1 } }, { $limit: 5 }]),
    Order.find({ 'items.product': { $in: await Product.find({ business }).distinct('_id') } }).sort('-createdAt').limit(5).select('orderId status fulfilmentStatus total createdAt').lean(),
  ])
  const summary = Object.fromEntries(events.map(event => [event._id, { count: event.count, visitors: event.visitors.length }]))
  const visitors = summary.STORE_VIEW?.visitors || 0; const storeViews = summary.STORE_VIEW?.count || 0; const productViews = summary.PRODUCT_VIEW?.count || 0; const adds = summary.ADD_TO_CART?.count || 0; const checkouts = summary.CHECKOUT_STARTED?.count || 0; const purchases = summary.PURCHASE_COMPLETED?.count || 0; const orderData = orders[0] || { orders: 0, revenue: 0 }
  res.json({ success: true, metrics: { visitors, storeViews, productViews, purchases, addToCartRate: productViews ? adds / productViews : 0, checkoutRate: adds ? checkouts / adds : 0, conversionRate: visitors ? purchases / visitors : 0, revenue: orderData.revenue, orders: orderData.orders }, topProducts, recentOrders })
}
