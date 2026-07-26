import { useState } from 'react'
import { Bot, Send, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useBusiness } from '../context/BusinessContext'
import { api } from '../utils/api'
import { formatMoney } from '../utils/business'

function displayMetric(key, value) {
  if (key.endsWith('Paise')) return formatMoney(value)
  if (Array.isArray(value)) return value.length ? `${value.length} records` : 'No records'
  return String(value ?? '—')
}

export default function BusinessAIPage() {
  const { selectedBusiness, selectedBusinessId, loading: businessLoading } = useBusiness()
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const ask = async event => {
    event.preventDefault()
    setLoading(true)
    setError('')
    try {
      const data = await api.post(`/businesses/${selectedBusinessId}/assistant`, { question, preset: 'last_30_days' })
      setAnswer(data.answer)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  if (businessLoading) return <div className="state-panel">Loading workspace…</div>
  if (!selectedBusiness) return <div className="state-panel"><Bot className="h-8 w-8 text-brand-700" /><h1 className="text-xl font-bold">Create a business first</h1><Link to="/app/overview" className="btn-primary">Go to overview</Link></div>

  return (
    <div className="mx-auto max-w-4xl">
      <p className="eyebrow">Business assistant</p>
      <h1 className="mt-2 text-3xl font-bold text-slate-950">Ask about {selectedBusiness.name}</h1>
      <p className="mt-2 text-slate-600">Answers are calculated only from authorized records in the selected workspace. No external company data is invented.</p>
      <form onSubmit={ask} className="mt-7 surface-card p-5">
        <label className="form-field">Your question<textarea required minLength={3} maxLength={500} className="input-base mt-2 min-h-28" value={question} onChange={event => setQuestion(event.target.value)} placeholder="How is my profit, which stock needs attention, or what should I follow up?" /></label>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3"><p className="flex items-center gap-2 text-xs font-semibold text-slate-500"><ShieldCheck className="h-4 w-4 text-emerald-600" />Tenant-scoped · last 30 days</p><button className="btn-primary" disabled={loading}><Send className="h-4 w-4" />{loading ? 'Analyzing records…' : 'Ask Earnova'}</button></div>
      </form>
      {error && <div className="mt-5 rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</div>}
      {answer && <section className="mt-6 surface-card p-6">
        <p className="text-xs font-black uppercase tracking-[.16em] text-brand-700">{answer.confidence}</p>
        <h2 className="mt-2 text-xl font-bold text-slate-950">{answer.summary}</h2>
        <dl className="mt-5 grid gap-3 sm:grid-cols-2">{Object.entries(answer.supportingMetrics || {}).map(([key, value]) => <div key={key} className="rounded-xl bg-slate-50 p-4"><dt className="text-xs font-bold uppercase tracking-wide text-slate-500">{key.replace(/Paise$/, '').replace(/([A-Z])/g, ' $1')}</dt><dd className="mt-1 text-lg font-bold text-slate-900">{displayMetric(key, value)}</dd></div>)}</dl>
        <div className="mt-5 rounded-xl border border-brand-100 bg-brand-50 p-4"><p className="text-xs font-black uppercase tracking-wide text-brand-700">Recommended action</p><p className="mt-1 text-sm font-semibold text-slate-800">{answer.recommendedAction}</p></div>
        <p className="mt-4 text-xs text-slate-500">{answer.limitation}</p>
      </section>}
    </div>
  )
}
