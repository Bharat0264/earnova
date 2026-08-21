import mongoose from 'mongoose'
import dotenv from 'dotenv'
import User from '../models/User.js'
import { migrateLegacyPlatformProducts } from '../services/platformStore.js'

dotenv.config()

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { dbName: process.env.MONGO_DB || 'earnova' })
    const administrator = await User.findOne({ role: 'admin' }).select('_id').lean()
    if (!administrator) throw new Error('No administrator exists to own the Earnova Store business.')
    const { platformBusiness, migrated } = await migrateLegacyPlatformProducts(administrator._id)
    console.log(`Earnova Store: ${platformBusiness._id}; legacy products migrated: ${migrated}`)
    await mongoose.disconnect()
  } catch (error) {
    console.error('Platform product migration failed:', error.message)
    await mongoose.disconnect().catch(() => {})
    process.exitCode = 1
  }
}

run()
