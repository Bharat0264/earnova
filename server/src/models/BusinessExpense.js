import mongoose from 'mongoose'

const expenseSchema = new mongoose.Schema({
  business: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
  category: { type: String, required: true, trim: true, maxlength: 100 },
  amountPaise: { type: Number, required: true, min: 1 },
  vendor: { type: String, trim: true, maxlength: 160 },
  expenseDate: { type: Date, default: Date.now, index: true },
  paymentMethod: { type: String, enum: ['cash', 'upi', 'card', 'bank_transfer', 'credit', 'other'], default: 'cash' },
  notes: { type: String, trim: true, maxlength: 1000 },
  receipt: {
    fileName: { type: String, trim: true, maxlength: 255 },
    url: { type: String, trim: true, maxlength: 1000 },
  },
  recurring: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true })

expenseSchema.index({ business: 1, expenseDate: -1 })
expenseSchema.index({ business: 1, category: 1, expenseDate: -1 })

export default mongoose.model('BusinessExpense', expenseSchema)
