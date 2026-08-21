import Product from '../models/Product.js'
import Business from '../models/Business.js'
import FulfilmentConfiguration from '../models/FulfilmentConfiguration.js'

export class FulfilmentUnavailableError extends Error {
  constructor(message, { code = 'FULFILMENT_UNAVAILABLE', productIds = [] } = {}) {
    super(message)
    this.name = 'FulfilmentUnavailableError'
    this.code = code
    this.productIds = productIds.map(String)
  }
}

const destinationValues = address => [address?.pincode, address?.city, address?.state].filter(Boolean).map(value => String(value).trim().toLowerCase())
export const serves = (config, address) => {
  const regions = config.serviceRegions || []
  if (!config.enabled || !regions.length) return false
  const destination = destinationValues(address)
  return regions.some(region => String(region).trim() === '*' || destination.some(value => value === String(region).trim().toLowerCase()))
}

export const getShippingQuote = async ({ items, address }) => {
  const productIds = items.filter(item => item.itemType !== 'service' && item.product).map(item => item.product)
  if (!productIds.length) return { shipping: 0, estimatedDelivery: null, fulfilmentMode: null, businesses: [] }
  if (!address?.pincode) throw new FulfilmentUnavailableError('A delivery address with pincode is required.', { code: 'DELIVERY_ADDRESS_REQUIRED' })
  const products = await Product.find({ _id: { $in: productIds }, isActive: true, $or: [{ published: true }, { published: { $exists: false } }] }).select('business').lean()
  if (products.length !== new Set(productIds.map(String)).size) {
    throw new FulfilmentUnavailableError('One or more products are no longer available.', { code: 'PRODUCT_UNAVAILABLE', productIds })
  }
  const businessIds = [...new Set(products.map(product => String(product.business || '')).filter(Boolean))]
  if (businessIds.length !== new Set(productIds.map(String)).size) {
    const unassigned = products.filter(product => !product.business).map(product => product._id)
    throw new FulfilmentUnavailableError('Delivery is currently unavailable for one or more products.', { code: 'PRODUCT_BUSINESS_MISSING', productIds: unassigned })
  }
  const activeBusinesses = await Business.find({ _id: { $in: businessIds }, status: 'active' }).select('_id').lean()
  if (activeBusinesses.length !== businessIds.length) {
    throw new FulfilmentUnavailableError('Delivery is currently unavailable for one or more products.', { code: 'BUSINESS_UNAVAILABLE' })
  }
  const configs = await FulfilmentConfiguration.find({ business: { $in: businessIds } }).lean()
  const byBusiness = new Map(configs.map(config => [String(config.business), config]))
  let shipping = 0; let maxDays = 0; const businesses = []
  for (const businessId of businessIds) {
    const config = byBusiness.get(businessId)
    if (!config) throw new FulfilmentUnavailableError('Delivery is currently unavailable for one or more products.', { code: 'FULFILMENT_NOT_CONFIGURED', productIds: products.filter(product => String(product.business) === businessId).map(product => product._id) })
    if (!serves(config, address)) throw new FulfilmentUnavailableError('This delivery address is not serviceable for one or more sellers.', { code: 'DELIVERY_NOT_SERVICEABLE', productIds: products.filter(product => String(product.business) === businessId).map(product => product._id) })
    const subtotal = items.filter(item => String(item.product || '') && products.find(product => String(product._id) === String(item.product) && String(product.business) === businessId)).reduce((sum, item) => sum + item.price * item.quantity, 0)
    const charge = config.freeDeliveryThreshold !== undefined && subtotal >= config.freeDeliveryThreshold ? 0 : Number(config.baseDeliveryCharge || 0)
    shipping += charge; maxDays = Math.max(maxDays, Number(config.estimatedMaxDays || 0)); businesses.push({ businessId, mode: config.mode, charge })
  }
  return { shipping, estimatedDelivery: maxDays ? new Date(Date.now() + maxDays * 86400000) : null, fulfilmentMode: businesses.length === 1 ? businesses[0].mode : 'MULTI_SELLER', businesses }
}
