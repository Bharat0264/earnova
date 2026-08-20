import mongoose from 'mongoose'

const businessBlueprintSchema = new mongoose.Schema({
  business: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true, unique: true, index: true },
  identity: { name: String, industry: String, description: String, location: String },
  businessModel: { audience: { type: String, trim: true, maxlength: 180 }, channel: { type: String, enum: ['online', 'offline', 'hybrid', 'unspecified'], default: 'unspecified' } },
  goals: { primary: { type: String, trim: true, maxlength: 300 }, items: { type: [String], default: [] } },
  digitalPresence: { website: { type: String, default: '' }, domain: { type: String, default: '' } },
  payments: { status: { type: String, default: 'NOT_STARTED' } },
  products: { status: { type: String, default: 'NOT_STARTED' } },
  suppliers: { status: { type: String, default: 'NOT_STARTED' } },
  fulfilment: { status: { type: String, default: 'NOT_STARTED' } },
  customers: { status: { type: String, default: 'NOT_STARTED' } },
  compliance: { status: { type: String, default: 'NOT_STARTED' } },
  marketing: { status: { type: String, default: 'NOT_STARTED' } },
  operations: { status: { type: String, default: 'NOT_STARTED' } },
}, { timestamps: true, minimize: false })

export default mongoose.model('BusinessBlueprint', businessBlueprintSchema)
