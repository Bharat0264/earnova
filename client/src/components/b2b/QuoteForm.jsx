import { useState } from 'react'
import { CheckCircle2, Loader2, ArrowRight, ArrowLeft, Building2 } from 'lucide-react'
import { api } from '../../utils/api'

const STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa',
  'Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala',
  'Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland',
  'Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura',
  'Uttar Pradesh','Uttarakhand','West Bengal','Delhi','Jammu & Kashmir',
  'Ladakh','Chandigarh','Puducherry',
]

const BUSINESS_TYPES = [
  { value: 'apartment',   label: '🏢 Apartment Complex' },
  { value: 'school',      label: '🏫 School / College'  },
  { value: 'hospital',    label: '🏥 Hospital / Clinic'  },
  { value: 'office',      label: '🏬 Office / Warehouse' },
  { value: 'factory',     label: '🏭 Factory / Industrial' },
  { value: 'dealer',      label: '🤝 Dealer / Distributor' },
  { value: 'contractor',  label: '🔧 Contractor / Installer' },
  { value: 'other',       label: '📋 Other'              },
]

const CATEGORIES = ['Solar Panels', 'Fans', 'ACs', 'Accessories']

const INITIAL = {
  name: '', email: '', phone: '', organization: '', designation: '',
  businessType: '', city: '', state: '',
  products: CATEGORIES.map(c => ({ category: c.toLowerCase().replace(' ', '-'), label: c, quantity: '', specifications: '', selected: false })),
  budget: '', timeline: '', message: '', heardFrom: '', referralCode: '',
}

function Field({ label, type = 'text', placeholder, req, value, onChange, error, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1">
        {label}{req && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children || (
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete="off"
          className={`input-base ${error ? 'border-red-300' : ''}`}
        />
      )}
      {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
    </div>
  )
}

export default function QuoteForm() {
  const [step,    setStep]    = useState(1)
  const [form,    setForm]    = useState(INITIAL)
  const [errors,  setErrors]  = useState({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const toggleProduct = (i) => {
    setForm(f => {
      const products = [...f.products]
      products[i] = { ...products[i], selected: !products[i].selected }
      return { ...f, products }
    })
  }

  const setProductField = (i, k, v) => {
    setForm(f => {
      const products = [...f.products]
      products[i] = { ...products[i], [k]: v }
      return { ...f, products }
    })
  }

  const validate = (s) => {
    const e = {}
    if (s === 1) {
      if (!form.name.trim())         e.name         = 'Required'
      if (!form.email.trim())        e.email        = 'Required'
      if (!form.phone.trim())        e.phone        = 'Required'
      if (!form.organization.trim()) e.organization = 'Required'
      if (!form.businessType)        e.businessType = 'Select business type'
      if (!form.city.trim())         e.city         = 'Required'
      if (!form.state)               e.state        = 'Required'
    }
    if (s === 2) {
      const anySelected = form.products.some(p => p.selected)
      if (!anySelected) e.products = 'Select at least one product category'
    }
    return e
  }

  const next = () => {
    const e = validate(step)
    if (Object.keys(e).length) { setErrors(e); return }
    setErrors({})
    setStep(s => s + 1)
  }

  const submit = async () => {
    setLoading(true)
    try {
      const payload = {
        ...form,
        products: form.products
          .filter(p => p.selected)
          .map(p => ({ category: p.category, quantity: Number(p.quantity) || 0, specifications: p.specifications })),
      }
      await api.post('/b2b/quote', payload)
      setSuccess(true)
    } catch (err) {
      setErrors({ submit: err.message })
    } finally {
      setLoading(false)
    }
  }

  if (success) return (
    <div className="bg-white border border-gray-100 rounded-3xl shadow-card p-8 text-center">
      <div className="w-16 h-16 bg-eco-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <CheckCircle2 className="w-8 h-8 text-eco-600" />
      </div>
      <h3 className="font-display font-bold text-xl text-gray-900 mb-2">Quote Request Submitted!</h3>
      <p className="text-gray-500 text-sm mb-4 max-w-sm mx-auto">
        Our B2B team will review your requirements and get back to you within <strong>24 business hours</strong>.
      </p>
      <div className="bg-primary-50 border border-primary-100 rounded-2xl p-4 text-sm text-primary-700 mb-6">
        A confirmation email has been sent to <strong>{form.email}</strong>.
      </div>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <a href="/products" className="btn-secondary text-sm">Browse Products</a>
        <a href="/referral" className="btn-primary text-sm flex items-center gap-2">
          Refer a Business → Earn 8–12% <ArrowRight className="w-4 h-4" />
        </a>
      </div>
    </div>
  )

  return (
    <div className="bg-white border border-gray-100 rounded-3xl shadow-card overflow-hidden">
      {/* Progress */}
      <div className="bg-gray-50 border-b border-gray-100 px-6 py-4">
        <div className="flex items-center gap-2 mb-2">
          <Building2 className="w-4 h-4 text-primary-600" />
          <span className="font-display font-bold text-gray-900">Request Custom Quote</span>
        </div>
        <div className="flex items-center gap-1.5">
          {['Business Details', 'Requirements', 'Confirm'].map((label, i) => {
            const n = i + 1
            return (
              <div key={n} className="flex items-center gap-1.5">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  n < step ? 'bg-eco-500 text-white' : n === step ? 'bg-primary-700 text-white' : 'bg-gray-200 text-gray-400'
                }`}>
                  {n < step ? '✓' : n}
                </div>
                <span className={`text-xs font-medium hidden sm:block ${n === step ? 'text-primary-700' : 'text-gray-400'}`}>{label}</span>
                {i < 2 && <div className={`flex-1 h-0.5 w-8 ${n < step ? 'bg-eco-400' : 'bg-gray-200'}`} />}
              </div>
            )
          })}
        </div>
      </div>

      <div className="p-6 space-y-4">
        {/* ── Step 1: Business Details ── */}
        {step === 1 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Organization Name" value={form.organization} onChange={set('organization')} error={errors.organization} placeholder="Sunshine Apartments" req />
              <Field label="Business Type" error={errors.businessType} req>
                <select value={form.businessType} onChange={set('businessType')}
                        className={`input-base ${errors.businessType ? 'border-red-300' : ''}`}>
                  <option value="">Select type…</option>
                  {BUSINESS_TYPES.map(bt => (
                    <option key={bt.value} value={bt.value}>{bt.label}</option>
                  ))}
                </select>
              </Field>
              <Field label="Your Name" value={form.name} onChange={set('name')} error={errors.name} placeholder="Raju Sharma" req />
              <Field label="Designation" value={form.designation} onChange={set('designation')} error={errors.designation} placeholder="Facility Manager" />
              <Field label="Email Address" type="email" value={form.email} onChange={set('email')} error={errors.email} placeholder="raju@apartments.com" req />
              <Field label="Mobile Number" type="tel" value={form.phone} onChange={set('phone')} error={errors.phone} placeholder="9876543210" req />
              <Field label="City" value={form.city} onChange={set('city')} error={errors.city} placeholder="Mumbai" req />
              <Field label="State" error={errors.state} req>
                <select value={form.state} onChange={set('state')}
                        className={`input-base ${errors.state ? 'border-red-300' : ''}`}>
                  <option value="">Select state…</option>
                  {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </Field>
            </div>
          </>
        )}

        {/* ── Step 2: Requirements ── */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2">
                Products Required<span className="text-red-400 ml-0.5">*</span>
              </label>
              <div className="space-y-3">
                {form.products.map((p, i) => (
                  <div key={p.category} className={`border-2 rounded-xl p-3 transition-all ${
                    p.selected ? 'border-primary-400 bg-primary-50' : 'border-gray-100 hover:border-gray-200'
                  }`}>
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input type="checkbox" checked={p.selected} onChange={() => toggleProduct(i)}
                             className="w-4 h-4 accent-primary-700" />
                      <span className="font-semibold text-sm text-gray-800">{p.label}</span>
                    </label>
                    {p.selected && (
                      <div className="mt-2.5 grid grid-cols-2 gap-2 pl-6">
                        <div>
                          <label className="text-[11px] text-gray-500 mb-0.5 block">Quantity</label>
                          <input type="number" value={p.quantity} min="1"
                                 onChange={e => setProductField(i, 'quantity', e.target.value)}
                                 placeholder="e.g. 50" className="input-base py-1.5 text-sm" />
                        </div>
                        <div>
                          <label className="text-[11px] text-gray-500 mb-0.5 block">Specifications</label>
                          <input type="text" value={p.specifications}
                                 onChange={e => setProductField(i, 'specifications', e.target.value)}
                                 placeholder="e.g. 400W, 5-star" className="input-base py-1.5 text-sm" />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {errors.products && <p className="text-xs text-red-500 mt-1">{errors.products}</p>}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Project Timeline">
                <select value={form.timeline} onChange={set('timeline')} className="input-base">
                  <option value="">Select…</option>
                  {['Immediate (within 1 month)','1–3 months','3–6 months','6–12 months','Planning stage'].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </Field>
              <Field label="Approximate Budget">
                <select value={form.budget} onChange={set('budget')} className="input-base">
                  <option value="">Select range…</option>
                  {['Under ₹5 Lakh','₹5–20 Lakh','₹20–50 Lakh','₹50 Lakh – 1 Cr','Above ₹1 Cr'].map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </Field>
            </div>
          </div>
        )}

        {/* ── Step 3: Confirm ── */}
        {step === 3 && (
          <div className="space-y-4">
            <Field label="Additional Requirements or Notes">
              <textarea value={form.message} onChange={set('message')} rows={3}
                        placeholder="Specific brands, warranty requirements, installation support needed…"
                        className="input-base resize-none" />
            </Field>
            <Field label="How did you hear about Earnova?">
              <select value={form.heardFrom} onChange={set('heardFrom')} className="input-base">
                <option value="">Select…</option>
                {['Google Search','WhatsApp/Social Media','Referral from colleague','Advertisement','Already a customer','Other'].map(h => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
            </Field>
            <Field label="Referral Code (optional)" value={form.referralCode} onChange={set('referralCode')} error={errors.referralCode} placeholder="e.g. RAJU7X2K" />

            {/* Summary */}
            <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-1.5 text-gray-600">
              <p className="font-semibold text-gray-900">Summary</p>
              <p>📍 {form.organization} · {form.businessType} · {form.city}, {form.state}</p>
              <p>👤 {form.name} · {form.email} · {form.phone}</p>
              <p>📦 {form.products.filter(p=>p.selected).map(p=>`${p.label} (${p.quantity||'?'} units)`).join(', ')}</p>
              {form.timeline && <p>⏱ {form.timeline}</p>}
              {form.budget   && <p>💰 {form.budget}</p>}
            </div>

            {errors.submit && (
              <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                {errors.submit}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="px-6 pb-6 flex gap-3">
        {step > 1 && (
          <button onClick={() => setStep(s => s-1)}
                  className="btn-secondary flex items-center gap-2 text-sm px-4 py-2.5">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        )}
        {step < 3 ? (
          <button onClick={next} className="btn-primary flex-1 flex items-center justify-center gap-2 text-sm py-2.5">
            Continue <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button onClick={submit} disabled={loading}
                  className="btn-primary flex-1 flex items-center justify-center gap-2 text-sm py-2.5">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? 'Submitting…' : 'Submit Quote Request'}
          </button>
        )}
      </div>
    </div>
  )
}
