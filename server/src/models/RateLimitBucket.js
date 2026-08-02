import mongoose from 'mongoose'

const rateLimitBucketSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  count: { type: Number, required: true, default: 0 },
  resetAt: { type: Date, required: true, index: { expires: 0 } },
}, { versionKey: false })

export default mongoose.model('RateLimitBucket', rateLimitBucketSchema)
