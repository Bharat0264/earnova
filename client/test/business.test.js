import test from 'node:test'
import assert from 'node:assert/strict'
import { formatMoney, futureDateInput, rupeesToPaise } from '../src/utils/business.js'

test('business workspace converts rupees to integer paise', () => {
  assert.equal(rupeesToPaise('199.99'), 19999)
  assert.equal(rupeesToPaise('-1'), null)
  assert.match(formatMoney(125050), /1,251/)
})

test('invoice due-date helper produces a valid future date', () => {
  const dueDate = new Date(futureDateInput(14))
  assert.equal(Number.isNaN(dueDate.getTime()), false)
  assert.ok(dueDate.getTime() > Date.now())
})
