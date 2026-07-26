import mongoose from 'mongoose'

const supportAttachmentSchema = new mongoose.Schema({
  ticket: { type: mongoose.Schema.Types.ObjectId, ref: 'SupportTicket', required: true, index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  originalFilename: { type: String, required: true, trim: true, maxlength: 255 },
  storageProvider: { type: String, required: true, enum: ['cloudinary', 's3_compatible'] },
  storageKey: { type: String, required: true, trim: true },
  resourceType: { type: String, trim: true, default: 'raw' },
  mimeType: { type: String, required: true, trim: true },
  fileSize: { type: Number, required: true, min: 1 },
  checksum: { type: String, required: true, trim: true },
  malwareScanStatus: { type: String, enum: ['pending', 'clean', 'quarantined', 'failed'], default: 'pending' },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  retentionAt: Date,
  revokedAt: Date,
  deletedAt: Date,
}, { timestamps: true })

supportAttachmentSchema.index({ ticket: 1, createdAt: -1 })
supportAttachmentSchema.index({ retentionAt: 1, deletedAt: 1 })

export default mongoose.model('SupportAttachment', supportAttachmentSchema)

