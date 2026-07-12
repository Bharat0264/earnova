import mongoose from 'mongoose'

const paymentAttemptSchema = new mongoose.Schema({
  razorpayOrderId: { type: String, required: true, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  amount: { type: Number, required: true, min: 1 },
  currency: { type: String, default: 'INR' },
  cartItems: { type: [mongoose.Schema.Types.Mixed], required: true },
  razorpayPaymentId: { type: String, index: true },
  status: { type: String, enum: ['created', 'paid', 'fulfilled', 'failed'], default: 'created', index: true },
  paidAt: Date,
  fulfilledAt: Date,
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
}, { timestamps: true })

export default mongoose.model('PaymentAttempt', paymentAttemptSchema)
