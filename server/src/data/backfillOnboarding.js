import dotenv from 'dotenv'
import mongoose from 'mongoose'
import { connectDB } from '../config/db.js'
import User from '../models/User.js'

dotenv.config()
await connectDB()

const result = await User.updateMany(
  { onboarding: { $exists: false } },
  {
    $set: {
      accountType: 'individual',
      goals: [],
      onboarding: {
        status: 'not_started',
        currentStep: 0,
        completedSteps: [],
        skippedSteps: [],
      },
    },
  }
)

console.log(`Matched ${result.matchedCount}; updated ${result.modifiedCount} users.`)
await mongoose.connection.close()
