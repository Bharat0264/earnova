import mongoose from 'mongoose'

const caCaseAssignmentSchema = new mongoose.Schema({
  case: { type: mongoose.Schema.Types.ObjectId, ref: 'CACase', required: true, index: true },
  firm: { type: mongoose.Schema.Types.ObjectId, ref: 'CAFirm', required: true, index: true },
  member: { type: mongoose.Schema.Types.ObjectId, ref: 'CAFirmMember', required: true, index: true },
  assignmentRole: { type: String, enum: ['lead_professional', 'case_manager', 'accountant', 'reviewer', 'support_owner'], required: true },
  active: { type: Boolean, default: true, index: true },
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assignedAt: { type: Date, default: Date.now },
  removedAt: Date,
}, { timestamps: true })

caCaseAssignmentSchema.index({ case: 1, member: 1, assignmentRole: 1 }, { unique: true })
caCaseAssignmentSchema.index({ firm: 1, member: 1, active: 1 })

export default mongoose.model('CACaseAssignment', caCaseAssignmentSchema)

