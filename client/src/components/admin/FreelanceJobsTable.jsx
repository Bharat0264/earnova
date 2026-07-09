import { useMemo, useState } from 'react'
import { Briefcase, ChevronDown, ChevronUp, Search, UserCheck } from 'lucide-react'
import { api } from '../../utils/api'
import { formatDate, formatPrice } from '../../utils/formatters'

const STATUS_OPTIONS = ['all', 'awaiting-payment', 'open', 'in-progress', 'submitted', 'completed', 'cancelled', 'disputed']
const STATUS_STYLE = {
  'awaiting-payment': 'bg-amber-50 text-amber-700',
  open: 'bg-blue-50 text-blue-700',
  'in-progress': 'bg-primary-50 text-primary-700',
  submitted: 'bg-cyan-50 text-cyan-700',
  completed: 'bg-eco-50 text-eco-700',
  cancelled: 'bg-red-50 text-red-600',
  disputed: 'bg-orange-50 text-orange-700',
}
const PAYMENT_STYLE = {
  pending: 'bg-amber-50 text-amber-700',
  'paid-to-escrow': 'bg-eco-50 text-eco-700',
  'admin-waived': 'bg-violet-50 text-violet-700',
  released: 'bg-slate-100 text-slate-700',
  refunded: 'bg-red-50 text-red-600',
}

function Badge({ value, styles }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${styles[value] || 'bg-gray-100 text-gray-600'}`}>
      {String(value || 'unknown').replaceAll('-', ' ')}
    </span>
  )
}

export default function FreelanceJobsTable({ data, freelancers = [], loading, reload }) {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [expanded, setExpanded] = useState(null)
  const [updating, setUpdating] = useState(null)

  const filtered = useMemo(() => data.filter(job => {
    const query = search.trim().toLowerCase()
    const matchesStatus = status === 'all' || job.status === status
    const matchesSearch = !query || [
      job.jobId, job.title, job.clientName, job.clientEmail, job.category,
      job.assignedFreelancer?.name, job.assignedFreelancer?.email,
    ].filter(Boolean).some(value => String(value).toLowerCase().includes(query))
    return matchesStatus && matchesSearch
  }), [data, search, status])

  const updateJob = async (jobId, body) => {
    setUpdating(jobId)
    try {
      await api.patch(`/admin/freelance-jobs/${jobId}`, body)
      reload?.()
    } catch (err) {
      alert(err.message)
    } finally {
      setUpdating(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid lg:grid-cols-[1fr_auto] gap-3">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={event => setSearch(event.target.value)}
            placeholder="Search job, client, freelancer..."
            className="input-base pl-9 text-sm"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {STATUS_OPTIONS.map(item => (
            <button
              key={item}
              onClick={() => setStatus(item)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all capitalize ${
                status === item ? 'bg-primary-700 text-white border-primary-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              {item.replaceAll('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-3">
        {[
          ['Active jobs', data.filter(job => ['open', 'in-progress', 'submitted'].includes(job.status)).length],
          ['Assigned work', data.filter(job => job.assignedFreelancer).length],
          ['Unassigned open', data.filter(job => job.status === 'open' && !job.assignedFreelancer).length],
        ].map(([label, value]) => (
          <div key={label} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-card">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">{label}</p>
            <p className="font-display font-bold text-2xl text-gray-900 mt-1">{loading ? '...' : value}</p>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {loading ? Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />
        )) : filtered.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-2xl p-10 text-center shadow-card">
            <Briefcase className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <h3 className="font-display font-bold text-gray-900">No freelance jobs found</h3>
            <p className="text-sm text-gray-500 mt-1">Jobs created on the freelance page will appear here.</p>
          </div>
        ) : filtered.map(job => {
          const freelancer = job.assignedFreelancer
          return (
            <div key={job._id} className="bg-white border border-gray-100 rounded-2xl shadow-card overflow-hidden">
              <button
                onClick={() => setExpanded(expanded === job._id ? null : job._id)}
                className="w-full p-4 text-left hover:bg-gray-50/60 transition-colors"
              >
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-display font-bold text-gray-900">{job.title}</p>
                      <Badge value={job.status} styles={STATUS_STYLE} />
                      <Badge value={job.paymentStatus} styles={PAYMENT_STYLE} />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {job.jobId} · {job.category} · {formatDate(job.createdAt)}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs lg:min-w-[560px]">
                    <div>
                      <p className="text-gray-400 font-bold">Client</p>
                      <p className="font-semibold text-gray-800 truncate">{job.clientName}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 font-bold">Taken by</p>
                      <p className={`font-semibold truncate ${freelancer ? 'text-eco-700' : 'text-amber-700'}`}>
                        {freelancer?.name || 'Not assigned'}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 font-bold">Freelancer amount</p>
                      <p className="font-semibold text-gray-900">{formatPrice(job.freelancerAmount)}</p>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="text-gray-400 font-bold">Payable</p>
                        <p className="font-semibold text-gray-900">{formatPrice(job.totalPayable)}</p>
                      </div>
                      {expanded === job._id ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                    </div>
                  </div>
                </div>
              </button>

              {expanded === job._id && (
                <div className="border-t border-gray-100 p-4 space-y-4">
                  <div className="grid md:grid-cols-4 gap-4 text-xs text-gray-600">
                    <div>
                      <p className="font-bold text-gray-400 mb-1">Client contact</p>
                      <p className="font-semibold text-gray-800">{job.clientName}</p>
                      <p>{job.clientEmail}</p>
                      <p>{job.clientWhatsapp}</p>
                    </div>
                    <div>
                      <p className="font-bold text-gray-400 mb-1">Assigned freelancer</p>
                      {freelancer ? (
                        <>
                          <p className="font-semibold text-gray-800">{freelancer.name}</p>
                          <p>{freelancer.title}</p>
                          <p>{freelancer.email}</p>
                          <p>{freelancer.whatsapp || freelancer.phone}</p>
                        </>
                      ) : <p className="text-amber-700 font-semibold">No freelancer has taken this work yet.</p>}
                    </div>
                    <div>
                      <p className="font-bold text-gray-400 mb-1">Money</p>
                      <p>Freelancer: {formatPrice(job.freelancerAmount)}</p>
                      <p>Earnova fee: {formatPrice(job.serviceFee)} ({job.serviceFeeRate}%)</p>
                      <p>Total: {formatPrice(job.totalPayable)}</p>
                    </div>
                    <div>
                      <p className="font-bold text-gray-400 mb-1">Timeline</p>
                      <p>Duration: {job.duration}</p>
                      <p>Deadline: {job.deadline ? formatDate(job.deadline) : 'Not set'}</p>
                      <p>Mode: {job.workMode}</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 border border-gray-100 rounded-xl p-3">
                    <p className="text-xs font-bold text-gray-400 mb-1">Work description</p>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{job.description}</p>
                    {job.skills?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {job.skills.map(skill => <span key={skill} className="text-[10px] font-bold bg-white border border-gray-100 text-gray-600 px-2 py-1 rounded-full">{skill}</span>)}
                      </div>
                    )}
                  </div>

                  <div className="grid lg:grid-cols-[1fr_1fr_auto] gap-3">
                    <label className="block">
                      <span className="block text-xs font-bold text-gray-500 mb-1.5">Assign / taken by freelancer</span>
                      <select
                        value={freelancer?._id || ''}
                        disabled={updating === job._id}
                        onChange={event => updateJob(job._id, { assignedFreelancer: event.target.value || null })}
                        className="input-base py-2 text-sm"
                      >
                        <option value="">Not assigned</option>
                        {freelancers.map(profile => (
                          <option key={profile._id} value={profile._id}>
                            {profile.name} · {profile.title} · {profile.status}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="block">
                      <span className="block text-xs font-bold text-gray-500 mb-1.5">Job status</span>
                      <select
                        value={job.status}
                        disabled={updating === job._id}
                        onChange={event => updateJob(job._id, { status: event.target.value })}
                        className="input-base py-2 text-sm"
                      >
                        {STATUS_OPTIONS.filter(item => item !== 'all').map(item => (
                          <option key={item} value={item}>{item.replaceAll('-', ' ')}</option>
                        ))}
                      </select>
                    </label>
                    <div className="flex items-end">
                      <div className="inline-flex items-center gap-2 rounded-xl bg-eco-50 text-eco-700 px-3 py-2 text-xs font-bold">
                        <UserCheck className="w-4 h-4" />
                        {freelancer ? 'Work owner visible' : 'Waiting assignment'}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
