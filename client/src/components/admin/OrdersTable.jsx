import { Fragment, useState } from 'react'
import { Search, ChevronDown, ChevronUp } from 'lucide-react'
import { formatPrice, formatDate } from '../../utils/formatters'
import { api } from '../../utils/api'

const STATUS_STYLE = {
  placed:     'bg-blue-50   text-blue-700',
  received:   'bg-cyan-50   text-cyan-700',
  processing: 'bg-amber-50  text-amber-700',
  shipped:    'bg-indigo-50 text-indigo-700',
  delivered:  'bg-eco-50    text-eco-700',
  cancelled:  'bg-red-50    text-red-600',
  returned:   'bg-gray-100  text-gray-600',
}
const STATUSES = ['all','placed','received','shipped','delivered','cancelled']
const FLOW = [
  { key: 'placed', label: 'Ordered' },
  { key: 'received', label: 'Order Received' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'delivered', label: 'Delivered' },
]

function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full capitalize ${STATUS_STYLE[status] || 'bg-gray-100 text-gray-600'}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />{status}
    </span>
  )
}

export default function OrdersTable({ data, loading, reload }) {
  const [search,     setSearch]     = useState('')
  const [filterSt,   setFilterSt]   = useState('all')
  const [expanded,   setExpanded]   = useState(null)
  const [updating,   setUpdating]   = useState(null)

  const filtered = data.filter(o => {
    const matchSt  = filterSt === 'all' || o.status === filterSt
    const matchQ   = !search || o.orderId?.toLowerCase().includes(search.toLowerCase()) || o.user?.name?.toLowerCase().includes(search.toLowerCase())
    return matchSt && matchQ
  })

  const updateStatus = async (id, status) => {
    setUpdating(id)
    try { await api.patch(`/orders/${id}/status`, { status }); reload?.() }
    catch (e) { alert(e.message) }
    finally { setUpdating(null) }
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
                 placeholder="Search order ID or customer…"
                 className="input-base pl-9 text-sm" />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {STATUSES.map(s => (
            <button key={s} onClick={() => setFilterSt(s)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all capitalize ${
                      filterSt === s ? 'bg-primary-700 text-white border-primary-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {['Order ID','Customer','Amount','Status','Date','Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-50">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-3.5 bg-gray-100 rounded-full animate-pulse" style={{width:`${[60,80,50,70,55,40][j]}%`}}/></td>
                    ))}
                  </tr>
                ))
              : filtered.map(order => (
                  <Fragment key={order._id}>
                    <tr className="hover:bg-gray-50/50 transition-colors cursor-pointer"
                        onClick={() => setExpanded(expanded === order._id ? null : order._id)}>
                      <td className="px-4 py-3">
                        <p className="font-bold text-gray-900 text-xs">{order.orderId}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-800 text-xs">{order.user?.name}</p>
                        <p className="text-[11px] text-gray-400">{order.user?.email}</p>
                      </td>
                      <td className="px-4 py-3 font-bold text-gray-900">{formatPrice(order.total)}</td>
                      <td className="px-4 py-3"><StatusBadge status={order.status} /></td>
                      <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{formatDate(order.createdAt)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <select
                            value={order.status}
                            onClick={e => e.stopPropagation()}
                            onChange={e => { e.stopPropagation(); updateStatus(order._id, e.target.value) }}
                            disabled={updating === order._id}
                            className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white focus:outline-none focus:border-primary-400 cursor-pointer"
                          >
                            {['placed','received','shipped','delivered','cancelled'].map(s => (
                              <option key={s} value={s} className="capitalize">{s}</option>
                            ))}
                          </select>
                          {expanded === order._id
                            ? <ChevronUp className="w-3.5 h-3.5 text-gray-400" />
                            : <ChevronDown className="w-3.5 h-3.5 text-gray-400" />}
                        </div>
                      </td>
                    </tr>
                    {expanded === order._id && (
                      <tr key={`${order._id}-exp`}>
                        <td colSpan={6} className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                          <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
                            <div>
                              <p className="font-bold text-gray-800 mb-1">Payment</p>
                              <p>Status: <span className={`font-semibold ${order.paymentStatus === 'paid' ? 'text-eco-600' : 'text-red-500'}`}>{order.paymentStatus}</span></p>
                              <p>Method: {order.paymentMethod}</p>
                              {order.razorpayPaymentId && <p>RZP ID: {order.razorpayPaymentId}</p>}
                            </div>
                            {order.shippingAddress && (
                              <div>
                                <p className="font-bold text-gray-800 mb-1">Delivery Address</p>
                                <p>{order.shippingAddress.name}</p>
                                <p>{order.shippingAddress.line1}, {order.shippingAddress.city}</p>
                                <p>{order.shippingAddress.state} – {order.shippingAddress.pincode}</p>
                              </div>
                            )}
                          </div>
                          {!['cancelled','returned'].includes(order.status) && (
                            <div className="grid grid-cols-4 gap-2 mt-4">
                              {FLOW.map((step, i) => {
                                const activeIndex = order.status === 'processing'
                                  ? 1
                                  : FLOW.findIndex(s => s.key === order.status)
                                const done = i <= activeIndex
                                return (
                                  <div key={step.key}>
                                    <div className={`h-1.5 rounded-full mb-2 ${done ? 'bg-eco-500' : 'bg-gray-200'}`} />
                                    <p className={`text-[11px] font-semibold ${done ? 'text-gray-800' : 'text-gray-400'}`}>{step.label}</p>
                                  </div>
                                )
                              })}
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))
            }
          </tbody>
        </table>
      </div>
    </div>
  )
}
