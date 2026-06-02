import { Router } from 'express'
import { submitQuote, getQuotes, updateQuote } from '../controllers/b2bController.js'
import { protect, adminOnly } from '../middleware/auth.js'

const router = Router()

router.post('/quote',        submitQuote)                         /* Public  */
router.get('/quotes',        protect, adminOnly, getQuotes)       /* Admin   */
router.patch('/quotes/:id',  protect, adminOnly, updateQuote)     /* Admin   */

export default router
