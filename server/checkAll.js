import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Product from './src/models/Product.js'

dotenv.config()

async function check() {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    
    const allProducts = await Product.find().lean()
    console.log('All products in database:')
    allProducts.forEach(p => {
      console.log(`  - ${p.name} | isActive: ${p.isActive} | category: ${p.category}`)
    })
    
    const active = await Product.countDocuments({ isActive: true })
    console.log(`\nActive products: ${active}`)
    
    await mongoose.connection.close()
  } catch (err) {
    console.error('❌ Error:', err)
  }
}

check()
