import mongoose from 'mongoose'

const businessRoadmapItemSchema = new mongoose.Schema({
  business: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
  stepKey: { type: String, required: true, trim: true, maxlength: 80 },
  title: { type: String, required: true, trim: true, maxlength: 140 },
  description: { type: String, trim: true, maxlength: 500, default: '' },
  category: { type: String, trim: true, maxlength: 60, default: 'business' },
  status: { type: String, enum: ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'BLOCKED', 'NOT_APPLICABLE'], default: 'NOT_STARTED', index: true },
  progress: { type: Number, min: 0, max: 100, default: 0 },
  required: { type: Boolean, default: true },
  dependsOn: { type: [String], default: [] },
  recommendedRoute: { type: String, trim: true, maxlength: 200, default: '' },
  completedAt: Date,
}, { timestamps: true })

businessRoadmapItemSchema.index({ business: 1, stepKey: 1 }, { unique: true })
businessRoadmapItemSchema.index({ business: 1, status: 1, createdAt: 1 })

export default mongoose.model('BusinessRoadmapItem', businessRoadmapItemSchema)
