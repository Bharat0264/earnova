import mongoose from 'mongoose'

const statusEventSchema = new mongoose.Schema({
  status: String,
  note: String,
  timestamp: { type: Date, default: Date.now },
}, { _id: false })

const documentSchema = new mongoose.Schema({
  label: { type: String, required: true, trim: true },
  url: { type: String, required: true, trim: true },
}, { _id: false })

const caTaxJobSchema = new mongoose.Schema({
  jobId: { type: String, unique: true, index: true },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  clientName: { type: String, required: true, trim: true },
  clientEmail: { type: String, required: true, lowercase: true, trim: true },
  clientWhatsapp: { type: String, required: true, trim: true },
  clientType: {
    type: String,
    enum: ['individual', 'business', 'proprietor', 'partnership', 'llp', 'company'],
    default: 'individual',
  },
  pan: { type: String, required: true, uppercase: true, trim: true },
  aadhaarLast4: { type: String, trim: true, maxlength: 4 },
  assessmentYear: { type: String, required: true, trim: true },
  filingType: {
    type: String,
    enum: ['itr-filing', 'itr-revision', 'tax-notice', 'gst-filing', 'tds', 'bookkeeping', 'audit-support', 'financial-statements'],
    default: 'itr-filing',
  },
  incomeSources: [{ type: String, trim: true }],
  salaryEmployer: { type: String, trim: true },
  form16Available: { type: Boolean, default: false },
  bankInterest: { type: Number, min: 0, default: 0 },
  capitalGains: { type: Number, default: 0 },
  rentalIncome: { type: Number, default: 0 },
  businessIncome: { type: Number, default: 0 },
  foreignIncome: { type: Number, default: 0 },
  deductions80C: { type: Number, min: 0, default: 0 },
  deductions80D: { type: Number, min: 0, default: 0 },
  homeLoanInterest: { type: Number, min: 0, default: 0 },
  otherDeductions: { type: String, trim: true },
  gstin: { type: String, trim: true },
  turnover: { type: Number, min: 0, default: 0 },
  booksMaintained: { type: Boolean, default: false },
  documents: [documentSchema],
  notes: { type: String, trim: true, maxlength: 4000 },
  assignedCA: { type: mongoose.Schema.Types.ObjectId, ref: 'CAProfile', default: null },
  status: {
    type: String,
    enum: ['submitted', 'under-review', 'documents-needed', 'verified', 'filed', 'completed', 'cancelled'],
    default: 'submitted',
    index: true,
  },
  caNotes: { type: String, trim: true },
  adminNote: { type: String, trim: true },
  completedAt: Date,
  statusHistory: [statusEventSchema],
}, { timestamps: true })

caTaxJobSchema.pre('save', function (next) {
  if (!this.jobId) {
    const ts = Date.now().toString(36).toUpperCase()
    const rand = Math.random().toString(36).slice(2, 6).toUpperCase()
    this.jobId = `TAX${ts}${rand}`
  }
  next()
})

caTaxJobSchema.index({ status: 1, createdAt: -1 })
caTaxJobSchema.index({ client: 1, createdAt: -1 })

export default mongoose.model('CATaxJob', caTaxJobSchema)
