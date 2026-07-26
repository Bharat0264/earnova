import mongoose from 'mongoose'
import { SUPPORT_STATUSES } from './SupportTicket.js'

const supportStatusHistorySchema = new mongoose.Schema({
  ticket: { type: mongoose.Schema.Types.ObjectId, ref: 'SupportTicket', required: true, index: true },
  previousStatus: { type: String, enum: [...SUPPORT_STATUSES, null], default: null },
  newStatus: { type: String, enum: SUPPORT_STATUSES, required: true },
  changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  actorRole: { type: String, required: true, trim: true, maxlength: 80 },
  reason: { type: String, required: true, trim: true, maxlength: 1000 },
  customerVisible: { type: Boolean, default: true },
}, { timestamps: true, versionKey: false })

supportStatusHistorySchema.index({ ticket: 1, createdAt: 1 })

export default mongoose.model('SupportStatusHistory', supportStatusHistorySchema)

