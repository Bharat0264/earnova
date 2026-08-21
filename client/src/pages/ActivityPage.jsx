import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import PageMeta from '../components/common/PageMeta'
import { useBusiness } from '../context/BusinessContext'
import { api } from '../utils/api'

export default function ActivityPage() {
  const { selectedBusiness, loading } = useBusiness()
  const [events, setEvents] = useState([])
  const [error, setError] = useState('')
  useEffect(() => {
    if (!selectedBusiness) return
    api.get(`/businesses/${selectedBusiness._id}/events`).then(data => setEvents(data.events || [])).catch(requestError => setError(requestError.message))
  }, [selectedBusiness])
  if (loading) return <main className="section-wrapper py-14 text-sm text-slate-600">Loading activity…</main>
  if (!selectedBusiness) return <main className="section-wrapper py-14"><PageMeta title="Activity" noIndex /><h1 className="page-title">Your business activity</h1><p className="page-lead mt-3">You haven’t created a business yet.</p><Link to="/business/start" className="btn-primary mt-6">Start your first business</Link></main>
  return <main className="section-wrapper max-w-4xl py-10"><PageMeta title="Activity" noIndex /><p className="eyebrow">{selectedBusiness.name}</p><h1 className="page-title mt-2">Business activity</h1><p className="mt-2 text-sm text-slate-600">Build, sourcing, operating, verification and recorded workspace updates in one feed.</p>{error && <p className="mt-4 text-sm text-red-700">{error}</p>}{!events.length ? <section className="surface-card mt-7 p-6"><h2 className="font-bold">No activity yet</h2><p className="mt-2 text-sm text-slate-600">Business updates will appear here as you build, source, and operate.</p></section> : <section className="surface-card mt-7 divide-y divide-slate-100">{events.map(event => <div key={`${event.kind}-${event._id}`} className="p-5"><p className="font-semibold text-slate-900">{event.summary || event.eventType.replaceAll('_', ' ')}</p><p className="mt-1 text-sm text-slate-500">{new Date(event.createdAt).toLocaleString()}</p></div>)}</section>}</main>
}
