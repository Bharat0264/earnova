import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  ArrowRight, Briefcase, CalendarDays, CheckCircle2, FileLock2, HelpCircle,
  IndianRupee, Loader2, Plus, Settings, Video,
} from 'lucide-react'
import { api } from '../utils/api'
import { formatDate } from '../utils/formatters'

const MODE_META = {
  overview: ['CA office', 'Track active professional work and the next required action.', Briefcase],
  cases: ['My CA cases', 'All CA service requests linked to your account.', Briefcase],
  consultations: ['Consultations', 'Consultation scheduling becomes available inside eligible cases.', Video],
  documents: ['Documents', 'Sensitive documents remain linked to authorized cases.', FileLock2],
  'compliance-calendar': ['Compliance calendar', 'Only professionally verified obligations and dates will appear here.', CalendarDays],
  payments: ['CA payments', 'Case-linked quotes and verified payments will appear here.', IndianRupee],
  completed: ['Completed work', 'Review completed cases and secure deliverables.', CheckCircle2],
  settings: ['CA settings', 'Manage CA service preferences without exposing case documents.', Settings],
}

const statusLabel = value => String(value || '').replaceAll('_', ' ')

export default function CAWorkspacePage({ mode = 'overview' }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const [cases, setCases] = useState([])
  const [services, setServices] = useState([])
  const [firms, setFirms] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [form, setForm] = useState({
    serviceSlug: searchParams.get('start') || '',
    firmId: '',
    intakeSummary: '',
    contactPhone: '',
    contactWhatsapp: '',
    pan: '',
    taxIntake: { assessmentYear: '2026-27', taxpayerType: 'individual', residentialStatus: 'resident', incomeSources: [], deductionClaims: [], filingReason: 'regular', hasForm16: false, hasAisTis: false, hasCapitalGains: false, hasForeignAssets: false, taxPosition: 'not_sure', declarationAccepted: false },
  })
  const [step, setStep] = useState(1)
  const showForm = searchParams.has('start')
  const [title, description, Icon] = MODE_META[mode] || MODE_META.overview

  const refresh = async () => {
    setLoading(true)
    try {
      const [caseData, serviceData, firmData] = await Promise.all([
        api.get('/ca-office/cases?limit=50'),
        api.get('/ca-office/services'),
        api.get('/ca-office/firms?limit=50'),
      ])
      setCases(caseData.cases || [])
      setServices(serviceData.services || [])
      setFirms(firmData.firms || [])
    } catch (error) {
      setMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { refresh() }, [])

  const visibleCases = useMemo(() => {
    if (mode === 'completed') return cases.filter(item => item.status === 'completed')
    if (mode === 'overview') return cases.filter(item => !['completed', 'cancelled', 'refunded'].includes(item.status)).slice(0, 6)
    return cases
  }, [cases, mode])

  const selectedService = services.find(item => item.slug === form.serviceSlug)
  const eligibleFirms = firms.filter(firm => firm.serviceSlugs?.includes(form.serviceSlug) && firm.acceptingCases)

  const submit = async event => {
    event.preventDefault()
    setMessage('')
    try {
      const data = await api.post('/ca-office/cases', form)
      setCases(prev => [data.case, ...prev])
      setSearchParams({})
      setForm({ serviceSlug: '', firmId: '', intakeSummary: '', contactPhone: '', contactWhatsapp: '', pan: '', taxIntake: { assessmentYear: '2026-27', taxpayerType: 'individual', residentialStatus: 'resident', incomeSources: [], deductionClaims: [], filingReason: 'regular', hasForm16: false, hasAisTis: false, hasCapitalGains: false, hasForeignAssets: false, taxPosition: 'not_sure', declarationAccepted: false } })
      setStep(1)
      setMessage(`Case ${data.case.reference} was created.`)
    } catch (error) {
      setMessage(error.message)
    }
  }

  const isItr = form.serviceSlug === 'income-tax-return-filing'
  const toggleTaxItem = (field, value) => setForm(prev => ({ ...prev, taxIntake: { ...prev.taxIntake, [field]: prev.taxIntake[field].includes(value) ? prev.taxIntake[field].filter(item => item !== value) : [...prev.taxIntake[field], value] } }))

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-brand-700"><Icon className="h-5 w-5" /><span className="text-xs font-bold uppercase tracking-[.14em]">Online CA office</span></div>
          <h1 className="mt-2 text-3xl font-extrabold text-slate-950">{title}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">{description}</p>
        </div>
        <button type="button" onClick={() => setSearchParams({ start: form.serviceSlug || 'income-tax-return-filing' })} className="btn-primary"><Plus className="h-4 w-4" />Start service</button>
      </div>

      {message && <p className={`mt-5 rounded-xl px-4 py-3 text-sm font-semibold ${message.startsWith('Case ') ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'}`}>{message}</p>}

      {showForm && (
        <form onSubmit={submit} className="mt-6 rounded-3xl border border-brand-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div><h2 className="text-xl font-bold text-slate-950">Start a CA service request</h2><p className="mt-1 text-sm text-slate-500">Do not paste Aadhaar, bank details or document contents into this form.</p></div>
            <button type="button" onClick={() => setSearchParams({})} className="text-sm font-bold text-slate-500">Close</button>
          </div>
          {isItr && <div className="mt-5 grid grid-cols-4 gap-2">{['Service', 'Tax profile', 'Documents', 'Review'].map((label, index) => <div key={label} className={`rounded-lg px-2 py-2 text-center text-xs font-bold ${step >= index + 1 ? 'bg-brand-700 text-white' : 'bg-slate-100 text-slate-500'}`}>{index + 1}. {label}</div>)}</div>}
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {(!isItr || step === 1) && <>
            <label className="text-sm font-bold text-slate-700">Service
              <select className="input-base mt-2 w-full" value={form.serviceSlug} onChange={event => setForm(prev => ({ ...prev, serviceSlug: event.target.value, firmId: '' }))} required>
                <option value="">Choose service</option>
                {services.map(service => <option key={service.slug} value={service.slug}>{service.name}</option>)}
              </select>
            </label>
            </>}
            {isItr && step === 2 && <div className="grid gap-4 sm:col-span-2 sm:grid-cols-2">
              <label className="text-sm font-bold text-slate-700">Assessment year<select className="input-base mt-2 w-full" value={form.taxIntake.assessmentYear} onChange={e => setForm(p => ({ ...p, taxIntake: { ...p.taxIntake, assessmentYear: e.target.value } }))}><option>2026-27</option><option>2025-26</option><option>2024-25</option></select></label>
              <label className="text-sm font-bold text-slate-700">Taxpayer type<select className="input-base mt-2 w-full" value={form.taxIntake.taxpayerType} onChange={e => setForm(p => ({ ...p, taxIntake: { ...p.taxIntake, taxpayerType: e.target.value } }))}><option value="individual">Individual</option><option value="huf">HUF</option><option value="proprietor">Proprietor</option></select></label>
              <fieldset className="sm:col-span-2"><legend className="text-sm font-bold text-slate-700">Select all income sources</legend><div className="mt-2 grid gap-2 sm:grid-cols-3">{[['salary','Salary'],['house_property','House property'],['business','Business / profession'],['capital_gains','Capital gains'],['interest','Interest / other income'],['foreign_income','Foreign income']].map(([value,label]) => <label key={value} className="rounded-xl border p-3 text-sm"><input type="checkbox" className="mr-2" checked={form.taxIntake.incomeSources.includes(value)} onChange={() => toggleTaxItem('incomeSources', value)} />{label}</label>)}</div></fieldset>
              <label className="text-sm font-bold text-slate-700">Why are you filing?<select className="input-base mt-2 w-full" value={form.taxIntake.filingReason} onChange={e => setForm(p => ({ ...p, taxIntake: { ...p.taxIntake, filingReason: e.target.value } }))}><option value="regular">Regular return</option><option value="refund">Claim refund</option><option value="loss_carry_forward">Carry forward loss</option><option value="notice">Respond to notice</option><option value="revised">Revised return</option><option value="not_sure">Not sure</option></select></label>
              <label className="text-sm font-bold text-slate-700">Expected position<select className="input-base mt-2 w-full" value={form.taxIntake.taxPosition} onChange={e => setForm(p => ({ ...p, taxIntake: { ...p.taxIntake, taxPosition: e.target.value } }))}><option value="not_sure">Let CA calculate</option><option value="refund_expected">Refund expected</option><option value="tax_payable">Tax may be payable</option></select></label>
            </div>}
            {isItr && step === 3 && <div className="sm:col-span-2"><h3 className="font-bold text-slate-900">Document readiness</h3><p className="mt-1 text-sm text-slate-500">You can create the case now and upload these securely afterward.</p><div className="mt-3 grid gap-2 sm:grid-cols-2">{[['hasForm16','I have Form 16'],['hasAisTis','I have AIS / TIS'],['hasCapitalGains','I have capital-gain statements'],['hasForeignAssets','I have foreign income or assets']].map(([field,label]) => <label key={field} className="rounded-xl border p-3 text-sm"><input type="checkbox" className="mr-2" checked={form.taxIntake[field]} onChange={e => setForm(p => ({ ...p, taxIntake: { ...p.taxIntake, [field]: e.target.checked } }))} />{label}</label>)}</div></div>}
            {(!isItr || step === 4) && <>
            <label className="text-sm font-bold text-slate-700">Preferred verified firm
              <select className="input-base mt-2 w-full" value={form.firmId} onChange={event => setForm(prev => ({ ...prev, firmId: event.target.value }))}>
                <option value="">Let Earnova assign</option>
                {eligibleFirms.map(firm => <option key={firm._id} value={firm._id}>{firm.displayName}</option>)}
              </select>
            </label>
            <label className="text-sm font-bold text-slate-700">Contact phone
              <input className="input-base mt-2 w-full" value={form.contactPhone} onChange={event => setForm(prev => ({ ...prev, contactPhone: event.target.value }))} placeholder="Optional contact number" />
            </label>
            <label className="text-sm font-bold text-slate-700">WhatsApp number
              <input className="input-base mt-2 w-full" type="tel" value={form.contactWhatsapp} onChange={event => setForm(prev => ({ ...prev, contactWhatsapp: event.target.value }))} placeholder="10-digit Indian mobile number" required />
              <span className="mt-1 block text-xs font-normal text-slate-500">Private: visible only to an authorized assigned CA and Earnova administrators.</span>
            </label>
            <label className="text-sm font-bold text-slate-700">PAN for matching
              <input className="input-base mt-2 w-full uppercase" value={form.pan} onChange={event => setForm(prev => ({ ...prev, pan: event.target.value.slice(0, 10) }))} placeholder="Stored masked only" />
            </label>
            <label className="sm:col-span-2 text-sm font-bold text-slate-700">What do you need help with?
              <textarea className="input-base mt-2 min-h-28 w-full" value={form.intakeSummary} onChange={event => setForm(prev => ({ ...prev, intakeSummary: event.target.value }))} minLength={20} maxLength={3000} required />
            </label>
            {isItr && <label className="sm:col-span-2 rounded-xl bg-slate-50 p-4 text-sm text-slate-700"><input type="checkbox" className="mr-2" checked={form.taxIntake.declarationAccepted} onChange={e => setForm(p => ({ ...p, taxIntake: { ...p.taxIntake, declarationAccepted: e.target.checked } }))} required />I confirm the information is accurate and authorize Earnova and the assigned CA to review it for this case.</label>}
            </>}
          </div>
          {selectedService && <p className="mt-4 rounded-xl bg-amber-50 p-3 text-xs leading-relaxed text-amber-900">{selectedService.handlingTime} {selectedService.externalDependency}</p>}
          {isItr && <p className="mt-3 rounded-xl bg-blue-50 p-3 text-xs leading-relaxed text-blue-900">Earnova is not connected to the Income Tax Department. Your answers and files go to Earnova and the assigned CA, who prepares and coordinates the filing work.</p>}
          <div className="mt-5 flex gap-3">{isItr && step > 1 && <button type="button" onClick={() => setStep(value => value - 1)} className="btn-secondary">Back</button>}{isItr && step < 4 ? <button type="button" onClick={() => setStep(value => value + 1)} disabled={step === 1 && !form.serviceSlug} className="btn-primary">Continue <ArrowRight className="h-4 w-4" /></button> : <button className="btn-primary">Create secure case <ArrowRight className="h-4 w-4" /></button>}</div>
        </form>
      )}

      {['consultations', 'documents', 'compliance-calendar', 'payments', 'settings'].includes(mode) && !visibleCases.length ? (
        <div className="mt-8 rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <Icon className="mx-auto h-8 w-8 text-slate-300" />
          <p className="mt-4 font-bold text-slate-800">This area is case-connected.</p>
          <p className="mt-2 text-sm text-slate-500">Start a CA service first. Relevant records will appear only after an authorized case action creates them.</p>
        </div>
      ) : (
        <section className="mt-7">
          {loading ? <div className="flex justify-center py-16"><Loader2 className="h-7 w-7 animate-spin text-brand-700" /></div> : (
            <div className="grid gap-4 xl:grid-cols-2">
              {visibleCases.map(item => (
                <Link key={item._id} to={`/app/ca/cases/${item.reference}`} className="surface-card p-5 hover:border-brand-300">
                  <div className="flex items-start justify-between gap-3">
                    <div><p className="text-xs font-bold text-brand-700">{item.reference}</p><h2 className="mt-2 font-extrabold text-slate-950">{item.service?.name || item.serviceSlug?.replaceAll('-', ' ')}</h2></div>
                    <span className="status-badge status-info capitalize">{statusLabel(item.status)}</span>
                  </div>
                  <p className="mt-4 text-sm text-slate-600">{item.nextAction || 'Open the case for its next action.'}</p>
                  <div className="mt-4 flex items-center justify-between text-xs text-slate-500"><span>{item.firm?.displayName || 'Firm allocation pending'}</span><span>{formatDate(item.updatedAt)}</span></div>
                </Link>
              ))}
              {!visibleCases.length && <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center xl:col-span-2"><Briefcase className="mx-auto h-8 w-8 text-slate-300" /><p className="mt-4 font-bold text-slate-800">No CA cases here yet.</p></div>}
            </div>
          )}
        </section>
      )}

      <div className="mt-8 rounded-2xl bg-slate-950 p-5 text-white">
        <p className="flex items-center gap-2 font-bold"><HelpCircle className="h-4 w-4 text-emerald-300" />Need help with a CA case?</p>
        <p className="mt-1 text-sm text-slate-300">Open the case first so Earnova can safely link the support request after verifying ownership.</p>
        <Link to="/app/support/new?service=ca" className="mt-4 inline-flex text-sm font-bold text-emerald-300">Start CA support →</Link>
      </div>
    </div>
  )
}
