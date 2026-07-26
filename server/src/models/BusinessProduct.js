import mongoose from 'mongoose'

const businessProductSchema = new mongoose.Schema({
  business: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
  sku: { type: String, required: true, trim: true, uppercase: true, maxlength: 80 },
  name: { type: String, required: true, trim: true, maxlength: 180 },
  category: { type: String, trim: true, maxlength: 100 },
  purchasePricePaise: { type: Number, min: 0, default: 0 },
  sellingPricePaise: { type: Number, min: 0, required: true },
  currentQuantity: { type: Number, min: 0, default: 0 },
  reorderLevel: { type: Number, min: 0, default: 0 },
  supplier: { type: String, trim: true, maxlength: 160 },
  active: { type: Boolean, default: true, index: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true })

businessProductSchema.index({ business: 1, sku: 1 }, { unique: true })
businessProductSchema.index({ business: 1, active: 1, createdAt: -1 })

export default mongoose.model('BusinessProduct', businessProductSchema)
