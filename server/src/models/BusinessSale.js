import mongoose from 'mongoose'

const saleItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'BusinessProduct' },
  name: { type: String, required: true, trim: true, maxlength: 180 },
  sku: { type: String, trim: true, maxlength: 80 },
  quantity: { type: Number, required: true, min: 1 },
  unitPricePaise: { type: Number, required: true, min: 0 },
  discountPaise: { type: Number, min: 0, default: 0 },
  taxRateBps: { type: Number, min: 0, max: 10000, default: 0 },
  taxPaise: { type: Number, min: 0, default: 0 },
  lineTotalPaise: { type: Number, min: 0, required: true },
}, { _id: true })

const businessSaleSchema = new mongoose.Schema({
  business: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
  saleNumber: { type: String, required: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'BusinessCustomer' },
  customerName: { type: String, trim: true, maxlength: 140 },
  items: { type: [saleItemSchema], validate: value => Array.isArray(value) && value.length > 0 },
  subtotalPaise: { type: Number, min: 0, required: true },
  discountPaise: { type: Number, min: 0, default: 0 },
  taxPaise: { type: Number, min: 0, default: 0 },
  totalPaise: { type: Number, min: 0, required: true },
  paymentStatus: { type: String, enum: ['pending', 'partial', 'paid', 'refunded'], default: 'paid', index: true },
  paymentMethod: { type: String, enum: ['cash', 'upi', 'card', 'bank_transfer', 'credit', 'other'], default: 'cash' },
  saleDate: { type: Date, default: Date.now, index: true },
  notes: { type: String, trim: true, maxlength: 1000 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true })

businessSaleSchema.index({ business: 1, saleDate: -1 })
businessSaleSchema.index({ business: 1, saleNumber: 1 }, { unique: true })

export default mongoose.model('BusinessSale', businessSaleSchema)
