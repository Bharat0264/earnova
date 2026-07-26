import { useEffect, useState } from 'react'
import { BarChart3, Boxes, Lightbulb, TrendingUp, UsersRound, WalletCards } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useBusiness } from '../context/BusinessContext'
import { api } from '../utils/api'
import { formatMoney, todayInput } from '../utils/business'

const PRESETS = [
  ['today', 'Today'],
  ['last_7_days', '7 days'],
  ['last_30_days', '30 days'],
  ['current_quarter', 'Quarter'],
  ['current_year', 'Year'],
  ['custom', 'Custom'],
]

function BusinessSetup({ onCreate }) {
  const [form, setForm] = useState({ name: '', industry: '', businessType: 'proprietorship', phone: '', email: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const submit = async event => {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      await onCreate(form)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="mx-auto max-w-3xl surface-card p-6 sm:p-8">
      <p className="eyebrow">Phase 2 workspace</p>
      <h1 className="mt-2 text-3xl font-bold text-slate-950">Create your first business</h1>
      <p className="mt-2 text-slate-600">Every customer, sale, invoice and insight will be isolated inside this business.</p>
      <form onSubmit={submit} className="mt-7 grid gap-4 sm:grid-cols-2">
        <label className="form-field sm:col-span-2">Business name<input required className="input-base" value={form.name} onChange={event => setForm({ ...form, name: event.target.value })} /></label>
        <label className="form-field">Industry<input required className="input-base" placeholder="Retail, services, manufacturing…" value={form.industry} onChange={event => setForm({ ...form, industry: event.target.value })} /></label>
        <label className="form-field">Business type<select className="input-base" value={form.businessType} onChange={event => setForm({ ...form, businessType: event.target.value })}><option value="proprietorship">Proprietorship</option><option value="partnership">Partnership</option><option value="llp">LLP</option><option value="private_limited">Private limited</option><option value="other">Other</option></select></label>
        <label className="form-field">Mobile<input className="input-base" inputMode="tel" value={form.phone} onChange={event => setForm({ ...form, phone: event.target.value })} /></label>
        <label className="form-field">Business email<input className="input-base" type="email" value={form.email} onChange={event => setForm({ ...form, email: event.target.value })} /></label>
        {error && <p className="text-sm font-semibold text-red-700 sm:col-span-2">{error}</p>}
        <button className="btn-primary sm:col-span-2" disabled={saving}>{saving ? 'Creating workspace…' : 'Create secure business workspace'}</button>
      </form>
    </section>
  )
}

export default function AppOverviewPage() {
  const { user } = useAuth()
  const { selectedBusiness, selectedBusinessId, loading: businessLoading, error: businessError, createBusiness } = useBusiness()
  const [preset, setPreset] = useState('last_30_days')
  const [customStart, setCustomStart] = useState(todayInput())
  const [customEnd, setCustomEnd] = useState(todayInput())
  const [overview, setOverview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!selectedBusinessId) {
      setOverview(null)
      return
    }
    let active = true
    setLoading(true)
    setError('')
    const customQuery = preset === 'custom' ? `&start=${customStart}&end=${customEnd}` : ''
    api.get(`/businesses/${selectedBusinessId}/overview?preset=${preset}${customQuery}`)
      .then(data => active && setOverview(data))
      .catch(requestError => active && setError(requestError.message))
      .finally(() => active && setLoading(false))
    return () => { active = false }
  }, [selectedBusinessId, preset, customStart, customEnd])

  if (businessLoading) return <div className="state-panel"><p className="font-semibold text-slate-600">Loading business workspace…</p></div>
  if (!selectedBusiness) return <BusinessSetup onCreate={createBusiness} />

  const metrics = overview?.metrics || {}
  const cards = [
    ['Revenue', formatMoney(metrics.revenuePaise), TrendingUp, 'text-emerald-700'],
    ['Recorded profit', formatMoney(metrics.profitPaise), WalletCards, metrics.profitPaise < 0 ? 'text-red-700' : 'text-brand-700'],
    ['Customers', metrics.customerCount || 0, UsersRound, 'text-sky-700'],
    ['Low stock', metrics.lowStockCount || 0, Boxes, metrics.lowStockCount ? 'text-amber-700' : 'text-slate-600'],
  ]

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Business overview</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-950">{selectedBusiness.name}</h1>
          <p className="mt-2 text-slate-600">Welcome back, {user?.name?.split(' ')[0]}. These metrics use only this workspace&apos;s saved records.</p>
        </div>
        <div className="flex flex-wrap gap-2" aria-label="Analytics period">
          {PRESETS.map(([value, label]) => <button key={value} type="button" onClick={() => setPreset(value)} className={preset === value ? 'btn-primary' : 'btn-secondary'}>{label}</button>)}
        </div>
      </div>
      {preset === 'custom' && <div className="mt-4 flex flex-wrap justify-end gap-3"><label className="form-field">From<input className="input-base" type="date" max={customEnd} value={customStart} onChange={event => setCustomStart(event.target.value)} /></label><label className="form-field">To<input className="input-base" type="date" min={customStart} value={customEnd} onChange={event => setCustomEnd(event.target.value)} /></label></div>}
      {(error || businessError) && <div className="mt-5 rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-700">{error || businessError}</div>}
      <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(([label, value, Icon, color]) => (
          <article key={label} className="surface-card p-5">
            <Icon className={`h-5 w-5 ${color}`} />
            <p className="mt-4 text-sm font-semibold text-slate-500">{label}</p>
            <p className="mt-1 text-2xl font-bold text-slate-950">{loading ? '—' : value}</p>
          </article>
        ))}
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_.8fr]">
        <section className="surface-card p-6">
          <div className="flex items-center gap-3"><BarChart3 className="h-5 w-5 text-brand-700" /><h2 className="text-xl font-bold text-slate-950">Operational snapshot</h2></div>
          <dl className="mt-5 grid gap-3 sm:grid-cols-2">
            {[
              ['Sales recorded', metrics.orderCount || 0],
              ['Expenses recorded', metrics.expenseCount || 0],
              ['Open pipeline', formatMoney(metrics.pipelineValuePaise)],
              ['Outstanding invoices', formatMoney(metrics.outstandingInvoicePaise)],
              ['Lead follow-ups due', metrics.followUpsDue || 0],
              ['Overdue invoices', formatMoney(metrics.overdueInvoicePaise)],
            ].map(([label, value]) => <div key={label} className="rounded-xl bg-slate-50 p-4"><dt className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</dt><dd className="mt-1 text-lg font-bold text-slate-900">{value}</dd></div>)}
          </dl>
        </section>
        <section className="surface-card p-6">
          <div className="flex items-center gap-3"><Lightbulb className="h-5 w-5 text-amber-600" /><h2 className="text-xl font-bold text-slate-950">Recommended next actions</h2></div>
          <div className="mt-5 space-y-3">
            {(overview?.recommendations || []).map(item => (
              <article key={`${item.category}-${item.summary}`} className="rounded-xl border border-slate-200 p-4">
                <p className="text-sm font-bold text-slate-900">{item.summary}</p>
                <p className="mt-1 text-sm text-slate-600">{item.action}</p>
                <p className="mt-2 text-xs font-semibold text-slate-400">{item.confidence} confidence · {item.basis}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
