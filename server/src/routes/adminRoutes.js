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

import { protect, adminOnly } from '../middleware/auth.js'

const router = Router()

/* All admin routes require admin login */
router.use(protect, adminOnly)

/* Dashboard */
router.get('/stats', getDashboardStats)

/* Users */
router.get('/users', getAdminUsers)
router.post('/users', createAdminUser)
router.patch('/users/:id', updateAdminUser)

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

export default router
