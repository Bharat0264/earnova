import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useBusiness } from '../context/BusinessContext'
import { api } from '../utils/api'
import PageMeta from '../components/common/PageMeta'

const status = value => value === 'ACTIVE' || value === 'COMPLETED' ? 'Active' : value === 'IN_PROGRESS' ? 'In progress' : 'Not connected'

export default function OperatePage() {
  const { businesses, selectedBusiness, selectBusiness, loading } = useBusiness()
  const [data, setData] = useState({})
  useEffect(() => {
    if (!selectedBusiness) return
    Promise.all([
      api.get(`/businesses/${selectedBusiness._id}/lifecycle`), api.get(`/businesses/${selectedBusiness._id}/blueprint`), api.get(`/businesses/${selectedBusiness._id}/events`),
      api.get(`/business-modules/businesses/${selectedBusiness._id}/build-projects`), api.get(`/business-modules/businesses/${selectedBusiness._id}/rfqs`),
    ]).then(([lifecycle, blueprint, events, projects, rfqs]) => setData({ lifecycle, blueprint, events, projects, rfqs })).catch(() => setData({}))
  }, [selectedBusiness])
  if (loading) return <main className="section-wrapper py-16">Loading workspace…</main>
  if (!selectedBusiness) return <main className="section-wrapper py-16"><h1 className="page-title">Start your first business.</h1><Link className="btn-primary mt-6" to="/business/start">Start</Link></main>
  const lifecycle = data.lifecycle || {}
  return <main className="section-wrapper py-8"><PageMeta title="Operate" noIndex />
    <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="eyebrow">Operate</p><h1 className="text-3xl font-bold text-slate-950">{selectedBusiness.name}</h1><p className="text-sm text-slate-500">{selectedBusiness.stage} · {lifecycle.progress || 0}% roadmap complete</p></div>{businesses.length > 1 && <select className="input-base w-auto" value={selectedBusiness._id} onChange={event => selectBusiness(event.target.value)}>{businesses.map(business => <option key={business._id} value={business._id}>{business.name}</option>)}</select>}</div>
    <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{[['Revenue', 'Not connected yet'], ['Orders', lifecycle.counts?.orders ?? 0], ['Customers', 'Not connected yet'], ['Products', lifecycle.counts?.products ?? 0]].map(([label, value]) => <section className="surface-card p-4" key={label}><p className="text-xs text-slate-500">{label}</p><p className="mt-2 text-xl font-bold">{value}</p></section>)}</div>
    <div className="mt-5 grid gap-5 lg:grid-cols-[1.2fr_.8fr]"><section className="surface-card p-5"><h2 className="font-bold">Business status</h2>{[['Digital Presence', lifecycle.state?.website], ['Payments', lifecycle.state?.payments], ['Products', lifecycle.state?.catalog], ['Marketing', lifecycle.state?.marketing]].map(([label, value]) => <div key={label} className="flex justify-between border-b py-3 text-sm"><span>{label}</span><span className="font-semibold text-slate-600">{status(value)}</span></div>)}<Link to="/business/roadmap" className="btn-secondary mt-5">View roadmap</Link></section><aside className="surface-card p-5"><p className="eyebrow">Needs attention</p><h2 className="mt-2 font-bold">{lifecycle.recommendation?.title || 'Create your roadmap'}</h2><p className="mt-2 text-sm text-slate-600">{lifecycle.recommendation?.reason || 'Set up your business context to receive a next step.'}</p><div className="mt-5 flex flex-wrap gap-2"><Link className="btn-primary" to="/build/start">Manage website</Link><Link className="btn-secondary" to="/source/request">Source supplies</Link></div></aside></div>
    <section className="surface-card mt-5 p-5"><h2 className="font-bold">Connected work</h2><p className="mt-2 text-sm text-slate-600">{data.projects?.projects?.length || 0} build project(s) · {data.rfqs?.rfqs?.length || 0} sourcing request(s)</p></section>
    <section className="surface-card mt-5 p-5"><h2 className="font-bold">Recent activity</h2>{data.events?.events?.length ? <div className="mt-3 space-y-3">{data.events.events.map(event => <div key={event._id} className="border-b pb-3 text-sm"><b>{event.eventType.replaceAll('_', ' ')}</b><span className="ml-2 text-slate-500">{new Date(event.createdAt).toLocaleDateString()}</span></div>)}</div> : <p className="mt-3 text-sm text-slate-500">No activity yet. Your business updates will appear here.</p>}</section>
  </main>
}
