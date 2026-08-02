import mongoose from 'mongoose'
import bcrypt   from 'bcryptjs'
import { DEFAULT_PUBLIC_ACCESS } from '../config/features.js'

/* ── Sub-schemas ── */
const addressSchema = new mongoose.Schema({
  type:      { type: String, enum: ['home', 'work', 'other'], default: 'home' },
  name:      { type: String, required: true },
  phone:     { type: String, required: true },
  line1:     { type: String, required: true },
  line2:     String,
  city:      { type: String, required: true },
  state:     { type: String, required: true },
  pincode:   { type: String, required: true },
  isDefault: { type: Boolean, default: false },
}, { _id: true })

const onboardingSchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ['not_started', 'in_progress', 'skipped', 'completed'],
    default: 'not_started',
  },
  currentStep: { type: Number, min: 0, default: 0 },
  completedSteps: [{ type: Number, min: 0 }],
  skippedSteps: [{ type: Number, min: 0 }],
  completedAt: Date,
}, { _id: false })

/* ── Main schema ── */
const userSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone:    { type: String, trim: true },
  password: { type: String, minlength: 8, select: false },
  googleSub: { type: String, unique: true, sparse: true, index: true, select: false },
  authProvider: { type: String, enum: ['local', 'google'], default: 'local' },
  avatar:   String,
  role:     { type: String, enum: ['customer', 'admin', 'dealer'], default: 'customer' },
  accountType: {
    type: String,
    enum: ['individual', 'business_owner', 'freelancer', 'ca_consultant', 'product_seller', 'energy_partner'],
    default: 'individual',
    index: true,
  },
  goals: [{ type: String, trim: true, maxlength: 120 }],
  onboarding: { type: onboardingSchema, default: () => ({}) },
  featureAccess: {
    type: Map,
    of: Boolean,
    default: () => ({ ...DEFAULT_PUBLIC_ACCESS }),
  },
  businessAccessExpiresAt: Date,

  /* Referral */
  referralCode:      { type: String, unique: true, sparse: true },
  referredBy:        { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  referralCount:     { type: Number, default: 0 },
  referralEarnings:  { type: Number, default: 0 }, // lifetime
  walletBalance:     { type: Number, default: 0 }, // withdrawable

  /* Address book */
  addresses: [addressSchema],

  /* Wishlist */
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],

  /* Account status */
  isVerified: { type: Boolean, default: false },
  isActive:   { type: Boolean, default: true  },
  sessionVersion: { type: Number, default: 0, select: false },

  /* Password reset */
  resetPasswordToken:   String,
  resetPasswordExpires: Date,

}, { timestamps: true })

/* ── Hooks ── */
userSchema.pre('save', async function (next) {
  /* Hash password */
  if (this.password && this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 12)
  }
  /* Auto-generate referral code on first save */
  if (!this.referralCode) {
    const prefix = this.name.replace(/\s+/g, '').slice(0, 4).toUpperCase()
    const suffix = Math.random().toString(36).slice(2, 7).toUpperCase()
    this.referralCode = prefix + suffix
  }
  next()
})

/* ── Methods ── */
userSchema.methods.comparePassword = function (candidate) {
  if (!this.password) return false
  return bcrypt.compare(candidate, this.password)
}

userSchema.methods.toPublicJSON = function () {
  const obj = this.toObject({ flattenMaps: true })
  if (obj.businessAccessExpiresAt && new Date(obj.businessAccessExpiresAt) <= new Date() && obj.role !== 'admin') {
    obj.featureAccess = { ...(obj.featureAccess || {}), businessSolutions: false }
  }
  delete obj.password
  delete obj.googleSub
  delete obj.resetPasswordToken
  delete obj.resetPasswordExpires
  delete obj.sessionVersion
  return obj
}

/* ── Indexes ── */
export default mongoose.model('User', userSchema)
