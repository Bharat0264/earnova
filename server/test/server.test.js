import test, { after, before } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

process.env.NODE_ENV = 'test'
process.env.JWT_SECRET = 'test-only-secret-that-is-long-enough'

const { default: app } = await import('../src/server.js')
const productControllerSource = await readFile(new URL('../src/controllers/productController.js', import.meta.url), 'utf8')
const paymentControllerSource = await readFile(new URL('../src/controllers/paymentController.js', import.meta.url), 'utf8')
let server
let baseUrl

before(async () => {
  await new Promise(resolve => {
    server = app.listen(0, '127.0.0.1', () => {
      baseUrl = `http://127.0.0.1:${server.address().port}`
      resolve()
    })
  })
})

after(async () => {
  await new Promise(resolve => server.close(resolve))
})

test('public and admin product queries include every product category', () => {
  assert.match(productControllerSource, /Product\.find\(\{ isActive: true \}\)/)
  assert.match(productControllerSource, /Product\.find\(\{\}\)/)
  assert.doesNotMatch(productControllerSource, /isActive: true, category: 'solar-panels'/)
})

test('health endpoint returns safe operational metadata and security headers', async () => {
  const response = await fetch(`${baseUrl}/api/health`)
  const body = await response.json()
  assert.equal(response.status, 200)
  assert.equal(body.status, 'OK')
  assert.equal(response.headers.get('x-content-type-options'), 'nosniff')
  assert.match(response.headers.get('x-request-id'), /^[a-z0-9-]+$/i)
})

test('readiness fails closed without a database connection', async () => {
  const response = await fetch(`${baseUrl}/api/ready`)
  const body = await response.json()
  assert.equal(response.status, 503)
  assert.equal(body.status, 'NOT_READY')
})

test('unknown routes return a safe 404 with a request ID', async () => {
  const response = await fetch(`${baseUrl}/api/does-not-exist`)
  const body = await response.json()
  assert.equal(response.status, 404)
  assert.equal(body.message, 'Route not found')
  assert.ok(body.requestId)
})

test('protected API failures identify actual session expiry', async () => {
  const response = await fetch(`${baseUrl}/api/payment/create-order`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ cartItems: [] }),
  })
  const body = await response.json()
  assert.equal(response.status, 401)
  assert.equal(body.code, 'AUTH_REQUIRED')
})

test('Razorpay credentials tolerate safe env-import quoting without exposing secrets', () => {
  assert.match(paymentControllerSource, /value\.slice\(1, -1\)\.trim\(\)/)
  assert.match(paymentControllerSource, /value\.startsWith\(`\$\{name\}=`\)/)
  assert.match(paymentControllerSource, /secret length \$\{keySecret\.length\}/)
})
