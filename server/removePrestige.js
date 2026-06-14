import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Product from './src/models/Product.js'

dotenv.config()

async function removePrestige() {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    
    const result = await Product.deleteMany({ brand: /prestige/i })
    console.log(`✅ Removed ${result.deletedCount} Prestige products`)
    
    const remaining = await Product.countDocuments()
    console.log(`📦 Remaining products: ${remaining}`)
    
    await mongoose.connection.close()
  } catch (err) {
    console.error('❌ Error:', err)
  }
}

removePrestige()
