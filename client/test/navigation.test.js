import test from 'node:test'
import assert from 'node:assert/strict'
import {
  ACCOUNT_TYPES,
  APP_NAV_LINKS,
  ONBOARDING_CHECKLISTS,
  PRODUCT_PILLARS,
  PUBLIC_NAV_LINKS,
} from '../src/config/navigation.js'

test('public navigation exposes the five required destinations', () => {
  assert.deepEqual(PUBLIC_NAV_LINKS.map(link => link.label), ['Business', 'Services', 'Energy', 'Marketplace', 'Pricing'])
})

test('homepage has exactly three primary product pillars', () => {
  assert.deepEqual(PRODUCT_PILLARS.map(pillar => pillar.key), ['business', 'services', 'energy'])
})

test('every selectable account type has an onboarding checklist', () => {
  for (const accountType of ACCOUNT_TYPES) {
    assert.ok(ONBOARDING_CHECKLISTS[accountType.value]?.length > 0)
  }
})

test('protected workspace route names are unique', () => {
  const paths = APP_NAV_LINKS.map(link => link.to)
  assert.equal(new Set(paths).size, paths.length)
})
