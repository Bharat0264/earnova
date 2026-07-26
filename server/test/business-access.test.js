import test from 'node:test'
import assert from 'node:assert/strict'
import Business from '../src/models/Business.js'
import BusinessMember from '../src/models/BusinessMember.js'
import { loadBusinessAccess, requireBusinessRole } from '../src/middleware/businessAccess.js'

const BUSINESS_ID = '507f1f77bcf86cd799439011'
const USER_ID = '507f191e810c19729de860ea'

const responseRecorder = () => {
  const result = { statusCode: 200, body: null }
  return {
    result,
    status(code) {
      result.statusCode = code
      return this
    },
    json(body) {
      result.body = body
      return this
    },
  }
}

test('business access rejects a user without tenant membership', async () => {
  const originalBusinessFind = Business.findOne
  const originalMemberFind = BusinessMember.findOne
  try {
    Business.findOne = async () => ({ _id: BUSINESS_ID, status: 'active' })
    BusinessMember.findOne = async () => null
    const req = { params: { businessId: BUSINESS_ID }, user: { _id: USER_ID, role: 'user' } }
    const res = responseRecorder()
    let continued = false
    await loadBusinessAccess(req, res, () => { continued = true })
    assert.equal(continued, false)
    assert.equal(res.result.statusCode, 403)
    assert.match(res.result.body.message, /do not have access/i)
  } finally {
    Business.findOne = originalBusinessFind
    BusinessMember.findOne = originalMemberFind
  }
})

test('business access attaches an active tenant membership', async () => {
  const originalBusinessFind = Business.findOne
  const originalMemberFind = BusinessMember.findOne
  try {
    const business = { _id: BUSINESS_ID, status: 'active' }
    const membership = { business: BUSINESS_ID, user: USER_ID, role: 'editor', status: 'active' }
    Business.findOne = async () => business
    BusinessMember.findOne = async () => membership
    const req = { params: { businessId: BUSINESS_ID }, user: { _id: USER_ID, role: 'user' } }
    const res = responseRecorder()
    let continued = false
    await loadBusinessAccess(req, res, () => { continued = true })
    assert.equal(continued, true)
    assert.equal(req.business, business)
    assert.equal(req.businessMembership, membership)
  } finally {
    Business.findOne = originalBusinessFind
    BusinessMember.findOne = originalMemberFind
  }
})

test('viewer memberships cannot mutate business records', () => {
  const req = { user: { role: 'user' }, businessMembership: { role: 'viewer' } }
  const res = responseRecorder()
  let continued = false
  requireBusinessRole('owner', 'admin', 'editor')(req, res, () => { continued = true })
  assert.equal(continued, false)
  assert.equal(res.result.statusCode, 403)
})
