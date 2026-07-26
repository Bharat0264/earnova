import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { ArrowLeft, Building2, Headphones, Loader2, ShieldCheck } from 'lucide-react'
import { api } from '../utils/api'
import { formatDate } from '../utils/formatters'

const statusLabel = value => String(value || '').replaceAll('_', ' ')

export default function AdminDomainPage({ domain }) {
  const location = useLocation()
  const { ticketId } = useParams()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let endpoint
    if (domain === 'support') {
      endpoint = ticketId ? `/admin/support/tickets/${ticketId}` : `${location.pathname}${location.pathname === '/admin/support' ? '' : '?limit=100'}`
    } else {
      endpoint = `${location.pathname}?limit=100`
    }
    api.get(endpoint).then(setData).catch(err => setError(err.message))
  }, [domain, location.pathname, ticketId])

  const records = data?.tickets || data?.firms || data?.professionals || data?.services || data?.cases || data?.logs || []
  const Icon = domain === 'support' ? Headphones : Building2

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white"><div className="section-wrapper flex min-h-16 items-center justify-between py-3"><Link to="/admin" className="inline-flex items-center gap-2 text-sm font-bold text-brand-700"><ArrowLeft className="h-4 w-4" />Admin panel</Link><div className="flex items-center gap-2 text-sm font-bold text-slate-700"><ShieldCheck className="h-4 w-4" />Restricted administration</div></div></header>
      <main className="section-wrapper py-8">
        <div className="flex items-center gap-2 text-brand-700"><Icon className="h-5 w-5" /><span className="text-xs font-black uppercase tracking-[.14em]">Earnova operations</span></div>
        <h1 className="mt-2 text-3xl font-extrabold text-slate-950">{domain === 'support' ? 'Support operations' : 'CA office administration'}</h1>
        <p className="mt-2 text-sm text-slate-600">{domain === 'support' ? 'Queue-aware tickets without sensitive CA document previews.' : 'Verified firms, professionals, configurable services, cases and audit controls.'}</p>

        <nav className="mt-6 flex gap-2 overflow-x-auto pb-2">
          {(domain === 'support'
            ? [['Dashboard', '/admin/support'], ['Tickets', '/admin/support/tickets'], ['Queues', '/admin/support/queues'], ['Escalations', '/admin/support/escalations'], ['Articles', '/admin/support/articles'], ['Reports', '/admin/support/reports']]
            : [['Firms', '/admin/ca/firms'], ['Professionals', '/admin/ca/professionals'], ['Verifications', '/admin/ca/verifications'], ['Services', '/admin/ca/services'], ['Cases', '/admin/ca/cases'], ['Escalations', '/admin/ca/escalations'], ['Payments', '/admin/ca/payments'], ['Reviews', '/admin/ca/reviews'], ['Audit logs', '/admin/ca/audit-logs']]
          ).map(([label, to]) => <Link key={to} to={to} className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-bold ${location.pathname === to ? 'bg-brand-700 text-white' : 'bg-white text-slate-600'}`}>{label}</Link>)}
        </nav>

        {error && <p className="mt-6 rounded-2xl bg-rose-50 p-5 font-bold text-rose-800">{error}</p>}
        {!data && !error && <div className="flex justify-center py-16"><Loader2 className="h-7 w-7 animate-spin text-brand-700" /></div>}

        {data?.metrics && (
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[['New', data.metrics.byStatus?.submitted || 0], ['Unassigned', data.metrics.unassigned || 0], ['High priority', (data.metrics.byPriority?.high || 0) + (data.metrics.byPriority?.urgent || 0)], ['Security', data.metrics.byPriority?.security_critical || 0], ['Waiting customer', data.metrics.waitingCustomer || 0]].map(([label, value]) => <div key={label} className="surface-card p-4"><p className="text-2xl font-extrabold text-slate-950">{value}</p><p className="mt-1 text-xs font-bold text-slate-500">{label}</p></div>)}
          </div>
        )}

        {data?.ticket && (
          <div className="mt-7 grid gap-5 lg:grid-cols-[1fr_360px]">
            <section className="surface-card p-6"><p className="text-xs font-bold text-brand-700">{data.ticket.ticketNumber}</p><h2 className="mt-2 text-2xl font-bold text-slate-950">{data.ticket.subject}</h2><p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-slate-600">{data.ticket.description}</p><h3 className="mt-7 font-bold text-slate-950">Customer-visible conversation</h3><div className="mt-3 space-y-3">{data.messages.map(item => <div key={item._id} className="rounded-xl bg-slate-50 p-4 text-sm text-slate-700">{item.message}</div>)}</div></section>
            <aside className="space-y-4"><div className="surface-card p-5"><p className="text-xs font-bold text-slate-400">Queue</p><p className="mt-1 font-bold capitalize text-slate-800">{statusLabel(data.ticket.supportQueue)}</p><p className="mt-4 text-xs font-bold text-slate-400">Priority</p><p className="mt-1 font-bold capitalize text-slate-800">{statusLabel(data.ticket.priority)}</p></div><div className="surface-card p-5"><h3 className="font-bold text-slate-950">Internal notes</h3><p className="mt-2 text-xs text-slate-500">These records come from a separate collection and are never included in customer ticket APIs.</p><p className="mt-3 text-sm text-slate-600">{data.internalNotes.length} internal notes</p></div></aside>
          </div>
        )}

        {records.length > 0 && (
          <div className="mt-7 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="min-w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-4 py-3">Reference</th><th className="px-4 py-3">Name / subject</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Updated</th></tr></thead><tbody className="divide-y divide-slate-100">
              {records.map(record => {
                const ref = record.ticketNumber || record.reference || record.slug || record._id
                const name = record.subject || record.displayName || record.name || record.professionalDesignation || record.serviceSlug
                return <tr key={record._id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-bold text-brand-700">{domain === 'support' && record.ticketNumber ? <Link to={`/admin/support/tickets/${record._id}`} className="hover:underline">{ref}</Link> : ref}</td>
                  <td className="px-4 py-3 font-semibold text-slate-800">{name}</td>
                  <td className="px-4 py-3 capitalize text-slate-600">{statusLabel(record.status || record.platformRole || (record.active ? 'active' : 'inactive'))}</td>
                  <td className="px-4 py-3 text-slate-500">{record.updatedAt ? formatDate(record.updatedAt) : '—'}</td>
                </tr>
              })}
            </tbody></table>
          </div>
        )}
        {data && !data.metrics && !data.ticket && !records.length && <p className="mt-7 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">No records are available for this administration view.</p>}
      </main>
    </div>
  )
}
