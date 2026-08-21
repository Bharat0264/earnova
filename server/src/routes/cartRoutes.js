import { Router } from 'express'
import { protect } from '../middleware/auth.js'
import { getCart, replaceCart } from '../controllers/cartController.js'

const router = Router()
router.use(protect)
router.route('/').get(getCart).put(replaceCart)
export default router
