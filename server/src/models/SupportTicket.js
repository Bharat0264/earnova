import mongoose from 'mongoose'

export const SUPPORT_STATUSES = [
  'submitted', 'under_review', 'assigned', 'more_information_required',
  'waiting_for_customer', 'waiting_for_provider', 'waiting_for_ca_firm',
  'waiting_for_payment_review', 'escalated', 'resolved', 'closed', 'reopened',
  'rejected_as_duplicate', 'spam_or_abuse',
]

const supportTicketSchema = new mongoose.Schema({
  ticketNumber: { type: String, required: true, unique: true, index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  business: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', index: true },
  serviceCategory: { type: String, required: true, trim: true, maxlength: 80, index: true },
  issueCategory: { type: String, required: true, trim: true, maxlength: 180, index: true },
  subject: { type: String, required: true, trim: true, maxlength: 180 },
  description: { type: String, required: true, trim: true, maxlength: 5000 },
  relatedEntityType: { type: String, enum: ['ca_case', 'order', 'payment', 'project', 'service_request', 'provider', 'none'], default: 'none' },
  relatedEntityId: { type: mongoose.Schema.Types.ObjectId },
  relatedPublicReference: { type: String, trim: true, maxlength: 100 },
  customerImpact: { type: String, enum: ['low', 'normal', 'high', 'critical'], default: 'normal' },
  priority: { type: String, enum: ['low', 'normal', 'high', 'urgent', 'security_critical'], default: 'normal', index: true },
  status: { type: String, enum: SUPPORT_STATUSES, default: 'submitted', index: true },
  supportQueue: { type: String, required: true, trim: true, maxlength: 100, index: true },
  assignedAgent: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  assignedTeam: { type: String, trim: true, maxlength: 120 },
  assignedFirm: { type: mongoose.Schema.Types.ObjectId, ref: 'CAFirm', index: true },
  escalationLevel: { type: Number, min: 0, max: 5, default: 0 },
  nextAction: { type: String, trim: true, maxlength: 500 },
  firstResponseDueAt: Date,
  resolutionDueAt: Date,
  resolvedAt: Date,
  closedAt: Date,
  resolutionCode: { type: String, trim: true, maxlength: 100 },
  resolutionSummary: { type: String, trim: true, maxlength: 2000 },
  satisfactionScore: { type: Number, min: 1, max: 5 },
}, { timestamps: true })

supportTicketSchema.index({ user: 1, status: 1, updatedAt: -1 })
supportTicketSchema.index({ business: 1, status: 1, updatedAt: -1 })
supportTicketSchema.index({ supportQueue: 1, assignedAgent: 1, status: 1, createdAt: -1 })
supportTicketSchema.index({ relatedEntityType: 1, relatedEntityId: 1, status: 1 })
supportTicketSchema.index({ subject: 'text', description: 'text', ticketNumber: 'text' })

export default mongoose.model('SupportTicket', supportTicketSchema)
