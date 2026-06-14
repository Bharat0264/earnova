import mongoose from 'mongoose'

const specSchema = new mongoose.Schema(
  { key: String, value: String },
  { _id: false }
)

const reviewSchema = new mongoose.Schema({
  user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name:    String,
  rating:  { type: Number, required: true, min: 1, max: 5 },
  comment: String,
}, { timestamps: true })

const productSchema = new mongoose.Schema({
  name:      { type: String, required: true, trim: true },
  slug:      { type: String, unique: true },
  description: { type: String, required: true },
  shortDesc: String,

  /* Pricing */
  price:     { type: Number, required: true, min: 0 },
  mrp:       { type: Number, min: 0 },
  discount:  { type: Number, default: 0, min: 0, max: 100 }, // %
  gstRate:   { type: Number, default: 18 },                  // %

  /* Category */
  category:  {
    type: String,
    enum: ['solar-panels', 'fans', 'acs', 'accessories'],
    required: true,
    index: true,
  },
  brand:     { type: String, required: true },
  model:     String,

  /* Media */
  images:    [String],       // Cloudinary URLs
  thumbnail: String,

  /* Specs & highlights */
  specs:      [specSchema],
  highlights: [String],

  /* Inventory */
  stock: { type: Number, default: 0, min: 0 },
  sku:   { type: String, unique: true, sparse: true },

  /* Energy rating */
  starRating:   { type: Number, min: 1, max: 5 },
  energySaving: String, // e.g. "60% vs non-inverter"

  /* Referral */
  referralName:   { type: String, trim: true },
  referralIncome: { type: Number, default: 0, min: 0 },
  referralCommission: { type: Number, default: 5 }, // % of sale price

  /* Visibility */
  isActive:   { type: Boolean, default: true,  index: true },
  isFeatured: { type: Boolean, default: false },

  /* Aggregate review stats */
  rating:      { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  reviews:     [reviewSchema],

}, { timestamps: true })

/* Auto-generate slug */
productSchema.pre('save', function (next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
  }
  next()
})

/* Recalculate aggregate rating on review change */
productSchema.methods.recalcRating = function () {
  if (this.reviews.length === 0) { this.rating = 0; this.reviewCount = 0; return }
  this.reviewCount = this.reviews.length
  this.rating = +(
    this.reviews.reduce((s, r) => s + r.rating, 0) / this.reviewCount
  ).toFixed(1)
}

productSchema.index({ category: 1, isActive: 1 })
productSchema.index({ slug: 1 })

export default mongoose.model('Product', productSchema)
