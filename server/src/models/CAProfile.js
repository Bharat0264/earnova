import mongoose from 'mongoose'

const caPricingSchema = new mongoose.Schema({
  servicePackage: {
    type: String,
    required: true,
    enum: ['simple-salaried', 'investors-traders', 'freelancers-small-business', 'corporate-tax-audits'],
  },
  charge: { type: Number, required: true, min: 49, max: 1000000 },
}, { _id: false })

const caProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  whatsapp: { type: String, required: true, trim: true },
  phone: { type: String, trim: true },
  dateOfBirth: { type: Date, required: true },
  gender: { type: String, required: true, trim: true },
  address: { type: String, required: true, trim: true },
  pincode: { type: String, required: true, trim: true },
  city: { type: String, required: true, trim: true },
  state: { type: String, required: true, trim: true },
  firmName: { type: String, trim: true },
  membershipNumber: { type: String, required: true, trim: true },
  qualification: { type: String, required: true, trim: true },
  yearsExperience: { type: Number, min: 0, default: 0 },
  languages: [{ type: String, trim: true }],
  professionalBio: { type: String, required: true, trim: true, maxlength: 1200 },
  specializations: [{ type: String, trim: true }],
  servicesOffered: [{ type: String, trim: true }],
  pricing: { type: [caPricingSchema], required: true, default: [] },
  govtIdType: { type: String, required: true, trim: true },
  idCardUrl: { type: String, required: true, trim: true },
  govtIdUrl: { type: String, required: true, trim: true },
  caCertificateUrl: { type: String, required: true, trim: true },
  practiceProofUrl: { type: String, trim: true },
  consentToVerify: { type: Boolean, required: true },
  status: {
    type: String,
    enum: ['pending', 'verified', 'paused', 'rejected'],
    default: 'pending',
    index: true,
  },
  adminNote: { type: String, trim: true },
  verifiedAt: Date,
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true })

caProfileSchema.index({ status: 1, createdAt: -1 })
caProfileSchema.index({ membershipNumber: 1 })

export default mongoose.model('CAProfile', caProfileSchema)
