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
  contactWhatsapp: { type: String, trim: true, maxlength: 20, select: false },
  maskedPan: { type: String, trim: true, maxlength: 20 },
  taxIntake: {
    assessmentYear: { type: String, trim: true, maxlength: 20 },
    taxpayerType: { type: String, enum: ['individual', 'huf', 'proprietor'] },
    residentialStatus: { type: String, enum: ['resident', 'nri', 'not_sure'] },
    incomeSources: [{ type: String, enum: ['salary', 'house_property', 'business', 'capital_gains', 'interest', 'foreign_income', 'other'] }],
    deductionClaims: [{ type: String, enum: ['80c', '80d', 'home_loan', 'donations', 'nps', 'education_loan', 'other'] }],
    filingReason: { type: String, enum: ['regular', 'refund', 'loss_carry_forward', 'notice', 'revised', 'not_sure'] },
    hasForm16: Boolean,
    hasAisTis: Boolean,
    hasCapitalGains: Boolean,
    hasForeignAssets: Boolean,
    taxPosition: { type: String, enum: ['refund_expected', 'tax_payable', 'not_sure'] },
    declarationAccepted: Boolean,
  },
  status: { type: String, enum: CA_CASE_STATUSES, default: 'draft', index: true },
  workflowKey: { type: String, default: 'standard_ca_service', trim: true },
  nextActionOwner: { type: String, enum: ['customer', 'firm', 'external', 'none'], default: 'firm' },
  nextAction: { type: String, trim: true, maxlength: 500 },
  expectedNextUpdateAt: Date,
  consultation: { type: mongoose.Schema.Types.ObjectId, ref: 'CAConsultation' },
  quote: { type: mongoose.Schema.Types.ObjectId, ref: 'CAQuote' },
  payments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'PaymentAttempt' }],
  quote: {
    professionalFeePaise: { type: Number, min: 0 },
    customerPlatformFeePaise: { type: Number, min: 0 },
    providerPlatformFeePaise: { type: Number, min: 0 },
    totalPaise: { type: Number, min: 0 },
    providerPayoutPaise: { type: Number, min: 0 },
    currency: { type: String, enum: ['INR'], default: 'INR' },
    scope: { type: String, trim: true, maxlength: 2000 },
    feeVersion: { type: Number, min: 1 },
    raisedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    raisedAt: Date,
    status: { type: String, enum: ['issued', 'paid', 'cancelled', 'expired'] },
  },
  paymentStatus: { type: String, enum: ['not_quoted', 'pending', 'paid', 'failed', 'refunded'], default: 'not_quoted', index: true },
  razorpayOrderId: { type: String, trim: true },
  razorpayPaymentId: { type: String, trim: true },
  paidAt: Date,
  supportTickets: [{ type: mongoose.Schema.Types.ObjectId, ref: 'SupportTicket' }],
  completionSummary: { type: String, trim: true, maxlength: 3000 },
  completedAt: Date,
}, { timestamps: true })

caCaseSchema.index({ customer: 1, status: 1, createdAt: -1 })
caCaseSchema.index({ business: 1, status: 1, createdAt: -1 })
caCaseSchema.index({ firm: 1, status: 1, updatedAt: -1 })

export default mongoose.model('CACase', caCaseSchema)
