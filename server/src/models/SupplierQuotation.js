import mongoose from 'mongoose'

const schema = new mongoose.Schema({
  rfq: { type: mongoose.Schema.Types.ObjectId, ref: 'RFQ', required: true, index: true },
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true, index: true },
  business: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
  unitPrice: { type: Number, required: true, min: 0 }, quantity: { type: Number, required: true, min: 1 }, totalPrice: { type: Number, required: true, min: 0 },
  moq: { type: Number, min: 1 }, leadTimeDays: { type: Number, min: 0 }, deliveryEstimate: String, notes: { type: String, maxlength: 2000 }, validUntil: Date,
  status: { type: String, enum: ['DRAFT', 'SUBMITTED', 'ACCEPTED', 'REJECTED', 'EXPIRED', 'WITHDRAWN'], default: 'SUBMITTED', index: true },
}, { timestamps: true })
schema.index({ rfq: 1, supplier: 1 }, { unique: true }); schema.index({ business: 1, status: 1, createdAt: -1 })
export default mongoose.model('SupplierQuotation', schema)
