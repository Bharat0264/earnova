import { useEffect, useState } from 'react'
import { Bell, Headphones, Leaf, Plus, Send } from 'lucide-react'
import { api } from '../utils/api'
import { formatMoney, rupeesToPaise } from '../utils/business'

const blankRequest = { category: 'business_consulting', title: '', requirements: '', budget: '' }
const blankEnergy = { useType: 'residential', monthlyBill: '', propertyType: '', roofAvailability: 'owned_clear', location: '', preferredContactTime: '', phone: '', estimateDisclaimerAccepted: false }
const blankTicket = { category: 'account', priority: 'normal', subject: '', description: '' }

function ServicesWorkspace() {
  const [requests, setRequests] = useState([])
  const [energy, setEnergy] = useState([])
  const [requestForm, setRequestForm] = useState(blankRequest)
  const [energyForm, setEnergyForm] = useState(blankEnergy)
  const [error, setError] = useState('')
  const load = async () => {
    try {
      const [requestData, energyData] = await Promise.all([api.get('/operations/service-requests'), api.get('/operations/energy-enquiries')])
      setRequests(requestData.requests || [])
      setEnergy(energyData.enquiries || [])
    } catch (requestError) { setError(requestError.message) }
  }
  useEffect(() => { load() }, [])
  const createRequest = async event => {
    event.preventDefault(); setError('')
    try {
      await api.post('/operations/service-requests', { ...requestForm, budgetPaise: rupeesToPaise(requestForm.budget) })
      setRequestForm(blankRequest); await load()
    } catch (requestError) { setError(requestError.message) }
  }
  const createEnergy = async event => {
    event.preventDefault(); setError('')
    try {
      await api.post('/operations/energy-enquiries', { ...energyForm, monthlyBillPaise: rupeesToPaise(energyForm.monthlyBill) })
      setEnergyForm(blankEnergy); await load()
    } catch (requestError) { setError(requestError.message) }
  }
  return <div>
    <p className="eyebrow">Operations marketplace</p><h1 className="mt-2 text-3xl font-bold text-slate-950">Services and energy requests</h1>
    <p className="mt-2 text-slate-600">Submit requirements, compare tracked proposals and follow every status without implying escrow.</p>
    {error && <p className="mt-4 rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</p>}
    <div className="mt-6 grid gap-6 xl:grid-cols-2">
      <form onSubmit={createRequest} className="surface-card p-6"><h2 className="text-xl font-bold">Request a professional</h2><div className="mt-4 space-y-3">
        <label className="form-field">Category<select className="input-base" value={requestForm.category} onChange={e => setRequestForm({ ...requestForm, category: e.target.value })}><option value="business_consulting">Business consulting</option><option value="freelancing">Freelancing</option><option value="ca_services">CA and tax support</option><option value="project_work">Project work</option></select></label>
        <label className="form-field">Title<input required className="input-base" value={requestForm.title} onChange={e => setRequestForm({ ...requestForm, title: e.target.value })} /></label>
        <label className="form-field">Requirements<textarea required className="input-base min-h-24" value={requestForm.requirements} onChange={e => setRequestForm({ ...requestForm, requirements: e.target.value })} /></label>
        <label className="form-field">Budget (₹)<input required type="number" min="0" className="input-base" value={requestForm.budget} onChange={e => setRequestForm({ ...requestForm, budget: e.target.value })} /></label>
        <button className="btn-primary"><Plus className="h-4 w-4" />Create request</button>
      </div></form>
      <form onSubmit={createEnergy} className="surface-card p-6"><h2 className="flex items-center gap-2 text-xl font-bold"><Leaf className="h-5 w-5 text-emerald-600" />Energy requirement</h2><div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="form-field">Use<select className="input-base" value={energyForm.useType} onChange={e => setEnergyForm({ ...energyForm, useType: e.target.value })}><option value="residential">Residential</option><option value="commercial">Commercial</option></select></label>
        <label className="form-field">Monthly bill (₹)<input required type="number" min="0" className="input-base" value={energyForm.monthlyBill} onChange={e => setEnergyForm({ ...energyForm, monthlyBill: e.target.value })} /></label>
        <label className="form-field">Property type<input required className="input-base" value={energyForm.propertyType} onChange={e => setEnergyForm({ ...energyForm, propertyType: e.target.value })} /></label>
        <label className="form-field">Roof<select className="input-base" value={energyForm.roofAvailability} onChange={e => setEnergyForm({ ...energyForm, roofAvailability: e.target.value })}><option value="owned_clear">Owned and clear</option><option value="owned_partial">Partially available</option><option value="rented">Rented</option><option value="unknown">Not sure</option></select></label>
        <label className="form-field">Location<input required className="input-base" value={energyForm.location} onChange={e => setEnergyForm({ ...energyForm, location: e.target.value })} /></label>
        <label className="form-field">Phone<input required className="input-base" value={energyForm.phone} onChange={e => setEnergyForm({ ...energyForm, phone: e.target.value })} /></label>
        <label className="form-field sm:col-span-2">Preferred contact time<input className="input-base" value={energyForm.preferredContactTime} onChange={e => setEnergyForm({ ...energyForm, preferredContactTime: e.target.value })} /></label>
        <label className="flex gap-2 text-sm text-slate-600 sm:col-span-2"><input required type="checkbox" checked={energyForm.estimateDisclaimerAccepted} onChange={e => setEnergyForm({ ...energyForm, estimateDisclaimerAccepted: e.target.checked })} />I understand all savings, sizing and subsidy estimates are approximate.</label>
        <button className="btn-primary sm:col-span-2">Submit energy enquiry</button>
      </div></form>
    </div>
    <section className="mt-6 surface-card p-6"><h2 className="text-xl font-bold">Current requests</h2><div className="mt-4 space-y-3">{requests.map(item => <article key={item._id} className="rounded-xl bg-slate-50 p-4"><div className="flex justify-between gap-3"><div><p className="font-bold">{item.title}</p><p className="text-sm text-slate-500">{item.category.replaceAll('_', ' ')} · {formatMoney(item.budgetPaise)}</p></div><span className="status-badge status-info">{item.status.replaceAll('_', ' ')}</span></div><p className="mt-2 text-xs text-slate-500">{item.proposals?.length || 0} proposal(s)</p></article>)}{energy.map(item => <article key={item._id} className="rounded-xl bg-emerald-50 p-4"><div className="flex justify-between"><p className="font-bold">Energy enquiry · {item.location}</p><span className="status-badge status-success">{item.status.replaceAll('_', ' ')}</span></div></article>)}{!requests.length && !energy.length && <p className="text-sm text-slate-500">No requests yet.</p>}</div></section>
  </div>
}

function NotificationsWorkspace() {
  const [data, setData] = useState([])
  const load = () => api.get('/operations/notifications').then(result => setData(result.notifications || []))
  useEffect(() => { load() }, [])
  const read = async id => { await api.patch(`/operations/notifications/${id}/read`, {}); await load() }
  return <div><p className="eyebrow">Updates</p><h1 className="mt-2 text-3xl font-bold">Notifications</h1><div className="mt-6 space-y-3">{data.map(item => <button type="button" onClick={() => read(item._id)} key={item._id} className={`block w-full rounded-2xl border p-5 text-left ${item.readAt ? 'bg-white' : 'border-brand-200 bg-brand-50'}`}><Bell className="h-5 w-5 text-brand-700" /><p className="mt-2 font-bold">{item.title}</p><p className="mt-1 text-sm text-slate-600">{item.message}</p></button>)}{!data.length && <p className="state-panel text-slate-500">No notifications yet.</p>}</div></div>
}

function SettingsWorkspace() {
  const [tickets, setTickets] = useState([])
  const [subscription, setSubscription] = useState(null)
  const [form, setForm] = useState(blankTicket)
  const load = async () => {
    const [ticketData, subscriptionData] = await Promise.all([api.get('/operations/support-tickets'), api.get('/operations/subscription')])
    setTickets(ticketData.tickets || []); setSubscription(subscriptionData.subscription)
  }
  useEffect(() => { load() }, [])
  const submit = async event => { event.preventDefault(); await api.post('/operations/support-tickets', form); setForm(blankTicket); await load() }
  return <div><p className="eyebrow">Account operations</p><h1 className="mt-2 text-3xl font-bold">Settings and support</h1><div className="mt-6 grid gap-6 xl:grid-cols-2"><section className="surface-card p-6"><h2 className="text-xl font-bold">Subscription</h2><p className="mt-3 text-sm text-slate-600">{subscription ? `${subscription.plan} · ${subscription.billingStatus || subscription.status}` : 'Starter access · no paid subscription recorded'}</p></section><form onSubmit={submit} className="surface-card p-6"><h2 className="flex items-center gap-2 text-xl font-bold"><Headphones className="h-5 w-5" />Open support ticket</h2><div className="mt-4 space-y-3"><label className="form-field">Subject<input required className="input-base" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} /></label><label className="form-field">Description<textarea required className="input-base min-h-24" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></label><button className="btn-primary"><Send className="h-4 w-4" />Submit ticket</button></div></form></div><div className="mt-6 space-y-3">{tickets.map(ticket => <article key={ticket._id} className="surface-card p-5"><div className="flex justify-between"><p className="font-bold">{ticket.ticketNumber} · {ticket.subject}</p><span className="status-badge status-info">{ticket.status.replaceAll('_', ' ')}</span></div></article>)}</div></div>
}

export default function AppOperationsPage({ module }) {
  if (module === 'notifications') return <NotificationsWorkspace />
  if (module === 'settings') return <SettingsWorkspace />
  return <ServicesWorkspace />
}
