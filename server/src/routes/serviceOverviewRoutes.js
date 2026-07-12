import { Router } from 'express'
import { protect } from '../middleware/auth.js'
import { getMyServiceOverview } from '../controllers/serviceOverviewController.js'

const router = Router()
router.get('/me', protect, getMyServiceOverview)
export default router
