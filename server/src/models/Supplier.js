import mongoose from 'mongoose'
const schema = new mongoose.Schema({ owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, name: { type: String, required: true, trim: true }, categories: [String], location: String, contact: { name: String, email: String, phone: String }, offerings: [String], moq: String, leadTime: String, verificationStatus: { type: String, enum: ['PENDING','VERIFIED','REJECTED'], default: 'PENDING' }, status: { type: String, enum: ['ACTIVE','INACTIVE'], default: 'ACTIVE' } }, { timestamps: true })
export default mongoose.model('Supplier', schema)
