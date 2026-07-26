import mongoose from 'mongoose'

const auditLogSchema = new mongoose.Schema({
  actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  action: { type: String, required: true, trim: true, maxlength: 120, index: true },
  resourceType: { type: String, required: true, trim: true, maxlength: 100 },
  resourceId: mongoose.Schema.Types.ObjectId,
  summary: { type: String, required: true, trim: true, maxlength: 500 },
  requestId: { type: String, trim: true, maxlength: 100 },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: true, versionKey: false })

auditLogSchema.index({ createdAt: -1 })
export default mongoose.model('AuditLog', auditLogSchema)
