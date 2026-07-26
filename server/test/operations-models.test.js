import test from 'node:test'
import assert from 'node:assert/strict'
import mongoose from 'mongoose'
import ServiceRequest from '../src/models/ServiceRequest.js'
import EnergyEnquiry from '../src/models/EnergyEnquiry.js'
import ReferralLedger from '../src/models/ReferralLedger.js'

const id = () => new mongoose.Types.ObjectId()

test('service operations enforce documented workflow states', () => {
  const request = new ServiceRequest({
    customer: id(), category: 'freelancing', title: 'Build a landing page',
    requirements: 'Responsive business landing page', budgetPaise: 100000,
    status: 'not-a-real-state',
  })
  assert.match(request.validateSync().errors.status.message, /not a valid enum value/i)
})

test('energy enquiries require explicit estimate acknowledgement', () => {
  const enquiry = new EnergyEnquiry({
    user: id(), useType: 'residential', monthlyBillPaise: 500000,
    propertyType: 'Independent house', roofAvailability: 'owned_clear',
    location: 'Bengaluru', phone: '9876543210',
  })
  assert.ok(enquiry.validateSync().errors.estimateDisclaimerAccepted)
})

test('referral ledger permits only transparent commission states', () => {
  const ledger = new ReferralLedger({
    referrer: id(), order: id(), eligibleAmountPaise: 100000,
    commissionAmountPaise: 5000, ruleKey: 'standard-order', ruleVersion: 1,
    approveAfter: new Date(), status: 'credited-secretly',
  })
  assert.match(ledger.validateSync().errors.status.message, /not a valid enum value/i)
})
