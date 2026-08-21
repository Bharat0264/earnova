import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useBusiness } from '../context/BusinessContext'
import { api } from '../utils/api'
import PageMeta from '../components/common/PageMeta'

const status = value => ({ ACTIVE: 'Connected', COMPLETED: 'Connected', IN_PROGRESS: 'In progress', NOT_STARTED: 'Not connected' }[value] || 'Not connected')

export default function BusinessPassportPage() {
  const { businesses, selectedBusiness, selectBusiness, loading } = useBusiness()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!selectedBusiness) return
    setData(null); setError('')
    Promise.all([
      api.get(`/businesses/${selectedBusiness._id}`),
      api.get(`/businesses/${selectedBusiness._id}/blueprint`),
      api.get(`/businesses/${selectedBusiness._id}/lifecycle`),
      api.get(`/business-modules/businesses/${selectedBusiness._id}/build-projects`),
      api.get(`/business-modules/businesses/${selectedBusiness._id}/rfqs`),
    ]).then(([business, blueprint, lifecycle, projects, rfqs]) => setData({ business: business.business, blueprint: blueprint.blueprint, lifecycle, projects: projects.projects || [], rfqs: rfqs.rfqs || [] })).catch(requestError => setError(requestError.message))
  }, [selectedBusiness])

  if (loading) return <main className="section-wrapper py-12 text-sm text-slate-600">Loading workspace…</main>
  if (!selectedBusiness) return <main className="section-wrapper py-12"><h1 className="page-title">Create your business workspace</h1><p className="page-lead mt-3">Your passport is created with your first business.</p><Link to="/start" className="btn-primary mt-6">Start a business</Link></main>
  if (error) return <main className="section-wrapper py-12"><h1 className="page-title">Unable to load business passport</h1><p className="mt-3 text-sm text-red-700">{error}</p></main>
  if (!data) return <main className="section-wrapper py-12 text-sm text-slate-600">Loading business passport…</main>

  const { business, blueprint, lifecycle, projects, rfqs } = data
  const sections = [
    ['Identity', business.industry || 'Not set', '/business/roadmap'],
    ['Products', `${lifecycle.counts?.products || 0} active inventory item(s)`, '/app/inventory'],
    ['Website', status(blueprint?.digitalPresence?.status), '/build'],
    ['Orders', `${lifecycle.counts?.orders || 0} recorded order(s)`, '/operate'],
    ['Customers', status(blueprint?.customers?.status), '/operate'],
    ['Payments', status(blueprint?.payments?.status), '/operate/status'],
    ['Inventory', `${lifecycle.counts?.products || 0} item(s)`, '/app/inventory'],
    ['Procurement', `${rfqs.length} sourcing request(s)`, '/source'],
    ['Documents', status(blueprint?.compliance?.status), '/business/roadmap'],
    ['Analytics', 'Available in your workspace', '/app/analytics'],
  ]
  return <main className="section-wrapper py-10">
    <PageMeta title="Business Passport" noIndex />
    <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="eyebrow">Earnova business passport</p><h1 className="page-title mt-2">{business.name}</h1><p className="mt-2 text-sm text-slate-600">One persistent identity connecting your blueprint, build work, sourcing and operations.</p></div>{businesses.length > 1 && <label className="form-field min-w-52">Workspace<select className="input-base" value={selectedBusiness._id} onChange={event => selectBusiness(event.target.value)}>{businesses.map(item => <option key={item._id} value={item._id}>{item.name}</option>)}</select></label>}</div>
    <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">{sections.map(([title, value, route]) => <Link key={title} to={route} className="surface-card p-4 transition hover:border-brand-300"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</p><p className="mt-2 text-sm font-bold text-slate-900">{value}</p></Link>)}</div>
    <div className="mt-6 grid gap-4 lg:grid-cols-2"><section className="surface-card p-5"><p className="eyebrow">Connected work</p><h2 className="mt-2 text-lg font-bold text-slate-950">Build and sourcing</h2><p className="mt-3 text-sm text-slate-600">{projects.length} build project(s) and {rfqs.length} sourcing request(s) are linked to this business.</p><div className="mt-4 flex gap-2"><Link className="btn-primary" to="/build">Build online</Link><Link className="btn-secondary" to="/source">Source supplies</Link></div></section><section className="surface-card p-5"><p className="eyebrow">Roadmap</p><h2 className="mt-2 text-lg font-bold text-slate-950">{lifecycle.progress || 0}% complete</h2><p className="mt-3 text-sm text-slate-600">Your setup steps are persisted with this business, not with a separate account.</p><Link className="btn-secondary mt-4" to="/start/roadmap">View roadmap</Link></section></div>
  </main>
}
