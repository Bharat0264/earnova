import mongoose from 'mongoose'

const caFirmSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  legalName: { type: String, required: true, trim: true, maxlength: 180 },
  displayName: { type: String, required: true, trim: true, maxlength: 140 },
  description: { type: String, trim: true, maxlength: 1500 },
  email: { type: String, required: true, lowercase: true, trim: true, maxlength: 180 },
  phone: { type: String, trim: true, maxlength: 30 },
  city: { type: String, trim: true, maxlength: 100 },
  state: { type: String, trim: true, maxlength: 100 },
  serviceSlugs: [{ type: String, trim: true, lowercase: true }],
  status: { type: String, enum: ['pending', 'verified', 'paused', 'rejected'], default: 'pending', index: true },
  verificationSummary: { type: String, trim: true, maxlength: 500 },
  verifiedAt: Date,
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  acceptingCases: { type: Boolean, default: false, index: true },
  caseAccessPolicy: { type: String, enum: ['assigned_only', 'role_and_assignment'], default: 'assigned_only' },
}, { timestamps: true })

caFirmSchema.index({ status: 1, acceptingCases: 1, displayName: 1 })
caFirmSchema.index({ serviceSlugs: 1, status: 1 })

export default mongoose.model('CAFirm', caFirmSchema)

