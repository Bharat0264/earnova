import mongoose from 'mongoose'

const supportTicketMessageSchema = new mongoose.Schema({
  ticket: { type: mongoose.Schema.Types.ObjectId, ref: 'SupportTicket', required: true, index: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  authorType: { type: String, enum: ['customer', 'agent', 'provider', 'firm', 'system'], required: true },
  message: { type: String, required: true, trim: true, maxlength: 5000 },
  attachmentIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'SupportAttachment' }],
  readBy: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    readAt: Date,
  }],
  editedAt: Date,
  moderationFlag: { type: String, trim: true, maxlength: 120 },
}, { timestamps: true })

supportTicketMessageSchema.index({ ticket: 1, createdAt: 1 })

export default mongoose.model('SupportTicketMessage', supportTicketMessageSchema)

