import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  AlertCircle, ArrowLeft, Building2, CheckCircle2, Download, FileLock2,
  HelpCircle, Loader2, Upload,
} from 'lucide-react'
import { api } from '../utils/api'
import { formatDate } from '../utils/formatters'

const ownerStyle = {
  customer: 'bg-amber-50 text-amber-900 border-amber-200',
  firm: 'bg-blue-50 text-blue-900 border-blue-200',
  external: 'bg-violet-50 text-violet-900 border-violet-200',
  none: 'bg-emerald-50 text-emerald-900 border-emerald-200',
}

export default function CACasePage() {
  const { caseId } = useParams()
  const [data, setData] = useState(null)
  const [message, setMessage] = useState('')
  const [file, setFile] = useState(null)
  const [documentType, setDocumentType] = useState('')

  const refresh = () => api.get(`/ca-office/cases/${caseId}`).then(setData).catch(error => setMessage(error.message))
  useEffect(refresh, [caseId])

  const upload = async event => {
    event.preventDefault()
    if (!file) return
    const body = new FormData()
    body.append('document', file)
    body.append('documentType', documentType || file.name)
    try {
      const result = await api.post(`/private-files/ca-cases/${data.case._id}/documents`, body)
      setMessage(result.message)
      setFile(null)
      setDocumentType('')
      refresh()
    } catch (error) {
      setMessage(error.message)
    }
  }

  const download = async document => {
    try {
      const result = await api.get(`/private-files/ca-documents/${document._id}/download`)
      window.open(result.downloadUrl, '_blank', 'noopener,noreferrer')
    } catch (error) {
      setMessage(error.message)
    }
  }

  if (!data && !message) return <div className="flex min-h-[50vh] items-center justify-center"><Loader2 className="h-7 w-7 animate-spin text-brand-700" /></div>
  if (!data) return <div><Link to="/app/ca/cases" className="text-sm font-bold text-brand-700">← My CA cases</Link><p className="mt-6 rounded-xl bg-rose-50 p-4 text-sm font-bold text-rose-800">{message}</p></div>
  const item = data.case
  return (
    <div>
      <Link to="/app/ca/cases" className="inline-flex items-center gap-1 text-sm font-bold text-brand-700"><ArrowLeft className="h-4 w-4" />My CA cases</Link>
      <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div><p className="text-xs font-bold text-brand-700">{item.reference}</p><h1 className="mt-2 text-3xl font-extrabold text-slate-950">{item.service?.name}</h1><p className="mt-2 text-sm text-slate-500">Created {formatDate(item.createdAt)}</p></div>
        <span className="status-badge status-info capitalize">{item.status.replaceAll('_', ' ')}</span>
      </div>

      {message && <p className="mt-5 rounded-xl bg-amber-50 p-4 text-sm font-semibold text-amber-900">{message}</p>}

      <section className={`mt-6 rounded-2xl border p-5 ${ownerStyle[item.nextActionOwner] || ownerStyle.firm}`}>
        <p className="text-xs font-black uppercase tracking-[.12em]">{item.nextActionOwner === 'customer' ? 'Your action required' : item.nextActionOwner === 'external' ? 'External-authority dependency' : item.nextActionOwner === 'none' ? 'No action required' : 'Firm action required'}</p>
        <p className="mt-2 text-sm font-semibold">{item.nextAction}</p>
      </section>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          <section className="surface-card p-5">
            <h2 className="font-bold text-slate-950">Case progress</h2>
            <ol className="mt-5 space-y-4">
              {data.history.map((event, index) => (
                <li key={event._id} className="flex gap-3">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">{index === data.history.length - 1 ? <CheckCircle2 className="h-3.5 w-3.5" /> : index + 1}</span>
                  <div><p className="text-sm font-bold capitalize text-slate-900">{event.newStatus.replaceAll('_', ' ')}</p><p className="mt-1 text-xs leading-relaxed text-slate-500">{event.reason} · {formatDate(event.createdAt)}</p></div>
                </li>
              ))}
            </ol>
          </section>

          <section className="surface-card p-5">
            <h2 className="flex items-center gap-2 font-bold text-slate-950"><FileLock2 className="h-4 w-4 text-brand-700" />Secure document room</h2>
            <p className="mt-2 text-xs leading-relaxed text-slate-500">Files are private, authorization-checked and unavailable for download until security scanning is marked clean.</p>
            <form onSubmit={upload} className="mt-5 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
              <input className="input-base" placeholder="Document type" value={documentType} onChange={event => setDocumentType(event.target.value)} />
              <input type="file" accept=".pdf,.jpg,.jpeg,.png,.csv,.xlsx" onChange={event => setFile(event.target.files?.[0] || null)} className="input-base text-xs" required />
              <button className="btn-primary"><Upload className="h-4 w-4" />Upload</button>
            </form>
            <div className="mt-5 space-y-2">
              {data.documents.map(document => (
                <div key={document._id} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 p-3">
                  <div className="min-w-0"><p className="truncate text-sm font-bold text-slate-800">{document.documentType}</p><p className="text-xs text-slate-500">{document.reviewStatus.replaceAll('_', ' ')} · scan {document.malwareScanStatus}</p></div>
                  <button type="button" onClick={() => download(document)} className="icon-button" aria-label={`Download ${document.documentType}`}><Download className="h-4 w-4" /></button>
                </div>
              ))}
              {!data.documents.length && <p className="rounded-xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">No documents uploaded.</p>}
            </div>
          </section>
        </div>
        <aside className="space-y-4">
          <div className="surface-card p-5">
            <h2 className="flex items-center gap-2 font-bold text-slate-950"><Building2 className="h-4 w-4 text-emerald-700" />Assigned firm</h2>
            <p className="mt-3 text-sm font-bold text-slate-800">{item.firm?.displayName || 'Allocation pending'}</p>
            <p className="mt-1 text-xs text-slate-500">{item.firm ? 'Verified Earnova partner firm' : 'Earnova admin will assign an eligible verified firm.'}</p>
          </div>
          <div className="surface-card p-5">
            <h2 className="font-bold text-slate-950">Assigned team</h2>
            <div className="mt-3 space-y-2">{data.assignments.length ? data.assignments.map(assignment => <p key={assignment._id} className="text-sm text-slate-600"><span className="font-bold capitalize">{assignment.assignmentRole.replaceAll('_', ' ')}:</span> {assignment.member?.user?.name || 'Assigned member'} {assignment.member?.designationVerified && assignment.member.professionalDesignation ? `· ${assignment.member.professionalDesignation}` : ''}</p>) : <p className="text-sm text-slate-500">No individual team assignments published yet.</p>}</div>
          </div>
          <div className="rounded-2xl bg-slate-950 p-5 text-white">
            <h2 className="flex items-center gap-2 font-bold"><HelpCircle className="h-4 w-4 text-emerald-300" />Get case help</h2>
            <p className="mt-2 text-xs leading-relaxed text-slate-300">The backend will verify this case belongs to you before attaching it to a ticket.</p>
            <Link to={`/app/support/new?service=ca&entityType=ca_case&entityRef=${encodeURIComponent(item.reference)}`} className="btn-primary mt-4 w-full">Start support request</Link>
          </div>
          <p className="flex gap-2 text-xs leading-relaxed text-slate-500"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />Do not share documents or identification numbers outside this case room.</p>
        </aside>
      </div>
    </div>
  )
}
