import mongoose from 'mongoose'

const projectListingSchema = new mongoose.Schema({
  listingId: { type: String, unique: true, index: true },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  sellerName: { type: String, required: true, trim: true },
  sellerEmail: { type: String, required: true, lowercase: true, trim: true },
  sellerWhatsapp: { type: String, required: true, trim: true },
  title: { type: String, required: true, trim: true },
  category: { type: String, required: true, trim: true },
  shortDescription: { type: String, required: true, trim: true, maxlength: 500 },
  details: { type: String, required: true, trim: true, maxlength: 5000 },
  techStack: [{ type: String, trim: true }],
  liveDemoUrl: { type: String, required: true, trim: true },
  documentationSummary: { type: String, required: true, trim: true, maxlength: 2500 },
  documentationUrl: { type: String, trim: true },
  deliveryNotes: { type: String, trim: true, maxlength: 2500 },
  price: { type: Number, required: true, min: 100 },
  earnovaFee: { type: Number, min: 0, default: 0 },
  sellerPayout: { type: Number, required: true, min: 0 },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'sold', 'paused'],
    default: 'pending',
    index: true,
  },
  adminNote: { type: String, trim: true },
  approvedAt: Date,
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  soldAt: Date,
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  buyerName: { type: String, trim: true },
  buyerEmail: { type: String, trim: true },
  buyerWhatsapp: { type: String, trim: true },
  razorpayOrderId: String,
  razorpayPaymentId: String,
  razorpaySignature: String,
  sellerCreditedAt: Date,
}, { timestamps: true })

projectListingSchema.pre('save', function (next) {
  if (!this.listingId) {
    const ts = Date.now().toString(36).toUpperCase()
    const rand = Math.random().toString(36).slice(2, 6).toUpperCase()
    this.listingId = `PRJ${ts}${rand}`
  }
  next()
})

projectListingSchema.index({ status: 1, createdAt: -1 })
projectListingSchema.index({ seller: 1, createdAt: -1 })

export default mongoose.model('ProjectListing', projectListingSchema)
