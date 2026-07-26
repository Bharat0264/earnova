import mongoose from 'mongoose'

const planSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true, trim: true },
  name: { type: String, required: true, trim: true },
  active: { type: Boolean, default: true, index: true },
  pricePaise: { type: Number, min: 0, required: true },
  interval: { type: String, enum: ['month', 'year', 'none'], default: 'month' },
  features: [{ type: String, trim: true }],
  limits: { type: Map, of: Number, default: {} },
}, { timestamps: true })

export default mongoose.model('Plan', planSchema)
