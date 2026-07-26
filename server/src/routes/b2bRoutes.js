import { Router } from 'express'
import { submitQuote, getQuotes, updateQuote } from '../controllers/b2bController.js'
import { protect, adminOnly, requireFeature } from '../middleware/auth.js'

const router = Router()

router.post('/quote',        protect, requireFeature('b2bPrograms'), submitQuote)
router.get('/quotes',        protect, adminOnly, requireFeature('b2bPrograms'), getQuotes)       /* Admin   */
router.patch('/quotes/:id',  protect, adminOnly, requireFeature('b2bPrograms'), updateQuote)     /* Admin   */

export default router
