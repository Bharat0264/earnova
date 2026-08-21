import test from 'node:test'
import assert from 'node:assert/strict'
import { derivePublicPurchaseState } from '../src/services/publicProductState.js'
import { serves } from '../src/services/fulfilmentShipping.js'

const business = { _id: 'business-1', name: 'Earnova Store', slug: 'earnova-store', status: 'active', isPlatformStore: true }
const delivery = { enabled: true, serviceRegions: ['*'] }

test('a published legacy platform product is visible and sellable only with configured fulfilment', () => {
  const product = { _id: 'product-1', isActive: true, published: true, stock: 4 }
  const ready = derivePublicPurchaseState(product, business, delivery)
  assert.equal(ready.isPublished, true)
  assert.equal(ready.inStock, true)
  assert.equal(ready.fulfilmentAvailable, true)
  assert.equal(ready.canPurchase, true)
  assert.equal(ready.business.isPlatformStore, true)

  const unavailable = derivePublicPurchaseState(product, business, null)
  assert.equal(unavailable.isPublished, true)
  assert.equal(unavailable.canPurchase, false)
})

test('stock and publication state independently prevent purchase without hiding fulfilment readiness', () => {
  assert.equal(derivePublicPurchaseState({ isActive: true, published: false, stock: 2 }, business, delivery).canPurchase, false)
  assert.equal(derivePublicPurchaseState({ isActive: true, published: true, stock: 0 }, business, delivery).canPurchase, false)
})

test('shipping serviceability requires enabled fulfilment and a matching configured region', () => {
  assert.equal(serves({ enabled: true, serviceRegions: ['560001'] }, { pincode: '560001' }), true)
  assert.equal(serves({ enabled: true, serviceRegions: ['560001'] }, { pincode: '110001' }), false)
  assert.equal(serves({ enabled: false, serviceRegions: ['*'] }, { pincode: '560001' }), false)
})
