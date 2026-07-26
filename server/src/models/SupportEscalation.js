import mongoose from 'mongoose'

const supportEscalationSchema = new mongoose.Schema({
  ticket: { type: mongoose.Schema.Types.ObjectId, ref: 'SupportTicket', required: true, index: true },
  escalatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reason: { type: String, required: true, trim: true, maxlength: 1500 },
  previousQueue: { type: String, required: true, trim: true, maxlength: 100 },
  newQueue: { type: String, required: true, trim: true, maxlength: 100 },
  level: { type: Number, required: true, min: 1, max: 5 },
  requiredFollowUp: { type: String, trim: true, maxlength: 1000 },
  customerVisibleStatus: { type: String, trim: true, maxlength: 500 },
}, { timestamps: true, versionKey: false })

supportEscalationSchema.index({ ticket: 1, createdAt: -1 })
supportEscalationSchema.index({ newQueue: 1, createdAt: -1 })

export default mongoose.model('SupportEscalation', supportEscalationSchema)

