import test from 'node:test'
import assert from 'node:assert/strict'
import { DEFAULT_PUBLIC_ACCESS, normalizeFeatureAccess } from '../src/config/features.js'
import { requireFeature } from '../src/middleware/auth.js'

test('new registrations receive every standard service except restricted programs', () => {
  assert.deepEqual(DEFAULT_PUBLIC_ACCESS, {
    freelancing: true,
    ecommerce: true,
    businessSolutions: false,
    energySolutions: true,
    caServices: true,
    b2bPrograms: false,
    subsidies: false,
    referrals: false,
  })
})

test('normalization preserves explicit admin overrides while using new registration defaults', () => {
  const access = normalizeFeatureAccess({ caServices: false, referrals: true })
  assert.equal(access.ecommerce, true)
  assert.equal(access.caServices, false)
  assert.equal(access.referrals, true)
  assert.equal(access.subsidies, false)
})

test('restricted programs remain blocked until an administrator enables them', () => {
  for (const feature of ['b2bPrograms', 'subsidies', 'referrals']) {
    let nextCalled = false
    let responseStatus
    const req = { user: { role: 'customer', featureAccess: new Map(Object.entries(DEFAULT_PUBLIC_ACCESS)) } }
    const res = {
      status(value) { responseStatus = value; return this },
      json() { return this },
    }
    requireFeature(feature)(req, res, () => { nextCalled = true })
    assert.equal(responseStatus, 403)
    assert.equal(nextCalled, false)
  }
})

test('standard free services pass backend feature authorization for a new account', () => {
  for (const feature of ['freelancing', 'ecommerce', 'energySolutions', 'caServices']) {
    let nextCalled = false
    const req = { user: { role: 'customer', featureAccess: new Map(Object.entries(DEFAULT_PUBLIC_ACCESS)) } }
    requireFeature(feature)(req, {}, () => { nextCalled = true })
    assert.equal(nextCalled, true)
  }
})

test('business intelligence requires a paid subscription for a new account', () => {
  let responseStatus
  const req = { user: { role: 'customer', featureAccess: new Map(Object.entries(DEFAULT_PUBLIC_ACCESS)) } }
  const res = {
    status(value) { responseStatus = value; return this },
    json() { return this },
  }
  requireFeature('businessSolutions')(req, res, () => {})
  assert.equal(responseStatus, 403)
})
