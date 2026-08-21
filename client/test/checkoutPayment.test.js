import test from 'node:test'
import assert from 'node:assert/strict'
import { checkoutTotal, normalizeRazorpayOrder } from '../src/utils/checkoutPayment.js'

test('normalizes the actual safe Razorpay create-order response', () => {
  assert.deepEqual(normalizeRazorpayOrder({ orderId: 'order_test_123', amount: 32999900, currency: 'INR', keyId: 'rzp_test_key' }), {
    orderId: 'order_test_123', amount: 32999900, currency: 'INR', keyId: 'rzp_test_key',
  })
})

test('rejects incomplete payment initialization without crashing checkout', () => {
  assert.throws(() => normalizeRazorpayOrder({ amount: 100, currency: 'INR', keyId: 'rzp_test_key' }), /Unable to initialize payment/)
})

test('treats free delivery as a valid zero charge', () => {
  assert.equal(checkoutTotal(329999, 0), 329999)
  assert.equal(checkoutTotal(329999, undefined), 329999)
})
