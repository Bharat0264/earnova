import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, FileLock2, IndianRupee, Loader2, MessageCircle, ShieldCheck, UsersRound } from 'lucide-react'
import { api } from '../utils/api'
import { formatDate, formatPrice } from '../utils/formatters'

export default function FirmCasePage() {
  const { caseId } = useParams()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [quote, setQuote] = useState({ amount: '', scope: '' })
  const [completionSummary, setCompletionSummary] = useState('')
  const refresh = () => api.get(`/ca-office/firm/cases/${caseId}`).then(setData).catch(err => setError(err.message))
  useEffect(refresh, [caseId])

  const raiseQuote = async event => {
    event.preventDefault()
    setError('')
    try {
      await api.post(`/ca-office/firm/cases/${data.case._id}/quote`, {
        professionalFeePaise: Math.round(Number(quote.amount) * 100),
        scope: quote.scope,
      })
      setQuote({ amount: '', scope: '' })
      refresh()
    } catch (err) { setError(err.message) }
  }
  const completeWork = async event => {
    event.preventDefault()
    setError('')
    try {
      await api.post(`/ca-office/firm/cases/${data.case._id}/complete`, { completionSummary })
      setCompletionSummary('')
      refresh()
    } catch (err) { setError(err.message) }
  }

  if (!data && !error) return <div className="flex min-h-[50vh] items-center justify-center"><Loader2 className="h-7 w-7 animate-spin text-brand-700" /></div>
  if (!data) return <p className="rounded-2xl bg-rose-50 p-5 font-bold text-rose-800">{error}</p>
  const item = data.case
  const whatsapp = item.contactWhatsapp?.replace(/\D/g, '').slice(-10)

  return (
    <div>
      <Link to="/firm/cases" className="inline-flex items-center gap-1 text-sm font-bold text-brand-700"><ArrowLeft className="h-4 w-4" />Firm cases</Link>
      <div className="mt-5 flex items-start justify-between gap-4"><div><p className="text-xs font-bold text-brand-700">{item.reference}</p><h1 className="mt-2 text-3xl font-extrabold text-slate-950">{item.service?.name}</h1><p className="mt-2 text-sm text-slate-500">Customer: {item.customer?.name} · {item.customer?.email}</p></div><span className="status-badge status-info capitalize">{item.status.replaceAll('_', ' ')}</span></div>
      {error && <p className="mt-5 rounded-xl bg-rose-50 p-4 text-sm font-bold text-rose-800">{error}</p>}
      <div className="mt-7 grid gap-5 lg:grid-cols-2">
        <section className="surface-card p-5">
          <h2 className="font-bold text-slate-950">Intake summary</h2>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-600">{item.intakeSummary}</p>
          <p className="mt-4 text-xs text-slate-500">PAN: {item.maskedPan || 'Not provided'}</p>
          {item.taxIntake?.assessmentYear && <div className="mt-4 rounded-xl bg-blue-50 p-4 text-sm text-blue-950"><p className="font-bold">Structured ITR profile</p><p className="mt-2">Assessment year: {item.taxIntake.assessmentYear} · {item.taxIntake.taxpayerType?.replaceAll('_', ' ')}</p><p className="mt-1">Income: {item.taxIntake.incomeSources?.map(value => value.replaceAll('_', ' ')).join(', ') || 'Not specified'}</p><p className="mt-1">Reason: {item.taxIntake.filingReason?.replaceAll('_', ' ')} · Position: {item.taxIntake.taxPosition?.replaceAll('_', ' ')}</p><p className="mt-2 text-xs">This is customer-provided intake. Verify it professionally against uploaded records before preparing the return.</p></div>}
          {whatsapp && <a className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-emerald-700" href={`https://wa.me/91${whatsapp}`} target="_blank" rel="noreferrer"><MessageCircle className="h-4 w-4" />Message customer on WhatsApp</a>}
        </section>
        <section className="surface-card p-5"><h2 className="flex items-center gap-2 font-bold text-slate-950"><UsersRound className="h-4 w-4 text-brand-700" />Assignments</h2><div className="mt-4 space-y-2">{data.assignments.length ? data.assignments.map(row => <p key={row._id} className="text-sm text-slate-600"><span className="font-bold capitalize">{row.assignmentRole.replaceAll('_', ' ')}:</span> {row.member?.user?.name}</p>) : <p className="text-sm text-slate-500">Firm administrator must assign authorized members.</p>}</div></section>
        <section className="surface-card p-5"><h2 className="flex items-center gap-2 font-bold text-slate-950"><FileLock2 className="h-4 w-4 text-brand-700" />Private documents</h2><p className="mt-2 text-xs text-slate-500">Only metadata is previewed. Each download requires a fresh authorization check.</p><div className="mt-4 space-y-2">{data.documents.map(doc => <div key={doc._id} className="rounded-xl bg-slate-50 p-3 text-sm"><p className="font-bold text-slate-800">{doc.documentType}</p><p className="mt-1 text-xs text-slate-500">{doc.reviewStatus.replaceAll('_', ' ')} · scan {doc.malwareScanStatus}</p></div>)}</div></section>
        <section className="surface-card p-5"><h2 className="flex items-center gap-2 font-bold text-slate-950"><ShieldCheck className="h-4 w-4 text-emerald-700" />Audit history</h2><div className="mt-4 space-y-3">{data.history.map(row => <div key={row._id}><p className="text-sm font-bold capitalize text-slate-800">{row.newStatus.replaceAll('_', ' ')}</p><p className="text-xs text-slate-500">{row.reason} · {formatDate(row.createdAt)}</p></div>)}</div></section>
        <section className="surface-card p-5 lg:col-span-2">
          <h2 className="flex items-center gap-2 font-bold text-slate-950"><IndianRupee className="h-4 w-4 text-brand-700" />Raise payment in Earnova</h2>
          {item.paymentStatus === 'paid' ? <p className="mt-3 rounded-xl bg-emerald-50 p-3 text-sm font-bold text-emerald-800">Customer paid {formatPrice((item.quote?.totalPaise || 0) / 100)}. Work can proceed.</p> : (
            <form onSubmit={raiseQuote} className="mt-4 grid gap-3 lg:grid-cols-[220px_1fr_auto]">
              <input className="input-base" type="number" min="100" max="500000" step="1" value={quote.amount} onChange={event => setQuote(prev => ({ ...prev, amount: event.target.value }))} placeholder="Professional fee ₹" required />
              <textarea className="input-base min-h-24" minLength="20" maxLength="2000" value={quote.scope} onChange={event => setQuote(prev => ({ ...prev, scope: event.target.value }))} placeholder="Describe all work included in this quote" required />
              <button className="btn-primary self-end">Send quote</button>
            </form>
          )}
          {item.quote?.status === 'issued' && <p className="mt-3 text-sm text-slate-600">Current quote: {formatPrice((item.quote.totalPaise || 0) / 100)} · waiting for customer payment.</p>}
        </section>
        {item.paymentStatus === 'paid' && item.status !== 'completed' && <section className="surface-card p-5 lg:col-span-2"><h2 className="font-bold text-slate-950">Complete paid work</h2><form onSubmit={completeWork} className="mt-4 grid gap-3 lg:grid-cols-[1fr_auto]"><textarea className="input-base min-h-24" minLength="20" maxLength="3000" value={completionSummary} onChange={event => setCompletionSummary(event.target.value)} placeholder="Customer-visible completion summary and next steps" required /><button className="btn-primary self-end">Mark work complete</button></form></section>}
      </div>
    </div>
  )
}
