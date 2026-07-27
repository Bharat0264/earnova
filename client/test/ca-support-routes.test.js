import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const appSource = await readFile(new URL('../src/App.jsx', import.meta.url), 'utf8')
const caServicesSource = await readFile(new URL('../src/pages/CAServicesPage.jsx', import.meta.url), 'utf8')
const authSource = await readFile(new URL('../src/pages/AuthPage.jsx', import.meta.url), 'utf8')
const onboardingSource = await readFile(new URL('../src/pages/OnboardingPage.jsx', import.meta.url), 'utf8')

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

test('CA services exposes a Become a CA path that preselects CA registration', () => {
  assert.match(caServicesSource, /Become a CA/)
  assert.match(caServicesSource, /\/register\?accountType=ca_consultant/)
  assert.match(caServicesSource, /\/onboarding\?accountType=ca_consultant/)
  assert.match(caServicesSource, /\/partner\/overview/)
  assert.match(authSource, /searchParams\.get\('accountType'\) === 'ca_consultant'/)
  assert.match(onboardingSource, /requestedAccountType === 'ca_consultant'/)
})

test('login offers PrintBee on the Earnova subdomain', () => {
  assert.match(authSource, /Print documents with PrintBee/)
  assert.match(authSource, /https:\/\/printbee\.earnova\.in/)
  assert.match(authSource, /\/printbee-logo\.png/)
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
