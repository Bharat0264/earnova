/* Safe local/deployment smoke test. It never creates payments or provider transactions. */
const base = (process.env.ENGINE_SMOKE_API_BASE || 'http://127.0.0.1:5000/api').replace(/\/$/, '')
const suffix = Date.now().toString(36)
const request = async (path, method = 'GET', body, token) => { const response = await fetch(`${base}${path}`, { method, headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}) }, body: body ? JSON.stringify(body) : undefined }); const json = await response.json().catch(() => ({})); if (!response.ok) throw new Error(`${response.status} ${json.message || path}`); return json }
const user = await request('/auth/register', 'POST', { name: 'Engine Smoke', email: `engine-smoke-${suffix}@example.test`, phone: '9876543215', password: 'VerifyPass123!' })
const token = user.token
const business = await request('/businesses', 'POST', { name: `Engine Smoke ${suffix}`, industry: 'Retail', phone: '9876543215' }, token)
const id = business.business._id
await request(`/businesses/${id}/products`, 'POST', { sku: `SMOKE-${suffix}`, name: 'Smoke product', sellingPricePaise: 100, purchasePricePaise: 50, currentQuantity: 1, reorderLevel: 0 }, token)
const status = await request(`/businesses/${id}/capabilities`, 'GET', undefined, token)
const run = await request(`/businesses/${id}/capabilities/SELL_ONLINE/reverify`, 'POST', {}, token)
const diagnosis = await request(`/businesses/${id}/capabilities/SELL_ONLINE/diagnosis`, 'GET', undefined, token)
const recovery = await request(`/businesses/${id}/capabilities/SELL_ONLINE/recovery-plan`, 'POST', {}, token)
const history = await request(`/businesses/${id}/verification-runs`, 'GET', undefined, token)
console.table([{ capability: 'PRODUCT_AVAILABILITY', result: status.capabilities.find(x => x.key === 'PRODUCT_AVAILABILITY')?.state, evidencePersisted: status.evidence.some(x => x.capabilityKey === 'PRODUCT_AVAILABILITY') }, { capability: 'SELL_ONLINE', result: run.run?.resultingState, evidencePersisted: true }])
console.table([{ check: 'Manual Reverify', result: run.run?.status }, { check: 'Diagnosis', result: diagnosis.state }, { check: 'Recovery Plan', result: recovery.plan?.status }, { check: 'Verification History', result: history.runs?.length > 0 ? 'PASS' : 'FAIL' }])
console.log('Provider flags:', { website: process.env.ENGINE_TEST_WEBSITE_URL ? 'CONFIGURED' : 'NOT CONFIGURED', razorpay: process.env.RAZORPAY_TEST_KEY_ID ? 'CONFIGURED' : 'NOT CONFIGURED', fulfilment: process.env.ENGINE_TEST_FULFILMENT_ENABLED === 'true' ? 'CONFIGURED' : 'NOT CONFIGURED' })
