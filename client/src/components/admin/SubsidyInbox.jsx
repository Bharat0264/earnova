import { useState } from 'react'
import { ChevronDown, ChevronUp, CheckCircle2, XCircle } from 'lucide-react'
import { formatDate, formatPrice } from '../../utils/formatters'
import { api } from '../../utils/api'

const ST_STYLE = { pending:'bg-amber-50 text-amber-700', contacted:'bg-blue-50 text-blue-700', 'in-progress':'bg-indigo-50 text-indigo-700', completed:'bg-eco-50 text-eco-700' }
const ASSISTANCE_LABELS = { 'eligibility-check':'Eligibility Check','document-help':'Document Help','application-filing':'Application Filing','full-support':'Full Support' }

export default function SubsidyInbox({ data, loading, reload }) {
  const [filter,   setFilter]   = useState('all')
  const [expanded, setExpanded] = useState(null)
  const [updating, setUpdating] = useState(null)
  const [note,     setNote]     = useState({})

  const filtered = filter === 'all' ? data : data.filter(r => r.status === filter)

  const update = async (id, body) => {
    setUpdating(id)
    try { await api.patch(`/subsidy/requests/${id}`, body); reload?.() }
    catch (e) { alert(e.message) }
    finally { setUpdating(null) }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-1.5 flex-wrap">
        {['all','pending','contacted','in-progress','completed'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
                    filter === s ? 'bg-primary-700 text-white border-primary-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}>{s}</button>
        ))}
      </div>

      <div className="space-y-3">
        {loading ? Array.from({length:4}).map((_,i) => <div key={i} className="h-20 bg-gray-100 rounded-2xl animate-pulse" />) :
          filtered.map(r => (
            <div key={r._id} className="bg-white border border-gray-100 rounded-2xl shadow-card overflow-hidden">
              <button onClick={() => setExpanded(expanded === r._id ? null : r._id)}
                      className="w-full flex items-center gap-4 p-4 hover:bg-gray-50/50 transition-colors text-left">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <p className="font-semibold text-sm text-gray-900">{r.name}</p>
                    {r.isEligible !== undefined && (
                      r.isEligible
                        ? <span className="flex items-center gap-1 text-[10px] font-bold text-eco-600 bg-eco-50 px-2 py-0.5 rounded-full"><CheckCircle2 className="w-2.5 h-2.5" />Eligible</span>
                        : <span className="flex items-center gap-1 text-[10px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full"><XCircle className="w-2.5 h-2.5" />Not Eligible</span>
                    )}
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${ST_STYLE[r.status] || 'bg-gray-100 text-gray-500'}`}>{r.status}</span>
                  </div>
                  <p className="text-xs text-gray-500">{r.state}{r.city ? `, ${r.city}` : ''} · {r.systemSize} kW · {ASSISTANCE_LABELS[r.assistanceType] || r.assistanceType} · {formatDate(r.createdAt)}</p>
                </div>
                {r.estimatedSubsidy > 0 && <p className="font-bold text-sm text-yellow-600 shrink-0">{formatPrice(r.estimatedSubsidy)}</p>}
                {expanded === r._id ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />}
              </button>

              {expanded === r._id && (
                <div className="border-t border-gray-100 p-4 space-y-3">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-gray-600">
                    <div><p className="text-gray-400 font-bold">Contact</p><p>{r.email}</p><p>{r.phone}</p></div>
                    <div><p className="text-gray-400 font-bold">Property</p><p>Type: {r.propertyType || '—'}</p><p>Roof: {r.roofType || '—'}</p></div>
                    <div><p className="text-gray-400 font-bold">Financials</p><p>System: {r.systemSize} kW</p><p>Bill: {r.annualBill ? formatPrice(r.annualBill)+'/yr' : '—'}</p></div>
                  </div>
                  {r.message && <p className="text-xs text-gray-600 bg-gray-50 rounded-xl p-3">{r.message}</p>}

                  <div className="flex flex-wrap gap-2 pt-1">
                    <select value={r.status} onChange={e => update(r._id, { status: e.target.value })}
                            disabled={updating === r._id}
                            className="text-xs border border-gray-200 rounded-xl px-3 py-2 bg-white cursor-pointer">
                      {['pending','contacted','in-progress','completed'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <input value={note[r._id] || ''} onChange={e => setNote(n => ({...n, [r._id]: e.target.value}))}
                           placeholder="Add admin note…" className="input-base py-1.5 text-xs flex-1" />
                    {note[r._id] && (
                      <button onClick={() => update(r._id, { adminNote: note[r._id] })}
                              className="btn-secondary text-xs py-1.5">Save Note</button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        }
      </div>
    </div>
  )
}
