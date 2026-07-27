import { useEffect, useState } from 'react'
import { api } from '../utils/api'
import { formatMoney, rupeesToPaise } from '../utils/business'
import { useAuth } from '../context/AuthContext'

const profileDefaults = { title: '', description: '', skills: '', categories: '', location: '', pricingMethod: 'quote', startingPrice: '', experienceYears: '0', availability: 'available' }

export default function PartnerPage({ title }) {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [requests, setRequests] = useState([])
  const [form, setForm] = useState(profileDefaults)
  const [proposal, setProposal] = useState({})
  const [message, setMessage] = useState('')

  const load = async () => {
    const [profileData, requestData] = await Promise.all([api.get('/operations/provider-profile'), api.get('/operations/service-requests?view=provider')])
    setProfile(profileData.profile)
    setRequests(requestData.requests || [])
    if (profileData.profile) setForm({
      title: profileData.profile.title || '', description: profileData.profile.description || '',
      skills: (profileData.profile.skills || []).join(', '), categories: (profileData.profile.categories || []).join(', '),
      location: profileData.profile.location || '', pricingMethod: profileData.profile.pricingMethod || 'quote',
      startingPrice: (profileData.profile.startingPricePaise || 0) / 100, experienceYears: profileData.profile.experienceYears || 0,
      availability: profileData.profile.availability || 'available',
    })
  }
  useEffect(() => { load().catch(error => setMessage(error.message)) }, [])

  const save = async event => {
    event.preventDefault()
    const typeMap = { product_seller: 'project_seller' }
    const data = await api.put('/operations/provider-profile', {
      ...form, providerType: typeMap[user?.accountType] || user?.accountType,
      skills: form.skills.split(',').map(value => value.trim()).filter(Boolean),
      categories: form.categories.split(',').map(value => value.trim()).filter(Boolean),
      startingPricePaise: rupeesToPaise(form.startingPrice),
    })
    setProfile(data.profile); setMessage('Profile submitted for verification.')
  }

  const submitProposal = async requestId => {
    const current = proposal[requestId] || {}
    await api.post(`/operations/service-requests/${requestId}/proposals`, {
      message: current.message, amountPaise: rupeesToPaise(current.amount), deliveryDays: Number(current.deliveryDays),
    })
    setMessage('Proposal submitted.'); await load()
  }

  if (title !== 'Overview' && title !== 'Requests' && title !== 'Settings') {
    const filtered = requests.filter(request => title === 'Reviews' ? request.review?.rating : title === 'Earnings' ? request.status === 'completed' : true)
    return <div><p className="eyebrow">Partner operations</p><h1 className="mt-2 text-3xl font-bold">{title}</h1><div className="mt-6 space-y-3">{filtered.map(request => <article className="surface-card p-5" key={request._id}><p className="font-bold">{request.title}</p><p className="mt-1 text-sm text-slate-500">{request.status.replaceAll('_', ' ')} · {formatMoney(request.budgetPaise)}</p></article>)}{!filtered.length && <p className="state-panel text-slate-500">No {title.toLowerCase()} yet.</p>}</div></div>
  }

  return <div><p className="eyebrow">Partner workspace</p><h1 className="mt-2 text-3xl font-bold">{title}</h1>{message && <p className="mt-4 rounded-xl bg-brand-50 p-4 text-sm font-semibold text-brand-800">{message}</p>}
    {user?.accountType === 'ca_consultant' && profile?.verificationStatus !== 'verified' && <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5"><p className="font-bold text-amber-950">{profile ? 'Admin approval pending' : 'Complete your CA profile'}</p><p className="mt-1 text-sm leading-6 text-amber-800">{profile ? 'Earnova admin is reviewing your professional details. Work and proposals will become available after approval.' : 'Submit the professional profile below. It will be sent to the admin for review before you can accept work.'}</p></div>}
    {(title === 'Overview' || title === 'Settings') && <form onSubmit={save} className="mt-6 surface-card p-6"><div className="flex justify-between gap-3"><h2 className="text-xl font-bold">Provider profile</h2><span className="status-badge status-info">{profile?.verificationStatus || 'not submitted'}</span></div><div className="mt-4 grid gap-3 sm:grid-cols-2">
      <label className="form-field">Professional title<input required className="input-base" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></label>
      <label className="form-field">Location<input className="input-base" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} /></label>
      <label className="form-field sm:col-span-2">Description<textarea required className="input-base min-h-24" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></label>
      <label className="form-field">Skills, comma separated<input className="input-base" value={form.skills} onChange={e => setForm({ ...form, skills: e.target.value })} /></label>
      <label className="form-field">Categories, comma separated<input className="input-base" value={form.categories} onChange={e => setForm({ ...form, categories: e.target.value })} /></label>
      <label className="form-field">Starting price (₹)<input type="number" min="0" className="input-base" value={form.startingPrice} onChange={e => setForm({ ...form, startingPrice: e.target.value })} /></label>
      <label className="form-field">Experience years<input type="number" min="0" className="input-base" value={form.experienceYears} onChange={e => setForm({ ...form, experienceYears: e.target.value })} /></label>
      <button className="btn-primary sm:col-span-2">Save and request verification</button>
    </div></form>}
    {(title === 'Overview' || title === 'Requests') && <section className="mt-6"><h2 className="text-xl font-bold">Available and assigned requests</h2><div className="mt-4 space-y-4">{requests.map(request => <article className="surface-card p-5" key={request._id}><div className="flex justify-between"><div><p className="font-bold">{request.title}</p><p className="text-sm text-slate-500">{request.category.replaceAll('_', ' ')} · {formatMoney(request.budgetPaise)}</p></div><span className="status-badge status-info">{request.status.replaceAll('_', ' ')}</span></div>{profile?.verificationStatus === 'verified' && ['open', 'proposal_received'].includes(request.status) && !request.proposals?.some(item => item.provider?._id === profile._id) && <div className="mt-4 grid gap-2 sm:grid-cols-3"><input className="input-base" placeholder="Proposal message" value={proposal[request._id]?.message || ''} onChange={e => setProposal({ ...proposal, [request._id]: { ...proposal[request._id], message: e.target.value } })} /><input className="input-base" type="number" placeholder="Amount ₹" value={proposal[request._id]?.amount || ''} onChange={e => setProposal({ ...proposal, [request._id]: { ...proposal[request._id], amount: e.target.value } })} /><div className="flex gap-2"><input className="input-base" type="number" placeholder="Days" value={proposal[request._id]?.deliveryDays || ''} onChange={e => setProposal({ ...proposal, [request._id]: { ...proposal[request._id], deliveryDays: e.target.value } })} /><button type="button" className="btn-primary" onClick={() => submitProposal(request._id)}>Send</button></div></div>}</article>)}{!requests.length && <p className="state-panel text-slate-500">No matching requests yet.</p>}</div></section>}
  </div>
}
