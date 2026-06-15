import express     from 'express'
import cors        from 'cors'
import morgan      from 'morgan'
import dotenv      from 'dotenv'
import { connectDB } from './config/db.js'
import router      from './routes/index.js'

dotenv.config()

const app  = express()
const PORT = process.env.PORT || 5000

const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:4173',
  'http://127.0.0.1:4173',
  'https://earnova.in',
  'https://www.earnova.in',
  ...(process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',').map((value) => value.trim()).filter(Boolean) : []),
]

const isDevLocalOrigin = (origin) => {
  if (process.env.NODE_ENV === 'production') return false

  try {
    const url = new URL(origin)
    return ['localhost', '127.0.0.1', '::1'].includes(url.hostname)
  } catch {
    return false
  }
}

/* ── Middleware ── */
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
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'))

/* ── DB ── */
connectDB()

/* ── API routes ── */
app.use('/api', router)

/* ── Health check ── */
app.get('/api/health', (_req, res) => {
  res.json({
    status:    'OK',
    service:   'Earnova API',
    version:   '1.0.0',
    timestamp: new Date().toISOString(),
    env:       process.env.NODE_ENV || 'development',
  })
})

app.get('/api/env-check', (_req, res) => {
  res.json({
    keyIdExists: !!process.env.RAZORPAY_KEY_ID,
    keySecretExists: !!process.env.RAZORPAY_KEY_SECRET,
    webhookExists: !!process.env.RAZORPAY_WEBHOOK_SECRET,
    nodeEnv: process.env.NODE_ENV,
  })
})

/* ── 404 ── */
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' })
})

/* ── Global error handler ── */
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error('[ERROR]', err.message)
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  })
})

app.listen(PORT, () => {
  console.log(`\n🚀  Earnova API  →  http://localhost:${PORT}`)
  console.log(`📦  Env         →  ${process.env.NODE_ENV || 'development'}\n`)
})

export default app
