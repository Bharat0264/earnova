import mongoose from 'mongoose'

const withdrawalSchema = new mongoose.Schema({
  user:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  amount: { type: Number, required: true, min: 100 },

  /* Payout details */
  upiId:       { type: String, required: true },
  accountName: { type: String, required: true },

  /* Status */
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending',
    index: true,
  },

  /* Razorpay Payouts (filled when processed) */
  razorpayPayoutId:      String,
  razorpayFundAccountId: String,
  razorpayContactId:     String,

  /* Admin */
  adminNote:     String,
  failureReason: String,
  processedAt:   Date,
}, { timestamps: true })

withdrawalSchema.index({ user: 1, createdAt: -1 })

export default mongoose.model('Withdrawal', withdrawalSchema)
