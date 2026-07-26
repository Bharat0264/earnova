import 'dotenv/config'
import mongoose from 'mongoose'
import Plan from '../models/Plan.js'
import CommissionRule from '../models/CommissionRule.js'

if (!process.env.MONGO_URI) throw new Error('MONGO_URI is required.')

await mongoose.connect(process.env.MONGO_URI)
try {
  const plans = [
    { key: 'starter', name: 'Starter', pricePaise: 0, interval: 'none', features: ['One business', 'Manual entry', 'Basic dashboard'], limits: { businesses: 1, members: 1, aiQuestions: 10, invoices: 20 } },
    { key: 'growth', name: 'Growth', pricePaise: 14900, interval: 'month', features: ['CSV import', 'CRM', 'Inventory', 'Forecasts'], limits: { businesses: 1, members: 5, aiQuestions: 100, invoices: 500 } },
    { key: 'pro', name: 'Pro', pricePaise: 49900, interval: 'month', features: ['Multiple businesses', 'Advanced permissions', 'Priority support'], limits: { businesses: 5, members: 25, aiQuestions: 1000, invoices: 5000 } },
  ]
  for (const plan of plans) await Plan.updateOne({ key: plan.key }, { $set: plan }, { upsert: true })
  await CommissionRule.updateOne(
    { key: 'standard-order', version: 1 },
    { $setOnInsert: { key: 'standard-order', version: 1, rateBps: 500, approvalDays: 14, payoutThresholdPaise: 10000, active: true } },
    { upsert: true }
  )
  console.log(`Operations configuration ready: ${plans.length} plans and commission rule v1.`)
} finally {
  await mongoose.disconnect()
}
