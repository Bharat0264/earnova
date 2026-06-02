import { Router } from 'express'
import { getDashboardStats, getAdminUsers, updateAdminUser } from '../controllers/adminController.js'
import { protect, adminOnly } from '../middleware/auth.js'

const router = Router()

router.use(protect, adminOnly)   /* all admin routes require auth + admin role */

router.get('/stats',          getDashboardStats)
router.get('/users',          getAdminUsers)
router.patch('/users/:id',    updateAdminUser)

export default router
