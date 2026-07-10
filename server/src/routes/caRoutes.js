import { Router } from 'express'
import { protect, requireFeature } from '../middleware/auth.js'
import {
  upsertCAProfile,
  getMyCAProfile,
  createTaxJob,
  createTaxJobPaymentOrder,
  getMyTaxJobs,
  verifyTaxJobPayment,
} from '../controllers/caController.js'

const router = Router()

router.use(protect, requireFeature('caServices'))
router.get('/profile/me', getMyCAProfile)
router.put('/profile', upsertCAProfile)
router.get('/tax-jobs/me', getMyTaxJobs)
router.post('/tax-jobs', createTaxJob)
router.post('/tax-jobs/:id/payment-order', createTaxJobPaymentOrder)
router.post('/tax-jobs/:id/verify-payment', verifyTaxJobPayment)

export default router
