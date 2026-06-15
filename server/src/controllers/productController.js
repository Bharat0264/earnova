import Product from '../models/Product.js'
import { APIFeatures, buildCountFilter } from '../utils/apiFeatures.js'
import { uploadToCloudinary, deleteFromCloudinary } from '../config/cloudinary.js'

const parseDelimited = (text) => {
  const rows = []
  let row = []
  let cell = ''
  let quoted = false
  const delimiter = text.includes('\t') && !text.includes(',') ? '\t' : ','

  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i]
    const next = text[i + 1]

    if (ch === '"' && quoted && next === '"') {
      cell += '"'
      i += 1
    } else if (ch === '"') {
      quoted = !quoted
    } else if (ch === delimiter && !quoted) {
      row.push(cell.trim())
      cell = ''
    } else if ((ch === '\n' || ch === '\r') && !quoted) {
      if (ch === '\r' && next === '\n') i += 1
      row.push(cell.trim())
      if (row.some(Boolean)) rows.push(row)
      row = []
      cell = ''
    } else {
      cell += ch
    }
  }

  row.push(cell.trim())
  if (row.some(Boolean)) rows.push(row)
  return rows
}

const HEADER_ALIASES = {
  productname: 'name',
  product: 'name',
  title: 'name',
  itemname: 'name',
  item: 'name',
  type: 'category',
  productcategory: 'category',
  company: 'brand',
  make: 'brand',
  manufacturer: 'brand',
  fullproductdescription: 'description',
  productdescription: 'description',
  desc: 'description',
  shortdescription: 'shortDesc',
  shortdesc: 'shortDesc',
  sellingprice: 'price',
  saleprice: 'price',
  amount: 'price',
  mrpprice: 'mrp',
  tax: 'gstRate',
  gst: 'gstRate',
  gstpercent: 'gstRate',
  quantity: 'stock',
  qty: 'stock',
  inventory: 'stock',
  image: 'thumbnail',
  imageurl: 'thumbnail',
  thumbnailurl: 'thumbnail',
  imageurls: 'images',
  productimages: 'images',
  keyfeatures: 'highlights',
  features: 'highlights',
  specifications: 'specs',
  productspecs: 'specs',
  energysavings: 'energySaving',
  rating: 'starRating',
  stars: 'starRating',
  memberincome: 'referralIncome',
  memberearnings: 'referralIncome',
  memberearning: 'referralIncome',
  referralincome: 'referralIncome',
  referralearning: 'referralIncome',
  referralincome: 'referralIncome',
  commissionamount: 'referralIncome',
  membername: 'referralName',
  referral: 'referralName',
  commissionpercent: 'referralCommission',
  referralcommissionpercent: 'referralCommission',
  featured: 'isFeatured',
}

const normalizeHeader = (header) => {
  const compact = String(header || '')
    .replace(/^\uFEFF/, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')

  return HEADER_ALIASES[compact] || compact
}

const normalizeCategory = (value) => {
  const compact = String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')

  const map = {
    solar: 'solar-panels',
    solarpanel: 'solar-panels',
    solarpanels: 'solar-panels',
    solarfield: 'solar-panels',
    renewableenergy: 'solar-panels',
    fan: 'fans',
    fans: 'fans',
    ceilingfan: 'fans',
    ac: 'acs',
    acs: 'acs',
    airconditioner: 'acs',
    airconditioners: 'acs',
    accessory: 'accessories',
    accessories: 'accessories',
  }

  return map[compact] || 'accessories'
}

const makeSlug = (value) => String(value || '')
  .toLowerCase()
  .replace(/\s+/g, '-')
  .replace(/[^a-z0-9-]/g, '')

const normalizeProductPayload = (input, { partial = false } = {}) => {
  const number = (value, fallback = 0) => {
    if (partial && value === undefined) return undefined
    const cleaned = String(value ?? '')
      .replace(/[₹,%\s]/g, '')
      .replace(/,/g, '')
    const parsed = Number(cleaned)
    return Number.isFinite(parsed) ? parsed : fallback
  }
  const nonNegativeNumber = (value, fallback = 0) => {
    const parsed = number(value, fallback)
    return parsed === undefined ? undefined : Math.max(parsed, 0)
  }
  const text = (value) => {
    if (partial && value === undefined) return undefined
    return value?.trim()
  }
  const payload = {
    name: text(input.name),
    category: normalizeCategory(text(input.category) || (partial ? undefined : 'solar-panels')),
    brand: text(input.brand),
    model: text(input.model),
    description: text(input.description) || text(input.shortDesc) || text(input.name),
    shortDesc: text(input.shortDesc),
    price: number(input.price, NaN),
    mrp: number(input.mrp, number(input.price)),
    discount: number(input.discount),
    gstRate: number(input.gstRate, 18),
    stock: number(input.stock),
    sku: text(input.sku) || undefined,
    thumbnail: text(input.thumbnail) || undefined,
    images: input.images === undefined && partial
      ? undefined
      : Array.isArray(input.images)
        ? input.images
        : String(input.images || '')
          .split(/[|,\n]+/)
          .map(url => url.trim())
          .filter(Boolean),
    highlights: input.highlights === undefined && partial
      ? undefined
      : Array.isArray(input.highlights)
        ? input.highlights
        : String(input.highlights || '')
          .split('|')
          .map(item => item.trim())
          .filter(Boolean),
    specs: input.specs === undefined && partial
      ? undefined
      : Array.isArray(input.specs)
        ? input.specs.filter(spec => spec?.key?.trim())
        : String(input.specs || '')
          .split('|')
          .map(spec => {
            const [key, ...rest] = spec.split(':')
            return { key: key?.trim(), value: rest.join(':').trim() }
          })
          .filter(spec => spec.key),
    energySaving: text(input.energySaving),
    starRating: input.starRating ? number(input.starRating, 5) : undefined,
    referralName: text(input.referralName),
    referralIncome: nonNegativeNumber(input.referralIncome, NaN),
    referralCommission: number(input.referralCommission, 5),
    isActive: input.isActive === undefined ? (partial ? undefined : true) : !['false', '0', 'no'].includes(String(input.isActive).toLowerCase()),
    isFeatured: input.isFeatured === undefined ? undefined : ['true', '1', 'yes'].includes(String(input.isFeatured).toLowerCase()),
  }

  return Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== undefined))
}

const validateProductPayload = (payload) => {
  const missing = []
  if (!payload.name) missing.push('name')
  if (!payload.brand) missing.push('brand')
  if (!payload.description) missing.push('description')
  if (!payload.price && payload.price !== 0) missing.push('price')
  if (!Number.isFinite(payload.referralIncome)) missing.push('referralIncome')
  if (missing.length) return `${missing.join(', ')} required`
  return null
}

/* ────────────────────────────────────────
   GET /api/products
   Query: category, brand, minPrice, maxPrice,
          rating, inStock, search, sort, page, limit
──────────────────────────────────────── */
export const getProducts = async (req, res) => {
  try {
    const base     = Product.find({ isActive: true })
    const features = new APIFeatures(base, req.query)
      .filter()
      .search()
      .sort()
      .limitFields()
      .paginate()

    const [products, total] = await Promise.all([
      features.query.lean(),
      Product.countDocuments(buildCountFilter(req.query)),
    ])

    const page  = parseInt(req.query.page,  10) || 1
    const limit = req.query.limit === 'all'
      ? total || products.length || 1
      : parseInt(req.query.limit, 10) || 12

    res.json({
      success:  true,
      total,
      page,
      pages:    req.query.limit === 'all' ? 1 : Math.ceil(total / limit) || 1,
      products,
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

/* ────────────────────────────────────────
   GET /api/products/:slug
──────────────────────────────────────── */
export const getProduct = async (req, res) => {
  try {
    const { slug } = req.params
    const product  = await Product.findOne({
      $or: [{ slug }, { _id: slug.match(/^[a-f\d]{24}$/i) ? slug : null }],
      isActive: true,
    }).lean()

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' })
    }

    res.json({ success: true, product })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

/* ────────────────────────────────────────
   POST /api/products  (admin)
──────────────────────────────────────── */
export const createProduct = async (req, res) => {
  try {
    const payload = normalizeProductPayload(req.body)
    const validationError = validateProductPayload(payload)
    if (validationError) {
      return res.status(400).json({ success: false, message: validationError })
    }
    const product = await Product.create(payload)
    res.status(201).json({ success: true, product })
  } catch (err) {
    res.status(400).json({ success: false, message: err.message })
  }
}

export const getAdminProducts = async (req, res) => {
  try {
    const products = await Product.find({})
      .sort('-createdAt')
      .select('-__v')
      .lean()

    res.json({
      success: true,
      total: products.length,
      page: 1,
      pages: 1,
      products,
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

/* ────────────────────────────────────────
   PATCH /api/products/:id  (admin)
──────────────────────────────────────── */
export const updateProduct = async (req, res) => {
  try {
    const payload = normalizeProductPayload(req.body, { partial: true })
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: payload },
      { new: true, runValidators: true }
    )
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' })
    res.json({ success: true, product })
  } catch (err) {
    res.status(400).json({ success: false, message: err.message })
  }
}

export const importProducts = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Upload a CSV or TSV file exported from Excel.' })
    }

    const rows = parseDelimited(req.file.buffer.toString('utf8'))
    if (rows.length < 2) {
      return res.status(400).json({ success: false, message: 'Import file must include a header row and at least one product.' })
    }

    const headers = rows[0].map(normalizeHeader)
    const results = { created: 0, updated: 0, failed: 0, errors: [] }

    for (const [index, values] of rows.slice(1).entries()) {
      const raw = {}
      headers.forEach((header, i) => { raw[header] = values[i] ?? '' })
      const payload = normalizeProductPayload(raw)
      const validationError = validateProductPayload(payload)

      if (validationError) {
        results.failed += 1
        if (results.errors.length < 100) {
          results.errors.push({ row: index + 2, message: validationError })
        }
        continue
      }

      try {
        const existing = await Product.findOne({
          $or: [
            ...(payload.sku ? [{ sku: payload.sku }] : []),
            { slug: makeSlug(payload.name) },
            { name: payload.name },
          ],
        })

        if (existing) {
          await Product.findByIdAndUpdate(existing._id, { $set: payload }, { runValidators: true })
          results.updated += 1
        } else {
          await Product.create(payload)
          results.created += 1
        }
      } catch (err) {
        results.failed += 1
        if (results.errors.length < 100) {
          results.errors.push({ row: index + 2, message: err.message })
        }
      }
    }

    res.status(201).json({ success: true, results })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

/* ────────────────────────────────────────
   DELETE /api/products/:id  (admin — soft delete)
──────────────────────────────────────── */
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    )
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' })
    res.json({ success: true, message: 'Product deactivated' })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

/* ────────────────────────────────────────
   POST /api/products/:id/upload-image  (admin)
   Accepts: multipart/form-data  field: image
──────────────────────────────────────── */
export const uploadProductImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file provided' })
    }
    if (!req.file.mimetype.startsWith('image/')) {
      return res.status(400).json({ success: false, message: 'Only image files can be uploaded as product images.' })
    }

    const { secure_url, public_id } = await uploadToCloudinary(
      req.file.buffer,
      `earnova/products/${req.params.id}`
    )

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        $push:  { images: secure_url },
        $setOnInsert: { thumbnail: secure_url },
      },
      { new: true }
    )

    if (!product.thumbnail) {
      product.thumbnail = secure_url
      await product.save()
    }

    res.json({ success: true, url: secure_url, publicId: public_id, product })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

/* ────────────────────────────────────────
   POST /api/products/:id/reviews  (authenticated)
──────────────────────────────────────── */
export const addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body
    const product = await Product.findById(req.params.id)
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' })

    const alreadyReviewed = product.reviews.some(
      r => r.user.toString() === req.user._id.toString()
    )
    if (alreadyReviewed) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this product' })
    }

    product.reviews.push({ user: req.user._id, name: req.user.name, rating, comment })
    product.recalcRating()
    await product.save()

    res.status(201).json({ success: true, message: 'Review added', product })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

/* ────────────────────────────────────────
   GET /api/products/featured
──────────────────────────────────────── */
export const getFeaturedProducts = async (_req, res) => {
  try {
    const products = await Product.find({ isActive: true, isFeatured: true })
      .sort('-createdAt')
      .limit(8)
      .lean()
    res.json({ success: true, products })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}
