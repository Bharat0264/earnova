import { Router } from 'express'
import { protect } from '../middleware/auth.js'
import { createRateLimit } from '../middleware/security.js'
import { requireFirmAdministrator, requireFirmMember } from '../services/caPermissions.js'
import {
  addFirmMember, assignCaseMember, createCACase, getCAService, getFirmCase, getFirmDashboard,
  getFirmTeam,
  getMyCACase, getVerifiedFirm, listCAServices, listFirmCases, listMyCACases,
  listVerifiedFirms, raiseCaseQuote, completeCaseWork, createCasePaymentOrder, verifyCasePayment,
} from '../controllers/caOfficeController.js'

const router = Router()
const intakeLimit = createRateLimit({ windowMs: 15 * 60 * 1000, max: 15 })

router.get('/services', listCAServices)
router.get('/services/:serviceSlug', getCAService)
router.get('/firms', listVerifiedFirms)
router.get('/firms/:firmSlug', getVerifiedFirm)

router.use('/cases', protect)
router.get('/cases', listMyCACases)
router.post('/cases', intakeLimit, createCACase)
router.get('/cases/:caseId', getMyCACase)
router.post('/cases/:caseId/payment-order', createCasePaymentOrder)
router.post('/cases/:caseId/verify-payment', verifyCasePayment)

router.use('/firm', protect, requireFirmMember)
router.get('/firm/dashboard', getFirmDashboard)
router.get('/firm/cases', listFirmCases)
router.get('/firm/cases/:caseId', getFirmCase)
router.post('/firm/cases/:caseId/quote', raiseCaseQuote)
router.post('/firm/cases/:caseId/complete', completeCaseWork)
router.get('/firm/team', getFirmTeam)
router.post('/firm/team', requireFirmAdministrator, addFirmMember)
router.post('/firm/cases/:caseId/assignments', requireFirmAdministrator, assignCaseMember)

export default router
