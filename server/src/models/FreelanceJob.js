import mongoose from 'mongoose'

const DEFAULT_SERVICE_FEE_RATE = 10

const statusEventSchema = new mongoose.Schema({
  status: String,
  note: String,
  timestamp: { type: Date, default: Date.now },
}, { _id: false })

const freelanceJobSchema = new mongoose.Schema({
  jobId: { type: String, unique: true, index: true },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  clientName: { type: String, required: true, trim: true },
  clientEmail: { type: String, required: true, lowercase: true, trim: true },
  clientWhatsapp: { type: String, required: true, trim: true },
  company: { type: String, trim: true },
  title: { type: String, required: true, trim: true },
  category: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true, maxlength: 4000 },
  skills: [{ type: String, trim: true }],
  duration: { type: String, required: true, trim: true },
  deadline: Date,
  workMode: { type: String, enum: ['remote', 'onsite', 'hybrid'], default: 'remote' },
  freelancerAmount: { type: Number, required: true, min: 1 },
  serviceFeeRate: { type: Number, default: DEFAULT_SERVICE_FEE_RATE, immutable: true },
  serviceFee: { type: Number, required: true, min: 0 },
  totalPayable: { type: Number, required: true, min: 1 },
  currency: { type: String, default: 'INR' },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid-to-escrow', 'admin-waived', 'refunded', 'released'],
    default: 'pending',
    index: true,
  },
  status: {
    type: String,
    enum: ['awaiting-payment', 'open', 'in-progress', 'submitted', 'completed', 'cancelled', 'disputed'],
    default: 'awaiting-payment',
    index: true,
  },
  assignedFreelancer: { type: mongoose.Schema.Types.ObjectId, ref: 'FreelancerProfile', default: null },
  razorpayOrderId: String,
  razorpayPaymentId: String,
  razorpaySignature: String,
  fundedAt: Date,
  completedAt: Date,
  releasedAt: Date,
  notificationSentAt: Date,
  statusHistory: [statusEventSchema],
}, { timestamps: true })

freelanceJobSchema.pre('save', function (next) {
  if (!this.jobId) {
    const ts = Date.now().toString(36).toUpperCase()
    const rand = Math.random().toString(36).slice(2, 6).toUpperCase()
    this.jobId = `JOB${ts}${rand}`
  }
  next()
})

freelanceJobSchema.index({ status: 1, createdAt: -1 })
freelanceJobSchema.index({ client: 1, createdAt: -1 })

export default mongoose.model('FreelanceJob', freelanceJobSchema)
