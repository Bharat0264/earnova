import mongoose from 'mongoose'

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: { type: String, required: true, trim: true, maxlength: 80 },
  title: { type: String, required: true, trim: true, maxlength: 180 },
  message: { type: String, required: true, trim: true, maxlength: 1000 },
  link: { type: String, trim: true, maxlength: 500 },
  readAt: Date,
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: true })

notificationSchema.index({ user: 1, readAt: 1, createdAt: -1 })
export default mongoose.model('Notification', notificationSchema)
