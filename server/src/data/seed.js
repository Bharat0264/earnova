/**
 * Earnova — Database Seed Script
 *
 * Usage:
 *   cd server
 *   node src/data/seed.js           # seed products
 *   node src/data/seed.js --clear   # wipe products collection first
 */

import mongoose  from 'mongoose'
import dotenv    from 'dotenv'
import { SEED_PRODUCTS } from './seedProducts.js'
import Product   from '../models/Product.js'

dotenv.config()

const clear  = process.argv.includes('--clear')
const silent = process.argv.includes('--silent')

const log = (...args) => { if (!silent) console.log(...args) }

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI, { dbName: 'earnova' })
    log('\n✅  Connected to MongoDB')

    if (clear) {
      await Product.deleteMany({})
      log('🗑   Products collection cleared')
    }

    /* Skip if already seeded */
    const count = await Product.countDocuments()
    if (count > 0 && !clear) {
      log(`ℹ️   Database already has ${count} products. Use --clear to reseed.\n`)
      process.exit(0)
    }

    const inserted = await Product.insertMany(SEED_PRODUCTS)
    log(`🌱  Seeded ${inserted.length} products across 4 categories`)

    const byCategory = inserted.reduce((acc, p) => {
      acc[p.category] = (acc[p.category] || 0) + 1
      return acc
    }, {})
    Object.entries(byCategory).forEach(([cat, n]) => log(`     • ${cat}: ${n}`))
    log('\n🚀  Database ready — run npm run dev to start the server\n')

    process.exit(0)
  } catch (err) {
    console.error('❌  Seed failed:', err.message)
    process.exit(1)
  }
}

seed()
