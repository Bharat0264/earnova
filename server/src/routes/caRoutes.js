import { Router } from 'express'
import { protect } from '../middleware/auth.js'
import {
  upsertCAProfile,
  getMyCAProfile,
  createTaxJob,
  getMyTaxJobs,
} from '../controllers/caController.js'

const router = Router()

router.use(protect)
router.get('/profile/me', getMyCAProfile)
router.put('/profile', upsertCAProfile)
router.get('/tax-jobs/me', getMyTaxJobs)
router.post('/tax-jobs', createTaxJob)

export default router
