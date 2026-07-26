import mongoose from 'mongoose'

export const DOCUMENT_REVIEW_STATUSES = [
  'not_requested', 'requested', 'not_uploaded', 'uploaded', 'under_review',
  'accepted', 'rejected', 'replacement_requested', 'not_applicable',
]

const caCaseDocumentSchema = new mongoose.Schema({
  case: { type: mongoose.Schema.Types.ObjectId, ref: 'CACase', required: true, index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  firm: { type: mongoose.Schema.Types.ObjectId, ref: 'CAFirm', index: true },
  documentType: { type: String, required: true, trim: true, maxlength: 160 },
  originalFilename: { type: String, required: true, trim: true, maxlength: 255 },
  storageProvider: { type: String, required: true, enum: ['cloudinary', 's3_compatible'] },
  storageKey: { type: String, required: true, trim: true },
  resourceType: { type: String, trim: true, default: 'raw' },
  mimeType: { type: String, required: true, trim: true },
  fileSize: { type: Number, required: true, min: 1 },
  checksum: { type: String, required: true, trim: true },
  version: { type: Number, default: 1, min: 1 },
  reviewStatus: { type: String, enum: DOCUMENT_REVIEW_STATUSES, default: 'uploaded', index: true },
  malwareScanStatus: { type: String, enum: ['pending', 'clean', 'quarantined', 'failed'], default: 'pending', index: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewedAt: Date,
  rejectionReason: { type: String, trim: true, maxlength: 1000 },
  correctionInstructions: { type: String, trim: true, maxlength: 1000 },
  replacementDueAt: Date,
  retentionAt: Date,
  revokedAt: Date,
  deletedAt: Date,
}, { timestamps: true })

caCaseDocumentSchema.index({ case: 1, documentType: 1, version: -1 })
caCaseDocumentSchema.index({ retentionAt: 1, deletedAt: 1 })

export default mongoose.model('CACaseDocument', caCaseDocumentSchema)

