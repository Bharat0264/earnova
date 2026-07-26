import mongoose from 'mongoose'

const leadSchema = new mongoose.Schema({
  business: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 140 },
  company: { type: String, trim: true, maxlength: 140 },
  email: { type: String, trim: true, lowercase: true, maxlength: 160 },
  phone: { type: String, trim: true, maxlength: 20 },
  stage: {
    type: String,
    enum: ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost'],
    default: 'new',
    index: true,
  },
  source: { type: String, trim: true, maxlength: 100 },
  estimatedValuePaise: { type: Number, min: 0, default: 0 },
  followUpAt: Date,
  notes: { type: String, trim: true, maxlength: 2000 },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  convertedCustomer: { type: mongoose.Schema.Types.ObjectId, ref: 'BusinessCustomer' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true })

leadSchema.index({ business: 1, stage: 1, followUpAt: 1 })
leadSchema.index({ business: 1, createdAt: -1 })

export default mongoose.model('BusinessLead', leadSchema)
