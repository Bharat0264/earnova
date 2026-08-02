/**
 * Earnova — Create First Admin User
 * 
 * Usage:
 *   cd server
 *   node src/data/createAdmin.js
 *
 * Or promote an existing user via MongoDB:
 *   db.users.updateOne({ email: "you@email.com" }, { $set: { role: "admin" } })
 */
import mongoose from 'mongoose'
import dotenv   from 'dotenv'
import User     from '../models/User.js'

dotenv.config()

const ADMIN = {
  name:     process.env.ADMIN_NAME,
  email:    process.env.ADMIN_EMAIL,
  password: process.env.ADMIN_PASS,
  role:     'admin',
}

async function main() {
  if (!process.env.MONGO_URI || !ADMIN.name || !ADMIN.email || !ADMIN.password) {
    throw new Error('MONGO_URI, ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASS are all required.')
  }
  if (ADMIN.password.length < 12) throw new Error('ADMIN_PASS must contain at least 12 characters.')
  await mongoose.connect(process.env.MONGO_URI, { dbName: 'earnova' })
  console.log('✅  Connected to MongoDB')

  const existing = await User.findOne({ email: ADMIN.email })
  if (existing) {
    if (existing.role !== 'admin') {
      existing.role = 'admin'
      await existing.save()
      console.log(`✅  Promoted existing user ${ADMIN.email} to admin`)
    } else {
      console.log(`ℹ️   ${ADMIN.email} is already an admin`)
    }
  } else {
    await User.create(ADMIN)
    console.log(`Admin created: ${ADMIN.email}`)
  }
  process.exit(0)
}

main().catch(err => { console.error(err); process.exit(1) })
