import { useMemo, useState } from 'react'
import { BadgeCheck, ChevronDown, ChevronUp, FileCheck2, Link as LinkIcon, Search, UserCheck } from 'lucide-react'
import { api } from '../../utils/api'
import { formatDate, formatPrice } from '../../utils/formatters'

const PROFILE_STATUSES = ['all', 'pending', 'verified', 'paused', 'rejected']
const JOB_STATUSES = ['all', 'submitted', 'under-review', 'documents-needed', 'verified', 'filed', 'completed', 'cancelled']
const STATUS_STYLE = {
  pending: 'bg-amber-50 text-amber-700',
  verified: 'bg-eco-50 text-eco-700',
  paused: 'bg-slate-100 text-slate-700',
  rejected: 'bg-red-50 text-red-600',
  submitted: 'bg-blue-50 text-blue-700',
  'under-review': 'bg-primary-50 text-primary-700',
  'documents-needed': 'bg-orange-50 text-orange-700',
  filed: 'bg-cyan-50 text-cyan-700',
  completed: 'bg-eco-50 text-eco-700',
  cancelled: 'bg-red-50 text-red-600',
  paid: 'bg-eco-50 text-eco-700',
  'admin-waived': 'bg-primary-50 text-primary-700',
  failed: 'bg-red-50 text-red-600',
}

function Badge({ value }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${STATUS_STYLE[value] || 'bg-gray-100 text-gray-600'}`}>
      {String(value || 'unknown').replaceAll('-', ' ')}
    </span>
  )
}

function DocLink({ href, children }) {
  if (!href) return <span className="text-gray-300">Not provided</span>
  return (
    <a href={href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary-700 hover:text-primary-900 font-semibold">
      <LinkIcon className="w-3 h-3" />
      {children}
    </a>
  )
}

export default function CAWorkTable({ profiles, taxJobs, caProfiles, loadingProfiles, loadingJobs, reloadProfiles, reloadJobs }) {
  const [view, setView] = useState('jobs')
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [expanded, setExpanded] = useState(null)
  const [updating, setUpdating] = useState(null)

  const filteredProfiles = useMemo(() => {
    const query = search.trim().toLowerCase()
    return profiles.filter(profile => {
      const matchesStatus = status === 'all' || profile.status === status
      const matchesSearch = !query || [
        profile.name, profile.email, profile.whatsapp, profile.membershipNumber, profile.firmName, profile.city,
      ].filter(Boolean).some(value => String(value).toLowerCase().includes(query))
      return matchesStatus && matchesSearch
    })
  }, [profiles, search, status])

  const filteredJobs = useMemo(() => {
    const query = search.trim().toLowerCase()
    return taxJobs.filter(job => {
      const matchesStatus = status === 'all' || job.status === status
      const matchesSearch = !query || [
        job.jobId, job.clientName, job.clientEmail, job.clientWhatsapp, job.pan, job.filingType,
        job.assignedCA?.name, job.assignedCA?.membershipNumber,
      ].filter(Boolean).some(value => String(value).toLowerCase().includes(query))
      return matchesStatus && matchesSearch
    })
  }, [taxJobs, search, status])

  const updateProfile = async (id, body) => {
    setUpdating(id)
    try {
      await api.patch(`/admin/ca-profiles/${id}`, body)
      reloadProfiles?.()
    } catch (err) {
      alert(err.message)
    } finally {
      setUpdating(null)
    }
  }

  const updateJob = async (id, body) => {
    setUpdating(id)
    try {
      await api.patch(`/admin/ca-tax-jobs/${id}`, body)
      reloadJobs?.()
    } catch (err) {
      alert(err.message)
    } finally {
      setUpdating(null)
    }
  }

  const statuses = view === 'jobs' ? JOB_STATUSES : PROFILE_STATUSES
  const loading = view === 'jobs' ? loadingJobs : loadingProfiles
  const rows = view === 'jobs' ? filteredJobs : filteredProfiles

  return (
    <div className="space-y-4">
      <div className="grid lg:grid-cols-[auto_1fr_auto] gap-3 items-center">
        <div className="inline-flex bg-white border border-gray-100 rounded-2xl p-1 shadow-card">
          {[
            ['jobs', 'Tax jobs'],
            ['profiles', 'CA applicants'],
          ].map(([key, label]) => (
            <button
              key={key}
              onClick={() => { setView(key); setStatus('all'); setExpanded(null) }}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${view === key ? 'bg-primary-700 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={event => setSearch(event.target.value)}
            placeholder="Search client, CA, PAN, membership..."
            className="input-base pl-9 text-sm"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {statuses.map(item => (
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

      <div className="grid sm:grid-cols-4 gap-3">
        {[
          ['Pending CA verification', profiles.filter(profile => profile.status === 'pending').length],
          ['Verified Earnova CAs', profiles.filter(profile => profile.status === 'verified').length],
          ['Paid/active tax jobs', taxJobs.filter(job => ['paid', 'admin-waived'].includes(job.paymentStatus) && ['submitted', 'under-review', 'documents-needed', 'verified', 'filed'].includes(job.status)).length],
          ['Assigned jobs', taxJobs.filter(job => job.assignedCA).length],
        ].map(([label, value]) => (
          <div key={label} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-card">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">{label}</p>
            <p className="font-display font-bold text-2xl text-gray-900 mt-1">{loadingProfiles || loadingJobs ? '...' : value}</p>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {loading ? Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />
        )) : rows.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-2xl p-10 text-center shadow-card">
            <FileCheck2 className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <h3 className="font-display font-bold text-gray-900">No CA records found</h3>
            <p className="text-sm text-gray-500 mt-1">CA applications and client tax jobs will appear here.</p>
          </div>
        ) : view === 'profiles' ? rows.map(profile => (
          <div key={profile._id} className="bg-white border border-gray-100 rounded-2xl shadow-card overflow-hidden">
            <button onClick={() => setExpanded(expanded === profile._id ? null : profile._id)} className="w-full p-4 text-left hover:bg-gray-50/60 transition-colors">
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-display font-bold text-gray-900">{profile.name}</p>
                    <Badge value={profile.status} />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {profile.membershipNumber} · {profile.firmName || 'Independent CA'} · {profile.city}, {profile.state} · {formatDate(profile.createdAt)}
                  </p>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs lg:min-w-[560px]">
                  <div><p className="text-gray-400 font-bold">WhatsApp</p><p className="font-semibold text-gray-800 truncate">{profile.whatsapp}</p></div>
                  <div><p className="text-gray-400 font-bold">Experience</p><p className="font-semibold text-gray-800">{profile.yearsExperience || 0} years</p></div>
                  <div><p className="text-gray-400 font-bold">ID</p><p className="font-semibold text-gray-800">{profile.govtIdType}</p></div>
                  <div className="flex items-center justify-between"><div><p className="text-gray-400 font-bold">Verified by</p><p className="font-semibold text-gray-800">{profile.verifiedBy?.name || 'Pending'}</p></div>{expanded === profile._id ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}</div>
                </div>
              </div>
            </button>

            {expanded === profile._id && (
              <div className="border-t border-gray-100 p-4 space-y-4">
                <div className="grid md:grid-cols-4 gap-4 text-xs text-gray-600">
                  <div><p className="font-bold text-gray-400 mb-1">Contact</p><p className="font-semibold text-gray-800">{profile.email}</p><p>{profile.whatsapp}</p><p>{profile.phone || 'No alternate phone'}</p></div>
                  <div><p className="font-bold text-gray-400 mb-1">Practice</p><p>{profile.qualification}</p><p>{profile.firmName || 'Independent'}</p><p>{profile.city}, {profile.state}</p></div>
                  <div><p className="font-bold text-gray-400 mb-1">Proof links</p><p><DocLink href={profile.idCardUrl}>ID card</DocLink></p><p><DocLink href={profile.govtIdUrl}>Government ID</DocLink></p><p><DocLink href={profile.caCertificateUrl}>CA proof</DocLink></p><p><DocLink href={profile.practiceProofUrl}>Practice proof</DocLink></p></div>
                  <div><p className="font-bold text-gray-400 mb-1">Services</p><p>{profile.specializations?.join(', ') || 'Not provided'}</p></div>
                </div>

                <div className="grid lg:grid-cols-[1fr_1fr_auto] gap-3">
                  <label className="block">
                    <span className="block text-xs font-bold text-gray-500 mb-1.5">Admin note</span>
                    <input className="input-base py-2 text-sm" defaultValue={profile.adminNote || ''} onBlur={event => updateProfile(profile._id, { adminNote: event.target.value })} />
                  </label>
                  <label className="block">
                    <span className="block text-xs font-bold text-gray-500 mb-1.5">Verification status</span>
                    <select value={profile.status} disabled={updating === profile._id} onChange={event => updateProfile(profile._id, { status: event.target.value })} className="input-base py-2 text-sm">
                      {PROFILE_STATUSES.filter(item => item !== 'all').map(item => <option key={item} value={item}>{item.replaceAll('-', ' ')}</option>)}
                    </select>
                  </label>
                  <div className="flex items-end">
                    <div className="inline-flex items-center gap-2 rounded-xl bg-eco-50 text-eco-700 px-3 py-2 text-xs font-bold">
                      <BadgeCheck className="w-4 h-4" />
                      Manual verification
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )) : rows.map(job => {
          const assignedCA = job.assignedCA
          return (
            <div key={job._id} className="bg-white border border-gray-100 rounded-2xl shadow-card overflow-hidden">
              <button onClick={() => setExpanded(expanded === job._id ? null : job._id)} className="w-full p-4 text-left hover:bg-gray-50/60 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-display font-bold text-gray-900">{job.clientName}</p>
                      <Badge value={job.status} />
                      <Badge value={job.paymentStatus} />
                      <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full capitalize">{job.filingType?.replaceAll('-', ' ')}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {job.jobId} · PAN {job.pan} · AY {job.assessmentYear} · {formatDate(job.createdAt)}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs lg:min-w-[560px]">
                    <div><p className="text-gray-400 font-bold">Client</p><p className="font-semibold text-gray-800 truncate">{job.clientWhatsapp}</p></div>
                    <div><p className="text-gray-400 font-bold">Assigned CA</p><p className={`font-semibold truncate ${assignedCA ? 'text-eco-700' : 'text-amber-700'}`}>{assignedCA?.name || 'Not assigned'}</p></div>
                    <div><p className="text-gray-400 font-bold">CA payout</p><p className="font-semibold text-gray-900">{formatPrice(job.caPayoutAmount ?? Math.max((job.serviceAmount || 0) - 49, 0))}</p></div>
                    <div className="flex items-center justify-between"><div><p className="text-gray-400 font-bold">Documents</p><p className="font-semibold text-gray-900">{job.documents?.length || 0}</p></div>{expanded === job._id ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}</div>
                  </div>
                </div>
              </button>

              {expanded === job._id && (
                <div className="border-t border-gray-100 p-4 space-y-4">
                  <div className="grid md:grid-cols-4 gap-4 text-xs text-gray-600">
                    <div><p className="font-bold text-gray-400 mb-1">Client contact</p><p className="font-semibold text-gray-800">{job.clientName}</p><p>{job.clientEmail}</p><p>{job.clientWhatsapp}</p></div>
                    <div><p className="font-bold text-gray-400 mb-1">Tax profile</p><p>{job.clientType}</p><p>Filing: {job.filingType?.replaceAll('-', ' ')}</p><p>Income: {job.incomeSources?.join(', ') || 'Not set'}</p></div>
                    <div>
                      <p className="font-bold text-gray-400 mb-1">CA package</p>
                      <p className="font-semibold text-gray-800">{job.serviceLabel || 'Simple salaried'}</p>
                      <p>Total paid: {formatPrice(job.serviceAmount || 0)}{job.serviceAmountMax && job.serviceAmountMax !== job.serviceAmount ? `-${formatPrice(job.serviceAmountMax)}` : ''}</p>
                      <p>Earnova: {formatPrice(job.earnovaFee || 49)}</p>
                      <p>Verified CA: {formatPrice(job.caPayoutAmount ?? Math.max((job.serviceAmount || 0) - 49, 0))}{job.caPayoutAmountMax && job.caPayoutAmountMax !== job.caPayoutAmount ? `-${formatPrice(job.caPayoutAmountMax)}` : ''}</p>
                      <p>Payment: {job.paymentStatus || 'pending'}</p>
                      {job.razorpayPaymentId && <p>RZP: {job.razorpayPaymentId}</p>}
                    </div>
                    <div><p className="font-bold text-gray-400 mb-1">Amounts</p><p>Interest: {formatPrice(job.bankInterest || 0)}</p><p>Capital gains: {formatPrice(job.capitalGains || 0)}</p><p>Business: {formatPrice(job.businessIncome || 0)}</p><p>80C/80D: {formatPrice((job.deductions80C || 0) + (job.deductions80D || 0))}</p></div>
                    <div><p className="font-bold text-gray-400 mb-1">Assigned CA</p>{assignedCA ? <><p className="font-semibold text-gray-800">{assignedCA.name}</p><p>{assignedCA.membershipNumber}</p><p>{assignedCA.whatsapp}</p></> : <p className="text-amber-700 font-semibold">No CA assigned yet.</p>}</div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="bg-gray-50 border border-gray-100 rounded-xl p-3">
                      <p className="text-xs font-bold text-gray-400 mb-2">Client notes</p>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{job.notes || 'No notes provided.'}</p>
                    </div>
                    <div className="bg-gray-50 border border-gray-100 rounded-xl p-3">
                      <p className="text-xs font-bold text-gray-400 mb-2">Document links</p>
                      <div className="grid sm:grid-cols-2 gap-1.5 text-xs">
                        {(job.documents || []).length ? job.documents.map(doc => <DocLink key={`${doc.label}-${doc.url}`} href={doc.url}>{doc.label}</DocLink>) : <p className="text-gray-400">No document links submitted.</p>}
                      </div>
                    </div>
                  </div>

                  <div className="grid lg:grid-cols-[1fr_1fr_1fr] gap-3">
                    <label className="block">
                      <span className="block text-xs font-bold text-gray-500 mb-1.5">Assign verified CA</span>
                      <select value={assignedCA?._id || ''} disabled={updating === job._id} onChange={event => updateJob(job._id, { assignedCA: event.target.value || null })} className="input-base py-2 text-sm">
                        <option value="">Not assigned</option>
                        {caProfiles.map(profile => <option key={profile._id} value={profile._id}>{profile.name} · {profile.membershipNumber}</option>)}
                      </select>
                    </label>
                    <label className="block">
                      <span className="block text-xs font-bold text-gray-500 mb-1.5">Work status</span>
                      <select value={job.status} disabled={updating === job._id} onChange={event => updateJob(job._id, { status: event.target.value })} className="input-base py-2 text-sm">
                        {JOB_STATUSES.filter(item => item !== 'all').map(item => <option key={item} value={item}>{item.replaceAll('-', ' ')}</option>)}
                      </select>
                    </label>
                    <label className="block">
                      <span className="block text-xs font-bold text-gray-500 mb-1.5">Admin/CA note</span>
                      <input className="input-base py-2 text-sm" defaultValue={job.adminNote || job.caNotes || ''} onBlur={event => updateJob(job._id, { adminNote: event.target.value })} />
                    </label>
                  </div>

                  <div className="inline-flex items-center gap-2 rounded-xl bg-primary-50 text-primary-700 px-3 py-2 text-xs font-bold">
                    <UserCheck className="w-4 h-4" />
                    {assignedCA ? 'Verified CA owns this work' : 'Waiting for CA assignment'}
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
