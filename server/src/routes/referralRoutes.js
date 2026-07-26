import { Router } from 'express'
import {
  getReferralStats, getReferralTransactions, getLeaderboard,
  trackClick, requestWithdrawal, getWithdrawals, updateWithdrawal,
} from '../controllers/referralController.js'
import { protect, adminOnly, requireFeature } from '../middleware/auth.js'

const router = Router()

/* Public */
router.get('/leaderboard',    getLeaderboard)
router.get('/track/:code',    trackClick)

/* Protected */
router.get('/stats',          protect, requireFeature('referrals'), getReferralStats)
router.get('/transactions',   protect, requireFeature('referrals'), getReferralTransactions)
router.post('/withdraw',      protect, requireFeature('referrals'), requestWithdrawal)
router.get('/withdrawals',    protect, requireFeature('referrals'), getWithdrawals)

/* Admin */
router.patch('/withdrawals/:id', protect, adminOnly, updateWithdrawal)

export default router
