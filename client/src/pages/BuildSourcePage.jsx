import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../utils/api'
import { useBusiness } from '../context/BusinessContext'
import PageMeta from '../components/common/PageMeta'

const BUILD_FEATURES = ['Payments', 'Customer Login', 'Admin Dashboard', 'Catalogue', 'Cart', 'Checkout', 'Orders', 'Inventory', 'Booking', 'Shipping', 'WhatsApp', 'Maps', 'Analytics', 'Blog', 'Email Notifications']

export default function BuildSourcePage({ mode }) {
  const { selectedBusiness } = useBusiness()
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const navigate = useNavigate()
  const build = mode === 'build'
  const dashboard = mode === 'build-dashboard' || mode === 'source-dashboard'
  const dashboardBuild = mode === 'build-dashboard'
  const [records, setRecords] = useState([])

  useEffect(() => {
    if (!dashboard || !selectedBusiness) return
    api.get(`/business-modules/businesses/${selectedBusiness._id}/${dashboardBuild ? 'build-projects' : 'rfqs'}`)
      .then(result => setRecords(dashboardBuild ? result.projects || [] : result.rfqs || []))
      .catch(requestError => setError(requestError.message))
  }, [dashboard, dashboardBuild, selectedBusiness])

  if (dashboard) {
    const title = dashboardBuild ? 'Build projects' : 'Sourcing requests'
    const action = dashboardBuild ? '/build/start' : '/source/request'
    if (!selectedBusiness) return <main className="section-wrapper py-12"><h1 className="page-title">Create a business workspace first</h1><p className="page-lead mt-3">Projects and sourcing requests are always connected to one business.</p><Link to="/start" className="btn-primary mt-6">Start a business</Link></main>
    return <main className="section-wrapper max-w-4xl py-12"><PageMeta title={title} noIndex /><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow">{dashboardBuild ? 'Build' : 'Source'} · {selectedBusiness.name}</p><h1 className="page-title mt-2">{title}</h1><p className="page-lead mt-3">Only records belonging to this business are shown here.</p></div><Link className="btn-primary" to={action}>{dashboardBuild ? 'New build project' : 'Create RFQ'}</Link></div>{error && <p className="mt-5 text-sm text-red-700">{error}</p>}<section className="surface-card mt-7 divide-y divide-slate-100">{records.length ? records.map(record => <div className="flex flex-wrap items-center justify-between gap-3 p-5" key={record._id}><div><h2 className="font-bold text-slate-950">{dashboardBuild ? record.projectType : record.title}</h2><p className="mt-1 text-sm text-slate-600">{dashboardBuild ? record.requirements?.businessName || selectedBusiness.name : record.category}</p></div><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{String(record.status || '').replaceAll('_', ' ')}</span>{dashboardBuild && <Link className="text-sm font-semibold text-brand-700 hover:underline" to={`/build/project/${record._id}`}>View project</Link>}</div>) : <div className="p-8 text-center"><h2 className="font-bold text-slate-800">No {dashboardBuild ? 'build projects' : 'sourcing requests'} yet</h2><p className="mt-2 text-sm text-slate-500">Create one when this business is ready.</p></div>}</section></main>
  }

  const submit = async event => {
    event.preventDefault()
    if (!selectedBusiness) return setError('Create or select a business workspace before continuing.')
    const form = new FormData(event.currentTarget)
    const payload = build
      ? { projectType: form.get('projectType'), selectedPackage: 'request_quote', requirements: { businessName: selectedBusiness.name, existingDomain: form.get('domain'), features: form.getAll('features'), notes: form.get('requirements'), budgetRange: form.get('budget'), timeline: form.get('timeline') } }
      : { title: form.get('title'), description: form.get('description'), category: form.get('category'), quantity: Number(form.get('quantity')) || undefined, unit: form.get('unit'), targetPrice: Number(form.get('targetPrice')) || undefined, requiredBy: form.get('requiredBy') || undefined, deliveryLocation: form.get('location'), notes: form.get('notes') }
    setSaving(true); setError('')
    try {
      const result = await api.post(`/business-modules/businesses/${selectedBusiness._id}/${build ? 'build-projects' : 'rfqs'}`, payload)
      navigate(build ? `/build/project/${result.project._id}` : '/operate')
    } catch (requestError) { setError(requestError.message) } finally { setSaving(false) }
  }

  return <main className="section-wrapper max-w-3xl py-12">
    <PageMeta title={build ? 'Start a build project' : 'Create sourcing request'} noIndex />
    <p className="eyebrow">{build ? 'Build' : 'Source'} · {selectedBusiness?.name || 'No workspace selected'}</p>
    <h1 className="page-title mt-2">{build ? 'Launch your business online.' : 'What does your business need?'}</h1>
    <p className="page-lead mt-3">{build ? 'Tell Earnova what you need. Your request becomes a real project in this business workspace.' : 'Create a real procurement request linked to your selected business.'}</p>
    <form onSubmit={submit} className="surface-card mt-7 grid gap-4 p-6">
      {build ? <>
        <label className="form-field">Project type<select required name="projectType" className="input-base"><option>Business Website</option><option>E-commerce Store</option><option>Restaurant Website</option><option>Booking Website</option><option>Portfolio</option><option>Startup Website</option><option>Custom Web Application</option></select></label>
        <label className="form-field">Existing domain (optional)<input name="domain" className="input-base" placeholder="example.com" /></label>
        <fieldset><legend className="text-sm font-semibold text-slate-800">Features needed</legend><div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">{BUILD_FEATURES.map(feature => <label key={feature} className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm"><input name="features" type="checkbox" value={feature} /> {feature}</label>)}</div></fieldset>
        <label className="form-field">Requirements<textarea required name="requirements" className="input-base" placeholder="Describe pages, content, integrations, and constraints." /></label>
        <div className="grid gap-4 sm:grid-cols-2"><label className="form-field">Timeline (optional)<input name="timeline" className="input-base" placeholder="For example, 4–6 weeks" /></label><label className="form-field">Budget range (optional)<input name="budget" className="input-base" placeholder="For example, ₹25,000–₹50,000" /></label></div>
      </> : <>
        <label className="form-field">Request title<input required name="title" className="input-base" placeholder="For example, 500 custom packaging boxes" /></label>
        <label className="form-field">Category<select required name="category" className="input-base"><option>Raw Materials</option><option>Packaging</option><option>Equipment</option><option>Business Supplies</option><option>Manufacturers</option><option>Wholesalers</option><option>Office</option><option>Technology</option><option>Other</option></select></label>
        <label className="form-field">What do you need?<textarea required name="description" className="input-base" placeholder="Describe specifications, quality requirements and other details." /></label>
        <div className="grid gap-4 sm:grid-cols-2"><label className="form-field">Quantity<input name="quantity" min="1" type="number" className="input-base" /></label><label className="form-field">Unit<input name="unit" className="input-base" placeholder="Boxes, kg, units…" /></label></div>
        <div className="grid gap-4 sm:grid-cols-2"><label className="form-field">Target price (optional)<input name="targetPrice" min="0" type="number" className="input-base" /></label><label className="form-field">Required by (optional)<input name="requiredBy" type="date" className="input-base" /></label></div>
        <label className="form-field">Delivery location<input name="location" className="input-base" /></label><label className="form-field">Notes (optional)<textarea name="notes" className="input-base" /></label>
      </>}
      {error && <p className="text-sm text-red-700">{error}</p>}
      <button disabled={saving || !selectedBusiness} className="btn-primary">{saving ? 'Saving…' : build ? 'Create build project' : 'Post sourcing request'}</button>
    </form>
  </main>
}
