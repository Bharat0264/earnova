import mongoose from 'mongoose'
import dotenv from 'dotenv'
import User from '../models/User.js'
import FulfilmentConfiguration from '../models/FulfilmentConfiguration.js'
import BusinessEvent from '../models/BusinessEvent.js'
import { migrateLegacyPlatformProducts } from '../services/platformStore.js'

dotenv.config()

const required = name => {
  const value = String(process.env[name] || '').trim()
  if (!value) throw new Error(`${name} is required.`)
  return value
}

const run = async () => {
  try {
    const pickupAddress = required('PLATFORM_FULFILMENT_PICKUP_ADDRESS')
    const serviceRegions = required('PLATFORM_FULFILMENT_SERVICE_REGIONS').split(',').map(value => value.trim()).filter(Boolean)
    const minDays = Number(required('PLATFORM_FULFILMENT_MIN_DAYS'))
    const maxDays = Number(required('PLATFORM_FULFILMENT_MAX_DAYS'))
    if (!Number.isFinite(minDays) || !Number.isFinite(maxDays) || minDays < 0 || maxDays < minDays) throw new Error('Delivery estimates are invalid.')

    await mongoose.connect(process.env.MONGO_URI, { dbName: process.env.MONGO_DB || 'earnova' })
    const administrator = await User.findOne({ role: 'admin' }).select('_id').lean()
    if (!administrator) throw new Error('No administrator exists to own the Earnova Store business.')
    const { platformBusiness, migrated } = await migrateLegacyPlatformProducts(administrator._id)
    const configuration = await FulfilmentConfiguration.findOneAndUpdate(
      { business: platformBusiness._id },
      { $set: {
        mode: process.env.PLATFORM_FULFILMENT_MODE || 'LOCAL_DELIVERY',
        enabled: true,
        serviceRegions,
        baseDeliveryCharge: Number(process.env.PLATFORM_FULFILMENT_BASE_CHARGE || 0),
        freeDeliveryThreshold: Number(process.env.PLATFORM_FULFILMENT_FREE_THRESHOLD || 0),
        estimatedMinDays: minDays,
        estimatedMaxDays: maxDays,
        pickupAddress,
      } },
      { upsert: true, new: true, runValidators: true },
    )
    await BusinessEvent.create({ business: platformBusiness._id, actor: administrator._id, eventType: 'FULFILMENT_CONFIGURED', source: 'platform-fulfilment', metadata: { mode: configuration.mode, enabled: true } })
    console.log(`Configured platform fulfilment for ${platformBusiness._id}; migrated ${migrated} legacy products.`)
    await mongoose.disconnect()
  } catch (error) {
    console.error('Platform fulfilment configuration failed:', error.message)
    await mongoose.disconnect().catch(() => {})
    process.exitCode = 1
  }
}

run()
