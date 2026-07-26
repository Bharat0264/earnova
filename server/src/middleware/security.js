import crypto from 'crypto'

export const requestContext = (req, res, next) => {
  const incoming = req.get('x-request-id')
  req.id = typeof incoming === 'string' && /^[a-zA-Z0-9._-]{8,100}$/.test(incoming)
    ? incoming
    : crypto.randomUUID()
  res.setHeader('X-Request-Id', req.id)
  next()
}

export const securityHeaders = (_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  res.setHeader('Cross-Origin-Resource-Policy', 'same-site')
  res.setHeader('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'")
  next()
}

export const createRateLimit = ({
  windowMs = 15 * 60 * 1000,
  max = 20,
  message = 'Too many requests. Please try again later.',
} = {}) => {
  const buckets = new Map()

  return (req, res, next) => {
    const now = Date.now()
    const key = `${req.ip}:${req.baseUrl}${req.path}`
    const current = buckets.get(key)
    const entry = !current || current.resetAt <= now
      ? { count: 0, resetAt: now + windowMs }
      : current

    entry.count += 1
    buckets.set(key, entry)
    res.setHeader('RateLimit-Limit', String(max))
    res.setHeader('RateLimit-Remaining', String(Math.max(0, max - entry.count)))
    res.setHeader('RateLimit-Reset', String(Math.ceil(entry.resetAt / 1000)))

    if (buckets.size > 5000) {
      for (const [bucketKey, bucket] of buckets) {
        if (bucket.resetAt <= now) buckets.delete(bucketKey)
      }
    }

    if (entry.count > max) {
      res.setHeader('Retry-After', String(Math.max(1, Math.ceil((entry.resetAt - now) / 1000))))
      return res.status(429).json({ success: false, code: 'RATE_LIMITED', message, requestId: req.id })
    }

    next()
  }
}

