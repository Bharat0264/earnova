import mongoose from 'mongoose'

const energyEnquirySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  useType: { type: String, enum: ['residential', 'commercial'], required: true },
  monthlyBillPaise: { type: Number, min: 0, required: true },
  propertyType: { type: String, required: true, trim: true, maxlength: 100 },
  roofAvailability: { type: String, enum: ['owned_clear', 'owned_partial', 'rented', 'unknown'], required: true },
  location: { type: String, required: true, trim: true, maxlength: 300 },
  preferredContactTime: { type: String, trim: true, maxlength: 100 },
  phone: { type: String, required: true, trim: true, maxlength: 20 },
  status: { type: String, enum: ['new', 'reviewing', 'partner_assigned', 'quote_ready', 'contacted', 'closed', 'cancelled'], default: 'new', index: true },
  assignedPartner: { type: mongoose.Schema.Types.ObjectId, ref: 'ProviderProfile' },
  quoteAmountPaise: { type: Number, min: 0 },
  quoteNote: { type: String, trim: true, maxlength: 2000 },
  estimateDisclaimerAccepted: { type: Boolean, required: true },
}, { timestamps: true })

energyEnquirySchema.index({ status: 1, createdAt: -1 })
export default mongoose.model('EnergyEnquiry', energyEnquirySchema)
