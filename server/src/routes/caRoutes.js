import { Router } from 'express'
import multer from 'multer'
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
  uploadCADocument,
  updateCAPricing,
} from '../controllers/caController.js'

const documentUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => cb(null, ['application/pdf', 'image/jpeg', 'image/png'].includes(file.mimetype)),
})

const router = Router()

router.get('/profiles', getPublicCAProfiles)
router.use(protect)
router.get('/profile/me', getMyCAProfile)
router.put('/profile', upsertCAProfile)
router.patch('/profile/pricing', updateCAPricing)
router.post('/documents', documentUpload.single('document'), uploadCADocument)
router.get('/tax-jobs/me', getMyTaxJobs)
router.post('/tax-jobs', createTaxJob)
router.get('/work/me', getMyCAWork)
router.post('/tax-jobs/:id/submit-work', submitAssignedTaxJob)
router.post('/withdraw', requestCAWithdrawal)

export default router
