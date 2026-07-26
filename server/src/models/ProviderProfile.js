import mongoose from 'mongoose'

const providerProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
  providerType: { type: String, enum: ['freelancer', 'ca_consultant', 'business_consultant', 'project_seller', 'energy_partner'], required: true, index: true },
  title: { type: String, required: true, trim: true, maxlength: 160 },
  description: { type: String, required: true, trim: true, maxlength: 2000 },
  skills: [{ type: String, trim: true, maxlength: 80 }],
  categories: [{ type: String, trim: true, maxlength: 80 }],
  location: { type: String, trim: true, maxlength: 160 },
  serviceAreas: [{ type: String, trim: true, maxlength: 120 }],
  pricingMethod: { type: String, enum: ['hourly', 'fixed', 'quote'], default: 'quote' },
  startingPricePaise: { type: Number, min: 0, default: 0 },
  experienceYears: { type: Number, min: 0, max: 80, default: 0 },
  portfolioUrls: [{ type: String, trim: true, maxlength: 1000 }],
  availability: { type: String, enum: ['available', 'limited', 'unavailable'], default: 'available', index: true },
  verificationStatus: { type: String, enum: ['pending', 'verified', 'rejected', 'suspended'], default: 'pending', index: true },
  completedJobs: { type: Number, min: 0, default: 0 },
  ratingAverage: { type: Number, min: 0, max: 5, default: 0 },
  ratingCount: { type: Number, min: 0, default: 0 },
  responseTimeHours: { type: Number, min: 0, default: 0 },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  verifiedAt: Date,
  adminNote: { type: String, trim: true, maxlength: 1000 },
}, { timestamps: true })

providerProfileSchema.index({ providerType: 1, verificationStatus: 1, availability: 1 })
export default mongoose.model('ProviderProfile', providerProfileSchema)
