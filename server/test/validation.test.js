import test from 'node:test'
import assert from 'node:assert/strict'
import {
  isStrongEnoughPassword,
  isValidEmail,
  isValidIndianPhone,
  validateOnboardingPayload,
} from '../src/utils/validation.js'
import {
  buildBusinessRecommendations,
  calculateDocumentTotals,
  calculateLine,
  getDateRange,
  moneyPaise,
} from '../src/services/businessAnalytics.js'

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

test('business finance totals are calculated in integer paise', () => {
  const line = calculateLine({
    quantity: 2,
    unitPricePaise: 10000,
    discountPaise: 1000,
    taxRateBps: 1800,
    integerQuantity: true,
  })
  assert.deepEqual(line, {
    quantity: 2,
    unitPricePaise: 10000,
    discountPaise: 1000,
    taxRateBps: 1800,
    taxPaise: 3420,
    lineTotalPaise: 22420,
    grossPaise: 20000,
  })
  assert.deepEqual(calculateDocumentTotals([line]), {
    subtotalPaise: 20000,
    discountPaise: 1000,
    taxPaise: 3420,
    totalPaise: 22420,
  })
  assert.equal(moneyPaise('199.6'), 200)
})

test('business finance rejects invalid quantities and excessive discounts', () => {
  assert.throws(() => calculateLine({ quantity: 0, unitPricePaise: 100 }), /positive number/i)
  assert.throws(() => calculateLine({ quantity: 1, unitPricePaise: 100, discountPaise: 101 }), /cannot exceed/i)
  assert.throws(() => calculateLine({ quantity: 1.5, unitPricePaise: 100, integerQuantity: true }), /positive number/i)
})

test('analytics date presets and recommendations are deterministic', () => {
  const range = getDateRange({ preset: 'current_year' })
  assert.equal(range.startDate.getMonth(), 0)
  assert.equal(range.startDate.getDate(), 1)
  const recommendations = buildBusinessRecommendations({
    revenuePaise: 10000,
    expensePaise: 9000,
    lowStockCount: 2,
    overdueInvoicePaise: 5000,
    followUpsDue: 1,
  })
  assert.deepEqual(recommendations.map(item => item.category), ['inventory', 'cash_flow', 'expenses', 'crm'])
})
