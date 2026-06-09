import { Router } from 'express'
import {
  getDashboardStats,
  getAdminUsers,
  updateAdminUser,
  createAdminUser
} from '../controllers/adminController.js'

import { protect, adminOnly } from '../middleware/auth.js'

const router = Router()

/* All admin routes require admin login */
router.use(protect, adminOnly)

/* Dashboard */
router.get('/stats', getDashboardStats)

/* Users */
router.get('/users', getAdminUsers)
router.post('/users', createAdminUser)
router.patch('/users/:id', updateAdminUser)

export default router