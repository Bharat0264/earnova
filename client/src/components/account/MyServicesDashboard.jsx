import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { BarChart3, Briefcase, Code2, FileCheck2, Loader2, Package, RefreshCw, Wallet } from 'lucide-react'
import { api } from '../../utils/api'
import { formatDate, formatPrice } from '../../utils/formatters'

const badge = value => <span className="rounded-full bg-primary-50 px-2 py-1 text-[10px] font-bold uppercase text-primary-700">{String(value || 'pending').replaceAll('-', ' ')}</span>

function ServiceList({ title, Icon, items, empty, render, to }) {
  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-card">
      <div className="flex items-center justify-between gap-3 mb-4">
        <h3 className="font-display font-bold text-gray-900 flex items-center gap-2"><Icon className="w-5 h-5 text-primary-700" />{title}</h3>
        <Link to={to} className="text-xs font-bold text-primary-700 hover:underline">Open</Link>
      </div>
      {items?.length ? <div className="space-y-3">{items.slice(0, 4).map(render)}</div> : <p className="text-sm text-gray-400">{empty}</p>}
    </section>
  )
}

export default function MyServicesDashboard() {
  const [overview, setOverview] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = () => {
    setLoading(true); setError('')
    api.get('/services/me').then(data => setOverview(data.overview)).catch(err => setError(err.message)).finally(() => setLoading(false))
  }
  useEffect(load, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return <div className="py-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary-600" /></div>
  if (error) return <div className="rounded-2xl border border-red-100 bg-red-50 p-5 text-sm text-red-700">{error}<button onClick={load} className="ml-3 font-bold underline">Retry</button></div>

  const business = overview?.business || {}
  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div><p className="text-xs font-bold uppercase tracking-wider text-primary-700">Earnova account</p><h2 className="font-display text-2xl font-bold text-gray-900 mt-1">My Services</h2><p className="text-sm text-gray-500 mt-1">One place for paid services, professional work and wallet activity.</p></div>
        <button onClick={load} className="btn-secondary text-sm"><RefreshCw className="w-4 h-4" />Refresh</button>
      </div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-3">
        {[
          ['Wallet', formatPrice(overview?.walletBalance || 0), Wallet],
          ['CA jobs', overview?.caJobs?.length || 0, FileCheck2],
          ['Freelance jobs', overview?.freelanceJobs?.length || 0, Briefcase],
          ['Project purchases', overview?.projectPurchases?.length || 0, Code2],
        ].map(([label, value, Icon]) => <div key={label} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-card"><Icon className="w-5 h-5 text-primary-700" /><p className="text-xs text-gray-400 mt-3">{label}</p><p className="font-display text-2xl font-bold text-gray-900 mt-1">{value}</p></div>)}
      </div>

      <section className="rounded-2xl border border-gray-100 bg-gradient-to-r from-slate-950 to-primary-950 p-5 text-white shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div><p className="text-xs font-bold uppercase tracking-wider text-primary-200">Business Solutions</p><h3 className="font-display text-xl font-bold mt-1">{business.active ? 'Subscription active' : 'No active subscription'}</h3><p className="text-sm text-white/65 mt-1">{business.rows || 0} saved rows · {business.sourceName || 'No workspace saved'}{business.subscription?.expiresAt ? ` · Expires ${formatDate(business.subscription.expiresAt)}` : ''}</p></div>
          <Link to="/business-solutions" className="btn-primary justify-center"><BarChart3 className="w-4 h-4" />Open workspace</Link>
        </div>
      </section>

      <div className="grid xl:grid-cols-2 gap-5">
        <ServiceList title="CA Services" Icon={FileCheck2} items={overview?.caJobs} empty="No CA jobs submitted." to="/ca-services" render={job => <div key={job._id} className="flex items-center justify-between gap-3 rounded-xl bg-gray-50 p-3"><div><p className="text-sm font-bold text-gray-900">{job.serviceLabel}</p><p className="text-xs text-gray-400">{job.jobId}{job.assignedCA?.name ? ` · ${job.assignedCA.name}` : ''}</p></div>{badge(job.status)}</div>} />
        <ServiceList title="Freelancing" Icon={Briefcase} items={overview?.freelanceJobs} empty="No freelance jobs created." to="/freelance" render={job => <div key={job._id} className="flex items-center justify-between gap-3 rounded-xl bg-gray-50 p-3"><div><p className="text-sm font-bold text-gray-900">{job.title}</p><p className="text-xs text-gray-400">{job.jobId} · {job.paymentStatus}</p></div>{badge(job.status)}</div>} />
        <ServiceList title="Project purchases" Icon={Code2} items={overview?.projectPurchases} empty="No projects purchased." to="/projects" render={item => <div key={item._id} className="flex items-center justify-between gap-3 rounded-xl bg-gray-50 p-3"><div><p className="text-sm font-bold text-gray-900">{item.title}</p><p className="text-xs text-gray-400">{item.listingId} · {formatPrice(item.price)}</p></div>{badge(item.status)}</div>} />
        <ServiceList title="Recent orders" Icon={Package} items={overview?.orders} empty="No orders placed." to="/account?tab=orders" render={order => <div key={order._id} className="flex items-center justify-between gap-3 rounded-xl bg-gray-50 p-3"><div><p className="text-sm font-bold text-gray-900">{order.orderId}</p><p className="text-xs text-gray-400">{formatPrice(order.total)} · {order.paymentStatus}</p></div>{badge(order.status)}</div>} />
      </div>
    </div>
  )
}
