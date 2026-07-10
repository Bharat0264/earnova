import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BadgeCheck, Briefcase, Calculator, ClipboardCheck, FileCheck2, FileText, ShieldCheck } from 'lucide-react'
import AuthModal from '../components/auth/AuthModal'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { api } from '../utils/api'
import { formatPrice } from '../utils/formatters'

const INCOME_SOURCES = ['Salary', 'Business', 'Capital gains', 'Rental income', 'Foreign income', 'Interest income', 'Freelance income']
const CA_SPECIALIZATIONS = ['ITR filing', 'GST', 'TDS', 'Bookkeeping', 'Audit support', 'Tax notices', 'Business compliance', 'Financial statements']
const CA_SERVICE_PACKAGES = [
  { key: 'simple-salaried', label: 'Simple salaried', amount: 1250, detail: 'For salary income, Form 16 and basic deductions.' },
  { key: 'investors-traders', label: 'Investors & Traders', amount: 3000, detail: 'For capital gains, trading reports and investment income.' },
  { key: 'freelancers-small-business', label: 'Freelancers & Small Business', amount: 4250, detail: 'For freelance income, small business books and deductions.' },
  { key: 'corporate-tax-audits', label: 'Corporate and Tax Audits', amount: 15000, amountMax: 50000, detail: 'Starts at 15000; final audit scope can go up to 50000.' },
]
const EARNOVA_CA_FEE = 49
const CLIENT_DOCS = [
  'PAN card',
  'Form 16',
  'AIS/TIS statement',
  'Bank statement',
  'Investment proofs',
  'Rent or home loan proof',
  'Capital gains statement',
  'GST/books data',
]

const inputClass = 'input-base text-sm'
const emptyClientForm = {
  clientName: '',
  clientEmail: '',
  clientWhatsapp: '',
  clientType: 'individual',
  pan: '',
  aadhaarLast4: '',
  assessmentYear: '2026-27',
  filingType: 'itr-filing',
  servicePackage: 'simple-salaried',
  incomeSources: [],
  salaryEmployer: '',
  form16Available: false,
  bankInterest: '',
  capitalGains: '',
  rentalIncome: '',
  businessIncome: '',
  foreignIncome: '',
  deductions80C: '',
  deductions80D: '',
  homeLoanInterest: '',
  otherDeductions: '',
  gstin: '',
  turnover: '',
  booksMaintained: false,
  documents: CLIENT_DOCS.map(label => ({ label, url: '' })),
  notes: '',
}
const emptyCAForm = {
  name: '',
  email: '',
  whatsapp: '',
  phone: '',
  city: '',
  state: '',
  firmName: '',
  membershipNumber: '',
  qualification: '',
  yearsExperience: '',
  specializations: [],
  servicesOffered: [],
  govtIdType: 'Aadhaar',
  idCardUrl: '',
  govtIdUrl: '',
  caCertificateUrl: '',
  practiceProofUrl: '',
  consentToVerify: false,
}

function ToggleGroup({ options, value, onChange }) {
  const selected = new Set(value)
  const toggle = item => {
    const next = new Set(selected)
    if (next.has(item)) next.delete(item)
    else next.add(item)
    onChange([...next])
  }

  return (
    <div className="flex flex-wrap gap-2">
      {options.map(item => (
        <button
          key={item}
          type="button"
          onClick={() => toggle(item)}
          className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
            selected.has(item) ? 'bg-primary-700 text-white border-primary-700' : 'border-gray-200 text-gray-600 hover:border-primary-200'
          }`}
        >
          {item}
        </button>
      ))}
    </div>
  )
}

export default function CAServicesPage() {
  const { isAuthenticated, user } = useAuth()
  const { addToCart } = useCart()
  const navigate = useNavigate()
  const [showAuth, setShowAuth] = useState(false)
  const [clientForm, setClientForm] = useState(() => ({
    ...emptyClientForm,
    clientName: user?.name || '',
    clientEmail: user?.email || '',
    clientWhatsapp: user?.phone || '',
  }))
  const [caForm, setCAForm] = useState(() => ({
    ...emptyCAForm,
    name: user?.name || '',
    email: user?.email || '',
    whatsapp: user?.phone || '',
  }))
  const [submitting, setSubmitting] = useState(null)
  const [message, setMessage] = useState('')
  const [createdJob, setCreatedJob] = useState(null)
  const [paymentDone, setPaymentDone] = useState(false)
  const selectedPackage = CA_SERVICE_PACKAGES.find(item => item.key === clientForm.servicePackage) || CA_SERVICE_PACKAGES[0]
  const packagePrice = selectedPackage.amountMax && selectedPackage.amountMax !== selectedPackage.amount
    ? `${formatPrice(selectedPackage.amount)}-${formatPrice(selectedPackage.amountMax)}`
    : formatPrice(selectedPackage.amount)

  const requireLogin = () => {
    if (isAuthenticated) return false
    setShowAuth(true)
    return true
  }

  const updateDocument = (index, field, value) => {
    setClientForm(prev => ({
      ...prev,
      documents: prev.documents.map((doc, i) => i === index ? { ...doc, [field]: value } : doc),
    }))
  }

  const submitClientWork = async event => {
    event.preventDefault()
    if (requireLogin()) return
    setSubmitting('client')
    setMessage('')
    try {
      const payload = {
        ...clientForm,
        documents: clientForm.documents.filter(doc => doc.label.trim() && doc.url.trim()),
      }
      const res = await api.post('/ca/tax-jobs', payload)
      setCreatedJob(res.job)
      setPaymentDone(res.job?.paymentStatus === 'admin-waived' || res.job?.paymentStatus === 'paid')
      setMessage(res.message || 'Tax work submitted. Complete Razorpay payment from cart to activate CA review.')
      if (res.job?.paymentStatus === 'admin-waived' || res.job?.paymentStatus === 'paid') {
        setClientForm(prev => ({ ...emptyClientForm, clientName: prev.clientName, clientEmail: prev.clientEmail, clientWhatsapp: prev.clientWhatsapp }))
      } else if (res.job?._id) {
        addToCart({
          _id: `earnova-ca-service-${res.job._id}`,
          itemType: 'service',
          serviceKey: 'caTaxJob',
          serviceRef: res.job._id,
          taxJobId: res.job._id,
          name: `Earnova CA Services - ${res.job.serviceLabel}`,
          brand: 'Earnova Services',
          price: res.job.serviceAmount,
          quantity: 1,
          gstRate: 0,
          category: 'earnova-services',
          thumbnail: '/favicon.svg',
        }, 1)
        navigate('/cart')
      }
    } catch (err) {
      setMessage(err.message)
    } finally {
      setSubmitting(null)
    }
  }

  const submitCAApplication = async event => {
    event.preventDefault()
    if (requireLogin()) return
    setSubmitting('ca')
    setMessage('')
    try {
      const res = await api.put('/ca/profile', caForm)
      setMessage(res.message || 'CA application submitted.')
    } catch (err) {
      setMessage(err.message)
    } finally {
      setSubmitting(null)
    }
  }

  return (
    <div className="bg-white">
      <section className="border-b border-gray-100 bg-gradient-to-br from-slate-950 via-primary-950 to-emerald-950 text-white">
        <div className="section-wrapper py-14 lg:py-20 grid lg:grid-cols-[1.05fr_0.95fr] gap-10 items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-bold text-primary-100">
              <ShieldCheck className="w-4 h-4" />
              Earnova verified CA network
            </div>
            <h1 className="font-display font-extrabold text-3xl sm:text-5xl leading-tight mt-5">
              ITR, GST, bookkeeping and tax work handled through verified chartered accountants.
            </h1>
            <p className="text-primary-100 text-sm sm:text-base mt-4 max-w-2xl">
              Clients can submit the data a CA needs, Earnova admins manually verify CA credentials, and assigned CAs can review documents, ask for missing information and complete the work.
            </p>
            <div className="grid sm:grid-cols-3 gap-3 mt-8">
              {[
                ['ITR verification', FileCheck2],
                ['GST and TDS work', Calculator],
                ['Business accounts', Briefcase],
              ].map(([label, Icon]) => (
                <div key={label} className="rounded-2xl bg-white/10 border border-white/10 p-4">
                  <Icon className="w-5 h-5 text-eco-300 mb-3" />
                  <p className="text-sm font-bold">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white text-gray-900 rounded-2xl shadow-2xl p-5">
            <p className="text-xs font-bold text-primary-700 uppercase tracking-wide">CA work checklist</p>
            <div className="grid gap-3 mt-4">
              {[
                'ITR filing, revised return and refund support',
                'Tax notices, document verification and reply preparation',
                'GST returns, TDS checks and compliance reminders',
                'Bookkeeping review, profit and loss, balance sheet support',
                'Deductions, capital gains and business income analysis',
              ].map(item => (
                <div key={item} className="flex items-start gap-3 text-sm">
                  <ClipboardCheck className="w-4 h-4 text-eco-600 mt-0.5 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section-wrapper py-10 space-y-8">
        {message && (
          <div className="rounded-2xl border border-primary-100 bg-primary-50 px-4 py-3 text-sm font-semibold text-primary-800">
            {message}
          </div>
        )}

        {createdJob && (
          <div className={`rounded-2xl border p-5 shadow-card ${paymentDone ? 'border-eco-200 bg-eco-50' : 'border-amber-200 bg-amber-50'}`}>
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <p className={`text-xs font-bold uppercase tracking-wide ${paymentDone ? 'text-eco-700' : 'text-amber-700'}`}>
                  {paymentDone ? 'Payment confirmed' : 'Payment required'}
                </p>
                <h2 className="font-display font-bold text-xl text-gray-900 mt-1">
                  {createdJob.serviceLabel} - {createdJob.jobId}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {paymentDone
                    ? 'Earnova CA review is active and ready for admin assignment.'
                    : `This CA request is added to cart. Pay ${formatPrice(createdJob.serviceAmount)} through cart checkout to activate it. Earnova keeps ${formatPrice(createdJob.earnovaFee || EARNOVA_CA_FEE)} from this price; the remaining ${formatPrice(createdJob.caPayoutAmount || Math.max((createdJob.serviceAmount || 0) - EARNOVA_CA_FEE, 0))} goes to the verified CA.`}
                </p>
              </div>
              {!paymentDone && (
                <button type="button" onClick={() => navigate('/cart')} className="btn-primary justify-center">
                  Go to cart
                </button>
              )}
            </div>
          </div>
        )}

        <div className="grid xl:grid-cols-[1.15fr_0.85fr] gap-8">
          <form onSubmit={submitClientWork} className="bg-white border border-gray-100 rounded-2xl shadow-card p-5 space-y-5">
            <div>
              <p className="text-xs font-bold text-primary-700 uppercase tracking-wide">For clients</p>
              <h2 className="font-display font-bold text-2xl text-gray-900 mt-1">Submit ITR or accounting work</h2>
              <p className="text-sm text-gray-500 mt-1">Provide the details and secure document links. Earnova assigns a verified CA after admin review.</p>
            </div>

            <div>
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-3">
                <div>
                  <p className="text-xs font-bold text-gray-500 mb-1">Standard CA payment package</p>
                  <p className="text-sm font-semibold text-gray-900">Selected price: {packagePrice}</p>
                  <p className="text-xs text-gray-500 mt-1">Earnova charge is {formatPrice(EARNOVA_CA_FEE)} inside the package price. The remaining amount goes to the verified CA.</p>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                {CA_SERVICE_PACKAGES.map(item => {
                  const selected = clientForm.servicePackage === item.key
                  const price = item.amountMax && item.amountMax !== item.amount
                    ? `${formatPrice(item.amount)}-${formatPrice(item.amountMax)}`
                    : formatPrice(item.amount)
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setClientForm(prev => ({ ...prev, servicePackage: item.key }))}
                      className={`text-left rounded-2xl border p-4 transition-all ${
                        selected ? 'border-primary-600 bg-primary-50 shadow-card' : 'border-gray-100 bg-white hover:border-primary-200'
                      }`}
                    >
                      <span className="block font-display font-bold text-gray-900">{item.label}</span>
                      <span className={`block text-lg font-black mt-1 ${selected ? 'text-primary-800' : 'text-gray-800'}`}>{price}</span>
                      <span className="block text-xs font-semibold text-eco-700 mt-1">
                        CA receives {item.amountMax && item.amountMax !== item.amount
                          ? `${formatPrice(item.amount - EARNOVA_CA_FEE)}-${formatPrice(item.amountMax - EARNOVA_CA_FEE)}`
                          : formatPrice(item.amount - EARNOVA_CA_FEE)}
                      </span>
                      <span className="block text-xs text-gray-500 mt-1 leading-relaxed">{item.detail}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-3">
              <input className={inputClass} placeholder="Full name" value={clientForm.clientName} onChange={e => setClientForm(p => ({ ...p, clientName: e.target.value }))} required />
              <input className={inputClass} placeholder="Email" type="email" value={clientForm.clientEmail} onChange={e => setClientForm(p => ({ ...p, clientEmail: e.target.value }))} required />
              <input className={inputClass} placeholder="WhatsApp number" value={clientForm.clientWhatsapp} onChange={e => setClientForm(p => ({ ...p, clientWhatsapp: e.target.value }))} required />
            </div>

            <div className="grid md:grid-cols-4 gap-3">
              <select className={inputClass} value={clientForm.clientType} onChange={e => setClientForm(p => ({ ...p, clientType: e.target.value }))}>
                <option value="individual">Individual</option>
                <option value="business">Business</option>
                <option value="proprietor">Proprietor</option>
                <option value="partnership">Partnership</option>
                <option value="llp">LLP</option>
                <option value="company">Company</option>
              </select>
              <input className={inputClass} placeholder="PAN" value={clientForm.pan} onChange={e => setClientForm(p => ({ ...p, pan: e.target.value.toUpperCase() }))} required />
              <input className={inputClass} placeholder="Aadhaar last 4 digits" maxLength={4} value={clientForm.aadhaarLast4} onChange={e => setClientForm(p => ({ ...p, aadhaarLast4: e.target.value.replace(/\D/g, '') }))} />
              <input className={inputClass} placeholder="Assessment year" value={clientForm.assessmentYear} onChange={e => setClientForm(p => ({ ...p, assessmentYear: e.target.value }))} required />
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              <select className={inputClass} value={clientForm.filingType} onChange={e => setClientForm(p => ({ ...p, filingType: e.target.value }))}>
                <option value="itr-filing">ITR filing</option>
                <option value="itr-revision">ITR revision</option>
                <option value="tax-notice">Tax notice</option>
                <option value="gst-filing">GST filing</option>
                <option value="tds">TDS</option>
                <option value="bookkeeping">Bookkeeping</option>
                <option value="audit-support">Audit support</option>
                <option value="financial-statements">Financial statements</option>
              </select>
              <input className={inputClass} placeholder="Employer / business name" value={clientForm.salaryEmployer} onChange={e => setClientForm(p => ({ ...p, salaryEmployer: e.target.value }))} />
            </div>

            <div>
              <p className="text-xs font-bold text-gray-500 mb-2">Income sources</p>
              <ToggleGroup options={INCOME_SOURCES} value={clientForm.incomeSources} onChange={incomeSources => setClientForm(p => ({ ...p, incomeSources }))} />
            </div>

            <div className="grid md:grid-cols-4 gap-3">
              {[
                ['bankInterest', 'Bank interest'],
                ['capitalGains', 'Capital gains'],
                ['rentalIncome', 'Rental income'],
                ['businessIncome', 'Business income'],
                ['foreignIncome', 'Foreign income'],
                ['deductions80C', '80C deductions'],
                ['deductions80D', '80D deductions'],
                ['homeLoanInterest', 'Home loan interest'],
              ].map(([key, label]) => (
                <input key={key} className={inputClass} type="number" min="0" placeholder={label} value={clientForm[key]} onChange={e => setClientForm(p => ({ ...p, [key]: e.target.value }))} />
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              <input className={inputClass} placeholder="GSTIN, if applicable" value={clientForm.gstin} onChange={e => setClientForm(p => ({ ...p, gstin: e.target.value.toUpperCase() }))} />
              <input className={inputClass} type="number" min="0" placeholder="Business turnover" value={clientForm.turnover} onChange={e => setClientForm(p => ({ ...p, turnover: e.target.value }))} />
            </div>

            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              <label className="flex items-center gap-2 text-gray-600">
                <input type="checkbox" checked={clientForm.form16Available} onChange={e => setClientForm(p => ({ ...p, form16Available: e.target.checked }))} />
                Form 16 available
              </label>
              <label className="flex items-center gap-2 text-gray-600">
                <input type="checkbox" checked={clientForm.booksMaintained} onChange={e => setClientForm(p => ({ ...p, booksMaintained: e.target.checked }))} />
                Books/accounts maintained
              </label>
            </div>

            <textarea className={`${inputClass} min-h-[82px]`} placeholder="Other deductions, tax notice details, questions or special notes" value={clientForm.notes} onChange={e => setClientForm(p => ({ ...p, notes: e.target.value }))} />

            <div>
              <p className="text-xs font-bold text-gray-500 mb-2">Secure document links</p>
              <div className="grid md:grid-cols-2 gap-3">
                {clientForm.documents.map((doc, index) => (
                  <div key={doc.label} className="grid grid-cols-[0.7fr_1fr] gap-2">
                    <input className={inputClass} value={doc.label} onChange={e => updateDocument(index, 'label', e.target.value)} />
                    <input className={inputClass} placeholder="Paste Drive/secure file URL" value={doc.url} onChange={e => updateDocument(index, 'url', e.target.value)} />
                  </div>
                ))}
              </div>
            </div>

            <button disabled={submitting === 'client'} className="btn-primary w-full justify-center py-3">
              {submitting === 'client' ? 'Submitting...' : `Submit and add ${formatPrice(selectedPackage.amount)} to cart`}
            </button>
          </form>

          <form onSubmit={submitCAApplication} className="bg-gray-50 border border-gray-100 rounded-2xl p-5 space-y-5">
            <div>
              <p className="text-xs font-bold text-eco-700 uppercase tracking-wide">For chartered accountants</p>
              <h2 className="font-display font-bold text-2xl text-gray-900 mt-1">Become an Earnova CA</h2>
              <p className="text-sm text-gray-500 mt-1">Earnova admin manually verifies ID, government proof and CA membership proof before work is assigned.</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <input className={inputClass} placeholder="Full name" value={caForm.name} onChange={e => setCAForm(p => ({ ...p, name: e.target.value }))} required />
              <input className={inputClass} type="email" placeholder="Email" value={caForm.email} onChange={e => setCAForm(p => ({ ...p, email: e.target.value }))} required />
              <input className={inputClass} placeholder="WhatsApp number" value={caForm.whatsapp} onChange={e => setCAForm(p => ({ ...p, whatsapp: e.target.value }))} required />
              <input className={inputClass} placeholder="Alternate phone" value={caForm.phone} onChange={e => setCAForm(p => ({ ...p, phone: e.target.value }))} />
              <input className={inputClass} placeholder="City" value={caForm.city} onChange={e => setCAForm(p => ({ ...p, city: e.target.value }))} required />
              <input className={inputClass} placeholder="State" value={caForm.state} onChange={e => setCAForm(p => ({ ...p, state: e.target.value }))} required />
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <input className={inputClass} placeholder="Firm name" value={caForm.firmName} onChange={e => setCAForm(p => ({ ...p, firmName: e.target.value }))} />
              <input className={inputClass} placeholder="CA membership number" value={caForm.membershipNumber} onChange={e => setCAForm(p => ({ ...p, membershipNumber: e.target.value }))} required />
              <input className={inputClass} placeholder="Qualification" value={caForm.qualification} onChange={e => setCAForm(p => ({ ...p, qualification: e.target.value }))} required />
              <input className={inputClass} type="number" min="0" placeholder="Years of experience" value={caForm.yearsExperience} onChange={e => setCAForm(p => ({ ...p, yearsExperience: e.target.value }))} />
            </div>

            <div>
              <p className="text-xs font-bold text-gray-500 mb-2">Specializations</p>
              <ToggleGroup options={CA_SPECIALIZATIONS} value={caForm.specializations} onChange={specializations => setCAForm(p => ({ ...p, specializations, servicesOffered: specializations }))} />
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <select className={inputClass} value={caForm.govtIdType} onChange={e => setCAForm(p => ({ ...p, govtIdType: e.target.value }))}>
                <option>Aadhaar</option>
                <option>PAN</option>
                <option>Passport</option>
                <option>Voter ID</option>
                <option>Driving License</option>
              </select>
              <input className={inputClass} placeholder="Earnova/firm ID card URL" value={caForm.idCardUrl} onChange={e => setCAForm(p => ({ ...p, idCardUrl: e.target.value }))} required />
              <input className={inputClass} placeholder="Government ID document URL" value={caForm.govtIdUrl} onChange={e => setCAForm(p => ({ ...p, govtIdUrl: e.target.value }))} required />
              <input className={inputClass} placeholder="CA certificate / ICAI proof URL" value={caForm.caCertificateUrl} onChange={e => setCAForm(p => ({ ...p, caCertificateUrl: e.target.value }))} required />
              <input className={`${inputClass} sm:col-span-2`} placeholder="Practice certificate / authorization proof URL" value={caForm.practiceProofUrl} onChange={e => setCAForm(p => ({ ...p, practiceProofUrl: e.target.value }))} />
            </div>

            <label className="flex items-start gap-2 text-sm text-gray-600">
              <input className="mt-1" type="checkbox" checked={caForm.consentToVerify} onChange={e => setCAForm(p => ({ ...p, consentToVerify: e.target.checked }))} />
              I confirm these details are accurate and allow Earnova admin to manually verify my identity, WhatsApp number and CA membership proof.
            </label>

            <button disabled={submitting === 'ca'} className="btn-primary w-full justify-center py-3 bg-eco-700 hover:bg-eco-800">
              {submitting === 'ca' ? 'Submitting...' : 'Apply for Earnova CA verification'}
            </button>
          </form>
        </div>

        <div className="grid md:grid-cols-4 gap-3">
          {[
            ['Verified only', 'Admins approve CA applicants after checking government ID and CA proof.', BadgeCheck],
            ['Document-first', 'Clients share PAN, AIS/TIS, Form 16, bank and investment proof links.', FileText],
            ['Trackable work', 'Every tax job has assignment, status, notes and completion tracking.', ClipboardCheck],
            ['Business-ready', 'Supports GST, TDS, books, audit help and financial statements.', Briefcase],
          ].map(([title, text, Icon]) => (
            <div key={title} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-card">
              <Icon className="w-5 h-5 text-primary-700 mb-3" />
              <h3 className="font-display font-bold text-gray-900">{title}</h3>
              <p className="text-xs text-gray-500 mt-1">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <AuthModal isOpen={showAuth} initialTab="login" onClose={() => setShowAuth(false)} onSuccess={() => setShowAuth(false)} />
    </div>
  )
}
