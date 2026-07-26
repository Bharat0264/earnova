import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import Business from '../src/models/Business.js'
import CAFirmMember from '../src/models/CAFirmMember.js'
import CAProfile from '../src/models/CAProfile.js'

const adminRoutes = await readFile(new URL('../src/routes/adminRoutes.js', import.meta.url), 'utf8')
const professionalController = await readFile(new URL('../src/controllers/adminCAAndSupportController.js', import.meta.url), 'utf8')
const businessController = await readFile(new URL('../src/controllers/adminVerificationController.js', import.meta.url), 'utf8')

test('businesses and firm CA workers have a full verification lifecycle', () => {
  const expected = ['pending', 'under_review', 'verified', 'rejected', 'suspended']
  assert.deepEqual(Business.schema.path('verificationStatus').enumValues, expected)
  assert.deepEqual(CAFirmMember.schema.path('verificationStatus').enumValues, expected)
  assert.ok(Business.schema.path('reviewedBy'))
  assert.ok(CAFirmMember.schema.path('verifiedBy'))
})

test('independent CA applicants support an explicit under-review state', () => {
  assert.ok(CAProfile.schema.path('status').enumValues.includes('under-review'))
  assert.ok(CAProfile.schema.path('reviewedAt'))
})

test('admin routes expose protected business and CA worker review actions', () => {
  assert.match(adminRoutes, /business-verifications\/:id/)
  assert.match(adminRoutes, /ca\/professionals\/:id\/verification/)
})

test('high-risk verification decisions require a review note', () => {
  assert.match(businessController, /\['rejected', 'suspended'\]\.includes\(status\) && !note/)
  assert.match(professionalController, /\['rejected', 'suspended'\]\.includes\(status\) && !note/)
  assert.match(professionalController, /Verify the CA firm before verifying this professional/)
})
