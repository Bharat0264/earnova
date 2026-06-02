import jwt   from 'jsonwebtoken'
import User  from '../models/User.js'

/**
 * Protect — verifies JWT and attaches req.user
 */
export const protect = async (req, res, next) => {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'No token provided.' })
  }

  const token = header.split(' ')[1]

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user    = await User.findById(decoded.id).select('-password')

    if (!user) {
      return res.status(401).json({ success: false, message: 'User no longer exists.' })
    }
    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account is suspended.' })
    }

    req.user = user
    next()
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' })
  }
}

/**
 * adminOnly — must be used after protect
 */
export const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access required.' })
  }
  next()
}

/**
 * dealerOrAdmin
 */
export const dealerOrAdmin = (req, res, next) => {
  if (!['admin', 'dealer'].includes(req.user?.role)) {
    return res.status(403).json({ success: false, message: 'Dealer or admin access required.' })
  }
  next()
}

/**
 * optionalAuth — attaches user if token is present, otherwise continues
 */
export const optionalAuth = async (req, res, next) => {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) { return next() }

  try {
    const token   = header.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user      = await User.findById(decoded.id).select('-password')
  } catch { /* ignore invalid token in optional routes */ }

  next()
}

/**
 * Helper to sign a JWT
 */
export const signToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  })
