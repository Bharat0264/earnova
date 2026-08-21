import mongoose from 'mongoose'
const schema = new mongoose.Schema({
  business: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true, index: true }, sessionId: { type: String, required: true, maxlength: 120 }, user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  eventType: { type: String, enum: ['STORE_VIEW','PRODUCT_VIEW','ADD_TO_CART','CHECKOUT_STARTED','PURCHASE_COMPLETED'], required: true, index: true }, product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' }, order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' }, metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: true })
schema.index({ business: 1, eventType: 1, createdAt: -1 }); schema.index({ sessionId: 1, eventType: 1, createdAt: -1 })
schema.index({ business: 1, order: 1, eventType: 1 }, { unique: true, partialFilterExpression: { order: { $exists: true } } })
export default mongoose.model('AnalyticsEvent', schema)
