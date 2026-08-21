import mongoose from 'mongoose'
const schema = new mongoose.Schema({
  business: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true, unique: true, index: true },
  mode: { type: String, enum: ['SELF_FULFILMENT', 'LOCAL_DELIVERY', 'COURIER_PROVIDER'], required: true }, enabled: { type: Boolean, default: false },
  serviceRegions: { type: [String], default: [] }, baseDeliveryCharge: { type: Number, default: 0, min: 0 }, freeDeliveryThreshold: { type: Number, min: 0 },
  estimatedMinDays: { type: Number, min: 0 }, estimatedMaxDays: { type: Number, min: 0 }, providerName: String, providerConfigReference: String, pickupAddress: String,
}, { timestamps: true })
export default mongoose.model('FulfilmentConfiguration', schema)
