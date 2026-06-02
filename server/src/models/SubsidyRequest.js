import mongoose from 'mongoose'

const subsidyRequestSchema = new mongoose.Schema({
  /* Contact */
  name:  { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  phone: { type: String, required: true, trim: true },
  state: { type: String, required: true },
  city:  String,

  /* Property */
  propertyType: { type: String, enum: ['owned','rented','institutional'] },
  roofType:     { type: String, enum: ['rcc','metal','asbestos','other'] },
  systemSize:   Number,  /* kW */
  annualBill:   Number,  /* ₹ */
  hasSolar:     { type: Boolean, default: false },

  /* Assistance */
  assistanceType: {
    type: String,
    enum: ['eligibility-check','document-help','application-filing','full-support'],
  },
  message: String,

  /* Eligibility result (auto-filled) */
  isEligible:       Boolean,
  estimatedSubsidy: Number,

  /* Admin */
  status: {
    type: String,
    enum: ['pending','contacted','in-progress','completed'],
    default: 'pending',
    index: true,
  },
  adminNote: String,
}, { timestamps: true })

subsidyRequestSchema.index({ createdAt: -1 })

export default mongoose.model('SubsidyRequest', subsidyRequestSchema)
