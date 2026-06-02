import crypto  from 'crypto'
import User    from '../models/User.js'
import { signToken } from '../middleware/auth.js'
import { sendWelcomeEmail, sendPasswordResetEmail } from '../utils/email.js'

const respond = (res, user, statusCode = 200) => {
  const token = signToken(user._id)
  res.status(statusCode).json({ success: true, token, user: user.toPublicJSON() })
}

/* ── POST /api/auth/register ── */
export const register = async (req, res) => {
  try {
    const { name, email, phone, password, referralCode } = req.body

    if (await User.findOne({ email })) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists.' })
    }

    let referredBy = null
    if (referralCode) {
      const referrer = await User.findOne({ referralCode: referralCode.toUpperCase() })
      if (referrer) referredBy = referrer._id
    }

    const user = await User.create({ name, email, phone, password, referredBy })

    /* Send welcome email (non-blocking) */
    sendWelcomeEmail(user).catch(err => console.warn('[Email] welcome failed:', err.message))

    /* Update referrer count */
    if (referredBy) {
      await User.findByIdAndUpdate(referredBy, { $inc: { referralCount: 1 } })
    }

    respond(res, user, 201)
  } catch (err) {
    res.status(400).json({ success: false, message: err.message })
  }
}

/* ── POST /api/auth/login ── */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' })
    }

    const user = await User.findOne({ email }).select('+password')
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' })
    }
    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Your account has been suspended. Contact support.' })
    }

    respond(res, user)
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

/* ── GET /api/auth/me ── */
export const getMe = (req, res) => {
  res.json({ success: true, user: req.user.toPublicJSON() })
}

/* ── PATCH /api/auth/profile ── */
export const updateProfile = async (req, res) => {
  try {
    const allowed = ['name', 'phone', 'avatar']
    const updates = {}
    allowed.forEach(key => { if (req.body[key] !== undefined) updates[key] = req.body[key] })

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true })
    res.json({ success: true, user: user.toPublicJSON() })
  } catch (err) {
    res.status(400).json({ success: false, message: err.message })
  }
}

/* ── PATCH /api/auth/password ── */
export const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body
    const user = await User.findById(req.user._id).select('+password')

    if (!(await user.comparePassword(currentPassword))) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect.' })
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters.' })
    }

    user.password = newPassword
    await user.save()
    respond(res, user)
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

/* ── POST /api/auth/addresses ── */
export const addAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)

    /* If new address is default, unset all others */
    if (req.body.isDefault) {
      user.addresses.forEach(a => { a.isDefault = false })
    }
    /* First address is automatically default */
    if (user.addresses.length === 0) req.body.isDefault = true

    user.addresses.push(req.body)
    await user.save()
    res.status(201).json({ success: true, addresses: user.addresses })
  } catch (err) {
    res.status(400).json({ success: false, message: err.message })
  }
}

/* ── PATCH /api/auth/addresses/:addressId ── */
export const updateAddress = async (req, res) => {
  try {
    const user    = await User.findById(req.user._id)
    const address = user.addresses.id(req.params.addressId)
    if (!address) return res.status(404).json({ success: false, message: 'Address not found.' })

    if (req.body.isDefault) {
      user.addresses.forEach(a => { a.isDefault = false })
    }
    Object.assign(address, req.body)
    await user.save()
    res.json({ success: true, addresses: user.addresses })
  } catch (err) {
    res.status(400).json({ success: false, message: err.message })
  }
}

/* ── DELETE /api/auth/addresses/:addressId ── */
export const deleteAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    user.addresses.pull({ _id: req.params.addressId })
    await user.save()
    res.json({ success: true, addresses: user.addresses })
  } catch (err) {
    res.status(400).json({ success: false, message: err.message })
  }
}

/* ── POST /api/auth/forgot-password ── */
export const forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email })
    /* Don't reveal whether email exists */
    if (!user) {
      return res.json({ success: true, message: 'If that email is registered, a reset link was sent.' })
    }

    const rawToken    = crypto.randomBytes(32).toString('hex')
    user.resetPasswordToken   = crypto.createHash('sha256').update(rawToken).digest('hex')
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000 // 1 hr
    await user.save({ validateBeforeSave: false })

    const resetURL = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/${rawToken}`

    await sendPasswordResetEmail(user, resetURL)
      .catch(err => {
        console.warn('[Email] reset failed:', err.message)
        user.resetPasswordToken = undefined
        user.resetPasswordExpires = undefined
        return user.save({ validateBeforeSave: false })
      })

    res.json({ success: true, message: 'Password reset link sent to your email.' })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

/* ── POST /api/auth/reset-password/:token ── */
export const resetPassword = async (req, res) => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex')
    const user = await User.findOne({
      resetPasswordToken:   hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    })

    if (!user) {
      return res.status(400).json({ success: false, message: 'Reset link is invalid or has expired.' })
    }

    user.password             = req.body.password
    user.resetPasswordToken   = undefined
    user.resetPasswordExpires = undefined
    await user.save()

    respond(res, user)
  } catch (err) {
    res.status(400).json({ success: false, message: err.message })
  }
}
