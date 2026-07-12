import mongoose from 'mongoose'

const businessWorkspaceSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  sourceName: { type: String, trim: true, maxlength: 240, default: 'No data imported' },
  profile: { type: mongoose.Schema.Types.Mixed, default: {} },
  orders: { type: [mongoose.Schema.Types.Mixed], default: [] },
  lastImportedAt: Date,
}, { timestamps: true, minimize: false })

export default mongoose.model('BusinessWorkspace', businessWorkspaceSchema)
