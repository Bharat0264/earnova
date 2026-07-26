import { Router } from 'express'
import {
  register, login, getMe, updateProfile, updatePassword,
  addAddress, updateAddress, deleteAddress,
  forgotPassword, resetPassword, updateOnboarding,
} from '../controllers/authController.js'
import { protect } from '../middleware/auth.js'
import { createRateLimit } from '../middleware/security.js'

const router = Router()
const authLimiter = createRateLimit({ windowMs: 15 * 60 * 1000, max: 12, message: 'Too many authentication attempts. Please wait and try again.' })
const resetLimiter = createRateLimit({ windowMs: 60 * 60 * 1000, max: 6, message: 'Too many password reset requests. Please wait and try again.' })

/* Public */
router.post('/register', authLimiter, register)

router.post('/login', authLimiter, login)
router.post('/forgot-password', resetLimiter, forgotPassword)
router.post('/reset-password/:token', resetLimiter, resetPassword)

/* Protected */
router.get('/me', protect, getMe)
router.patch('/profile', protect, updateProfile)
router.patch('/password', protect, updatePassword)
router.put('/onboarding', protect, updateOnboarding)
router.post('/addresses', protect, addAddress)
router.patch('/addresses/:addressId', protect, updateAddress)
router.delete('/addresses/:addressId', protect, deleteAddress)

export default router
