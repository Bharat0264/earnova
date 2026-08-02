import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import { connectDB } from './config/db.js'
import router from './routes/index.js'
import { handleWebhook } from './controllers/paymentController.js'
import { requestContext, securityHeaders } from './middleware/security.js'

dotenv.config()

const requiredProductionEnv = ['MONGO_URI', 'JWT_SECRET', 'CLIENT_URL']
if (process.env.NODE_ENV === 'production') {
  const missing = requiredProductionEnv.filter(name => !process.env[name]?.trim())
  if (missing.length) throw new Error(`Missing required production configuration: ${missing.join(', ')}`)
  if ((process.env.JWT_SECRET || '').length < 32) throw new Error('JWT_SECRET must contain at least 32 characters in production.')
}

const app = express()
const PORT = process.env.PORT || 5000
app.set('trust proxy', 1)

const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:4173',
  'http://127.0.0.1:4173',
  'https://earnova.in',
  'https://www.earnova.in',
  ...(process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',').map(value => value.trim()).filter(Boolean) : []),
]

const isDevLocalOrigin = origin => {
  if (process.env.NODE_ENV === 'production') return false
  try {
    const url = new URL(origin)
    return ['localhost', '127.0.0.1', '::1'].includes(url.hostname)
  } catch {
    return false
  }
}

app.use(requestContext)
app.use(securityHeaders)
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || isDevLocalOrigin(origin)) {
      callback(null, true)
      return
    }
    callback(new Error('Not allowed by CORS'))
  },
  credentials: true,
}))

app.post('/api/payment/webhook', express.raw({ type: 'application/json' }), handleWebhook)
app.use(express.json({ limit: '2mb' }))
app.use(express.urlencoded({ extended: true }))
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'))

if (process.env.NODE_ENV !== 'test') connectDB()

app.use('/api', router)

app.get('/', (_req, res) => {
  res.json({
    success: true,
    service: 'Earnova Backend API',
    status: 'running',
    frontend: process.env.CLIENT_URL || 'http://127.0.0.1:5173',
    health: '/api/health',
    readiness: '/api/ready',
  })
})

app.get('/api', (_req, res) => {
  res.json({
    success: true,
    service: 'Earnova API',
    status: 'running',
    health: '/api/health',
    readiness: '/api/ready',
  })
})

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'OK',
    service: 'Earnova API',
    version: '1.1.0',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development',
  })
})

app.get('/api/ready', (_req, res) => {
  const ready = mongoose.connection.readyState === 1
  res.status(ready ? 200 : 503).json({
    status: ready ? 'READY' : 'NOT_READY',
    service: 'Earnova API',
    database: ready ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  })
})

app.get('/api/env-check', (_req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ success: false, message: 'Route not found' })
  }
  res.json({
    keyIdExists: !!process.env.RAZORPAY_KEY_ID,
    keySecretExists: !!process.env.RAZORPAY_KEY_SECRET,
    webhookExists: !!process.env.RAZORPAY_WEBHOOK_SECRET,
    nodeEnv: process.env.NODE_ENV,
  })
})

app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found', requestId: _req.id })
})

app.use((err, req, res, _next) => {
  const status = err.status || (err.message === 'Not allowed by CORS' ? 403 : 500)
  console.error(`[ERROR] requestId=${req.id}`, err.message)
  res.status(status).json({
    success: false,
    message: status >= 500 && process.env.NODE_ENV === 'production'
      ? 'Internal Server Error'
      : err.message || 'Internal Server Error',
    requestId: req.id,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  })
})

let server
if (process.env.NODE_ENV !== 'test') {
  server = app.listen(PORT, () => {
    console.log(`Earnova API listening on port ${PORT}`)
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`)
  })

  const shutdown = signal => {
    console.log(`${signal} received; shutting down gracefully.`)
    server.close(async () => {
      await mongoose.connection.close().catch(() => {})
      process.exit(0)
    })
    setTimeout(() => process.exit(1), 10000).unref()
  }
  process.on('SIGTERM', () => shutdown('SIGTERM'))
  process.on('SIGINT', () => shutdown('SIGINT'))
}

export default app
