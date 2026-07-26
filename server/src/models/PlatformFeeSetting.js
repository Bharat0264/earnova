import mongoose from 'mongoose'

const feeSchema = new mongoose.Schema({
  type: { type: String, enum: ['percentage', 'fixed'], required: true },
  value: { type: Number, required: true, min: 0 },
}, { _id: false })

const historySchema = new mongoose.Schema({
  version: { type: Number, required: true, min: 1 },
  customerFee: { type: feeSchema, required: true },
  providerFee: { type: feeSchema, required: true },
  changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reason: { type: String, trim: true, maxlength: 300 },
  effectiveAt: { type: Date, required: true },
}, { _id: false })

const platformFeeSettingSchema = new mongoose.Schema({
  serviceKey: { type: String, required: true, unique: true, index: true, trim: true },
  label: { type: String, required: true, trim: true },
  customerPartyLabel: { type: String, required: true, trim: true },
  providerPartyLabel: { type: String, required: true, trim: true },
  customerFee: { type: feeSchema, required: true },
  providerFee: { type: feeSchema, required: true },
  version: { type: Number, required: true, min: 1, default: 1 },
  effectiveAt: { type: Date, required: true, default: Date.now },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  history: { type: [historySchema], default: [] },
}, { timestamps: true })

export default mongoose.model('PlatformFeeSetting', platformFeeSettingSchema)

