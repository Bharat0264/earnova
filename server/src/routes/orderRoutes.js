import { Router } from 'express'
import {
  getMyOrders, getOrder, cancelOrder,
  updateOrderStatus, getAllOrders,
} from '../controllers/orderController.js'
import { protect, adminOnly } from '../middleware/auth.js'

const router = Router()
router.use(protect)

/* Customer */
router.get('/',                protect, getMyOrders)
router.get('/:id',             protect, getOrder)
router.post('/:id/cancel',     protect, cancelOrder)

/* Admin */
router.get('/admin/all',           protect, adminOnly, getAllOrders)
router.patch('/:id/status',        protect, adminOnly, updateOrderStatus)

export default router
