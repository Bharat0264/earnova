import mongoose from 'mongoose'

const customerSchema = new mongoose.Schema({
  business: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 140 },
  email: { type: String, trim: true, lowercase: true, maxlength: 160 },
  phone: { type: String, trim: true, maxlength: 20 },
  company: { type: String, trim: true, maxlength: 140 },
  address: { type: String, trim: true, maxlength: 500 },
  notes: { type: String, trim: true, maxlength: 2000 },
  tags: [{ type: String, trim: true, maxlength: 50 }],
  totalRevenuePaise: { type: Number, min: 0, default: 0 },
  orderCount: { type: Number, min: 0, default: 0 },
  lastActivityAt: Date,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true })

customerSchema.index({ business: 1, createdAt: -1 })
customerSchema.index({ business: 1, email: 1 })
customerSchema.index({ business: 1, phone: 1 })

export default mongoose.model('BusinessCustomer', customerSchema)
