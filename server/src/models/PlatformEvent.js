import mongoose from 'mongoose'

const platformEventSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  event: { type: String, required: true, trim: true, maxlength: 120, index: true },
  properties: { type: mongoose.Schema.Types.Mixed, default: {} },
  occurredAt: { type: Date, default: Date.now, index: true },
}, { timestamps: false })

platformEventSchema.index({ event: 1, occurredAt: -1 })
export default mongoose.model('PlatformEvent', platformEventSchema)
