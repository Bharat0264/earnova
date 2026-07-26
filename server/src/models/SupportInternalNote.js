import mongoose from 'mongoose'

const supportInternalNoteSchema = new mongoose.Schema({
  ticket: { type: mongoose.Schema.Types.ObjectId, ref: 'SupportTicket', required: true, index: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  note: { type: String, required: true, trim: true, maxlength: 5000 },
  visibility: { type: String, enum: ['earnova_only', 'assigned_firm'], default: 'earnova_only' },
}, { timestamps: true })

supportInternalNoteSchema.index({ ticket: 1, createdAt: 1 })

export default mongoose.model('SupportInternalNote', supportInternalNoteSchema)

