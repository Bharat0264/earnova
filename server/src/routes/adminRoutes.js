import { Router } from 'express'
import {
  getDashboardStats,
  getAdminUsers,
  updateAdminUser,
  createAdminUser,
  getAdminFreelanceJobs,
  updateAdminFreelanceJob,
  getAdminCAProfiles,
  updateAdminCAProfile,
  getAdminCATaxJobs,
  updateAdminCATaxJob,
  getAdminProjectListings,
  updateAdminProjectListing
} from '../controllers/adminController.js'
import { getPlatformAnalytics, listAdminOperations, updateAdminOperation } from '../controllers/adminOperationsController.js'
import {
  adminAddFirmMember, adminAssignCaseFirm, adminCAAuditLogs, adminCreateFirm, adminGetSupportTicket,
  adminListCACases, adminListCAServices, adminListFirmMembers, adminListFirms,
  adminListSupportTickets, adminSupportDashboard, adminUpdateFirm, adminUpdateProfessionalVerification,
} from '../controllers/adminCAAndSupportController.js'

import { protect, adminOnly } from '../middleware/auth.js'
import { getPlatformFees, updatePlatformFee } from '../controllers/platformFeeController.js'
import { listBusinessVerifications, updateBusinessVerification } from '../controllers/adminVerificationController.js'

const router = Router()

/* All admin routes require admin login */
router.use(protect, adminOnly)

/* Dashboard */
router.get('/stats', getDashboardStats)
router.get('/fee-settings', getPlatformFees)
router.patch('/fee-settings/:serviceKey', updatePlatformFee)

/* Users */
router.get('/users', getAdminUsers)
router.post('/users', createAdminUser)
router.patch('/users/:id', updateAdminUser)

/* Business identity verification */
router.get('/business-verifications', listBusinessVerifications)
router.patch('/business-verifications/:id', updateBusinessVerification)

/* Freelance jobs */
router.get('/freelance-jobs', getAdminFreelanceJobs)
router.patch('/freelance-jobs/:id', updateAdminFreelanceJob)

/* CA verification and tax work */
router.get('/ca-profiles', getAdminCAProfiles)
router.patch('/ca-profiles/:id', updateAdminCAProfile)
router.get('/ca-tax-jobs', getAdminCATaxJobs)
router.patch('/ca-tax-jobs/:id', updateAdminCATaxJob)

/* Project marketplace */
router.get('/project-listings', getAdminProjectListings)
router.patch('/project-listings/:id', updateAdminProjectListing)

router.get('/platform-analytics', getPlatformAnalytics)
router.get('/operations/:resource', listAdminOperations)
router.patch('/operations/:resource/:id', updateAdminOperation)

router.get('/ca/firms', adminListFirms)
router.post('/ca/firms', adminCreateFirm)
router.patch('/ca/firms/:id', adminUpdateFirm)
router.post('/ca/firms/:id/members', adminAddFirmMember)
router.get('/ca/professionals', adminListFirmMembers)
router.get('/ca/verifications', adminListFirmMembers)
router.patch('/ca/professionals/:id/verification', adminUpdateProfessionalVerification)
router.get('/ca/services', adminListCAServices)
router.get('/ca/cases', adminListCACases)
router.patch('/ca/cases/:id/firm', adminAssignCaseFirm)
router.get('/ca/escalations', adminListCACases)
router.get('/ca/payments', adminListCACases)
router.get('/ca/reviews', adminListCACases)
router.get('/ca/audit-logs', adminCAAuditLogs)

router.get('/support', adminSupportDashboard)
router.get('/support/tickets', adminListSupportTickets)
router.get('/support/tickets/:id', adminGetSupportTicket)
router.get('/support/queues', adminSupportDashboard)
router.get('/support/agents', adminListSupportTickets)
router.get('/support/escalations', adminListSupportTickets)
router.get('/support/categories', adminSupportDashboard)
router.get('/support/articles', adminSupportDashboard)
router.get('/support/reports', adminSupportDashboard)
router.get('/support/settings', adminSupportDashboard)

export default router
