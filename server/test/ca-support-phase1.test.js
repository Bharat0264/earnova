import test from 'node:test'
import assert from 'node:assert/strict'
import mongoose from 'mongoose'
import { SUPPORT_ISSUES } from '../src/config/caSupport.js'
import { PRIVATE_DOCUMENT_MAX_BYTES } from '../src/config/uploads.js'
import SupportTicket from '../src/models/SupportTicket.js'
import SupportInternalNote from '../src/models/SupportInternalNote.js'
import CACase from '../src/models/CACase.js'
import { buildCustomerCaseScope, canFirmMemberAccessCase } from '../src/services/caPermissions.js'
import { validatePrivateFile } from '../src/services/privateStorage.js'
import { calculateSupportRouting } from '../src/controllers/supportController.js'
import { maskGovernmentId, maskPan, sanitizeFilename } from '../src/utils/masking.js'
import { createPublicReference } from '../src/utils/references.js'

test('CA and support references are human readable but not authorization tokens', () => {
  assert.match(createPublicReference('CA', new Date('2026-07-26')), /^EN-CA-2026-\d{5}$/)
  assert.match(createPublicReference('SUP', new Date('2026-07-26')), /^EN-SUP-2026-\d{5}$/)
})

test('sensitive identifiers and filenames are masked or sanitized', () => {
  assert.equal(maskPan('ABCDE1234F'), 'AB******4F')
  assert.equal(maskGovernmentId('1234 5678 9012'), '********9012')
  assert.equal(sanitizeFilename('../../pan<script>.pdf'), 'pan-script-.pdf')
})

test('customer case scope cannot escape the customer or authorized businesses', () => {
  const userId = new mongoose.Types.ObjectId()
  const businessId = new mongoose.Types.ObjectId()
  assert.deepEqual(buildCustomerCaseScope(userId, [String(businessId)]), {
    $or: [{ customer: userId }, { business: { $in: [String(businessId)] } }],
  })
})

test('firm isolation allows administrators or assigned active members only', () => {
  const firmId = new mongoose.Types.ObjectId()
  const memberId = new mongoose.Types.ObjectId()
  const otherMemberId = new mongoose.Types.ObjectId()
  assert.equal(canFirmMemberAccessCase({
    member: { _id: memberId, firm: firmId, status: 'active', platformRole: 'firm_administrator' },
    firm: { _id: firmId, caseAccessPolicy: 'assigned_only' },
  }), true)
  assert.equal(canFirmMemberAccessCase({
    member: { _id: memberId, firm: firmId, status: 'active', platformRole: 'accountant' },
    firm: { _id: firmId },
    assignedMemberIds: [otherMemberId],
  }), false)
  assert.equal(canFirmMemberAccessCase({
    member: { _id: memberId, firm: firmId, status: 'active', platformRole: 'reviewer' },
    firm: { _id: firmId },
    assignedMemberIds: [memberId],
  }), true)
})

test('support routing is service-specific and security issues override customer priority', () => {
  assert.notDeepEqual(SUPPORT_ISSUES.ca, SUPPORT_ISSUES.commerce)
  assert.deepEqual(calculateSupportRouting({
    serviceCategory: 'payments',
    issueCategory: 'Amount deducted but payment failed',
    customerImpact: 'normal',
  }), { priority: 'high', supportQueue: 'payment_review' })
  assert.deepEqual(calculateSupportRouting({
    serviceCategory: 'account',
    issueCategory: 'Security concern',
    customerImpact: 'low',
  }), { priority: 'security_critical', supportQueue: 'security_incident_review' })
})

test('support internal notes are held in a separate model from customer tickets', () => {
  assert.equal(SupportTicket.schema.path('internalNotes'), undefined)
  assert.equal(SupportTicket.schema.path('replies'), undefined)
  assert.ok(SupportInternalNote.schema.path('note'))
})

test('CA case intake keeps WhatsApp private and supports quote-first payment states', () => {
  assert.equal(CACase.schema.path('contactWhatsapp').options.select, false)
  assert.ok(CACase.schema.path('quote.professionalFeePaise'))
  assert.ok(CACase.schema.path('quote.totalPaise'))
  assert.deepEqual(CACase.schema.path('paymentStatus').enumValues, ['not_quoted', 'pending', 'paid', 'failed', 'refunded'])
  assert.ok(CACase.schema.path('status').enumValues.includes('awaiting_payment'))
  assert.ok(CACase.schema.path('status').enumValues.includes('payment_received'))
  assert.ok(CACase.schema.path('taxIntake.assessmentYear'))
  assert.ok(CACase.schema.path('taxIntake.incomeSources'))
  assert.ok(CACase.schema.path('taxIntake.declarationAccepted'))
})

test('private file validation accepts matching safe types and rejects spoofed files', () => {
  const pdf = {
    originalname: 'return.pdf',
    mimetype: 'application/pdf',
    size: 12,
    buffer: Buffer.from('%PDF-1.7 safe'),
  }
  assert.equal(validatePrivateFile(pdf).extension, '.pdf')
  assert.equal(PRIVATE_DOCUMENT_MAX_BYTES, 50 * 1024 * 1024)
  assert.doesNotThrow(() => validatePrivateFile({ ...pdf, size: PRIVATE_DOCUMENT_MAX_BYTES }))
  assert.throws(
    () => validatePrivateFile({ ...pdf, size: PRIVATE_DOCUMENT_MAX_BYTES + 1 }),
    /50 MB or smaller/
  )
  assert.throws(() => validatePrivateFile({
    originalname: 'malware.exe',
    mimetype: 'application/pdf',
    size: 10,
    buffer: Buffer.from('MZ executable'),
  }), /Only PDF/)
  assert.throws(() => validatePrivateFile({
    originalname: 'fake.pdf',
    mimetype: 'application/pdf',
    size: 10,
    buffer: Buffer.from('not a pdf'),
  }), /does not match/)
})
