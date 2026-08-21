import { Router } from 'express'
import { optionalAuth } from '../middleware/auth.js'
import { trackEvent } from '../controllers/analyticsController.js'
const router = Router()
router.post('/events', optionalAuth, trackEvent)
export default router
