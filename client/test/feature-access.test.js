import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { DEFAULT_PUBLIC_ACCESS } from '../src/config/features.js'

const appSource = await readFile(new URL('../src/App.jsx', import.meta.url), 'utf8')

test('new client sessions expose standard services and keep three programs restricted', () => {
  assert.deepEqual(DEFAULT_PUBLIC_ACCESS, {
    freelancing: true,
    ecommerce: true,
    businessSolutions: true,
    energySolutions: true,
    caServices: true,
    b2bPrograms: false,
    subsidies: false,
    referrals: false,
  })
})

test('all three restricted service pages use feature gates', () => {
  assert.match(appSource, /FeatureGate feature="b2bPrograms"/)
  assert.match(appSource, /FeatureGate feature="subsidies"/)
  assert.match(appSource, /FeatureGate feature="referrals"/)
})
