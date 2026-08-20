import mongoose from 'mongoose'

const businessSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 140 },
  industry: { type: String, required: true, trim: true, maxlength: 100 },
  slug: { type: String, trim: true, lowercase: true, maxlength: 180, sparse: true },
  stage: { type: String, enum: ['idea', 'starting', 'launching', 'operating', 'growing'], default: 'starting', index: true },
  businessModel: { type: String, enum: ['online', 'offline', 'hybrid', 'unspecified'], default: 'unspecified' },
  launchStatus: { type: String, enum: ['planning', 'building', 'ready', 'launched'], default: 'planning' },
  description: { type: String, trim: true, maxlength: 1000, default: '' },
  location: { type: String, trim: true, maxlength: 180, default: '' },
  website: { type: String, trim: true, maxlength: 300, default: '' },
  goals: { type: [String], default: [] },
  businessType: {
    type: String,
    enum: ['proprietorship', 'partnership', 'llp', 'private_limited', 'public_limited', 'other'],
    default: 'proprietorship',
  },
  gstin: { type: String, trim: true, uppercase: true, maxlength: 15 },
  phone: { type: String, trim: true, maxlength: 20 },
  email: { type: String, trim: true, lowercase: true, maxlength: 160 },
  address: { type: String, trim: true, maxlength: 500 },
  currency: { type: String, enum: ['INR'], default: 'INR' },
  timezone: { type: String, default: 'Asia/Kolkata' },
  status: { type: String, enum: ['active', 'archived'], default: 'active', index: true },
  verificationStatus: {
    type: String,
    enum: ['pending', 'under_review', 'verified', 'rejected', 'suspended'],
    default: 'pending',
    index: true,
  },
  verificationNote: { type: String, trim: true, maxlength: 1000 },
  verificationSubmittedAt: { type: Date, default: Date.now },
  reviewedAt: Date,
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  verifiedAt: Date,
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  state: {
    identity: { type: String, enum: ['NOT_STARTED', 'REQUIRED', 'IN_PROGRESS', 'ACTIVE', 'ISSUE', 'COMPLETED', 'NOT_APPLICABLE'], default: 'ACTIVE' },
    website: { type: String, enum: ['NOT_STARTED', 'REQUIRED', 'IN_PROGRESS', 'ACTIVE', 'ISSUE', 'COMPLETED', 'NOT_APPLICABLE'], default: 'NOT_STARTED' },
    payments: { type: String, enum: ['NOT_STARTED', 'REQUIRED', 'IN_PROGRESS', 'ACTIVE', 'ISSUE', 'COMPLETED', 'NOT_APPLICABLE'], default: 'NOT_STARTED' },
    catalog: { type: String, enum: ['NOT_STARTED', 'REQUIRED', 'IN_PROGRESS', 'ACTIVE', 'ISSUE', 'COMPLETED', 'NOT_APPLICABLE'], default: 'NOT_STARTED' },
    shipping: { type: String, enum: ['NOT_STARTED', 'REQUIRED', 'IN_PROGRESS', 'ACTIVE', 'ISSUE', 'COMPLETED', 'NOT_APPLICABLE'], default: 'NOT_STARTED' },
    marketing: { type: String, enum: ['NOT_STARTED', 'REQUIRED', 'IN_PROGRESS', 'ACTIVE', 'ISSUE', 'COMPLETED', 'NOT_APPLICABLE'], default: 'NOT_STARTED' },
  },
}, { timestamps: true })

businessSchema.index({ owner: 1, status: 1, createdAt: -1 })
businessSchema.index({ slug: 1 }, { unique: true, sparse: true })
businessSchema.index({ verificationStatus: 1, createdAt: -1 })

export default mongoose.model('Business', businessSchema)
