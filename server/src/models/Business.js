import mongoose from 'mongoose'

const businessSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 140 },
  industry: { type: String, required: true, trim: true, maxlength: 100 },
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
}, { timestamps: true })

businessSchema.index({ owner: 1, status: 1, createdAt: -1 })

export default mongoose.model('Business', businessSchema)
