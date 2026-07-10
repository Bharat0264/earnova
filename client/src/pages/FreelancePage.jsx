import { useEffect, useMemo, useState } from 'react'
import {
  ArrowRight, BadgeCheck, Briefcase, CheckCircle2, CircleDollarSign,
  Clock3, IndianRupee, Loader2, LockKeyhole, Mail, MapPin, MessageCircle,
  ShieldCheck, Sparkles, UserRoundSearch, WalletCards,
} from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { api } from '../utils/api'
import { useAuth } from '../context/AuthContext'
import AuthModal from '../components/auth/AuthModal'
import { loadRazorpayScript } from '../components/checkout/ReviewStep'

const CATEGORIES = [
  'Web & App Development', 'Graphic Design', 'Digital Marketing', 'Writing & Translation',
  'Video & Animation', 'Data & AI', 'Accounting & Finance', 'Business Support', 'Other',
]

const inputClass = 'input-base bg-white'
const DEFAULT_SERVICE_FEE_RATE = 10
const HIGH_VALUE_SERVICE_FEE_RATE = 1.5
const HIGH_VALUE_SERVICE_FEE_THRESHOLD = 2500
const getServiceFeeRate = amount =>
  Number(amount) > HIGH_VALUE_SERVICE_FEE_THRESHOLD ? HIGH_VALUE_SERVICE_FEE_RATE : DEFAULT_SERVICE_FEE_RATE

const initialJob = {
  clientName: '', clientEmail: '', clientWhatsapp: '', company: '',
  title: '', category: '', description: '', skills: '', duration: '',
  deadline: '', workMode: 'remote', freelancerAmount: '',
}
const initialProfile = {
  name: '', email: '', whatsapp: '', phone: '', city: '', title: '',
  bio: '', skills: '', experience: '', hourlyRate: '', portfolio: '',
  availability: 'available-now',
}

function Field({ label, required, hint, children }) {
  return (
    <label className="block">
      <span className="block text-sm font-bold text-slate-800 mb-1.5">
        {label}{required && <span className="text-violet-600"> *</span>}
      </span>
      {children}
      {hint && <span className="block text-xs text-slate-500 mt-1.5">{hint}</span>}
    </label>
  )
}

function FlowCard({ number, icon: Icon, title, text }) {
  return (
    <div className="relative min-w-0 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.07] p-5">
      <span className="absolute right-4 top-3 text-5xl font-black text-white/[0.05]">{number}</span>
      <div className="w-11 h-11 rounded-2xl bg-violet-400/15 flex items-center justify-center mb-4">
        <Icon className="w-5 h-5 text-violet-200" />
      </div>
      <h3 className="font-display font-bold text-white">{title}</h3>
      <p className="text-sm text-slate-400 mt-2 leading-relaxed">{text}</p>
    </div>
  )
}

function PricingSummary({ amount, paymentExempt = false }) {
  const base = Number(amount) || 0
  const rate = paymentExempt ? 0 : getServiceFeeRate(base)
  const fee = paymentExempt ? 0 : Math.round(base * rate / 100)
  const initialPayment = paymentExempt ? 0 : base + fee
  const feeLabel = paymentExempt ? 'Admin service fee' : `Earnova service fee (${rate}%)`
  const totalLabel = paymentExempt ? 'Admin payment required' : 'You fund initially'
  const note = paymentExempt
    ? 'Admin-created freelance jobs are published without Razorpay escrow payment.'
    : base > HIGH_VALUE_SERVICE_FEE_THRESHOLD
      ? 'Earnova securely holds the funds. Jobs above ₹2,500 use only 1.5% Earnova commission.'
      : 'Earnova securely holds the funds. Jobs above ₹2,500 get reduced 1.5% Earnova commission.'
  return (
    <div className="rounded-2xl bg-slate-950 text-white p-5 space-y-3">
      <div className="flex items-center justify-between text-sm text-slate-300">
        <span>Freelancer receives</span><strong className="text-white">₹{base.toLocaleString('en-IN')}</strong>
      </div>
      <div className="flex items-center justify-between text-sm text-slate-300">
        <span>{feeLabel}</span><strong className="text-violet-300">₹{fee.toLocaleString('en-IN')}</strong>
      </div>
      <div className="h-px bg-white/10" />
      <div className="flex items-center justify-between">
        <span className="font-bold">{totalLabel}</span>
        <strong className="font-display text-xl">₹{initialPayment.toLocaleString('en-IN')}</strong>
      </div>
      <p className="text-xs text-slate-400 leading-relaxed">
        {note}
      </p>
    </div>
  )
}

function JobLinkView({ jobId, isAuthenticated, requireAuth }) {
  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!jobId || !isAuthenticated) return
    setLoading(true)
    setError('')
    api.get(`/freelance/jobs/${jobId}`)
      .then(data => setJob(data.job))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [jobId, isAuthenticated])

  if (!jobId) return null

  if (!isAuthenticated) {
    return (
      <div className="bg-white rounded-[2rem] border border-violet-100 shadow-card p-6 sm:p-8 mb-8">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">Freelance job link</p>
        <h2 className="font-display text-2xl font-bold text-slate-950 mt-2">Sign in to view this job</h2>
        <p className="text-slate-500 mt-2">This job link was sent to registered Earnova users. Log in to view the full job details.</p>
        <button onClick={requireAuth} className="btn-primary mt-5">Sign in and view job</button>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-[2rem] border border-violet-100 shadow-card p-6 sm:p-8 mb-8">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">Freelance job link</p>
      {loading ? (
        <div className="h-28 bg-slate-100 rounded-2xl animate-pulse mt-4" />
      ) : error ? (
        <p className="rounded-xl bg-red-50 p-3 text-sm text-red-600 mt-4">{error}</p>
      ) : job ? (
        <div className="mt-3 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-950">{job.title}</h2>
                <span className="rounded-full bg-emerald-50 text-emerald-700 px-2.5 py-1 text-xs font-bold capitalize">{job.status}</span>
              </div>
              <p className="text-sm text-slate-500 mt-1">{job.jobId} · {job.category} · {job.workMode}</p>
            </div>
            <div className="rounded-2xl bg-slate-950 text-white px-4 py-3">
              <p className="text-xs text-slate-300">Freelancer payout</p>
              <p className="font-display font-bold text-xl">₹{(job.freelancerAmount || 0).toLocaleString('en-IN')}</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-3 text-sm">
            <div className="rounded-2xl bg-slate-50 p-4">
              <Clock3 className="w-4 h-4 text-violet-700 mb-2" />
              <p className="font-bold text-slate-900">Duration</p>
              <p className="text-slate-500">{job.duration || 'Not specified'}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <MapPin className="w-4 h-4 text-violet-700 mb-2" />
              <p className="font-bold text-slate-900">Mode</p>
              <p className="text-slate-500 capitalize">{job.workMode || 'remote'}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <Mail className="w-4 h-4 text-violet-700 mb-2" />
              <p className="font-bold text-slate-900">Client</p>
              <p className="text-slate-500">{job.clientName}</p>
            </div>
          </div>

          <div>
            <p className="font-display font-bold text-slate-950 mb-2">Work details</p>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{job.description}</p>
          </div>

          {(job.skills || []).length > 0 && (
            <div>
              <p className="font-display font-bold text-slate-950 mb-2">Skills</p>
              <div className="flex flex-wrap gap-2">
                {job.skills.map(skill => <span key={skill} className="rounded-full bg-violet-50 text-violet-700 px-3 py-1 text-xs font-bold">{skill}</span>)}
              </div>
            </div>
          )}

          <div className="rounded-2xl bg-violet-50 border border-violet-100 p-4 text-sm text-violet-950">
            Contact Earnova/admin to be assigned to this work after your freelancer profile is verified.
          </div>
        </div>
      ) : null}
    </div>
  )
}

function HireForm({ user, requireAuth, isAdmin = false }) {
  const [form, setForm] = useState(() => ({
    ...initialJob,
    clientName: user?.name || '',
    clientEmail: user?.email || '',
    clientWhatsapp: user?.phone || '',
  }))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [createdJob, setCreatedJob] = useState(null)
  const [funded, setFunded] = useState(false)

  useEffect(() => {
    setForm(current => ({
      ...current,
      clientName: current.clientName || user?.name || '',
      clientEmail: current.clientEmail || user?.email || '',
      clientWhatsapp: current.clientWhatsapp || user?.phone || '',
    }))
  }, [user])

  const set = key => event => setForm(value => ({ ...value, [key]: event.target.value }))

  const submit = async event => {
    event.preventDefault()
    if (!user) return requireAuth()
    setLoading(true)
    setError('')
    try {
      const data = await api.post('/freelance/jobs', form)
      setCreatedJob(data.job)
      if (data.job?.paymentStatus === 'admin-waived' || data.job?.status === 'open') setFunded(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fundJob = async () => {
    setLoading(true)
    setError('')
    try {
      const loaded = await loadRazorpayScript()
      if (!loaded) throw new Error('Razorpay could not load. Please check your connection.')
      const payment = await api.post(`/freelance/jobs/${createdJob._id}/payment-order`, {})
      await new Promise((resolve, reject) => {
        const checkout = new window.Razorpay({
          key: payment.keyId,
          amount: payment.amount,
          currency: payment.currency,
          name: 'Earnova Freelancing',
          description: `Escrow funding for ${createdJob.jobId}`,
          order_id: payment.orderId,
          prefill: { name: form.clientName, email: form.clientEmail, contact: form.clientWhatsapp },
          theme: { color: '#6d28d9' },
          handler: async response => {
            try {
              await api.post(`/freelance/jobs/${createdJob._id}/verify-payment`, {
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              })
              setFunded(true)
              resolve()
            } catch (err) {
              reject(err)
            }
          },
          modal: { ondismiss: resolve },
        })
        checkout.open()
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (funded) return (
    <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-8 text-center">
      <CheckCircle2 className="w-14 h-14 text-emerald-600 mx-auto mb-4" />
      <h2 className="font-display text-2xl font-bold text-slate-950">
        {isAdmin ? 'Admin job published' : 'Job funded and published'}
      </h2>
      <p className="text-slate-600 mt-2">
        {isAdmin
          ? 'No payment was requested because this job was created by an admin.'
          : 'Your money is now protected in Earnova escrow until the work is completed.'}
      </p>
    </div>
  )

  if (createdJob) return (
    <div className="space-y-5">
      <div className="rounded-3xl border border-violet-200 bg-violet-50 p-6">
        <BadgeCheck className="w-10 h-10 text-violet-700 mb-3" />
        <p className="text-xs font-bold uppercase tracking-widest text-violet-700">Job draft created</p>
        <h2 className="font-display text-2xl font-bold text-slate-950 mt-1">{createdJob.title}</h2>
        <p className="text-slate-600 text-sm mt-2">Reference: {createdJob.jobId}</p>
      </div>
      <PricingSummary amount={createdJob.freelancerAmount} paymentExempt={isAdmin || createdJob.paymentStatus === 'admin-waived'} />
      {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-600">{error}</p>}
      {isAdmin || createdJob.paymentStatus === 'admin-waived' ? (
        <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-4 text-sm font-semibold text-emerald-700">
          Admin-created jobs are already live. Razorpay payment is skipped.
        </div>
      ) : (
        <button onClick={fundJob} disabled={loading} className="btn-primary w-full py-4">
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <LockKeyhole className="w-5 h-5" />}
          Pay securely and publish job
        </button>
      )}
    </div>
  )

  return (
    <form onSubmit={submit} className="space-y-6">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">Hire with confidence</p>
        <h2 className="font-display text-3xl font-bold text-slate-950 mt-2">Tell us what you need</h2>
        <p className="text-slate-500 mt-2">Clear details help Earnova connect you with the right freelancer.</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Your name" required><input className={inputClass} value={form.clientName} onChange={set('clientName')} required /></Field>
        <Field label="Email" required><input type="email" className={inputClass} value={form.clientEmail} onChange={set('clientEmail')} required /></Field>
        <Field label="WhatsApp number" required><input type="tel" className={inputClass} value={form.clientWhatsapp} onChange={set('clientWhatsapp')} placeholder="9876543210" required /></Field>
        <Field label="Company / team"><input className={inputClass} value={form.company} onChange={set('company')} placeholder="Optional" /></Field>
      </div>

      <div className="h-px bg-slate-100" />
      <Field label="Job title" required><input className={inputClass} value={form.title} onChange={set('title')} placeholder="e.g. Build a modern business website" required /></Field>
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Category" required>
          <select className={inputClass} value={form.category} onChange={set('category')} required>
            <option value="">Select category</option>
            {CATEGORIES.map(category => <option key={category}>{category}</option>)}
          </select>
        </Field>
        <Field label="Work mode" required>
          <select className={inputClass} value={form.workMode} onChange={set('workMode')}>
            <option value="remote">Remote</option><option value="onsite">On-site</option><option value="hybrid">Hybrid</option>
          </select>
        </Field>
      </div>
      <Field label="Work description" required hint="Include deliverables, expectations, and any references.">
        <textarea rows="5" className={`${inputClass} resize-none`} value={form.description} onChange={set('description')} required />
      </Field>
      <Field label="Skills required" hint="Separate skills with commas.">
        <input className={inputClass} value={form.skills} onChange={set('skills')} placeholder="React, UI design, Node.js" />
      </Field>
      <div className="grid sm:grid-cols-3 gap-4">
        <Field label="Duration" required><input className={inputClass} value={form.duration} onChange={set('duration')} placeholder="2 weeks" required /></Field>
        <Field label="Deadline"><input type="date" className={inputClass} value={form.deadline} onChange={set('deadline')} /></Field>
        <Field label="Freelancer amount" required><input type="number" min="100" className={inputClass} value={form.freelancerAmount} onChange={set('freelancerAmount')} placeholder="₹" required /></Field>
      </div>
      <PricingSummary amount={form.freelancerAmount} paymentExempt={isAdmin} />
      {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-600">{error}</p>}
      <button disabled={loading} className="btn-primary w-full py-4">
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
        {isAdmin ? 'Publish job without payment' : 'Continue to secure payment'}
      </button>
    </form>
  )
}

function FreelancerForm({ user, requireAuth }) {
  const [form, setForm] = useState(() => ({
    ...initialProfile, name: user?.name || '', email: user?.email || '',
    whatsapp: user?.phone || '', phone: user?.phone || '',
  }))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const set = key => event => setForm(value => ({ ...value, [key]: event.target.value }))

  useEffect(() => {
    setForm(current => ({
      ...current,
      name: current.name || user?.name || '',
      email: current.email || user?.email || '',
      whatsapp: current.whatsapp || user?.phone || '',
      phone: current.phone || user?.phone || '',
    }))
  }, [user])

  const submit = async event => {
    event.preventDefault()
    if (!user) return requireAuth()
    setLoading(true)
    setError('')
    try {
      await api.put('/freelance/profile', form)
      setSuccess(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (success) return (
    <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-8 text-center">
      <CheckCircle2 className="w-14 h-14 text-emerald-600 mx-auto mb-4" />
      <h2 className="font-display text-2xl font-bold text-slate-950">Profile received</h2>
      <p className="text-slate-600 mt-2">Earnova will verify your details before matching you with paid work.</p>
    </div>
  )

  return (
    <form onSubmit={submit} className="space-y-6">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">Turn skills into income</p>
        <h2 className="font-display text-3xl font-bold text-slate-950 mt-2">Become an Earnova freelancer</h2>
        <p className="text-slate-500 mt-2">Build a trustworthy profile so clients know exactly why to hire you.</p>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Full name" required><input className={inputClass} value={form.name} onChange={set('name')} required /></Field>
        <Field label="Email" required><input type="email" className={inputClass} value={form.email} onChange={set('email')} required /></Field>
        <Field label="WhatsApp number" required><input type="tel" className={inputClass} value={form.whatsapp} onChange={set('whatsapp')} required /></Field>
        <Field label="Alternate phone"><input type="tel" className={inputClass} value={form.phone} onChange={set('phone')} /></Field>
        <Field label="City" required><input className={inputClass} value={form.city} onChange={set('city')} placeholder="Hyderabad" required /></Field>
        <Field label="Professional title" required><input className={inputClass} value={form.title} onChange={set('title')} placeholder="Full-stack developer" required /></Field>
      </div>
      <Field label="About you" required>
        <textarea rows="4" className={`${inputClass} resize-none`} value={form.bio} onChange={set('bio')} placeholder="Describe your strengths, work style, and the results you create." required />
      </Field>
      <Field label="Skills" required hint="Separate skills with commas.">
        <input className={inputClass} value={form.skills} onChange={set('skills')} placeholder="React, Figma, SEO, Content writing" required />
      </Field>
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Experience" required>
          <select className={inputClass} value={form.experience} onChange={set('experience')} required>
            <option value="">Select experience</option>
            <option>Fresher / under 1 year</option><option>1–3 years</option><option>3–5 years</option><option>5–10 years</option><option>10+ years</option>
          </select>
        </Field>
        <Field label="Hourly rate"><input type="number" min="0" className={inputClass} value={form.hourlyRate} onChange={set('hourlyRate')} placeholder="₹ per hour" /></Field>
        <Field label="Availability">
          <select className={inputClass} value={form.availability} onChange={set('availability')}>
            <option value="available-now">Available now</option><option value="part-time">Part-time</option><option value="weekends">Weekends</option><option value="not-available">Not available</option>
          </select>
        </Field>
        <Field label="Portfolio / LinkedIn"><input type="url" className={inputClass} value={form.portfolio} onChange={set('portfolio')} placeholder="https://" /></Field>
      </div>
      <div className="rounded-2xl bg-violet-50 border border-violet-100 p-4 flex gap-3">
        <ShieldCheck className="w-5 h-5 text-violet-700 shrink-0" />
        <p className="text-sm text-violet-950">Clients fund Earnova first. You are paid the agreed amount after approved completion. Earnova commission is paid by the client, and drops to 1.5% when the job amount crosses ₹2,500.</p>
      </div>
      {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-600">{error}</p>}
      <button disabled={loading} className="btn-primary w-full py-4">
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
        Submit freelancer profile
      </button>
    </form>
  )
}

export default function FreelancePage() {
  const [params, setParams] = useSearchParams()
  const { user, isAuthenticated, isAdmin } = useAuth()
  const [showAuth, setShowAuth] = useState(false)
  const jobId = params.get('job')
  const active = params.get('mode') === 'freelancer' ? 'freelancer' : 'hire'
  const requireAuth = () => setShowAuth(true)
  const tab = mode => setParams(jobId ? { mode, job: jobId } : { mode })

  const benefits = useMemo(() => [
    { Icon: LockKeyhole, title: 'Escrow protection', text: 'The hiring party funds the full job before work begins.' },
    { Icon: BadgeCheck, title: 'Verified talent', text: 'Earnova reviews freelancer profiles before trusted matching.' },
    { Icon: MessageCircle, title: 'Human mediation', text: 'Earnova stays between both sides when clarity or support is needed.' },
  ], [])

  return (
    <div className="min-h-screen bg-[#f7f6fb]">
      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} onSuccess={() => setShowAuth(false)} />

      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div className="absolute -top-32 -right-24 w-96 h-96 rounded-full bg-violet-600/30 blur-3xl" />
        <div className="absolute -bottom-36 -left-20 w-96 h-96 rounded-full bg-fuchsia-500/15 blur-3xl" />
        <div className="section-wrapper relative py-16 lg:py-24">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/10 px-3 py-1.5 text-xs font-bold text-violet-200 mb-5">
              <Sparkles className="w-3.5 h-3.5" /> Earnova Freelancing
            </div>
            <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.06] break-words">
              Good work deserves a <span className="text-violet-300">safer deal.</span>
            </h1>
            <p className="text-lg text-slate-300 max-w-2xl mt-5 leading-relaxed">
              Hire skilled people or earn through your talent. Earnova protects the payment, keeps expectations clear, and helps both sides finish strong.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-4 mt-10">
            {benefits.map(item => <FlowCard key={item.title} number="✓" icon={item.Icon} title={item.title} text={item.text} />)}
          </div>
        </div>
      </section>

      <section className="section-wrapper py-10 lg:py-16">
        <div className="max-w-4xl mx-auto">
          <JobLinkView jobId={jobId} isAuthenticated={isAuthenticated} requireAuth={requireAuth} />

          <div className="grid grid-cols-2 bg-white rounded-2xl p-1.5 border border-slate-200 shadow-sm mb-8">
            <button onClick={() => tab('hire')} className={`min-w-0 rounded-xl px-2 sm:px-4 py-3 text-xs sm:text-base font-bold flex items-center justify-center gap-1.5 sm:gap-2 transition-all ${active === 'hire' ? 'bg-slate-950 text-white shadow-lg' : 'text-slate-500 hover:text-slate-900'}`}>
              <UserRoundSearch className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" /> <span>Hire a freelancer</span>
            </button>
            <button onClick={() => tab('freelancer')} className={`min-w-0 rounded-xl px-2 sm:px-4 py-3 text-xs sm:text-base font-bold flex items-center justify-center gap-1.5 sm:gap-2 transition-all ${active === 'freelancer' ? 'bg-violet-700 text-white shadow-lg' : 'text-slate-500 hover:text-slate-900'}`}>
              <Briefcase className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" /> <span>Become a freelancer</span>
            </button>
          </div>

          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-card p-6 sm:p-9 lg:p-12">
            {active === 'hire'
              ? <HireForm user={user} requireAuth={requireAuth} isAdmin={isAdmin} />
              : <FreelancerForm user={user} requireAuth={requireAuth} />}
          </div>
          {!isAuthenticated && (
            <p className="text-center text-sm text-slate-500 mt-4">You can explore the form now. Sign in is requested only when you submit.</p>
          )}
        </div>
      </section>

      <section className="bg-white border-y border-slate-100">
        <div className="section-wrapper py-14">
          <div className="text-center max-w-2xl mx-auto mb-9">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">How the money moves</p>
            <h2 className="font-display text-3xl font-bold text-slate-950 mt-2">Simple, visible, protected</h2>
          </div>
          <div className="grid md:grid-cols-4 gap-4">
            {[
              [WalletCards, isAdmin ? 'Admin publishes job' : 'Client funds job', isAdmin ? 'Admin-created jobs are published without Razorpay payment.' : 'Client pays job amount plus Earnova fee. Above ₹2,500, the fee is only 1.5%.'],
              [LockKeyhole, 'Earnova holds funds', 'The freelancer can work knowing the money is secured.'],
              [Clock3, 'Work is completed', 'The client reviews the agreed deliverables.'],
              [IndianRupee, 'Freelancer is paid', 'Earnova releases the full agreed freelancer amount.'],
            ].map(([Icon, title, text], index) => (
              <div key={title} className="rounded-2xl bg-slate-50 border border-slate-100 p-5">
                <div className="flex items-center justify-between">
                  <Icon className="w-6 h-6 text-violet-700" />
                  <span className="font-display font-black text-slate-200 text-2xl">0{index + 1}</span>
                </div>
                <h3 className="font-display font-bold text-slate-950 mt-4">{title}</h3>
                <p className="text-sm text-slate-500 mt-2">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
