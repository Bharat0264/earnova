import test from 'node:test'
import assert from 'node:assert/strict'
import mongoose from 'mongoose'
import PlatformFeeSetting from '../src/models/PlatformFeeSetting.js'
import { calculateFeeAmount } from '../src/services/platformFees.js'

test('platform fees calculate independent percentage and fixed charges', () => {
  assert.equal(calculateFeeAmount(2500, { type: 'percentage', value: 10 }), 250)
  assert.equal(calculateFeeAmount(2500, { type: 'fixed', value: 149 }), 149)
  assert.equal(calculateFeeAmount(999, { type: 'percentage', value: 1.5 }), 15)
})

test('platform fee settings require valid charge modes on both parties', () => {
  const setting = new PlatformFeeSetting({
    serviceKey: 'ca',
    label: 'CA & tax services',
    customerPartyLabel: 'Customer',
    providerPartyLabel: 'CA firm',
    customerFee: { type: 'sliding', value: 5 },
    providerFee: { type: 'percentage', value: 2 },
    version: 2,
    updatedBy: new mongoose.Types.ObjectId(),
  })
  assert.match(setting.validateSync().errors['customerFee.type'].message, /not a valid enum value/i)
})

test('platform fee history records immutable transaction policy versions', () => {
  const actor = new mongoose.Types.ObjectId()
  const setting = new PlatformFeeSetting({
    serviceKey: 'freelance',
    label: 'Freelance services',
    customerPartyLabel: 'Client',
    providerPartyLabel: 'Freelancer',
    customerFee: { type: 'percentage', value: 8 },
    providerFee: { type: 'fixed', value: 50 },
    version: 3,
    updatedBy: actor,
    history: [{
      version: 3,
      customerFee: { type: 'percentage', value: 8 },
      providerFee: { type: 'fixed', value: 50 },
      changedBy: actor,
      reason: 'Rebalanced marketplace charges',
      effectiveAt: new Date(),
    }],
  })
  assert.equal(setting.validateSync(), undefined)
  assert.equal(setting.history[0].version, 3)
})
