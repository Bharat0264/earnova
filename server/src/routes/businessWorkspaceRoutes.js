import { Router } from 'express'
import { protect } from '../middleware/auth.js'
import { getBusinessWorkspace, saveBusinessWorkspace } from '../controllers/businessWorkspaceController.js'

const router = Router()
router.use(protect)
router.get('/', getBusinessWorkspace)
router.put('/', saveBusinessWorkspace)

export default router
