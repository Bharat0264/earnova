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

/* ── Main schema ── */
const userSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone:    { type: String, trim: true },
  password: { type: String, required: true, minlength: 6 },
  avatar:   String,
  role:     { type: String, enum: ['customer', 'admin', 'dealer'], default: 'customer' },
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

  /* Password reset */
  resetPasswordToken:   String,
  resetPasswordExpires: Date,

}, { timestamps: true })

/* ── Hooks ── */
userSchema.pre('save', async function (next) {
  /* Hash password */
  if (this.isModified('password')) {
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
  return bcrypt.compare(candidate, this.password)
}

userSchema.methods.toPublicJSON = function () {
  const obj = this.toObject({ flattenMaps: true })
  if (obj.businessAccessExpiresAt && new Date(obj.businessAccessExpiresAt) <= new Date() && obj.role !== 'admin') {
    obj.featureAccess = { ...(obj.featureAccess || {}), businessSolutions: false }
  }
  delete obj.password
  delete obj.resetPasswordToken
  delete obj.resetPasswordExpires
  return obj
}

/* ── Indexes ── */
userSchema.index({ email: 1 })
userSchema.index({ referralCode: 1 })

export default mongoose.model('User', userSchema)
