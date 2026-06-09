import { Router } from 'express'
import {
  login, getMe, updateProfile, updatePassword,
  addAddress, updateAddress, deleteAddress,
  forgotPassword, resetPassword,
} from '../controllers/authController.js'
import { protect } from '../middleware/auth.js'

const router = Router()

/* Public */
router.post('/register', (_req, res) => {
  res.status(403).json({
    success: false,
    message: 'Registration is disabled.'
  })
})

router.post('/login', login)
router.post('/forgot-password', forgotPassword)
router.post('/reset-password/:token', resetPassword)

/* Protected */
router.get('/me', protect, getMe)
router.patch('/profile', protect, updateProfile)
router.patch('/password', protect, updatePassword)
router.post('/addresses', protect, addAddress)
router.patch('/addresses/:addressId', protect, updateAddress)
router.delete('/addresses/:addressId', protect, deleteAddress)

export default router