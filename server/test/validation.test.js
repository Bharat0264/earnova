import test from 'node:test'
import assert from 'node:assert/strict'
import {
  isStrongEnoughPassword,
  isValidEmail,
  isValidIndianPhone,
  validateOnboardingPayload,
} from '../src/utils/validation.js'

test('auth input validation accepts valid Indian MVP inputs', () => {
  assert.equal(isValidEmail('owner@example.com'), true)
  assert.equal(isValidIndianPhone('9876543210'), true)
  assert.equal(isStrongEnoughPassword('correct-horse'), true)
})

test('auth input validation rejects weak or malformed inputs', () => {
  assert.equal(isValidEmail('owner-at-example'), false)
  assert.equal(isValidIndianPhone('1234'), false)
  assert.equal(isStrongEnoughPassword('short'), false)
})

test('onboarding validation normalizes progress safely', () => {
  const result = validateOnboardingPayload({
    accountType: 'business_owner',
    status: 'in_progress',
    completedSteps: [0, 0, 2, -1, 99],
    goals: ['Manage my business', '', '  Grow sales  '],
  })
  assert.deepEqual(result.value.completedSteps, [0, 2])
  assert.deepEqual(result.value.goals, ['Manage my business', 'Grow sales'])
})

test('onboarding validation rejects unsupported roles', () => {
  assert.match(validateOnboardingPayload({ accountType: 'administrator', status: 'completed' }).error, /valid account type/i)
})
