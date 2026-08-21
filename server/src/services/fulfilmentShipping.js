import Product from '../models/Product.js'
import FulfilmentConfiguration from '../models/FulfilmentConfiguration.js'

const destinationValues = address => [address?.pincode, address?.city, address?.state].filter(Boolean).map(value => String(value).trim().toLowerCase())
const serves = (config, address) => {
  const regions = config.serviceRegions || []
  if (!config.enabled || !regions.length) return false
  const destination = destinationValues(address)
  return regions.some(region => String(region).trim() === '*' || destination.some(value => value === String(region).trim().toLowerCase()))
}

export const getShippingQuote = async ({ items, address }) => {
  const productIds = items.filter(item => item.itemType !== 'service' && item.product).map(item => item.product)
  if (!productIds.length) return { shipping: 0, estimatedDelivery: null, fulfilmentMode: null, businesses: [] }
  if (!address?.pincode) throw new Error('A delivery address with pincode is required.')
  const products = await Product.find({ _id: { $in: productIds } }).select('business').lean()
  const businessIds = [...new Set(products.map(product => String(product.business || '')).filter(Boolean))]
  if (businessIds.length !== new Set(productIds.map(String)).size) throw new Error('One or more products are not connected to a fulfilment-enabled business.')
  const configs = await FulfilmentConfiguration.find({ business: { $in: businessIds } }).lean()
  const byBusiness = new Map(configs.map(config => [String(config.business), config]))
  let shipping = 0; let maxDays = 0; const businesses = []
  for (const businessId of businessIds) {
    const config = byBusiness.get(businessId)
    if (!config || !serves(config, address)) throw new Error('This delivery address is not serviceable for one or more sellers.')
    const subtotal = items.filter(item => String(item.product || '') && products.find(product => String(product._id) === String(item.product) && String(product.business) === businessId)).reduce((sum, item) => sum + item.price * item.quantity, 0)
    const charge = config.freeDeliveryThreshold !== undefined && subtotal >= config.freeDeliveryThreshold ? 0 : Number(config.baseDeliveryCharge || 0)
    shipping += charge; maxDays = Math.max(maxDays, Number(config.estimatedMaxDays || 0)); businesses.push({ businessId, mode: config.mode, charge })
  }
  return { shipping, estimatedDelivery: maxDays ? new Date(Date.now() + maxDays * 86400000) : null, fulfilmentMode: businesses.length === 1 ? businesses[0].mode : 'MULTI_SELLER', businesses }
}
