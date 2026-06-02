import { useState } from 'react'
import { CheckCircle2, XCircle, Sun, Zap, TrendingUp, Loader2 } from 'lucide-react'
import { formatPrice } from '../../utils/formatters'
import { api } from '../../utils/api'

const STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa',
  'Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala',
  'Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland',
  'Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura',
  'Uttar Pradesh','Uttarakhand','West Bengal','Delhi','Jammu & Kashmir',
  'Ladakh','Chandigarh','Puducherry',
]

export default function EligibilityChecker({ onEligibleResult }) {
  const [form, setForm] = useState({
    state: '', propertyType: '', hasElectricity: 'yes',
    existingSolar: 'no', systemSize: '3',
  })
  const [result,  setResult]  = useState(null)
  const [loading, setLoading] = useState(false)

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const check = async () => {
    if (!form.state || !form.propertyType) return
    setLoading(true)
    try {
      /* Try API first, fall back to client-side calc */
      const data = await api.post('/subsidy/check-eligibility', form)
      setResult(data)
      if (data.isEligible) onEligibleResult?.(data)
    } catch {
      /* Client-side fallback */
      const reasons = []
      if (form.propertyType !== 'owned')   reasons.push('Subsidy requires property ownership (not rented)')
      if (form.hasElectricity !== 'yes')   reasons.push('Active electricity connection in your name required')
      if (form.existingSolar === 'yes')    reasons.push('Subsidy not available for existing/expanded solar systems')
      const isEligible = reasons.length === 0
      const kw = Math.min(Number(form.systemSize), 10)
      const subsidy = isEligible ? (kw <= 1 ? 30000 : kw <= 2 ? 60000 : 78000) : 0
      const annualSavings = Math.round(kw * 4 * 365 * 8)
      setResult({ isEligible, subsidy, systemSize: kw, annualSavings, annualGeneration: Math.round(kw * 4 * 365), reasons })
      if (isEligible) onEligibleResult?.({ isEligible, subsidy, annualSavings })
    } finally {
      setLoading(false)
    }
  }

  const ready = form.state && form.propertyType

  return (
    <div className="bg-white border border-gray-100 rounded-3xl shadow-card overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-500 to-orange-500 px-6 py-4">
        <div className="flex items-center gap-2">
          <Sun className="w-5 h-5 text-white" />
          <h3 className="font-display font-bold text-white">PM Surya Ghar Eligibility Checker</h3>
        </div>
        <p className="text-yellow-100 text-xs mt-0.5">Check your eligibility for up to ₹78,000 subsidy — free, instant</p>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          {/* State */}
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">Your State *</label>
            <select value={form.state} onChange={set('state')} className="input-base">
              <option value="">Select state…</option>
              {STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Property type */}
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">Property Ownership *</label>
            <div className="flex gap-2">
              {[
                { val: 'owned',  label: '🏠 I Own It' },
                { val: 'rented', label: '🔑 Rented'    },
              ].map(opt => (
                <button key={opt.val} type="button" onClick={() => setForm(f => ({ ...f, propertyType: opt.val }))}
                        className={`flex-1 py-2.5 text-sm font-semibold rounded-xl border-2 transition-all ${
                          form.propertyType === opt.val
                            ? 'border-primary-600 bg-primary-50 text-primary-700'
                            : 'border-gray-200 text-gray-500 hover:border-gray-300'
                        }`}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Electricity connection */}
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">
              Electricity connection in your name?
            </label>
            <div className="flex gap-2">
              {['yes','no'].map(v => (
                <button key={v} type="button" onClick={() => setForm(f => ({ ...f, hasElectricity: v }))}
                        className={`flex-1 py-2.5 text-sm font-semibold rounded-xl border-2 transition-all capitalize ${
                          form.hasElectricity === v
                            ? 'border-primary-600 bg-primary-50 text-primary-700'
                            : 'border-gray-200 text-gray-500'
                        }`}>
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* Existing solar */}
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">
              Do you have existing solar panels?
            </label>
            <div className="flex gap-2">
              {['no','yes'].map(v => (
                <button key={v} type="button" onClick={() => setForm(f => ({ ...f, existingSolar: v }))}
                        className={`flex-1 py-2.5 text-sm font-semibold rounded-xl border-2 transition-all capitalize ${
                          form.existingSolar === v
                            ? 'border-primary-600 bg-primary-50 text-primary-700'
                            : 'border-gray-200 text-gray-500'
                        }`}>
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* System size */}
          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-gray-600 mb-1 block">
              Desired System Size: <span className="text-primary-700 font-bold">{form.systemSize} kW</span>
            </label>
            <input type="range" min="1" max="10" step="0.5" value={form.systemSize}
                   onChange={set('systemSize')}
                   className="w-full h-2 bg-gray-200 rounded-full accent-primary-700 cursor-pointer" />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>1 kW (small)</span><span>5 kW (medium)</span><span>10 kW (large)</span>
            </div>
          </div>
        </div>

        <button
          onClick={check}
          disabled={!ready || loading}
          className="btn-primary w-full py-3.5 flex items-center justify-center gap-2
                     disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Checking…</> : '✅ Check My Eligibility'}
        </button>
      </div>

      {/* Result */}
      {result && (
        <div className={`border-t px-6 pb-6 pt-4 ${
          result.isEligible ? 'border-eco-100 bg-eco-50' : 'border-red-100 bg-red-50'
        }`}>
          {result.isEligible ? (
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-eco-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-display font-bold text-eco-800 text-lg">
                    You are ELIGIBLE! 🎉
                  </p>
                  <p className="text-eco-700 text-sm mt-0.5">
                    For a {result.systemSize} kW system in {form.state}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { Icon: Zap, val: formatPrice(result.subsidy), label: 'Central Subsidy' },
                  { Icon: TrendingUp, val: formatPrice(result.annualSavings), label: 'Annual Savings' },
                  { Icon: Sun, val: `${result.annualGeneration?.toLocaleString('en-IN')} units`, label: 'Annual Generation' },
                ].map(({ Icon, val, label }) => (
                  <div key={label} className="bg-white rounded-xl p-3 text-center border border-eco-100">
                    <Icon className="w-4 h-4 text-eco-600 mx-auto mb-1" />
                    <p className="font-bold text-gray-900 text-sm">{val}</p>
                    <p className="text-[11px] text-gray-500">{label}</p>
                  </div>
                ))}
              </div>

              {result.stateBonusNote && (
                <div className="bg-yellow-50 border border-yellow-100 rounded-xl px-4 py-2.5 text-xs text-yellow-800">
                  💡 <strong>State Bonus:</strong> {result.stateBonusNote}
                </div>
              )}

              {result.paybackYears && (
                <p className="text-xs text-eco-700 font-medium">
                  ⚡ Estimated payback period: <strong>{result.paybackYears} years</strong>
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-700">Not Eligible for PM Surya Ghar Subsidy</p>
                  <p className="text-red-600 text-xs mt-0.5">Based on the details provided</p>
                </div>
              </div>
              <ul className="space-y-1.5">
                {result.reasons.map(r => (
                  <li key={r} className="text-xs text-red-600 flex items-start gap-1.5">
                    <span className="shrink-0">•</span>{r}
                  </li>
                ))}
              </ul>
              <p className="text-xs text-gray-500 pt-1">
                You can still benefit from energy savings by installing solar without the subsidy. 
                <a href="/subsidy#assistance" className="text-primary-600 ml-1 hover:underline">
                  Talk to our expert →
                </a>
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
