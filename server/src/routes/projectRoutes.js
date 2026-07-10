import { Router } from 'express'
import { optionalAuth, protect } from '../middleware/auth.js'
import {
  submitProjectListing,
  getApprovedProjects,
  getProjectListing,
  getMyProjectListings,
} from '../controllers/projectController.js'

const router = Router()

router.get('/', optionalAuth, getApprovedProjects)
router.get('/my-listings', protect, getMyProjectListings)
router.get('/:id', optionalAuth, getProjectListing)
router.post('/submit', protect, submitProjectListing)

export default router
