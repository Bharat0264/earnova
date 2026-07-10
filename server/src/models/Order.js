import mongoose from 'mongoose'

const itemSchema = new mongoose.Schema({
  product:  { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  itemType: { type: String, enum: ['product', 'service'], default: 'product' },
  serviceKey: String,
  serviceRef: String,
  name:     String,
  image:    String,
  price:    { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  gstRate:  { type: Number, default: 18 },
  category: String,
  memberIncome: { type: Number, default: 0 },
}, { _id: false })

const addressSnapshot = new mongoose.Schema({
  name:    String,
  phone:   String,
  line1:   String,
  line2:   String,
  city:    String,
  state:   String,
  pincode: String,
}, { _id: false })

const statusEventSchema = new mongoose.Schema({
  status:    String,
  note:      String,
  timestamp: { type: Date, default: Date.now },
}, { _id: false })

const orderSchema = new mongoose.Schema({
  orderId: { type: String, unique: true },

  user:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  items: [itemSchema],

  /* Pricing */
  subtotal:       { type: Number, required: true },
  gstAmount:      { type: Number, default: 0 },
  shippingCharge: { type: Number, default: 0 },
  discount:       { type: Number, default: 0 },
  total:          { type: Number, required: true },

  shippingAddress: addressSnapshot,

  /* Payment */
  paymentMethod: {
    type: String,
    enum: ['razorpay', 'cod'],
    default: 'razorpay',
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending',
    index: true,
  },
  razorpayOrderId:   String,
  razorpayPaymentId: String,
  razorpaySignature: String,

  /* Order status */
  status: {
    type: String,
    enum: ['placed', 'received', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'],
    default: 'placed',
    index: true,
  },
  statusHistory: [statusEventSchema],

  /* Logistics */
  trackingId: String,
  courier:    String,

  /* Referral commission */
  referredBy:       { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  commissionRate:   { type: Number, default: 0 },   // %
  commissionAmount: { type: Number, default: 0 },   // ₹
  commissionPaid:   { type: Boolean, default: false },
  memberIncomeAmount: { type: Number, default: 0 },
  memberIncomePaid:   { type: Boolean, default: false },
  memberIncomeRecipient: {
    type: String,
    enum: ['member', 'admin'],
    default: 'admin',
  },
  adminEarningsAmount: { type: Number, default: 0 },
  adminEarningsRecognized: { type: Boolean, default: false },

  /* Key timestamps */
  processedAt: Date,
  shippedAt:   Date,
  deliveredAt: Date,
  cancelledAt: Date,

}, { timestamps: true })

/* Auto-generate short order ID */
orderSchema.pre('save', function (next) {
  if (!this.orderId) {
    const ts     = Date.now().toString(36).toUpperCase()
    const rand   = Math.random().toString(36).slice(2, 5).toUpperCase()
    this.orderId = `EAR${ts}${rand}`
  }
  next()
})

orderSchema.index({ user: 1, createdAt: -1 })
orderSchema.index({ status: 1, paymentStatus: 1 })

export default mongoose.model('Order', orderSchema)
