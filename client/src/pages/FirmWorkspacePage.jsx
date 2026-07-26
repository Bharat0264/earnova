import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Briefcase, Building2, FileSearch, Loader2, ShieldCheck, UsersRound } from 'lucide-react'
import { api } from '../utils/api'
import { formatDate } from '../utils/formatters'

const TITLES = {
  overview: ['Firm overview', 'Authorized cases, pending actions and team workload.'],
  cases: ['Firm cases', 'Only cases available under your firm role and assignment policy.'],
  clients: ['Clients', 'Customer relationships are derived from authorized firm cases.'],
  team: ['Team', 'Firm administrators allocate roles without mislabelling professional designations.'],
  tasks: ['Tasks', 'Case-linked internal task management arrives in Phase 2.'],
  documents: ['Documents', 'Private document access requires case authorization and clean scan state.'],
  consultations: ['Consultations', 'Case-linked consultation scheduling arrives in Phase 3.'],
  services: ['Firm services', 'Service availability is controlled by verified firm configuration.'],
  quotes: ['Quotes', 'Versioned quotes and renewed approval arrive in Phase 3.'],
  billing: ['Billing', 'Case payment, payout and reconciliation records arrive in Phase 3.'],
  reports: ['Reports', 'Firm-scoped operational reporting arrives in Phase 3.'],
  support: ['Firm support', 'Firm-linked support queues and escalations are controlled by assignment.'],
  settings: ['Firm settings', 'Verification and case-access policies are controlled by authorized administrators.'],
}

export default function FirmWorkspacePage({ mode = 'overview' }) {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  useEffect(() => {
    const endpoint = mode === 'cases'
      ? '/ca-office/firm/cases?limit=50'
      : mode === 'team'
        ? '/ca-office/firm/team'
        : '/ca-office/firm/dashboard'
    api.get(endpoint).then(setData).catch(err => setError(err.message))
  }, [mode])
  const [title, description] = TITLES[mode] || TITLES.overview
  const cases = data?.cases || []

  return (
    <div>
      <div className="flex items-center gap-2 text-emerald-700"><ShieldCheck className="h-5 w-5" /><span className="text-xs font-black uppercase tracking-[.14em]">Verified firm workspace</span></div>
      <h1 className="mt-2 text-3xl font-extrabold text-slate-950">{title}</h1>
      <p className="mt-2 max-w-2xl text-sm text-slate-600">{description}</p>
      {error && <div className="mt-6 rounded-2xl bg-rose-50 p-5 text-sm font-bold text-rose-800">{error}</div>}
      {!data && !error && <div className="flex justify-center py-16"><Loader2 className="h-7 w-7 animate-spin text-brand-700" /></div>}

      {data?.widgets && (
        <div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            ['New cases', data.widgets.newCases, Briefcase],
            ['Awaiting documents', data.widgets.casesAwaitingDocuments, FileSearch],
            ['Firm actions pending', data.widgets.firmActionsPending, Building2],
            ['Team size', data.widgets.teamSize, UsersRound],
            ['Documents to review', data.widgets.documentsAwaitingReview, FileSearch],
            ['Customer actions', data.widgets.customerActionsPending, UsersRound],
            ['External responses', data.widgets.externalResponsesPending, Building2],
            ['Near internal target', data.widgets.casesNearingInternalDeadlines, Briefcase],
            ['Escalated support', data.widgets.escalatedSupportIssues, ShieldCheck],
            ['Completed cases', data.widgets.completedCases, ShieldCheck],
          ].map(([label, value, Icon]) => <div key={label} className="surface-card p-4"><Icon className="h-4 w-4 text-brand-700" /><p className="mt-3 text-2xl font-extrabold text-slate-950">{value}</p><p className="mt-1 text-xs font-bold text-slate-500">{label}</p></div>)}
        </div>
      )}

      {data?.members && (
        <section className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data.members.map(member => <div key={member._id} className="surface-card p-5"><p className="font-bold text-slate-950">{member.user?.name}</p><p className="mt-1 text-sm text-slate-500">{member.user?.email}</p><p className="mt-4 text-xs font-bold capitalize text-brand-700">{member.platformRole.replaceAll('_', ' ')}</p><p className="mt-1 text-xs text-slate-500">{member.designationVerified ? member.professionalDesignation : 'Professional designation not publicly verified'}</p></div>)}
          {!data.members.length && <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-sm text-slate-500">No active firm members are available.</p>}
        </section>
      )}

      {data && !data.members && (
        <section className="mt-8">
          <h2 className="text-xl font-bold text-slate-950">{mode === 'cases' ? 'Authorized cases' : 'Recently updated cases'}</h2>
          <div className="mt-4 grid gap-4 xl:grid-cols-2">
            {cases.map(item => (
              <Link key={item._id} to={`/firm/cases/${item.reference}`} className="surface-card p-5 hover:border-brand-300">
                <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold text-brand-700">{item.reference}</p><p className="mt-2 font-bold text-slate-950">{item.service?.name}</p></div><span className="status-badge status-info capitalize">{item.status.replaceAll('_', ' ')}</span></div>
                <p className="mt-3 text-sm text-slate-600">{item.nextAction}</p>
                <p className="mt-3 text-xs text-slate-500">Updated {formatDate(item.updatedAt)}</p>
              </Link>
            ))}
            {!cases.length && <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-sm text-slate-500 xl:col-span-2">No cases are available under this firm role and assignment policy.</p>}
          </div>
        </section>
      )}
    </div>
  )
}
