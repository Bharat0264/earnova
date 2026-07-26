import mongoose from 'mongoose'

const referralLedgerSchema = new mongoose.Schema({
  referrer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true, unique: true },
  eligibleAmountPaise: { type: Number, required: true, min: 0 },
  commissionAmountPaise: { type: Number, required: true, min: 0 },
  ruleKey: { type: String, required: true },
  ruleVersion: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'approved', 'paid', 'reversed'], default: 'pending', index: true },
  eligibleAt: Date,
  approveAfter: { type: Date, required: true, index: true },
  approvedAt: Date,
  paidAt: Date,
  reversedAt: Date,
  reversalReason: { type: String, trim: true, maxlength: 500 },
}, { timestamps: true })

referralLedgerSchema.index({ referrer: 1, status: 1, createdAt: -1 })
export default mongoose.model('ReferralLedger', referralLedgerSchema)
