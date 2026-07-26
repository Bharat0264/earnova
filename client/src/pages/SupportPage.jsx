import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import {
  AlertTriangle, ArrowLeft, ArrowRight, FileLock2, Loader2,
  Paperclip, Search, ShieldAlert, Upload,
} from 'lucide-react'
import { api } from '../utils/api'
import { formatDate } from '../utils/formatters'

const SERVICES = [
  ['account', 'Account'],
  ['business', 'Business Workspace'],
  ['ca', 'CA services'],
  ['commerce', 'Shopping & orders'],
  ['freelancing', 'Freelancing'],
  ['energy', 'Energy'],
  ['payments', 'Payments'],
  ['projects', 'Projects'],
  ['referrals', 'Referrals'],
]

const statusLabel = value => String(value || '').replaceAll('_', ' ')

function TicketList() {
  const [tickets, setTickets] = useState([])
  const [filters, setFilters] = useState({ service: '', status: '', q: '' })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const params = new URLSearchParams(Object.fromEntries(Object.entries(filters).filter(([, value]) => value)))
    setLoading(true)
    const timer = setTimeout(() => {
      api.get(`/support/tickets?${params}`).then(data => setTickets(data.tickets || [])).catch(err => setError(err.message)).finally(() => setLoading(false))
    }, 150)
    return () => clearTimeout(timer)
  }, [filters])

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div><p className="eyebrow">Customer support</p><h1 className="mt-2 text-3xl font-extrabold text-slate-950">My support tickets</h1><p className="mt-2 text-sm text-slate-600">Track service, status, linked item, last update and next action.</p></div>
        <Link to="/app/support/new" className="btn-primary">Start support request</Link>
      </div>
      <div className="mt-6 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-3">
        <label className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input className="input-base w-full pl-10" placeholder="Ticket reference" value={filters.q} onChange={event => setFilters(prev => ({ ...prev, q: event.target.value }))} /></label>
        <select className="input-base" value={filters.service} onChange={event => setFilters(prev => ({ ...prev, service: event.target.value }))}><option value="">All services</option>{SERVICES.map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select>
        <select className="input-base" value={filters.status} onChange={event => setFilters(prev => ({ ...prev, status: event.target.value }))}><option value="">All statuses</option>{['submitted', 'under_review', 'assigned', 'more_information_required', 'waiting_for_customer', 'waiting_for_provider', 'waiting_for_ca_firm', 'waiting_for_payment_review', 'escalated', 'resolved', 'closed', 'reopened'].map(value => <option key={value} value={value}>{statusLabel(value)}</option>)}</select>
      </div>
      {error && <p className="mt-5 rounded-xl bg-rose-50 p-4 text-sm font-bold text-rose-800">{error}</p>}
      {loading ? <div className="flex justify-center py-16"><Loader2 className="h-7 w-7 animate-spin text-brand-700" /></div> : (
        <div className="mt-6 grid gap-4 xl:grid-cols-2">
          {tickets.map(ticket => (
            <Link key={ticket._id} to={`/app/support/${ticket.ticketNumber}`} className="surface-card p-5 hover:border-brand-300">
              <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold text-brand-700">{ticket.ticketNumber}</p><h2 className="mt-2 font-bold text-slate-950">{ticket.subject}</h2></div><span className="status-badge status-info capitalize">{statusLabel(ticket.status)}</span></div>
              <p className="mt-3 text-sm text-slate-600">{ticket.nextAction}</p>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500"><span>{ticket.serviceCategory} · {ticket.relatedPublicReference || 'No linked item'}</span><span>{formatDate(ticket.updatedAt)}</span></div>
            </Link>
          ))}
          {!tickets.length && <p className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500 xl:col-span-2">No support tickets match these filters.</p>}
        </div>
      )}
    </div>
  )
}

function NewTicket() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const initialService = searchParams.get('service') || 'account'
  const [issues, setIssues] = useState([])
  const [duplicate, setDuplicate] = useState(null)
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    serviceCategory: SERVICES.some(([key]) => key === initialService) ? initialService : 'account',
    issueCategory: '',
    subject: '',
    description: '',
    customerImpact: 'normal',
    relatedEntityType: searchParams.get('entityType') || 'none',
    relatedEntityReference: searchParams.get('entityRef') || '',
    sourceRoute: (searchParams.get('source') || '').split('?')[0],
  })

  useEffect(() => {
    api.get(`/help/issues/${form.serviceCategory}`).then(data => {
      setIssues(data.issues || [])
      setForm(prev => ({ ...prev, issueCategory: data.issues?.includes(prev.issueCategory) ? prev.issueCategory : '' }))
    }).catch(err => setMessage(err.message))
  }, [form.serviceCategory])

  const submit = async (event, continueDespiteDuplicate = false) => {
    event?.preventDefault()
    setSubmitting(true)
    setMessage('')
    try {
      const data = await api.post('/support/tickets', { ...form, continueDespiteDuplicate })
      navigate(`/app/support/${data.ticket.ticketNumber}`)
    } catch (error) {
      if (error.status === 409 && error.data?.existingTicket) setDuplicate(error.data.existingTicket)
      else setMessage(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Link to="/app/support" className="inline-flex items-center gap-1 text-sm font-bold text-brand-700"><ArrowLeft className="h-4 w-4" />My tickets</Link>
      <p className="eyebrow mt-7">Contextual support</p>
      <h1 className="mt-2 text-3xl font-extrabold text-slate-950">Start a support request</h1>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">Choose the service first. Earnova calculates final priority and verifies any linked case or order on the backend.</p>
      {message && <p className="mt-5 rounded-xl bg-rose-50 p-4 text-sm font-bold text-rose-800">{message}</p>}
      {duplicate && (
        <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-950">
          <p className="font-bold">A similar open ticket already exists.</p>
          <p className="mt-1 text-sm">{duplicate.ticketNumber} · {duplicate.subject}</p>
          <div className="mt-4 flex flex-wrap gap-2"><Link to={`/app/support/${duplicate.ticketNumber}`} className="btn-primary">Continue existing ticket</Link><button type="button" onClick={() => submit(null, true)} className="btn-secondary">This is a separate issue</button></div>
        </div>
      )}
      <form onSubmit={submit} className="mt-6 space-y-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-bold text-slate-700">Service
            <select className="input-base mt-2 w-full" value={form.serviceCategory} onChange={event => setForm(prev => ({ ...prev, serviceCategory: event.target.value }))}>{SERVICES.map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select>
          </label>
          <label className="text-sm font-bold text-slate-700">Issue
            <select className="input-base mt-2 w-full" value={form.issueCategory} onChange={event => setForm(prev => ({ ...prev, issueCategory: event.target.value }))} required><option value="">Choose issue</option>{issues.map(issue => <option key={issue}>{issue}</option>)}</select>
          </label>
          <label className="text-sm font-bold text-slate-700">Your impact
            <select className="input-base mt-2 w-full" value={form.customerImpact} onChange={event => setForm(prev => ({ ...prev, customerImpact: event.target.value }))}><option value="low">Low</option><option value="normal">Normal</option><option value="high">High</option><option value="critical">Critical</option></select>
          </label>
          <label className="text-sm font-bold text-slate-700">Related item
            <select className="input-base mt-2 w-full" value={form.relatedEntityType} onChange={event => setForm(prev => ({ ...prev, relatedEntityType: event.target.value, relatedEntityReference: '' }))}><option value="none">No linked item</option><option value="ca_case">CA case</option><option value="order">Order</option></select>
          </label>
          {form.relatedEntityType !== 'none' && <label className="sm:col-span-2 text-sm font-bold text-slate-700">{form.relatedEntityType === 'ca_case' ? 'Case reference' : 'Order reference'}<input className="input-base mt-2 w-full" value={form.relatedEntityReference} onChange={event => setForm(prev => ({ ...prev, relatedEntityReference: event.target.value }))} placeholder={form.relatedEntityType === 'ca_case' ? 'EN-CA-2026-00124' : 'Order reference'} required /></label>}
          <label className="sm:col-span-2 text-sm font-bold text-slate-700">Subject<input className="input-base mt-2 w-full" minLength={5} maxLength={180} value={form.subject} onChange={event => setForm(prev => ({ ...prev, subject: event.target.value }))} required /></label>
          <label className="sm:col-span-2 text-sm font-bold text-slate-700">Description<textarea className="input-base mt-2 min-h-32 w-full" minLength={20} maxLength={5000} value={form.description} onChange={event => setForm(prev => ({ ...prev, description: event.target.value }))} required /></label>
        </div>
        {form.sourceRoute && <p className="rounded-xl bg-slate-50 p-3 text-xs text-slate-500">Safe page context: {form.sourceRoute}</p>}
        <div className="flex gap-3 rounded-xl bg-amber-50 p-4 text-xs leading-relaxed text-amber-900"><AlertTriangle className="h-4 w-4 shrink-0" /><p>Do not include passwords, tokens, cookies, PAN, Aadhaar, bank details or document contents. Attach only files required for this issue after the ticket is created.</p></div>
        <button disabled={submitting} className="btn-primary">{submitting ? 'Submitting...' : 'Submit support request'}<ArrowRight className="h-4 w-4" /></button>
      </form>
    </div>
  )
}

function TicketDetail() {
  const { ticketId } = useParams()
  const [data, setData] = useState(null)
  const [message, setMessage] = useState('')
  const [file, setFile] = useState(null)
  const refresh = () => api.get(`/support/tickets/${ticketId}`).then(setData).catch(err => setMessage(err.message))
  useEffect(refresh, [ticketId])

  const upload = async event => {
    event.preventDefault()
    if (!file) return
    const body = new FormData()
    body.append('attachment', file)
    try {
      const result = await api.post(`/private-files/support-tickets/${data.ticket._id}/attachments`, body)
      setMessage(result.message)
      setFile(null)
    } catch (error) {
      setMessage(error.message)
    }
  }

  const download = async attachment => {
    try {
      const result = await api.get(`/private-files/support-attachments/${attachment._id}/download`)
      window.open(result.downloadUrl, '_blank', 'noopener,noreferrer')
    } catch (error) {
      setMessage(error.message)
    }
  }

  if (!data && !message) return <div className="flex min-h-[50vh] items-center justify-center"><Loader2 className="h-7 w-7 animate-spin text-brand-700" /></div>
  if (!data) return <p className="rounded-xl bg-rose-50 p-4 font-bold text-rose-800">{message}</p>
  const { ticket, messages, history, attachments = [] } = data
  return (
    <div>
      <Link to="/app/support" className="inline-flex items-center gap-1 text-sm font-bold text-brand-700"><ArrowLeft className="h-4 w-4" />My tickets</Link>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-xs font-bold text-brand-700">{ticket.ticketNumber}</p><h1 className="mt-2 text-3xl font-extrabold text-slate-950">{ticket.subject}</h1><p className="mt-2 text-sm text-slate-500">{ticket.serviceCategory} · {ticket.issueCategory}</p></div><span className="status-badge status-info capitalize">{statusLabel(ticket.status)}</span></div>
      {message && <p className="mt-5 rounded-xl bg-amber-50 p-4 text-sm font-semibold text-amber-900">{message}</p>}
      <section className="mt-6 rounded-2xl border border-brand-200 bg-brand-50 p-5"><p className="text-xs font-black uppercase tracking-[.12em] text-brand-800">Next action</p><p className="mt-2 text-sm font-semibold text-brand-950">{ticket.nextAction || 'No customer action is currently requested.'}</p></section>
      <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          <section className="surface-card p-5"><h2 className="font-bold text-slate-950">Conversation</h2><div className="mt-4 space-y-3">{messages.map(item => <div key={item._id} className={`max-w-[90%] rounded-2xl p-4 ${item.authorType === 'customer' ? 'ml-auto bg-brand-700 text-white' : 'bg-slate-100 text-slate-800'}`}><p className="whitespace-pre-wrap text-sm leading-relaxed">{item.message}</p><p className={`mt-2 text-[10px] ${item.authorType === 'customer' ? 'text-brand-100' : 'text-slate-500'}`}>{item.author?.name || item.authorType} · {formatDate(item.createdAt)}</p></div>)}</div></section>
          <section className="surface-card p-5">
            <h2 className="flex items-center gap-2 font-bold text-slate-950"><FileLock2 className="h-4 w-4 text-brand-700" />Private attachment</h2>
            <p className="mt-2 text-xs text-slate-500">Attachments use private storage and are quarantined until the configured security scanner marks them clean.</p>
            <form onSubmit={upload} className="mt-4 flex flex-col gap-3 sm:flex-row"><input type="file" accept=".pdf,.jpg,.jpeg,.png,.csv,.xlsx" onChange={event => setFile(event.target.files?.[0] || null)} className="input-base flex-1 text-xs" required /><button className="btn-secondary"><Upload className="h-4 w-4" />Upload</button></form>
            <div className="mt-4 space-y-2">{attachments.map(attachment => <button key={attachment._id} type="button" onClick={() => download(attachment)} className="flex w-full items-center justify-between rounded-xl bg-slate-50 p-3 text-left"><span><span className="block text-sm font-bold text-slate-800">{attachment.originalFilename}</span><span className="text-xs text-slate-500">scan {attachment.malwareScanStatus}</span></span><Paperclip className="h-4 w-4 text-brand-700" /></button>)}</div>
          </section>
        </div>
        <aside className="space-y-4">
          <section className="surface-card p-5"><h2 className="font-bold text-slate-950">Ticket summary</h2><dl className="mt-4 space-y-3 text-sm"><div><dt className="text-xs font-bold text-slate-400">Priority</dt><dd className="mt-1 capitalize text-slate-700">{statusLabel(ticket.priority)}</dd></div><div><dt className="text-xs font-bold text-slate-400">Assigned team</dt><dd className="mt-1 text-slate-700">{ticket.assignedTeam || ticket.supportQueue.replaceAll('_', ' ')}</dd></div><div><dt className="text-xs font-bold text-slate-400">Linked item</dt><dd className="mt-1 text-slate-700">{ticket.relatedPublicReference || 'None'}</dd></div></dl></section>
          <section className="surface-card p-5"><h2 className="font-bold text-slate-950">Status timeline</h2><ol className="mt-4 space-y-3">{history.map(item => <li key={item._id}><p className="text-sm font-bold capitalize text-slate-800">{statusLabel(item.newStatus)}</p><p className="mt-1 text-xs text-slate-500">{item.reason} · {formatDate(item.createdAt)}</p></li>)}</ol></section>
          {ticket.priority === 'security_critical' && <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-rose-900"><ShieldAlert className="h-5 w-5" /><p className="mt-3 text-sm font-bold">Restricted security queue</p><p className="mt-1 text-xs leading-relaxed">Avoid uploading unrelated sensitive documents.</p></div>}
        </aside>
      </div>
    </div>
  )
}

export default function SupportPage({ mode = 'list' }) {
  if (mode === 'new') return <NewTicket />
  if (mode === 'detail') return <TicketDetail />
  return <TicketList />
}
