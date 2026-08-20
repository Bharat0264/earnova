import mongoose from 'mongoose'

const businessEventSchema = new mongoose.Schema({
  business: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
  eventType: { type: String, required: true, trim: true, maxlength: 80, index: true },
  source: { type: String, trim: true, maxlength: 60, default: 'platform' },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true, minimize: false })

businessEventSchema.index({ business: 1, createdAt: -1 })

export default mongoose.model('BusinessEvent', businessEventSchema)
