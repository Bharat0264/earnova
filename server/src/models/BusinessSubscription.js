import mongoose from 'mongoose'

const businessSubscriptionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  plan: { type: String, default: 'business-solutions-monthly' },
  business: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', index: true },
  billingStatus: { type: String, enum: ['trialing', 'active', 'past_due', 'cancelled', 'expired'], default: 'active', index: true },
  trialEndsAt: Date,
  cancelledAt: Date,
  usage: { type: Map, of: Number, default: {} },
  amount: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ['active', 'expired', 'cancelled'], default: 'active', index: true },
  startsAt: { type: Date, required: true },
  expiresAt: { type: Date, required: true, index: true },
  razorpayOrderId: String,
  razorpayPaymentId: String,
}, { timestamps: true })

export default mongoose.model('BusinessSubscription', businessSubscriptionSchema)
