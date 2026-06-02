import { useState } from 'react'
import { Loader2, CheckCircle2, HeartHandshake } from 'lucide-react'
import { api } from '../../utils/api'

const ASSISTANCE_TYPES = [
  { value: 'eligibility-check', label: "✅ Check if I'm eligible", desc: 'Quick eligibility assessment call' },
  { value: 'document-help',     label: '📄 Help with documents',  desc: 'Document preparation assistance' },
  { value: 'application-filing',label: '💻 File my application',  desc: 'We file the portal application for you' },
  { value: 'full-support',      label: '🌟 Full end-to-end support', desc: 'From application to subsidy receipt' },
]

const STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa',
  'Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala',
  'Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland',
  'Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura',
  'Uttar Pradesh','Uttarakhand','West Bengal','Delhi','Jammu & Kashmir',
  'Ladakh','Chandigarh','Puducherry',
]

export default function AssistanceForm({ prefilledData }) {
  const [form, setForm] = useState({
    name:           prefilledData?.name  || '',
    email:          prefilledData?.email || '',
    phone:          '',
    state:          '',
    city:           '',
    assistanceType: '',
    systemSize:     prefilledData?.systemSize || '3',
    message:        '',
    propertyType:   prefilledData?.propertyType || '',
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error,   setError]   = useState('')

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.phone || !form.state || !form.assistanceType) {
      setError('Please fill in all required fields.'); return
    }
    setLoading(true); setError('')
    try {
      await api.post('/subsidy/request', form)
      setSuccess(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (success) return (
    <div className="bg-eco-50 border border-eco-100 rounded-2xl p-6 text-center">
      <CheckCircle2 className="w-10 h-10 text-eco-500 mx-auto mb-3" />
      <h3 className="font-display font-bold text-eco-800 mb-2">Request Submitted!</h3>
      <p className="text-eco-700 text-sm">
        Our solar subsidy expert will call you within <strong>48 hours</strong>.
        A confirmation has been sent to <strong>{form.email}</strong>.
      </p>
    </div>
  )

  return (
    <div id="assistance" className="bg-white border border-gray-100 rounded-3xl shadow-card overflow-hidden">
      <div className="bg-gradient-to-r from-primary-800 to-primary-950 px-6 py-5">
        <div className="flex items-center gap-2">
          <HeartHandshake className="w-5 h-5 text-white" />
          <h3 className="font-display font-bold text-white">Get Expert Assistance</h3>
        </div>
        <p className="text-primary-200 text-xs mt-0.5">Free guidance from our PM Surya Ghar specialists</p>
      </div>

      <form onSubmit={submit} className="p-6 space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        {/* Assistance type */}
        <div>
          <label className="text-xs font-semibold text-gray-600 mb-2 block">
            What help do you need? *
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {ASSISTANCE_TYPES.map(at => (
              <label key={at.value}
                     className={`flex items-start gap-2.5 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                       form.assistanceType === at.value
                         ? 'border-primary-500 bg-primary-50'
                         : 'border-gray-100 hover:border-gray-200'
                     }`}>
                <input type="radio" name="assistanceType" value={at.value}
                       checked={form.assistanceType === at.value}
                       onChange={set('assistanceType')}
                       className="accent-primary-700 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-gray-800">{at.label}</p>
                  <p className="text-xs text-gray-500">{at.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { k: 'name',  label: 'Your Name *',    type: 'text', ph: 'Raju Sharma'     },
            { k: 'phone', label: 'Mobile Number *', type: 'tel',  ph: '9876543210'      },
            { k: 'email', label: 'Email Address *', type: 'email',ph: 'raju@email.com'  },
          ].map(({ k, label, type, ph }) => (
            <div key={k}>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">{label}</label>
              <input type={type} value={form[k]} onChange={set(k)} placeholder={ph} className="input-base" />
            </div>
          ))}

          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">State *</label>
            <select value={form.state} onChange={set('state')} className="input-base">
              <option value="">Select state…</option>
              {STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">City</label>
            <input type="text" value={form.city} onChange={set('city')} placeholder="Chennai" className="input-base" />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">
              System Size: <span className="text-primary-700 font-bold">{form.systemSize} kW</span>
            </label>
            <input type="range" min="1" max="10" step="0.5" value={form.systemSize}
                   onChange={set('systemSize')}
                   className="w-full h-2 bg-gray-200 rounded-full accent-primary-700 cursor-pointer mt-2" />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-600 mb-1 block">
            Additional Information (optional)
          </label>
          <textarea value={form.message} onChange={set('message')} rows={2}
                    placeholder="Share any specific questions or concerns about the subsidy process…"
                    className="input-base resize-none" />
        </div>

        <button type="submit" disabled={loading}
                className="btn-primary w-full py-3.5 flex items-center justify-center gap-2">
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {loading ? 'Submitting…' : 'Request Free Expert Guidance'}
        </button>

        <p className="text-center text-xs text-gray-400">
          100% free · No spam · Our expert calls within 48 hours
        </p>
      </form>
    </div>
  )
}
