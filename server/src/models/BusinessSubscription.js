import mongoose from 'mongoose'

const businessSubscriptionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  plan: { type: String, default: 'business-solutions-monthly' },
  amount: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ['active', 'expired', 'cancelled'], default: 'active', index: true },
  startsAt: { type: Date, required: true },
  expiresAt: { type: Date, required: true, index: true },
  razorpayOrderId: String,
  razorpayPaymentId: String,
}, { timestamps: true })

export default mongoose.model('BusinessSubscription', businessSubscriptionSchema)
