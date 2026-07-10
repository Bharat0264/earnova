import { Router } from 'express'
import { adminOnly, protect, requireFeature } from '../middleware/auth.js'
import {
  upsertFreelancerProfile,
  getMyFreelancerProfile,
  createJob,
  createJobPaymentOrder,
  verifyJobPayment,
  getMyJobs,
  getFreelanceJob,
  releaseCompletedJob,
} from '../controllers/freelanceController.js'

const router = Router()
router.use(protect, requireFeature('freelancing'))
router.get('/profile/me', getMyFreelancerProfile)
router.put('/profile', upsertFreelancerProfile)
router.get('/jobs/me', getMyJobs)
router.get('/jobs/:id', getFreelanceJob)
router.post('/jobs', createJob)
router.post('/jobs/:id/payment-order', createJobPaymentOrder)
router.post('/jobs/:id/verify-payment', verifyJobPayment)
router.patch('/jobs/:id/release', adminOnly, releaseCompletedJob)

export default router
