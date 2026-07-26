import { Router } from 'express'
import { checkEligibility, submitRequest, getRequests, updateRequest } from '../controllers/subsidyController.js'
import { protect, adminOnly, requireFeature } from '../middleware/auth.js'

const router = Router()

router.post('/check-eligibility', protect, requireFeature('subsidies'), checkEligibility)
router.post('/request',           protect, requireFeature('subsidies'), submitRequest)
router.get('/requests',           protect, adminOnly, requireFeature('subsidies'), getRequests)      /* Admin  */
router.patch('/requests/:id',     protect, adminOnly, requireFeature('subsidies'), updateRequest)    /* Admin  */

export default router
