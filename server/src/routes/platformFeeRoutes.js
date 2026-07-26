import { Router } from 'express'
import { getPlatformFees } from '../controllers/platformFeeController.js'

const router = Router()
router.get('/', getPlatformFees)

export default router
