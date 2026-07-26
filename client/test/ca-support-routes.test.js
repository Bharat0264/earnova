import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const appSource = await readFile(new URL('../src/App.jsx', import.meta.url), 'utf8')

test('Phase 1 exposes the required CA public and protected route families', () => {
  for (const route of [
    'services/ca/:serviceSlug',
    'services/ca/firm/:firmSlug',
    'services/ca/book-consultation',
    'ca/cases/:caseId',
    'cases/:caseId',
  ]) {
    assert.match(appSource, new RegExp(route.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
  }
})

test('Phase 1 exposes Help Centre, customer support and restricted admin routes', () => {
  for (const route of [
    'help/article/:articleSlug',
    'help/contact',
    'support/new',
    'support/:ticketId',
    'admin/support/tickets/:ticketId',
    'admin/ca/',
  ]) {
    assert.match(appSource, new RegExp(route.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
  }
})
