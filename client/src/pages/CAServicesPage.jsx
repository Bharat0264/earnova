import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight, BadgeCheck, Briefcase, CalendarClock, CheckCircle2, FileLock2,
  HelpCircle, Search, ShieldCheck, UsersRound,
} from 'lucide-react'
import PageMeta from '../components/common/PageMeta'
import { api } from '../utils/api'

const PROCESS = [
  ['Choose a service', 'Review eligibility, included work, documents, pricing basis and handling-time estimate.'],
  ['Submit requirements', 'Describe the work and select an available verified partner firm when appropriate.'],
  ['Complete the next action', 'Consult, approve a quote, pay or upload documents only when the case requests it.'],
  ['Track and receive work', 'Follow case progress, respond to corrections and receive secure deliverables.'],
]

export default function CAServicesPage() {
  const [data, setData] = useState({ services: [], firms: [] })
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    Promise.all([
      api.get('/ca-office/services'),
      api.get('/ca-office/firms?limit=6'),
    ]).then(([services, firms]) => {
      if (active) setData({ services: services.services || [], firms: firms.firms || [] })
    }).catch(() => {
      if (active) setData({ services: [], firms: [] })
    }).finally(() => {
      if (active) setLoading(false)
    })
    return () => { active = false }
  }, [])

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return data.services
    return data.services.filter(service => `${service.name} ${service.category} ${service.summary}`.toLowerCase().includes(needle))
  }, [data.services, query])

  return (
    <>
      <PageMeta title="Online CA Services" path="/services/ca" />
      <section className="border-b border-slate-200 bg-[linear-gradient(125deg,#f8fafc,#f5f3ff_55%,#ecfdf5)]">
        <div className="section-wrapper grid gap-10 py-14 lg:grid-cols-[1fr_.8fr] lg:items-center lg:py-20">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-3 py-1.5 text-xs font-bold text-emerald-800">
              <ShieldCheck className="h-3.5 w-3.5" /> Firm-based professional support
            </span>
            <h1 className="mt-5 text-4xl font-extrabold tracking-[-0.035em] text-slate-950 sm:text-5xl">Your CA office, completely online.</h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-600">Consult verified professionals, securely submit documents, track your work and receive completed deliverables through Earnova.</p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <a href="#services" className="btn-primary">Find a CA service <ArrowRight className="h-4 w-4" /></a>
              <Link to="/services/ca/book-consultation" className="btn-secondary">Book a consultation</Link>
            </div>
            <p className="mt-4 text-xs leading-relaxed text-slate-500">Professional eligibility, scope and authority-dependent timelines are reviewed case by case. Earnova does not guarantee tax savings, approval or completion dates.</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5">
            <p className="text-sm font-bold text-slate-950">Find the right starting point</p>
            <div className="relative mt-3">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input value={query} onChange={event => setQuery(event.target.value)} className="input-base w-full pl-11" placeholder="Search ITR, GST, bookkeeping, registration..." />
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              {[
                [Briefcase, '15 service areas'],
                [UsersRound, 'Firm-based teams'],
                [FileLock2, 'Private document room'],
                [CalendarClock, 'Trackable next actions'],
              ].map(([Icon, label]) => (
                <div key={label} className="rounded-2xl bg-slate-50 p-4">
                  <Icon className="h-5 w-5 text-brand-700" />
                  <p className="mt-2 text-xs font-bold text-slate-700">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="services" className="section-wrapper scroll-mt-24 py-14 lg:py-18">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="eyebrow">Professional services</p><h2 className="section-title mt-2">Choose the work you need.</h2></div>
          <Link to="/services/ca/pricing" className="text-sm font-bold text-brand-700">How CA pricing works →</Link>
        </div>
        {loading ? (
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{[1, 2, 3, 4, 5, 6].map(item => <div key={item} className="h-44 animate-pulse rounded-3xl bg-slate-100" />)}</div>
        ) : (
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map(service => (
              <Link key={service.slug} to={`/services/ca/${service.slug}`} className="surface-card group flex min-h-48 flex-col p-5 hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-lg">
                <span className="text-xs font-bold uppercase tracking-[.12em] text-brand-700">{service.category}</span>
                <h3 className="mt-3 text-lg font-extrabold text-slate-950">{service.name}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">{service.summary}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-brand-700">View details <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span>
              </Link>
            ))}
          </div>
        )}
        {!loading && !filtered.length && <p className="mt-8 rounded-2xl bg-slate-50 p-6 text-center text-sm text-slate-500">No service matches that search. Try a broader term or request a consultation.</p>}
      </section>

      <section className="border-y border-slate-200 bg-slate-50">
        <div className="section-wrapper py-14 lg:py-18">
          <div className="text-center"><p className="eyebrow">How it works</p><h2 className="section-title mt-2">A clear case from request to completion.</h2></div>
          <ol className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {PROCESS.map(([title, text], index) => (
              <li key={title} className="rounded-3xl border border-slate-200 bg-white p-5">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-700 text-xs font-black text-white">{index + 1}</span>
                <h3 className="mt-4 font-bold text-slate-950">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section-wrapper grid gap-8 py-14 lg:grid-cols-[.8fr_1.2fr] lg:items-start">
        <div>
          <p className="eyebrow">Verified partner firms</p>
          <h2 className="section-title mt-2">A firm owns the case. Authorized people do the work.</h2>
          <p className="section-sub">Platform roles and professional designations are kept separate. Earnova labels a team member as a Chartered Accountant only after designation verification.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {data.firms.length ? data.firms.map(firm => (
            <Link key={firm.slug} to={`/services/ca/firm/${firm.slug}`} className="surface-card p-5 hover:border-emerald-300">
              <div className="flex items-center gap-2 text-emerald-700"><BadgeCheck className="h-4 w-4" /><span className="text-xs font-bold">Verified partner firm</span></div>
              <h3 className="mt-3 font-extrabold text-slate-950">{firm.displayName}</h3>
              <p className="mt-1 text-sm text-slate-500">{[firm.city, firm.state].filter(Boolean).join(', ') || 'Online service'}</p>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">{firm.description}</p>
            </Link>
          )) : (
            <div className="surface-card sm:col-span-2 p-6">
              <p className="font-bold text-slate-900">Firm onboarding is controlled by Earnova admin.</p>
              <p className="mt-2 text-sm text-slate-600">Only firms verified in the administration workspace appear here. No production firm is invented or auto-approved.</p>
            </div>
          )}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-slate-950 text-white">
        <div className="section-wrapper grid gap-8 py-12 lg:grid-cols-2 lg:items-center">
          <div>
            <div className="flex items-center gap-2 text-emerald-300"><FileLock2 className="h-5 w-5" /><span className="text-xs font-bold uppercase tracking-[.14em]">Document security</span></div>
            <h2 className="mt-3 text-2xl font-bold">Sensitive documents do not belong in public links.</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">The new case room stores file metadata in MongoDB and uses private object storage with short-lived authorized access. Uploads are type-checked, access-controlled and audited.</p>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2">
            {['Private delivery', 'Case ownership checks', 'Version-ready metadata', 'Security scanning state'].map(item => <li key={item} className="flex items-center gap-2 rounded-xl bg-white/5 p-3 text-sm font-semibold"><CheckCircle2 className="h-4 w-4 text-emerald-300" />{item}</li>)}
          </ul>
        </div>
      </section>

      <section className="section-wrapper py-14">
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="surface-card p-6">
            <h2 className="text-xl font-bold text-slate-950">Pricing is scoped before commitment.</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">Services may use a fixed price, a starting price, a custom quote or a recurring plan. Government fees, professional fees, Earnova fees, taxes and add-ons should be separated in the accepted quote.</p>
            <Link to="/services/ca/pricing" className="mt-5 inline-flex text-sm font-bold text-brand-700">Read pricing guidance →</Link>
          </div>
          <div className="surface-card p-6">
            <h2 className="flex items-center gap-2 text-xl font-bold text-slate-950"><HelpCircle className="h-5 w-5 text-brand-700" />Need help before starting?</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">Read common answers, understand escalation options or start a contextual support request.</p>
            <div className="mt-5 flex flex-wrap gap-3"><Link to="/services/ca/faq" className="btn-secondary">CA FAQs</Link><Link to="/help/ca" className="btn-primary">Get CA help</Link></div>
          </div>
        </div>
        <div className="mx-auto mt-10 max-w-4xl">
          <h2 className="text-center text-2xl font-bold text-slate-950">Frequently asked questions</h2>
          <div className="mt-5 space-y-3">
            {[
              ['Is a completion date guaranteed?', 'No. Earnova shows a handling-time estimate, while customer readiness, firm review and external-authority processing can change timing.'],
              ['Is every firm team member a Chartered Accountant?', 'No. Platform role and verified professional designation are separate. Only verified professional designations are shown as such.'],
              ['Where should I send tax documents?', 'Upload sensitive documents only through the authorized private case room. Do not send them through public links or ordinary email.'],
            ].map(([question, answer]) => <details key={question} className="rounded-2xl border border-slate-200 bg-white p-5"><summary className="cursor-pointer font-bold text-slate-900">{question}</summary><p className="mt-3 text-sm leading-relaxed text-slate-600">{answer}</p></details>)}
          </div>
        </div>
      </section>
    </>
  )
}
