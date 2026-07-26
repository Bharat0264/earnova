import { useEffect, useMemo, useState } from 'react'
import { Building2, CheckCircle2, ClipboardCheck, Search, ShieldCheck } from 'lucide-react'
import { api } from '../../utils/api'
import { formatDate } from '../../utils/formatters'

const STATUSES = ['pending', 'under_review', 'verified', 'rejected', 'suspended']
const label = value => String(value || 'pending').replaceAll('_', ' ')
const styles = {
  pending: 'bg-amber-50 text-amber-700',
  under_review: 'bg-blue-50 text-blue-700',
  verified: 'bg-emerald-50 text-emerald-700',
  rejected: 'bg-rose-50 text-rose-700',
  suspended: 'bg-slate-200 text-slate-700',
}

export default function BusinessVerificationTable() {
  const [businesses, setBusinesses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [drafts, setDrafts] = useState({})
  const [saving, setSaving] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await api.get('/admin/business-verifications?limit=100')
      setBusinesses(data.businesses || [])
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return businesses.filter(item => {
      const matchesStatus = status === 'all' || item.verificationStatus === status
      const matchesSearch = !query || [item.name, item.industry, item.gstin, item.email, item.owner?.name, item.owner?.email]
        .filter(Boolean).some(value => String(value).toLowerCase().includes(query))
      return matchesStatus && matchesSearch
    })
  }, [businesses, search, status])

  const save = async business => {
    const draft = drafts[business._id] || {}
    const nextStatus = draft.status || business.verificationStatus || 'pending'
    const note = draft.note ?? business.verificationNote ?? ''
    setSaving(business._id)
    try {
      await api.patch(`/admin/business-verifications/${business._id}`, { status: nextStatus, note })
      await load()
    } catch (requestError) {
      alert(requestError.message)
    } finally {
      setSaving('')
    }
  }

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-primary-200 bg-primary-50 p-5">
        <div className="flex items-start gap-3"><ShieldCheck className="mt-0.5 h-6 w-6 text-primary-700" /><div>
          <h2 className="font-display font-bold text-primary-950">Business verification workflow</h2>
          <p className="mt-1 text-sm leading-6 text-primary-800">Confirm that the submitted identity and contact details belong to a real business. Verification is a platform trust review; it is not a guarantee of financial performance, tax compliance, or service quality.</p>
        </div></div>
        <div className="mt-4 grid gap-3 md:grid-cols-4">
          {[
            ['1. Submitted', 'A new business starts as pending with its registration details.'],
            ['2. Review', 'Check owner identity, contact details and GSTIN when one is supplied.'],
            ['3. Decision', 'Mark verified, reject with a reason, or suspend if trust changes later.'],
            ['4. Audit', 'Earnova stores the reviewer, note, status and decision time.'],
          ].map(([title, copy]) => <div key={title} className="rounded-xl bg-white/80 p-3"><p className="text-xs font-black text-primary-900">{title}</p><p className="mt-1 text-xs leading-5 text-primary-700">{copy}</p></div>)}
        </div>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative max-w-md flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" /><input className="input-base pl-9 text-sm" value={search} onChange={event => setSearch(event.target.value)} placeholder="Search business, owner, GSTIN or email" /></div>
        <select className="input-base max-w-48 text-sm" value={status} onChange={event => setStatus(event.target.value)}>
          <option value="all">All verification states</option>
          {STATUSES.map(item => <option key={item} value={item}>{label(item)}</option>)}
        </select>
      </div>

      {error && <p className="rounded-xl bg-rose-50 p-4 text-sm font-bold text-rose-700">{error}</p>}
      {loading ? <div className="h-40 animate-pulse rounded-2xl bg-gray-100" /> : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center"><Building2 className="mx-auto h-8 w-8 text-gray-300" /><p className="mt-2 font-bold text-gray-800">No businesses match this view.</p></div>
      ) : (
        <div className="space-y-3">
          {filtered.map(business => {
            const draft = drafts[business._id] || {}
            return <article key={business._id} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-card">
              <div className="grid gap-5 xl:grid-cols-[1fr_1.2fr]">
                <div>
                  <div className="flex flex-wrap items-center gap-2"><h3 className="font-display font-bold text-gray-950">{business.name}</h3><span className={`rounded-full px-2.5 py-1 text-[10px] font-black capitalize ${styles[business.verificationStatus] || styles.pending}`}>{label(business.verificationStatus)}</span></div>
                  <p className="mt-1 text-xs text-gray-500">{business.industry} · {label(business.businessType)} · submitted {formatDate(business.verificationSubmittedAt || business.createdAt)}</p>
                  <dl className="mt-4 grid grid-cols-2 gap-3 text-xs">
                    <div><dt className="font-bold text-gray-400">Owner</dt><dd className="mt-1 font-semibold text-gray-800">{business.owner?.name || 'Unknown'}<br />{business.owner?.email || business.email || 'No email'}</dd></div>
                    <div><dt className="font-bold text-gray-400">Identity/contact</dt><dd className="mt-1 font-semibold text-gray-800">{business.gstin || 'GSTIN not supplied'}<br />{business.phone || 'No phone'}</dd></div>
                  </dl>
                  {business.reviewedAt && <p className="mt-3 text-xs text-gray-500">Last reviewed {formatDate(business.reviewedAt)} by {business.reviewedBy?.name || 'admin'}</p>}
                </div>
                <div className="grid gap-3 md:grid-cols-[180px_1fr_auto] md:items-end">
                  <label className="text-xs font-bold text-gray-500">Decision<select className="input-base mt-1.5 text-sm" value={draft.status || business.verificationStatus || 'pending'} onChange={event => setDrafts(current => ({ ...current, [business._id]: { ...current[business._id], status: event.target.value } }))}>{STATUSES.map(item => <option key={item} value={item}>{label(item)}</option>)}</select></label>
                  <label className="text-xs font-bold text-gray-500">Review note<input className="input-base mt-1.5 text-sm" value={draft.note ?? business.verificationNote ?? ''} onChange={event => setDrafts(current => ({ ...current, [business._id]: { ...current[business._id], note: event.target.value } }))} placeholder="Evidence checked or reason for decision" /></label>
                  <button disabled={saving === business._id} onClick={() => save(business)} className="btn-primary inline-flex items-center justify-center gap-2 text-sm"><ClipboardCheck className="h-4 w-4" />{saving === business._id ? 'Saving...' : 'Save review'}</button>
                </div>
              </div>
            </article>
          })}
        </div>
      )}
      <p className="flex items-center gap-2 text-xs text-gray-500"><CheckCircle2 className="h-4 w-4 text-emerald-600" />Verified businesses remain subject to normal monitoring and can be suspended after a later trust review.</p>
    </div>
  )
}
