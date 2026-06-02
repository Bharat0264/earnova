import { useState } from 'react'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { formatPrice, formatDate } from '../../utils/formatters'
import { api } from '../../utils/api'

const ST_STYLE = { pending:'bg-amber-50 text-amber-700', processing:'bg-blue-50 text-blue-700', completed:'bg-eco-50 text-eco-700', failed:'bg-red-50 text-red-600' }

export default function WithdrawalQueue({ data, loading, reload }) {
  const [filter,   setFilter]   = useState('all')
  const [updating, setUpdating] = useState(null)

  const filtered = filter === 'all' ? data : data.filter(w => w.status === filter)

  const update = async (id, status, reason) => {
    setUpdating(id)
    try {
      await api.patch(`/referral/withdrawals/${id}`, { status, ...(reason ? { failureReason: reason } : {}) })
      reload?.()
    } catch (e) { alert(e.message) }
    finally { setUpdating(null) }
  }

  const pendingTotal = data.filter(w => w.status === 'pending').reduce((s, w) => s + w.amount, 0)

  return (
    <div className="space-y-4">
      {pendingTotal > 0 && (
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex items-center gap-3">
          <div>
            <p className="font-semibold text-amber-800 text-sm">₹{pendingTotal.toLocaleString('en-IN')} pending across {data.filter(w=>w.status==='pending').length} requests</p>
            <p className="text-amber-600 text-xs mt-0.5">Process withdrawals promptly to maintain referrer trust.</p>
          </div>
        </div>
      )}

      <div className="flex gap-1.5">
        {['all','pending','processing','completed','failed'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all capitalize ${
                    filter === s ? 'bg-primary-700 text-white border-primary-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}>{s}</button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {['User','Amount','UPI ID','Status','Date','Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-50">
            {loading
              ? Array.from({length:5}).map((_,i) => (
                  <tr key={i}>{Array.from({length:6}).map((_,j) => (
                    <td key={j} className="px-4 py-3"><div className="h-3.5 bg-gray-100 rounded-full animate-pulse" style={{width:`${[70,40,60,50,55,60][j]}%`}} /></td>
                  ))}</tr>
                ))
              : filtered.map(w => (
                  <tr key={w._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-900 text-xs">{w.user?.name}</p>
                      <p className="text-[11px] text-gray-400">{w.user?.email}</p>
                    </td>
                    <td className="px-4 py-3 font-bold text-gray-900">{formatPrice(w.amount)}</td>
                    <td className="px-4 py-3 text-xs text-gray-600 font-mono">{w.upiId}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full capitalize ${ST_STYLE[w.status]}`}>{w.status}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{formatDate(w.createdAt)}</td>
                    <td className="px-4 py-3">
                      {w.status === 'pending' && (
                        <div className="flex gap-2">
                          <button onClick={() => update(w._id, 'completed')} disabled={updating === w._id}
                                  className="flex items-center gap-1 text-[11px] font-bold text-eco-700 bg-eco-50 hover:bg-eco-100 px-2.5 py-1.5 rounded-lg transition-colors">
                            {updating === w._id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                            Approve
                          </button>
                          <button onClick={() => update(w._id, 'failed', 'Rejected by admin')} disabled={updating === w._id}
                                  className="flex items-center gap-1 text-[11px] font-bold text-red-600 bg-red-50 hover:bg-red-100 px-2.5 py-1.5 rounded-lg transition-colors">
                            <XCircle className="w-3 h-3" /> Reject
                          </button>
                        </div>
                      )}
                      {w.status === 'processing' && (
                        <button onClick={() => update(w._id, 'completed')} disabled={updating === w._id}
                                className="text-[11px] font-bold text-eco-700 bg-eco-50 hover:bg-eco-100 px-2.5 py-1.5 rounded-lg transition-colors">
                          Mark Complete
                        </button>
                      )}
                      {(w.status === 'completed' || w.status === 'failed') && (
                        <span className="text-[11px] text-gray-400">{formatDate(w.processedAt || w.createdAt)}</span>
                      )}
                    </td>
                  </tr>
                ))
            }
          </tbody>
        </table>
      </div>
    </div>
  )
}
