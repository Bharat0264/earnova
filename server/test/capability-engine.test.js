import test from 'node:test'
import assert from 'node:assert/strict'
import { derive, descendants, evidenceState, executeVerificationPlan, explainFault, isolateFault, recoveryPlan, verificationPlan } from '../src/services/capabilityEngine.js'

test('SELL_ONLINE is verified only when every dependency is verified', () => {
  const states = { PUBLIC_WEB_PRESENCE: 'VERIFIED', PRODUCT_AVAILABILITY: 'VERIFIED', PAYMENT_ACCEPTANCE: 'VERIFIED', ORDER_CAPTURE: 'VERIFIED', FULFILMENT: 'VERIFIED' }
  assert.equal(derive('SELL_ONLINE', states), 'VERIFIED')
  assert.equal(derive('SELL_ONLINE', { ...states, FULFILMENT: 'FAILED' }), 'DEGRADED')
  assert.equal(derive('SELL_ONLINE', { ...states, PAYMENT_ACCEPTANCE: 'STALE' }), 'STALE')
})

test('expired evidence becomes stale without a verification run', () => {
  assert.equal(evidenceState({ normalizedStatus: 'VALID', expiresAt: new Date(Date.now() - 1) }), 'STALE')
  assert.equal(evidenceState({ normalizedStatus: 'VALID', expiresAt: new Date(Date.now() + 60_000) }), 'VERIFIED')
})

test('shipping invalidation affects fulfilment and its parent only', () => {
  assert.deepEqual(descendants(['FULFILMENT']).sort(), ['FULFILMENT', 'SELL_ONLINE'])
})

test('minimum plan skips valid evidence and keeps prerequisite order', () => {
  const states = { PUBLIC_WEB_PRESENCE: 'VERIFIED', PRODUCT_AVAILABILITY: 'VERIFIED', PAYMENT_ACCEPTANCE: 'VERIFIED', ORDER_CAPTURE: 'VERIFIED', FULFILMENT: 'STALE' }
  assert.deepEqual(verificationPlan('SELL_ONLINE', states), ['FULFILMENT', 'SELL_ONLINE'])
})

test('selective reverification executes only the minimum adapter calls', async () => {
  const calls = []
  const states = { PUBLIC_WEB_PRESENCE: 'VERIFIED', PRODUCT_AVAILABILITY: 'VERIFIED', PAYMENT_ACCEPTANCE: 'VERIFIED', ORDER_CAPTURE: 'VERIFIED', FULFILMENT: 'STALE' }
  const adapters = {
    FULFILMENT: { collect: async () => { calls.push('FULFILMENT'); return 'VERIFIED' } },
    SELL_ONLINE: { collect: async () => { calls.push('SELL_ONLINE'); return 'VERIFIED' } },
    PAYMENT_ACCEPTANCE: { collect: async () => { calls.push('PAYMENT_ACCEPTANCE'); return 'VERIFIED' } },
  }
  const result = await executeVerificationPlan('SELL_ONLINE', states, adapters)
  assert.deepEqual(result.executed, ['FULFILMENT', 'SELL_ONLINE'])
  assert.deepEqual(calls, ['FULFILMENT', 'SELL_ONLINE'])
})

test('cycle detection fails safely', () => {
  assert.throws(() => verificationPlan('A', {}, { A: ['B'], B: ['A'] }), /cycle/i)
})

test('fault isolation and recovery remain deterministic and require confirmation', () => {
  const states = { PUBLIC_WEB_PRESENCE: 'VERIFIED', PRODUCT_AVAILABILITY: 'VERIFIED', PAYMENT_ACCEPTANCE: 'FAILED', ORDER_CAPTURE: 'VERIFIED', FULFILMENT: 'VERIFIED' }
  const fault = isolateFault('SELL_ONLINE', states)
  assert.deepEqual(fault.chain, ['SELL_ONLINE', 'PAYMENT_ACCEPTANCE'])
  assert.match(explainFault(fault), /payment acceptance/i)
  assert.equal(recoveryPlan(fault).requiresConfirmation, true)
})
