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
  name:     process.env.ADMIN_NAME  || 'Earnova Admin',
  email:    process.env.ADMIN_EMAIL || 'admin@earnova.in',
  password: process.env.ADMIN_PASS  || 'Admin@1234',
  role:     'admin',
}

async function main() {
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
    console.log(`✅  Admin created: ${ADMIN.email} / ${ADMIN.password}`)
    console.log('⚠️   Change the password immediately after first login!\n')
  }
  process.exit(0)
}

main().catch(err => { console.error(err); process.exit(1) })
