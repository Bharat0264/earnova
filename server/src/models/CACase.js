import mongoose from 'mongoose'

export const CA_CASE_STATUSES = [
  'draft', 'consultation_requested', 'consultation_scheduled', 'quote_prepared',
  'customer_approval_required', 'awaiting_payment', 'payment_received', 'documents_requested',
  'documents_uploaded', 'documents_under_review', 'correction_required', 'work_in_progress',
  'professional_review', 'customer_clarification_required', 'submitted_to_authority',
  'external_response_pending', 'additional_information_required', 'completed', 'on_hold',
  'cancelled', 'refund_requested', 'refunded',
]

const caCaseSchema = new mongoose.Schema({
  reference: { type: String, required: true, unique: true, index: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  business: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', index: true },
  service: { type: mongoose.Schema.Types.ObjectId, ref: 'CAService', required: true, index: true },
  serviceSlug: { type: String, required: true, lowercase: true, trim: true, index: true },
  firm: { type: mongoose.Schema.Types.ObjectId, ref: 'CAFirm', index: true },
  intakeSummary: { type: String, required: true, trim: true, maxlength: 3000 },
  contactPhone: { type: String, trim: true, maxlength: 30 },
  maskedPan: { type: String, trim: true, maxlength: 20 },
  status: { type: String, enum: CA_CASE_STATUSES, default: 'draft', index: true },
  workflowKey: { type: String, default: 'standard_ca_service', trim: true },
  nextActionOwner: { type: String, enum: ['customer', 'firm', 'external', 'none'], default: 'firm' },
  nextAction: { type: String, trim: true, maxlength: 500 },
  expectedNextUpdateAt: Date,
  consultation: { type: mongoose.Schema.Types.ObjectId, ref: 'CAConsultation' },
  quote: { type: mongoose.Schema.Types.ObjectId, ref: 'CAQuote' },
  payments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'PaymentAttempt' }],
  supportTickets: [{ type: mongoose.Schema.Types.ObjectId, ref: 'SupportTicket' }],
  completedAt: Date,
}, { timestamps: true })

caCaseSchema.index({ customer: 1, status: 1, createdAt: -1 })
caCaseSchema.index({ business: 1, status: 1, createdAt: -1 })
caCaseSchema.index({ firm: 1, status: 1, updatedAt: -1 })

export default mongoose.model('CACase', caCaseSchema)

