import mongoose from 'mongoose'

const caServiceSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 180 },
  category: { type: String, required: true, trim: true, maxlength: 100, index: true },
  summary: { type: String, required: true, trim: true, maxlength: 1200 },
  whoNeedsIt: [{ type: String, trim: true, maxlength: 300 }],
  eligibility: [{ type: String, trim: true, maxlength: 300 }],
  deliverables: [{ type: String, trim: true, maxlength: 300 }],
  exclusions: [{ type: String, trim: true, maxlength: 300 }],
  requiredDocuments: [{ type: String, trim: true, maxlength: 180 }],
  pricingMode: { type: String, enum: ['fixed', 'starting', 'quote', 'retainer'], default: 'quote' },
  startingPrice: { type: Number, min: 0 },
  handlingTime: { type: String, required: true, trim: true, maxlength: 500 },
  externalDependency: { type: String, trim: true, maxlength: 500 },
  addOns: [{ type: String, trim: true, maxlength: 180 }],
  consultationRequired: { type: Boolean, default: false },
  refundPolicy: { type: String, trim: true, maxlength: 600 },
  faq: [{
    question: { type: String, trim: true, maxlength: 300 },
    answer: { type: String, trim: true, maxlength: 1000 },
  }],
  workflowKey: { type: String, default: 'standard_ca_service', trim: true },
  active: { type: Boolean, default: true, index: true },
  sortOrder: { type: Number, default: 100 },
}, { timestamps: true })

caServiceSchema.index({ active: 1, category: 1, sortOrder: 1 })
caServiceSchema.index({ name: 'text', summary: 'text', category: 'text' })

export default mongoose.model('CAService', caServiceSchema)

