import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Product from './src/models/Product.js'

dotenv.config()

async function check() {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    
    const total = await Product.countDocuments()
    const active = await Product.countDocuments({ isActive: true })
    const prestige = await Product.countDocuments({ brand: /prestige/i })
    const prestigeActive = await Product.countDocuments({ brand: /prestige/i, isActive: true })
    
    console.log('Total products:', total)
    console.log('Active products:', active)
    console.log('Prestige products (all):', prestige)
    console.log('Prestige products (active):', prestigeActive)
    
    const sample = await Product.find({ brand: /prestige/i }).limit(3)
    console.log('\nSample Prestige product:', sample[0])
    
    await mongoose.connection.close()
  } catch (err) {
    console.error(err)
  }
}

check()
