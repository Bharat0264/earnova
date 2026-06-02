import mongoose from 'mongoose'

const productLineSchema = new mongoose.Schema({
  category:       { type: String, enum: ['solar-panels','fans','acs','accessories','mixed'] },
  quantity:       Number,
  specifications: String,
}, { _id: false })

const b2bQuoteSchema = new mongoose.Schema({
  /* Contact */
  name:         { type: String, required: true, trim: true },
  email:        { type: String, required: true, lowercase: true, trim: true },
  phone:        { type: String, required: true, trim: true },
  organization: { type: String, required: true, trim: true },
  designation:  String,

  /* Business */
  businessType: {
    type: String,
    enum: ['apartment','school','hospital','office','factory','dealer','contractor','other'],
    required: true,
  },
  city:  { type: String, required: true },
  state: { type: String, required: true },

  /* Requirements */
  products:  [productLineSchema],
  budget:    String,
  timeline:  String,
  message:   String,
  heardFrom: String,

  /* Referral */
  referralCode: String,
  referredBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

  /* Admin */
  status: {
    type: String,
    enum: ['pending','reviewed','quoted','won','lost'],
    default: 'pending',
    index: true,
  },
  adminNote:    String,
  quotePdfUrl:  String,
  quotedAmount: Number,
  followUpDate: Date,
  closedAt:     Date,
}, { timestamps: true })

b2bQuoteSchema.index({ createdAt: -1 })
b2bQuoteSchema.index({ status: 1 })

export default mongoose.model('B2BQuote', b2bQuoteSchema)
