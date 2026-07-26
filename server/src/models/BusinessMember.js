import mongoose from 'mongoose'

const businessMemberSchema = new mongoose.Schema({
  business: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  role: { type: String, enum: ['owner', 'admin', 'editor', 'viewer'], default: 'viewer' },
  status: { type: String, enum: ['active', 'invited', 'suspended'], default: 'active', index: true },
  invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  joinedAt: { type: Date, default: Date.now },
}, { timestamps: true })

businessMemberSchema.index({ business: 1, user: 1 }, { unique: true })
businessMemberSchema.index({ user: 1, status: 1, createdAt: -1 })

export default mongoose.model('BusinessMember', businessMemberSchema)
