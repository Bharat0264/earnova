import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, FileLock2, Loader2, ShieldCheck, UsersRound } from 'lucide-react'
import { api } from '../utils/api'
import { formatDate } from '../utils/formatters'

export default function FirmCasePage() {
  const { caseId } = useParams()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  useEffect(() => { api.get(`/ca-office/firm/cases/${caseId}`).then(setData).catch(err => setError(err.message)) }, [caseId])
  if (!data && !error) return <div className="flex min-h-[50vh] items-center justify-center"><Loader2 className="h-7 w-7 animate-spin text-brand-700" /></div>
  if (error) return <p className="rounded-2xl bg-rose-50 p-5 font-bold text-rose-800">{error}</p>
  const item = data.case
  return (
    <div>
      <Link to="/firm/cases" className="inline-flex items-center gap-1 text-sm font-bold text-brand-700"><ArrowLeft className="h-4 w-4" />Firm cases</Link>
      <div className="mt-5 flex items-start justify-between gap-4"><div><p className="text-xs font-bold text-brand-700">{item.reference}</p><h1 className="mt-2 text-3xl font-extrabold text-slate-950">{item.service?.name}</h1><p className="mt-2 text-sm text-slate-500">Customer: {item.customer?.name} · {item.customer?.email}</p></div><span className="status-badge status-info capitalize">{item.status.replaceAll('_', ' ')}</span></div>
      <div className="mt-7 grid gap-5 lg:grid-cols-2">
        <section className="surface-card p-5"><h2 className="font-bold text-slate-950">Intake summary</h2><p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-600">{item.intakeSummary}</p><p className="mt-4 text-xs text-slate-500">PAN: {item.maskedPan || 'Not provided'}</p></section>
        <section className="surface-card p-5"><h2 className="flex items-center gap-2 font-bold text-slate-950"><UsersRound className="h-4 w-4 text-brand-700" />Assignments</h2><div className="mt-4 space-y-2">{data.assignments.length ? data.assignments.map(row => <p key={row._id} className="text-sm text-slate-600"><span className="font-bold capitalize">{row.assignmentRole.replaceAll('_', ' ')}:</span> {row.member?.user?.name}</p>) : <p className="text-sm text-slate-500">Firm administrator must assign authorized members.</p>}</div></section>
        <section className="surface-card p-5"><h2 className="flex items-center gap-2 font-bold text-slate-950"><FileLock2 className="h-4 w-4 text-brand-700" />Private documents</h2><p className="mt-2 text-xs text-slate-500">Only metadata is previewed. Each download requires a fresh authorization check.</p><div className="mt-4 space-y-2">{data.documents.map(doc => <div key={doc._id} className="rounded-xl bg-slate-50 p-3 text-sm"><p className="font-bold text-slate-800">{doc.documentType}</p><p className="mt-1 text-xs text-slate-500">{doc.reviewStatus.replaceAll('_', ' ')} · scan {doc.malwareScanStatus}</p></div>)}</div></section>
        <section className="surface-card p-5"><h2 className="flex items-center gap-2 font-bold text-slate-950"><ShieldCheck className="h-4 w-4 text-emerald-700" />Audit history</h2><div className="mt-4 space-y-3">{data.history.map(row => <div key={row._id}><p className="text-sm font-bold capitalize text-slate-800">{row.newStatus.replaceAll('_', ' ')}</p><p className="text-xs text-slate-500">{row.reason} · {formatDate(row.createdAt)}</p></div>)}</div></section>
      </div>
    </div>
  )
}
