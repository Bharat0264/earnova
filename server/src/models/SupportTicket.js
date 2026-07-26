import mongoose from 'mongoose'

const replySchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true, trim: true, maxlength: 3000 },
  internal: { type: Boolean, default: false },
}, { timestamps: true })

const supportTicketSchema = new mongoose.Schema({
  ticketNumber: { type: String, required: true, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  category: { type: String, required: true, trim: true, maxlength: 100 },
  priority: { type: String, enum: ['low', 'normal', 'high', 'urgent'], default: 'normal', index: true },
  subject: { type: String, required: true, trim: true, maxlength: 180 },
  description: { type: String, required: true, trim: true, maxlength: 5000 },
  attachments: [{ fileName: String, url: String }],
  status: { type: String, enum: ['open', 'in_progress', 'waiting_for_customer', 'resolved', 'closed'], default: 'open', index: true },
  assignedAgent: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  replies: [replySchema],
}, { timestamps: true })

supportTicketSchema.index({ status: 1, priority: 1, createdAt: -1 })
export default mongoose.model('SupportTicket', supportTicketSchema)
