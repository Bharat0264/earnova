import mongoose from 'mongoose'
import { CA_CASE_STATUSES } from './CACase.js'

const caCaseStatusHistorySchema = new mongoose.Schema({
  case: { type: mongoose.Schema.Types.ObjectId, ref: 'CACase', required: true, index: true },
  previousStatus: { type: String, enum: [...CA_CASE_STATUSES, null], default: null },
  newStatus: { type: String, enum: CA_CASE_STATUSES, required: true },
  changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  actorRole: { type: String, required: true, trim: true, maxlength: 80 },
  reason: { type: String, required: true, trim: true, maxlength: 1000 },
  customerVisible: { type: Boolean, default: true },
}, { timestamps: true, versionKey: false })

caCaseStatusHistorySchema.index({ case: 1, createdAt: 1 })

export default mongoose.model('CACaseStatusHistory', caCaseStatusHistorySchema)

