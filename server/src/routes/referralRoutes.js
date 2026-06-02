import { Router } from 'express'
import {
  getReferralStats, getReferralTransactions, getLeaderboard,
  trackClick, requestWithdrawal, getWithdrawals, updateWithdrawal,
} from '../controllers/referralController.js'
import { protect, adminOnly } from '../middleware/auth.js'

const router = Router()

/* Public */
router.get('/leaderboard',    getLeaderboard)
router.get('/track/:code',    trackClick)

/* Protected */
router.get('/stats',          protect, getReferralStats)
router.get('/transactions',   protect, getReferralTransactions)
router.post('/withdraw',      protect, requestWithdrawal)
router.get('/withdrawals',    protect, getWithdrawals)

/* Admin */
router.patch('/withdrawals/:id', protect, adminOnly, updateWithdrawal)

export default router
