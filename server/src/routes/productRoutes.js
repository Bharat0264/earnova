import { Router }  from 'express'
import multer       from 'multer'
import {
  getProducts, getProduct, createProduct,
  updateProduct, deleteProduct, uploadProductImage,
  addReview, getFeaturedProducts, importProducts,
  getAdminProducts,
} from '../controllers/productController.js'
import { protect, adminOnly, optionalAuth } from '../middleware/auth.js'

const router = Router()

/* ── Multer — memory storage (buffer passed to Cloudinary) ── */
const upload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    const ok = file.mimetype.startsWith('image/') ||
      ['text/csv', 'text/tab-separated-values', 'application/vnd.ms-excel'].includes(file.mimetype) ||
      /\.(csv|tsv)$/i.test(file.originalname)
    if (ok) cb(null, true)
    else cb(new Error('Only image, CSV, or TSV files are allowed'))
  },
})

/* ── Public ── */
router.get('/',          optionalAuth, getProducts)
router.get('/featured',  getFeaturedProducts)
router.get('/admin/all', protect, adminOnly, getAdminProducts)
router.get('/:slug',     optionalAuth, getProduct)

/* ── Authenticated ── */
router.post('/:id/reviews', protect, addReview)

/* ── Admin only ── */
router.post('/',                          protect, adminOnly, createProduct)
router.post('/import',                    protect, adminOnly, upload.single('file'), importProducts)
router.patch('/:id',                      protect, adminOnly, updateProduct)
router.delete('/:id',                     protect, adminOnly, deleteProduct)
router.post('/:id/upload-image', protect, adminOnly, upload.single('image'), uploadProductImage)

export default router
