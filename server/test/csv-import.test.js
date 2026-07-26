import test from 'node:test'
import assert from 'node:assert/strict'
import { csvTemplate, parseCsv, validateCsvShape } from '../src/services/csvImport.js'

test('CSV parser preserves quoted commas and maps headers', () => {
  const parsed = parseCsv('name,email,company\n"Priya Rao",priya@example.com,"Rao, Sons"\n')
  assert.deepEqual(parsed.headers, ['name', 'email', 'company'])
  assert.equal(parsed.records[0].rowNumber, 2)
  assert.equal(parsed.records[0].values.company, 'Rao, Sons')
})

test('CSV import validation rejects missing required fields', () => {
  const parsed = parseCsv('email,company\nowner@example.com,Earnova\n')
  assert.throws(() => validateCsvShape('customers', parsed), /missing required column.*name/i)
})

test('CSV templates expose the documented columns', () => {
  assert.match(csvTemplate('sales'), /^productSku,quantity,customerEmail/)
  assert.match(csvTemplate('products'), /currentQuantity,reorderLevel/)
})
