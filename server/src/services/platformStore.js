import Business from '../models/Business.js'
import Product from '../models/Product.js'

const platformSlug = 'earnova-store'

export const ensurePlatformBusiness = async ownerId => {
  let business = await Business.findOne({ isPlatformStore: true })
  if (business) return business
  if (!ownerId) throw new Error('An administrator is required to create the Earnova Store business.')

  try {
    business = await Business.create({
      owner: ownerId,
      name: 'Earnova Store',
      slug: platformSlug,
      industry: 'Commerce',
      businessModel: 'online',
      stage: 'operating',
      launchStatus: 'launched',
      status: 'active',
      isPlatformStore: true,
    })
    return business
  } catch (error) {
    if (error?.code !== 11000) throw error
    business = await Business.findOne({ isPlatformStore: true })
    if (business) return business
    throw error
  }
}

// Legacy Admin products predate the business relationship. This update is
// deliberately narrow and idempotent: products already owned by a seller are
// never touched and all product/order identifiers and fields are retained.
export const migrateLegacyPlatformProducts = async ownerId => {
  const platformBusiness = await ensurePlatformBusiness(ownerId)
  const result = await Product.updateMany(
    { $or: [{ business: { $exists: false } }, { business: null }] },
    { $set: { business: platformBusiness._id } },
  )
  return { platformBusiness, migrated: result.modifiedCount || 0 }
}
