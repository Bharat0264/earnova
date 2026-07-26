import { useCallback, useEffect, useState } from 'react'
import { api } from '../../utils/api'

const STATUS_OPTIONS = {
  providers: ['pending', 'verified', 'rejected', 'suspended'],
  services: ['open', 'proposal_received', 'accepted', 'in_progress', 'submitted', 'revision_requested', 'completed', 'cancelled', 'disputed'],
  energy: ['new', 'reviewing', 'partner_assigned', 'quote_ready', 'contacted', 'closed', 'cancelled'],
  support: ['submitted', 'under_review', 'assigned', 'more_information_required', 'waiting_for_customer', 'waiting_for_provider', 'waiting_for_ca_firm', 'waiting_for_payment_review', 'escalated', 'resolved', 'closed', 'reopened', 'rejected_as_duplicate', 'spam_or_abuse'],
  subscriptions: ['trialing', 'active', 'past_due', 'cancelled', 'expired'],
  referrals: ['pending', 'approved', 'reversed'],
}

const labelFor = item => item.name || item.title || item.subject || item.ticketNumber || item.plan || item.action || item._id
const detailFor = item => item.email || item.category || item.providerType || item.status || item.billingStatus || item.resourceType || item.industry || 'Record'
const statusFor = (resource, item) => resource === 'providers' ? item.verificationStatus : resource === 'subscriptions' ? item.billingStatus || item.status : item.status

export default function AdminOperationsTable({ resource, title }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const load = useCallback(async () => {
    setLoading(true); setError('')
    try { const data = await api.get(`/admin/operations/${resource}`); setItems(data.items || []) }
    catch (requestError) { setError(requestError.message) }
    finally { setLoading(false) }
  }, [resource])
  useEffect(() => { load() }, [load])
  const update = async (item, value) => {
    const body = resource === 'providers' ? { verificationStatus: value } : resource === 'subscriptions' ? { billingStatus: value } : { status: value }
    await api.patch(`/admin/operations/${resource}/${item._id}`, body); await load()
  }
  return <section><div className="flex items-center justify-between"><div><h2 className="text-2xl font-bold text-slate-950">{title}</h2><p className="mt-1 text-sm text-slate-500">Backend-protected administration with append-only audit records.</p></div><button type="button" className="btn-secondary" onClick={load}>Refresh</button></div>
    {error && <p className="mt-4 rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</p>}
    <div className="mt-5 table-shell"><table className="data-table"><thead><tr><th>Record</th><th>Details</th><th>Status / action</th><th>Created</th></tr></thead><tbody>{items.map(item => <tr key={item._id}><td className="font-bold">{labelFor(item)}</td><td>{detailFor(item)}</td><td>{STATUS_OPTIONS[resource] ? <select className="rounded-lg border px-2 py-1" value={statusFor(resource, item) || STATUS_OPTIONS[resource][0]} onChange={event => update(item, event.target.value)}>{STATUS_OPTIONS[resource].map(value => <option value={value} key={value}>{value.replaceAll('_', ' ')}</option>)}</select> : <span className="status-badge status-info">{statusFor(resource, item) || 'read only'}</span>}</td><td>{new Date(item.createdAt).toLocaleDateString('en-IN')}</td></tr>)}</tbody></table>{!loading && !items.length && <p className="p-10 text-center text-sm text-slate-500">No records.</p>}{loading && <p className="p-10 text-center text-sm text-slate-500">Loading…</p>}</div>
  </section>
}

export function AdminPlatformAnalytics() {
  const [metrics, setMetrics] = useState(null)
  useEffect(() => { api.get('/admin/platform-analytics').then(data => setMetrics(data.metrics)) }, [])
  if (!metrics) return <p className="state-panel text-slate-500">Loading platform analytics…</p>
  return <section><h2 className="text-2xl font-bold text-slate-950">Platform analytics</h2><p className="mt-1 text-sm text-slate-500">Operational platform metrics remain separate from tenant business analytics.</p><div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{Object.entries(metrics).filter(([key]) => key !== 'events').map(([key, value]) => <article key={key} className="surface-card p-5"><p className="text-sm font-semibold capitalize text-slate-500">{key.replace(/([A-Z])/g, ' $1')}</p><p className="mt-2 text-3xl font-bold text-slate-950">{value}</p></article>)}</div><div className="mt-6 surface-card p-5"><h3 className="font-bold">Privacy-conscious events</h3><div className="mt-3 space-y-2">{(metrics.events || []).map(item => <div key={item._id} className="flex justify-between rounded-lg bg-slate-50 p-3 text-sm"><span>{item._id}</span><strong>{item.count}</strong></div>)}</div></div></section>
}
