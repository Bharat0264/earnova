import mongoose from 'mongoose'

const freelancerProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  whatsapp: { type: String, required: true, trim: true },
  phone: { type: String, trim: true },
  city: { type: String, required: true, trim: true },
  title: { type: String, required: true, trim: true },
  bio: { type: String, required: true, trim: true, maxlength: 1200 },
  skills: [{ type: String, trim: true }],
  experience: { type: String, required: true, trim: true },
  hourlyRate: { type: Number, min: 0, default: 0 },
  portfolio: { type: String, trim: true },
  availability: {
    type: String,
    enum: ['available-now', 'part-time', 'weekends', 'not-available'],
    default: 'available-now',
  },
  status: {
    type: String,
    enum: ['pending', 'verified', 'paused', 'rejected'],
    default: 'pending',
    index: true,
  },
}, { timestamps: true })

export default mongoose.model('FreelancerProfile', freelancerProfileSchema)
