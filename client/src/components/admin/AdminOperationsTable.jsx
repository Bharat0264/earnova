import { useCallback, useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { api } from '../../utils/api'

const STATUS_OPTIONS = {
  providers: ['pending', 'verified', 'rejected', 'suspended'],
  services: ['open', 'proposal_received', 'accepted', 'in_progress', 'submitted', 'revision_requested', 'completed', 'cancelled', 'disputed'],
  energy: ['new', 'reviewing', 'partner_assigned', 'quote_ready', 'contacted', 'closed', 'cancelled'],
  support: ['submitted', 'under_review', 'assigned', 'more_information_required', 'waiting_for_customer', 'waiting_for_provider', 'waiting_for_ca_firm', 'waiting_for_payment_review', 'escalated', 'resolved', 'closed', 'reopened', 'rejected_as_duplicate', 'spam_or_abuse'],
  subscriptions: ['trialing', 'active', 'past_due', 'cancelled', 'expired'],
  referrals: ['pending', 'approved', 'reversed'],
}

const labelFor = item => item.user?.name || item.name || item.title || item.subject || item.ticketNumber || item.plan || item.action || item._id
const detailFor = item => item.user?.email || item.email || item.category || item.providerType || item.status || item.billingStatus || item.resourceType || item.industry || 'Record'
const statusFor = (resource, item) => resource === 'providers' ? item.verificationStatus : resource === 'subscriptions' ? item.billingStatus || item.status : item.status
const emptyCA = { name: '', email: '', phone: '', password: '', title: 'Chartered Accountant', description: '', skills: '', categories: '', location: '', experienceYears: '0', verificationStatus: 'pending' }

export default function AdminOperationsTable({ resource, title, providerType = '', allowAddCA = false }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showAddCA, setShowAddCA] = useState(false)
  const [caForm, setCAForm] = useState(emptyCA)
  const [savingCA, setSavingCA] = useState(false)

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const suffix = providerType ? `?providerType=${encodeURIComponent(providerType)}` : ''
      const data = await api.get(`/admin/operations/${resource}${suffix}`)
      setItems(data.items || [])
    } catch (requestError) { setError(requestError.message) }
    finally { setLoading(false) }
  }, [providerType, resource])

  useEffect(() => { load() }, [load])

  const update = async (item, value) => {
    const body = resource === 'providers' ? { verificationStatus: value } : resource === 'subscriptions' ? { billingStatus: value } : { status: value }
    await api.patch(`/admin/operations/${resource}/${item._id}`, body); await load()
  }

  const addCA = async event => {
    event.preventDefault(); setSavingCA(true); setError('')
    try {
      await api.post('/admin/ca/accounts', {
        ...caForm,
        experienceYears: Number(caForm.experienceYears || 0),
        skills: caForm.skills.split(',').map(value => value.trim()).filter(Boolean),
        categories: caForm.categories.split(',').map(value => value.trim()).filter(Boolean),
      })
      setCAForm(emptyCA); setShowAddCA(false); await load()
    } catch (requestError) { setError(requestError.message) }
    finally { setSavingCA(false) }
  }

  return <section>
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div><h2 className="text-2xl font-bold text-slate-950">{title}</h2><p className="mt-1 text-sm text-slate-500">{providerType === 'ca_consultant' ? 'Review pending CA profiles here. Only verified CAs can accept work.' : 'Backend-protected administration with append-only audit records.'}</p></div>
      <div className="flex gap-2">{allowAddCA && <button type="button" className="btn-primary" onClick={() => setShowAddCA(true)}><Plus className="h-4 w-4" />Add CA manually</button>}<button type="button" className="btn-secondary" onClick={load}>Refresh</button></div>
    </div>
    {error && <p className="mt-4 rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</p>}
    <div className="mt-5 table-shell"><table className="data-table"><thead><tr><th>Record</th><th>Details</th><th>Status / action</th><th>Created</th></tr></thead><tbody>{items.map(item => <tr key={item._id}><td><p className="font-bold">{labelFor(item)}</p>{item.title && item.user?.name && <p className="text-xs text-slate-500">{item.title}</p>}</td><td>{detailFor(item)}</td><td>{STATUS_OPTIONS[resource] ? <select className="rounded-lg border px-2 py-1" value={statusFor(resource, item) || STATUS_OPTIONS[resource][0]} onChange={event => update(item, event.target.value)}>{STATUS_OPTIONS[resource].map(value => <option value={value} key={value}>{value.replaceAll('_', ' ')}</option>)}</select> : <span className="status-badge status-info">{statusFor(resource, item) || 'read only'}</span>}</td><td>{new Date(item.createdAt).toLocaleDateString('en-IN')}</td></tr>)}</tbody></table>{!loading && !items.length && <p className="p-10 text-center text-sm text-slate-500">No records.</p>}{loading && <p className="p-10 text-center text-sm text-slate-500">Loading…</p>}</div>
    {showAddCA && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"><form onSubmit={addCA} className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"><h3 className="text-xl font-bold text-slate-950">Add a CA manually</h3><p className="mt-1 text-sm text-slate-500">Create the login and professional profile together. Choose verified only after checking the CA’s credentials.</p><div className="mt-5 grid gap-3 sm:grid-cols-2"><input required className="input-base" placeholder="Full name" value={caForm.name} onChange={event => setCAForm({ ...caForm, name: event.target.value })} /><input required type="email" className="input-base" placeholder="Email" value={caForm.email} onChange={event => setCAForm({ ...caForm, email: event.target.value })} /><input className="input-base" placeholder="Phone" value={caForm.phone} onChange={event => setCAForm({ ...caForm, phone: event.target.value })} /><input required minLength="8" type="password" className="input-base" placeholder="Temporary password (8+ characters)" value={caForm.password} onChange={event => setCAForm({ ...caForm, password: event.target.value })} /><input required className="input-base" placeholder="Professional title" value={caForm.title} onChange={event => setCAForm({ ...caForm, title: event.target.value })} /><input className="input-base" placeholder="Location" value={caForm.location} onChange={event => setCAForm({ ...caForm, location: event.target.value })} /><input type="number" min="0" className="input-base" placeholder="Experience years" value={caForm.experienceYears} onChange={event => setCAForm({ ...caForm, experienceYears: event.target.value })} /><select className="input-base" value={caForm.verificationStatus} onChange={event => setCAForm({ ...caForm, verificationStatus: event.target.value })}><option value="pending">Pending verification</option><option value="verified">Verified by admin</option></select><input className="input-base" placeholder="Skills, comma separated" value={caForm.skills} onChange={event => setCAForm({ ...caForm, skills: event.target.value })} /><input className="input-base" placeholder="Service categories, comma separated" value={caForm.categories} onChange={event => setCAForm({ ...caForm, categories: event.target.value })} /><textarea required className="input-base min-h-28 sm:col-span-2" placeholder="Professional description" value={caForm.description} onChange={event => setCAForm({ ...caForm, description: event.target.value })} /></div><div className="mt-5 flex gap-2"><button type="button" className="btn-secondary flex-1" onClick={() => setShowAddCA(false)}>Cancel</button><button disabled={savingCA} className="btn-primary flex-1">{savingCA ? 'Adding CA…' : 'Add CA'}</button></div></form></div>}
  </section>
}

export function AdminPlatformAnalytics() {
  const [metrics, setMetrics] = useState(null)
  useEffect(() => { api.get('/admin/platform-analytics').then(data => setMetrics(data.metrics)) }, [])
  if (!metrics) return <p className="state-panel text-slate-500">Loading platform analytics…</p>
  return <section><h2 className="text-2xl font-bold text-slate-950">Platform analytics</h2><p className="mt-1 text-sm text-slate-500">Operational platform metrics remain separate from tenant business analytics.</p><div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{Object.entries(metrics).filter(([key]) => key !== 'events').map(([key, value]) => <article key={key} className="surface-card p-5"><p className="text-sm font-semibold capitalize text-slate-500">{key.replace(/([A-Z])/g, ' $1')}</p><p className="mt-2 text-3xl font-bold text-slate-950">{value}</p></article>)}</div><div className="mt-6 surface-card p-5"><h3 className="font-bold">Privacy-conscious events</h3><div className="mt-3 space-y-2">{(metrics.events || []).map(item => <div key={item._id} className="flex justify-between rounded-lg bg-slate-50 p-3 text-sm"><span>{item._id}</span><strong>{item.count}</strong></div>)}</div></div></section>
}
