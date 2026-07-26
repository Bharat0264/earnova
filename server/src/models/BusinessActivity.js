import mongoose from 'mongoose'

const activitySchema = new mongoose.Schema({
  business: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
  actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, required: true, trim: true, maxlength: 80 },
  entityType: { type: String, trim: true, maxlength: 80 },
  entityId: mongoose.Schema.Types.ObjectId,
  summary: { type: String, required: true, trim: true, maxlength: 300 },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: true })

activitySchema.index({ business: 1, createdAt: -1 })

export default mongoose.model('BusinessActivity', activitySchema)
