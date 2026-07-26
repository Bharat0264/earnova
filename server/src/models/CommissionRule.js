import mongoose from 'mongoose'

const commissionRuleSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true, trim: true },
  version: { type: Number, required: true, min: 1 },
  rateBps: { type: Number, required: true, min: 0, max: 10000 },
  approvalDays: { type: Number, required: true, min: 0, default: 14 },
  payoutThresholdPaise: { type: Number, required: true, min: 0, default: 10000 },
  active: { type: Boolean, default: true, index: true },
}, { timestamps: true })

commissionRuleSchema.index({ key: 1, version: -1 })
export default mongoose.model('CommissionRule', commissionRuleSchema)
