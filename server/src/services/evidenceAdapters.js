import dns from 'node:dns/promises'
import Business from '../models/Business.js'
import FulfilmentConfiguration from '../models/FulfilmentConfiguration.js'

const privateHost = host => host === 'localhost' || host.endsWith('.localhost') || host === 'metadata.google.internal' || /^(127\.|10\.|192\.168\.|169\.254\.|0\.|::1$|fc|fd)/i.test(host)
const publicAddress = address => !/^(127\.|10\.|192\.168\.|169\.254\.|0\.|::1$|fc|fd)/i.test(address)
export const approvedHttpsUrl = value => { try { const url = new URL(value); if (url.protocol !== 'https:' || privateHost(url.hostname) || /^\d+\.\d+\.\d+\.\d+$/.test(url.hostname)) return null; return url } catch { return null } }

export const websiteAdapter = { async collect(businessId) { const business = await Business.findById(businessId).lean(); const url = approvedHttpsUrl(business?.website); if (!url) return { state: 'UNKNOWN', configured: false }; const addresses = await dns.lookup(url.hostname, { all: true }).catch(() => []); if (!addresses.length || addresses.some(item => !publicAddress(item.address))) return { state: 'UNKNOWN', configured: true }; try { const response = await fetch(url, { method: 'HEAD', redirect: 'manual', signal: AbortSignal.timeout(5000) }); return { state: response.status < 500 ? 'VALID' : 'UNKNOWN', configured: true } } catch { return { state: 'UNKNOWN', configured: true } } } }
export const paymentAdapter = { async collect() { return { state: process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET ? 'UNKNOWN' : 'UNCONFIGURED', configured: Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) } } }
export const orderAdapter = { async collect() { return { state: 'VALID', configured: true } } }
export const fulfilmentAdapter = { async collect(businessId) { const config = await FulfilmentConfiguration.findOne({ business: businessId }).lean(); const ready = Boolean(config?.enabled && config?.mode && config?.serviceRegions?.length && Number.isFinite(config?.estimatedMaxDays)); return { state: ready ? 'VALID' : 'UNCONFIGURED', configured: Boolean(config?.enabled) } } }
export const ADAPTERS = { PUBLIC_WEB_PRESENCE: websiteAdapter, PAYMENT_ACCEPTANCE: paymentAdapter, ORDER_CAPTURE: orderAdapter, FULFILMENT: fulfilmentAdapter }
