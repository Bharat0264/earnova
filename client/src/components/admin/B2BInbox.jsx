import { useState } from 'react'
import { ChevronDown, ChevronUp, Loader2 } from 'lucide-react'
import { formatDate, formatPrice } from '../../utils/formatters'
import { api } from '../../utils/api'

const ST_STYLE = { pending:'bg-amber-50 text-amber-700', reviewed:'bg-blue-50 text-blue-700', quoted:'bg-primary-50 text-primary-700', won:'bg-eco-50 text-eco-700', lost:'bg-gray-100 text-gray-500' }

export default function B2BInbox({ data, loading, reload }) {
  const [filter,   setFilter]   = useState('all')
  const [expanded, setExpanded] = useState(null)
  const [updating, setUpdating] = useState(null)
  const [pdfUrl,   setPdfUrl]   = useState({})

  const filtered = filter === 'all' ? data : data.filter(q => q.status === filter)

  const update = async (id, body) => {
    setUpdating(id)
    try { await api.patch(`/b2b/quotes/${id}`, body); reload?.() }
    catch (e) { alert(e.message) }
    finally { setUpdating(null) }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-1.5 flex-wrap">
        {['all','pending','reviewed','quoted','won','lost'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all capitalize ${
                    filter === s ? 'bg-primary-700 text-white border-primary-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}>{s}</button>
        ))}
      </div>

      <div className="space-y-3">
        {loading ? Array.from({length:4}).map((_,i) => (
          <div key={i} className="h-20 bg-gray-100 rounded-2xl animate-pulse" />
        )) : filtered.map(q => (
          <div key={q._id} className="bg-white border border-gray-100 rounded-2xl shadow-card overflow-hidden">
            <button onClick={() => setExpanded(expanded === q._id ? null : q._id)}
                    className="w-full flex items-center gap-4 p-4 hover:bg-gray-50/50 transition-colors text-left">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  <p className="font-semibold text-sm text-gray-900">{q.organization}</p>
                  <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full capitalize">{q.businessType}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${ST_STYLE[q.status] || 'bg-gray-100 text-gray-500'}`}>{q.status}</span>
                </div>
                <p className="text-xs text-gray-500">{q.name} · {q.city}, {q.state} · {formatDate(q.createdAt)}</p>
              </div>
              {q.quotedAmount && <p className="font-bold text-sm text-primary-700 shrink-0">{formatPrice(q.quotedAmount)}</p>}
              {expanded === q._id ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />}
            </button>

            {expanded === q._id && (
              <div className="border-t border-gray-100 p-4 space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-gray-600">
                  <div><p className="text-gray-400 font-bold">Contact</p><p>{q.email}</p><p>{q.phone}</p></div>
                  <div><p className="text-gray-400 font-bold">Budget / Timeline</p><p>{q.budget || '—'}</p><p>{q.timeline || '—'}</p></div>
                  <div><p className="text-gray-400 font-bold">Products</p>
                    {q.products?.map((p,i) => <p key={i}>{p.category}: {p.quantity} units</p>)}
                  </div>
                </div>
                {q.message && <p className="text-xs text-gray-600 bg-gray-50 rounded-xl p-3">{q.message}</p>}

                {/* Actions */}
                <div className="flex flex-wrap gap-2 pt-1">
                  <select value={q.status} onChange={e => update(q._id, { status: e.target.value })}
                          disabled={updating === q._id}
                          className="text-xs border border-gray-200 rounded-xl px-3 py-2 bg-white cursor-pointer">
                    {['pending','reviewed','quoted','won','lost'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>

                  {q.status === 'reviewed' && (
                    <div className="flex gap-2 flex-1">
                      <input value={pdfUrl[q._id] || ''} onChange={e => setPdfUrl(p => ({...p, [q._id]: e.target.value}))}
                             placeholder="Paste quote PDF URL…" className="input-base py-1.5 text-xs flex-1" />
                      <button onClick={() => update(q._id, { status: 'quoted', quotePdfUrl: pdfUrl[q._id], quotedAmount: undefined })}
                              disabled={!pdfUrl[q._id] || updating === q._id}
                              className="btn-primary text-xs py-1.5 flex items-center gap-1 whitespace-nowrap">
                        {updating === q._id ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                        Send Quote
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
