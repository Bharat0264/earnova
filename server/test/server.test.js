import test, { after, before } from 'node:test'
import assert from 'node:assert/strict'

process.env.NODE_ENV = 'test'
process.env.JWT_SECRET = 'test-only-secret-that-is-long-enough'

const { default: app } = await import('../src/server.js')
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
