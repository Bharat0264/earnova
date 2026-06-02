import mongoose from 'mongoose'

const referralSchema = new mongoose.Schema({
  referrer:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  referee:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  order:      { type: mongoose.Schema.Types.ObjectId, ref: 'Order', default: null },

  /* Click deduplication — one record per unique visitor session */
  clickId:    { type: String, unique: true, sparse: true },
  ipHash:     String,   // hashed IP for dedup, never stored raw

  /* Conversion */
  converted:   { type: Boolean, default: false, index: true },
  convertedAt: Date,

  /* Commission */
  commissionRate:   { type: Number, default: 0 },
  commissionAmount: { type: Number, default: 0 },
  commissionStatus: {
    type: String,
    enum: ['pending', 'credited', 'withdrawn'],
    default: 'pending',
    index: true,
  },

  type: { type: String, enum: ['standard', 'bulk'], default: 'standard' },
}, { timestamps: true })

referralSchema.index({ referrer: 1, createdAt: -1 })
referralSchema.index({ referrer: 1, converted: 1 })

export default mongoose.model('Referral', referralSchema)
