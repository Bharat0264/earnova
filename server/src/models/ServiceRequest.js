import mongoose from 'mongoose'

const proposalSchema = new mongoose.Schema({
  provider: { type: mongoose.Schema.Types.ObjectId, ref: 'ProviderProfile', required: true },
  message: { type: String, required: true, trim: true, maxlength: 2000 },
  amountPaise: { type: Number, required: true, min: 0 },
  deliveryDays: { type: Number, required: true, min: 1, max: 365 },
  status: { type: String, enum: ['submitted', 'accepted', 'rejected', 'withdrawn'], default: 'submitted' },
}, { timestamps: true })

const serviceRequestSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  business: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', index: true },
  category: { type: String, required: true, trim: true, maxlength: 100, index: true },
  title: { type: String, required: true, trim: true, maxlength: 180 },
  requirements: { type: String, required: true, trim: true, maxlength: 5000 },
  budgetPaise: { type: Number, min: 0, default: 0 },
  status: { type: String, enum: ['draft', 'open', 'proposal_received', 'accepted', 'in_progress', 'submitted', 'revision_requested', 'completed', 'cancelled', 'disputed'], default: 'open', index: true },
  proposals: [proposalSchema],
  selectedProposal: mongoose.Schema.Types.ObjectId,
  assignedProvider: { type: mongoose.Schema.Types.ObjectId, ref: 'ProviderProfile', index: true },
  paymentStatus: { type: String, enum: ['not_required', 'pending', 'recorded', 'refunded'], default: 'pending' },
  completionNote: { type: String, trim: true, maxlength: 3000 },
  review: {
    rating: { type: Number, min: 1, max: 5 },
    comment: { type: String, trim: true, maxlength: 1200 },
    submittedAt: Date,
  },
}, { timestamps: true })

serviceRequestSchema.index({ assignedProvider: 1, status: 1, updatedAt: -1 })
serviceRequestSchema.index({ customer: 1, status: 1, createdAt: -1 })
export default mongoose.model('ServiceRequest', serviceRequestSchema)
