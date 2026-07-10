import { Router } from 'express'
import { protect } from '../middleware/auth.js'
import {
  submitProjectListing,
  getApprovedProjects,
  getProjectListing,
  getMyProjectListings,
} from '../controllers/projectController.js'

const router = Router()

router.get('/', getApprovedProjects)
router.get('/my-listings', protect, getMyProjectListings)
router.get('/:id', getProjectListing)
router.post('/submit', protect, submitProjectListing)

export default router
