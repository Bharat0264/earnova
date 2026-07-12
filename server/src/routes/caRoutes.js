import { Router } from 'express'
import { protect } from '../middleware/auth.js'
import {
  upsertCAProfile,
  getMyCAProfile,
  createTaxJob,
  getMyTaxJobs,
  getMyCAWork,
  submitAssignedTaxJob,
  requestCAWithdrawal,
  getPublicCAProfiles,
} from '../controllers/caController.js'

const router = Router()

router.get('/profiles', getPublicCAProfiles)
router.use(protect)
router.get('/profile/me', getMyCAProfile)
router.put('/profile', upsertCAProfile)
router.get('/tax-jobs/me', getMyTaxJobs)
router.post('/tax-jobs', createTaxJob)
router.get('/work/me', getMyCAWork)
router.post('/tax-jobs/:id/submit-work', submitAssignedTaxJob)
router.post('/withdraw', requestCAWithdrawal)

export default router
