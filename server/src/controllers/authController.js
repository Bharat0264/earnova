import crypto  from 'crypto'
import { OAuth2Client } from 'google-auth-library'
import User    from '../models/User.js'
import { signToken } from '../middleware/auth.js'
import { sendWelcomeEmail, sendPasswordResetEmail } from '../utils/email.js'
import { DEFAULT_PUBLIC_ACCESS } from '../config/features.js'
import {
  isStrongEnoughPassword,
  isValidEmail,
  isValidIndianPhone,
  normalizeEmail,
  validateOnboardingPayload,
} from '../utils/validation.js'

const respond = (res, user, statusCode = 200) => {
  const token = signToken(user._id)
  res.status(statusCode).json({ success: true, token, user: user.toPublicJSON() })
}

/* ── POST /api/auth/register ── */
export const register = async (req, res) => {
  try {
    const name = req.body.name?.trim()
    const email = normalizeEmail(req.body.email)
    const phone = req.body.phone?.trim()
    const { password, referralCode } = req.body
    const accountType = req.body.accountType === 'ca_consultant' ? 'ca_consultant' : 'individual'

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password are required.' })
    }
    if (name.length < 2 || name.length > 100 || !isValidEmail(email) || !isValidIndianPhone(phone)) {
      return res.status(400).json({ success: false, message: 'Enter a valid name, email address and Indian mobile number.' })
    }
    if (!isStrongEnoughPassword(password)) {
      return res.status(400).json({ success: false, message: 'Password must be 8 to 128 characters.' })
    }
    if (await User.exists({ email })) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists.' })
    }

    let referredBy
    if (referralCode) {
      const referrer = await User.findOne({ referralCode: referralCode.trim().toUpperCase() })
      referredBy = referrer?._id
    }
    const user = await User.create({
      name,
      email,
      phone,
      password,
      referredBy,
      role: 'customer',
      accountType,
      featureAccess: DEFAULT_PUBLIC_ACCESS,
    })
    sendWelcomeEmail(user).catch(err => console.warn('[Email] welcome failed:', err.message))
    respond(res, user, 201)
  } catch (err) {
    console.error('[Auth register]', err.message)
    res.status(500).json({ success: false, message: 'Could not create the account.' })
  }
}

/* POST /api/auth/google */
export const googleLogin = async (req, res) => {
  try {
    const { credential, referralCode } = req.body
    const clientId = process.env.GOOGLE_CLIENT_ID?.trim()
    if (!clientId) {
      return res.status(503).json({ success: false, message: 'Google sign-in is not configured on the server.' })
    }
    if (!credential) {
      return res.status(400).json({ success: false, message: 'Google credential is required.' })
    }

    const ticket = await new OAuth2Client(clientId).verifyIdToken({
      idToken: credential,
      audience: clientId,
    })
    const profile = ticket.getPayload()
    if (!profile?.sub || !profile.email || !profile.email_verified) {
      return res.status(401).json({ success: false, message: 'Google could not verify this email address.' })
    }

    const email = normalizeEmail(profile.email)
    let user = await User.findOne({ $or: [{ googleSub: profile.sub }, { email }] }).select('+googleSub')
    let isNew = false

    if (user) {
      if (!user.googleSub) user.googleSub = profile.sub
      if (!user.avatar && profile.picture) user.avatar = profile.picture
      user.isVerified = true
      await user.save()
    } else {
      let referredBy
      if (referralCode) {
        const referrer = await User.findOne({ referralCode: referralCode.trim().toUpperCase() })
        referredBy = referrer?._id
      }
      user = await User.create({
        name: profile.name?.trim() || email.split('@')[0],
        email,
        avatar: profile.picture,
        googleSub: profile.sub,
        authProvider: 'google',
        isVerified: true,
        referredBy,
        role: 'customer',
        accountType: req.body.accountType === 'ca_consultant' ? 'ca_consultant' : 'individual',
        featureAccess: DEFAULT_PUBLIC_ACCESS,
      })
      isNew = true
      sendWelcomeEmail(user).catch(err => console.warn('[Email] welcome failed:', err.message))
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Your account has been suspended. Contact support.' })
    }
    respond(res, user, isNew ? 201 : 200)
  } catch (err) {
    console.error('[Auth Google]', err.message)
    res.status(401).json({ success: false, message: 'Google sign-in failed. Please try again.' })
  }
}

/* ── POST /api/auth/login ── */
export const login = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email)
    const { password } = req.body
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
    console.error('[Auth login]', err.message)
    res.status(500).json({ success: false, message: 'Could not sign in.' })
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
    if (!isStrongEnoughPassword(newPassword)) {
      return res.status(400).json({ success: false, message: 'New password must be 8 to 128 characters.' })
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

/* PUT /api/auth/onboarding */
export const updateOnboarding = async (req, res) => {
  try {
    const result = validateOnboardingPayload(req.body)
    if (result.error) return res.status(400).json({ success: false, message: result.error })

    const { accountType, goals, status, completedSteps, skippedSteps } = result.value
    const onboarding = {
      status,
      currentStep: Math.min(completedSteps.length, 20),
      completedSteps,
      skippedSteps,
      completedAt: status === 'completed' ? new Date() : undefined,
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { accountType, goals, onboarding },
      { new: true, runValidators: true }
    )
    res.json({ success: true, user: user.toPublicJSON(), message: 'Onboarding progress saved.' })
  } catch (err) {
    console.error('[Auth onboarding]', err.message)
    res.status(500).json({ success: false, message: 'Could not save onboarding progress.' })
  }
}

/* ── POST /api/auth/forgot-password ── */
export const forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: normalizeEmail(req.body.email) })
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

    if (!isStrongEnoughPassword(req.body.password)) {
      return res.status(400).json({ success: false, message: 'Password must be 8 to 128 characters.' })
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
