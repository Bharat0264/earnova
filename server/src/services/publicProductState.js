import Business from '../models/Business.js'
import FulfilmentConfiguration from '../models/FulfilmentConfiguration.js'

const publicBusiness = business => business && ({
  _id: business._id,
  name: business.name,
  slug: business.slug,
  verificationStatus: business.verificationStatus,
  isPlatformStore: business.isPlatformStore === true,
})

// This exposes only derived fulfilment readiness. Provider names, regions and
// all other configuration details stay private to the owning business.
export const withPublicProductState = async products => {
  if (!products.length) return []
  const ids = [...new Set(products.map(product => product.business?._id || product.business).filter(Boolean).map(String))]
  const [businesses, configurations] = await Promise.all([
    Business.find({ _id: { $in: ids }, status: 'active' }).select('name slug verificationStatus isPlatformStore status').lean(),
    FulfilmentConfiguration.find({ business: { $in: ids } }).select('business enabled serviceRegions').lean(),
  ])
  const businessById = new Map(businesses.map(business => [String(business._id), business]))
  const fulfilmentByBusiness = new Map(configurations.map(config => [String(config.business), config]))

  return products.map(product => {
    const businessId = String(product.business?._id || product.business || '')
    const business = businessById.get(businessId)
    const fulfilment = fulfilmentByBusiness.get(businessId)
    return derivePublicPurchaseState(product, business, fulfilment)
  })
}

export const derivePublicPurchaseState = (product, business, fulfilment) => {
  const isPublished = product.published !== false
  const inStock = Number(product.stock || 0) > 0
  const fulfilmentAvailable = Boolean(fulfilment?.enabled && fulfilment.serviceRegions?.length)
  return {
    ...product,
    business: publicBusiness(business),
    store: publicBusiness(business),
    isPublished,
    inStock,
    fulfilmentAvailable,
    canPurchase: Boolean(product.isActive && isPublished && inStock && business && fulfilmentAvailable),
  }
}
