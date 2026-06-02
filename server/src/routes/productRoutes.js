import { Router }  from 'express'
import multer       from 'multer'
import {
  getProducts, getProduct, createProduct,
  updateProduct, deleteProduct, uploadProductImage,
  addReview, getFeaturedProducts,
} from '../controllers/productController.js'
import { protect, adminOnly, optionalAuth } from '../middleware/auth.js'

const router = Router()

/* ── Multer — memory storage (buffer passed to Cloudinary) ── */
const upload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true)
    else cb(new Error('Only image files are allowed'))
  },
})

/* ── Public ── */
router.get('/',          optionalAuth, getProducts)
router.get('/featured',  getFeaturedProducts)
router.get('/:slug',     optionalAuth, getProduct)

/* ── Authenticated ── */
router.post('/:id/reviews', protect, addReview)

/* ── Admin only ── */
router.post('/',                          protect, adminOnly, createProduct)
router.patch('/:id',                      protect, adminOnly, updateProduct)
router.delete('/:id',                     protect, adminOnly, deleteProduct)
router.post('/:id/upload-image', protect, adminOnly, upload.single('image'), uploadProductImage)

export default router
