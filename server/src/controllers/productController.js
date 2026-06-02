import Product from '../models/Product.js'
import { APIFeatures, buildCountFilter } from '../utils/apiFeatures.js'
import { uploadToCloudinary, deleteFromCloudinary } from '../config/cloudinary.js'

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
    const limit = parseInt(req.query.limit, 10) || 12

    res.json({
      success:  true,
      total,
      page,
      pages:    Math.ceil(total / limit) || 1,
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
    const product = await Product.create(req.body)
    res.status(201).json({ success: true, product })
  } catch (err) {
    res.status(400).json({ success: false, message: err.message })
  }
}

/* ────────────────────────────────────────
   PATCH /api/products/:id  (admin)
──────────────────────────────────────── */
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    )
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' })
    res.json({ success: true, product })
  } catch (err) {
    res.status(400).json({ success: false, message: err.message })
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
