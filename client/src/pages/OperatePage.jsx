import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useBusiness } from '../context/BusinessContext'
import { api } from '../utils/api'
import { formatMoney } from '../utils/business'
import PageMeta from '../components/common/PageMeta'

const healthLabel = state => ({ VERIFIED: 'Working', CONFIGURED: 'Configured', IN_PROGRESS: 'In progress', BLOCKED: 'Needs attention', DEGRADED: 'Needs attention', FAILED: 'Unavailable', STALE: 'Needs attention', UNCONFIGURED: 'Not connected', UNKNOWN: 'Not connected' }[state] || 'Not connected')
const capabilityName = { PUBLIC_WEB_PRESENCE: 'Website', PRODUCT_AVAILABILITY: 'Products', PAYMENT_ACCEPTANCE: 'Payments', ORDER_CAPTURE: 'Orders', FULFILMENT: 'Delivery', SELL_ONLINE: 'Online selling' }

export default function OperatePage() {
  const { businesses, selectedBusiness, selectBusiness, loading } = useBusiness()
  const [data, setData] = useState({})
  const [error, setError] = useState('')
  useEffect(() => {
    if (!selectedBusiness) return
    setError('')
    Promise.all([
      api.get(`/businesses/${selectedBusiness._id}/overview`), api.get(`/businesses/${selectedBusiness._id}/lifecycle`), api.get(`/businesses/${selectedBusiness._id}/events`), api.get(`/businesses/${selectedBusiness._id}/capabilities`), api.get(`/businesses/${selectedBusiness._id}/commerce-analytics`),
    ]).then(([overview, lifecycle, events, capabilities, commerce]) => setData({ overview, lifecycle, events: events.events || [], capabilities: capabilities.capabilities || [], commerce })).catch(requestError => setError(requestError.message))
  }, [selectedBusiness])
  if (loading) return <main className="section-wrapper py-16">Loading workspace…</main>
  if (!selectedBusiness) return <main className="section-wrapper py-16"><h1 className="page-title">Start your first business.</h1><Link className="btn-primary mt-6" to="/start">Start</Link></main>

  const metrics = data.overview?.metrics || {}
  const commerce = data.commerce?.metrics || {}
  const caps = Object.fromEntries((data.capabilities || []).map(item => [item.key, item.state]))
  const attention = data.overview?.recommendations?.[0]
  return <main className="section-wrapper py-8"><PageMeta title="Operate" noIndex />
    <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="eyebrow">Operate</p><h1 className="text-3xl font-bold text-slate-950">{selectedBusiness.name}</h1><p className="text-sm text-slate-500">{selectedBusiness.stage} · {data.lifecycle?.progress || 0}% roadmap complete</p></div>{businesses.length > 1 && <select className="input-base w-auto" value={selectedBusiness._id} onChange={event => selectBusiness(event.target.value)}>{businesses.map(business => <option key={business._id} value={business._id}>{business.name}</option>)}</select>}</div>
    {error && <p className="mt-4 text-sm text-red-700">{error}</p>}
    <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{[
      ['Revenue', commerce.revenue ? `₹${commerce.revenue}` : '₹0'], ['Orders', commerce.orders || 0], ['Visitors', commerce.visitors || 0], ['Conversion', `${Math.round((commerce.conversionRate || 0) * 100)}%`],
    ].map(([label, value]) => <section className="surface-card p-4" key={label}><p className="text-xs text-slate-500">{label}</p><p className="mt-2 text-xl font-bold text-slate-950">{value}</p></section>)}</div>
    <div className="mt-5 grid gap-5 xl:grid-cols-[1.2fr_.8fr]"><section className="surface-card p-5"><div className="flex items-center justify-between"><h2 className="font-bold">Revenue overview</h2><span className="text-xs text-slate-500">Last 30 days</span></div><p className="mt-6 text-2xl font-bold">{metrics.revenuePaise === undefined ? 'Not connected yet' : formatMoney(metrics.revenuePaise)}</p><p className="mt-2 text-sm text-slate-500">Revenue trend charts appear when period history is connected. Earnova does not estimate a trend.</p><div className="mt-5 h-20 rounded-xl border border-dashed border-slate-200 bg-slate-50" /></section><section className="surface-card p-5"><h2 className="font-bold">Business health</h2><p className="mt-1 text-sm text-slate-500">Online selling: <b className="text-slate-800">{healthLabel(caps.SELL_ONLINE)}</b></p><div className="mt-4 space-y-3">{['PUBLIC_WEB_PRESENCE', 'PRODUCT_AVAILABILITY', 'PAYMENT_ACCEPTANCE', 'ORDER_CAPTURE', 'FULFILMENT'].map(key => <div key={key} className="flex items-center justify-between border-b border-slate-100 pb-2 text-sm"><span>{capabilityName[key]}</span><span className="font-semibold text-slate-600">{healthLabel(caps[key])}</span></div>)}</div><Link to="/operate/status" className="btn-secondary mt-5">Open business status</Link></section></div>
    <div className="mt-5 grid gap-5 lg:grid-cols-2"><section className="surface-card p-5"><h2 className="font-bold">Top selling products</h2>{data.overview?.topProducts?.length ? <div className="mt-3 space-y-3">{data.overview.topProducts.map(product => <div className="flex justify-between text-sm" key={product._id}><span>{product._id}</span><span className="font-semibold">{product.quantity} sold · {formatMoney(product.revenuePaise)}</span></div>)}</div> : <p className="mt-3 text-sm text-slate-500">No recorded sales yet.</p>}</section><section className="surface-card p-5"><h2 className="font-bold">Needs attention</h2>{attention ? <><p className="mt-3 text-sm font-semibold text-slate-800">{attention.summary}</p><p className="mt-2 text-sm text-slate-600">{attention.action}</p></> : <p className="mt-3 text-sm text-slate-500">No current recommendation is available.</p>}<div className="mt-4 flex gap-2"><Link className="btn-primary" to="/app/inventory">Review inventory</Link><Link className="btn-secondary" to="/source">Source supplies</Link></div></section></div>
    <div className="mt-5 grid gap-5 lg:grid-cols-2"><section className="surface-card p-5"><h2 className="font-bold">Recent orders</h2><p className="mt-3 text-sm text-slate-600">{metrics.orderCount === undefined ? 'Not connected yet.' : metrics.orderCount ? `${metrics.orderCount} recorded order(s) in the selected period.` : 'No recorded orders yet.'}</p><Link className="mt-4 inline-flex text-sm font-semibold text-brand-700 hover:underline" to="/app/orders">Open orders</Link></section><section className="surface-card p-5"><h2 className="font-bold">Recent activity</h2>{data.events?.length ? <div className="mt-3 space-y-3">{data.events.slice(0, 5).map(event => <div key={`${event.kind}-${event._id}`} className="border-b border-slate-100 pb-2 text-sm"><p className="font-semibold text-slate-800">{event.summary || event.eventType?.replaceAll('_', ' ')}</p><p className="text-xs text-slate-500">{new Date(event.createdAt).toLocaleString()}</p></div>)}</div> : <p className="mt-3 text-sm text-slate-500">No activity yet.</p>}<Link className="mt-4 inline-flex text-sm font-semibold text-brand-700 hover:underline" to="/activity">View activity</Link></section></div>
  </main>
}
