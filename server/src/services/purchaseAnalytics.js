import AnalyticsEvent from '../models/AnalyticsEvent.js'
import Product from '../models/Product.js'

export const recordPurchaseCompleted = async ({ order, userId, sessionId }) => {
  const ids = order.items.filter(item => item.product).map(item => item.product)
  const products = await Product.find({ _id: { $in: ids } }).select('business').lean()
  const businessIds = [...new Set(products.map(product => String(product.business || '')).filter(Boolean))]
  for (const business of businessIds) {
    const productIds = products.filter(product => String(product.business) === business).map(product => String(product._id))
    await AnalyticsEvent.updateOne(
      { business, order: order._id, eventType: 'PURCHASE_COMPLETED' },
      { $setOnInsert: { business, order: order._id, user: userId, sessionId: String(sessionId || `order-${order._id}`).slice(0, 120), eventType: 'PURCHASE_COMPLETED', metadata: { productIds } } },
      { upsert: true }
    )
  }
}
