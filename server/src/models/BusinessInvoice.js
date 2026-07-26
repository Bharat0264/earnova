import mongoose from 'mongoose'

const invoiceItemSchema = new mongoose.Schema({
  description: { type: String, required: true, trim: true, maxlength: 300 },
  quantity: { type: Number, required: true, min: 0.01 },
  unitPricePaise: { type: Number, required: true, min: 0 },
  discountPaise: { type: Number, min: 0, default: 0 },
  taxRateBps: { type: Number, min: 0, max: 10000, default: 0 },
  taxPaise: { type: Number, min: 0, default: 0 },
  lineTotalPaise: { type: Number, min: 0, required: true },
}, { _id: true })

const invoiceSchema = new mongoose.Schema({
  business: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
  invoiceNumber: { type: String, required: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'BusinessCustomer' },
  customerSnapshot: {
    name: { type: String, required: true, trim: true, maxlength: 140 },
    email: { type: String, trim: true, maxlength: 160 },
    phone: { type: String, trim: true, maxlength: 20 },
    address: { type: String, trim: true, maxlength: 500 },
  },
  items: { type: [invoiceItemSchema], validate: value => Array.isArray(value) && value.length > 0 },
  subtotalPaise: { type: Number, min: 0, required: true },
  discountPaise: { type: Number, min: 0, default: 0 },
  taxPaise: { type: Number, min: 0, default: 0 },
  totalPaise: { type: Number, min: 0, required: true },
  issueDate: { type: Date, default: Date.now, index: true },
  dueDate: { type: Date, required: true, index: true },
  status: { type: String, enum: ['draft', 'sent', 'partial', 'paid', 'overdue', 'cancelled'], default: 'draft', index: true },
  notes: { type: String, trim: true, maxlength: 1000 },
  paidAt: Date,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true })

invoiceSchema.index({ business: 1, invoiceNumber: 1 }, { unique: true })
invoiceSchema.index({ business: 1, status: 1, dueDate: 1 })

export default mongoose.model('BusinessInvoice', invoiceSchema)
