import { Router } from 'express'
import { checkEligibility, submitRequest, getRequests, updateRequest } from '../controllers/subsidyController.js'
import { protect, adminOnly, requireFeature } from '../middleware/auth.js'

const router = Router()
router.use(protect, requireFeature('subsidies'))

router.post('/check-eligibility', checkEligibility)                     /* Public */
router.post('/request',           submitRequest)                        /* Public */
router.get('/requests',           protect, adminOnly, getRequests)      /* Admin  */
router.patch('/requests/:id',     protect, adminOnly, updateRequest)    /* Admin  */

export default router
