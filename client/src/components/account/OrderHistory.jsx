import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Package, ChevronDown, ChevronUp, MapPin, Plus, Trash2, Home, Briefcase, MoreHorizontal, Loader2 } from 'lucide-react'
import { formatPrice, formatDate } from '../../utils/formatters'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../utils/api'

/* ══════════════════════════════════════
   ORDER STATUS CHIP
══════════════════════════════════════ */
const STATUS_STYLE = {
  placed:     'bg-blue-50   text-blue-700',
  received:   'bg-cyan-50   text-cyan-700',
  processing: 'bg-amber-50  text-amber-700',
  shipped:    'bg-indigo-50 text-indigo-700',
  delivered:  'bg-eco-50    text-eco-700',
  cancelled:  'bg-red-50    text-red-600',
  returned:   'bg-gray-100  text-gray-600',
}

const FLOW = [
  { key: 'placed', label: 'Ordered' },
  { key: 'received', label: 'Order Received' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'delivered', label: 'Delivered' },
]

function OrderFlow({ status }) {
  const index = status === 'processing'
    ? 1
    : FLOW.findIndex(step => step.key === status)

  if (['cancelled', 'returned'].includes(status)) return null

  return (
    <div className="grid grid-cols-4 gap-2">
      {FLOW.map((step, i) => {
        const done = i <= index
        return (
          <div key={step.key} className="min-w-0">
            <div className={`h-1.5 rounded-full mb-2 ${done ? 'bg-eco-500' : 'bg-gray-200'}`} />
            <p className={`text-[11px] font-semibold leading-tight ${done ? 'text-gray-800' : 'text-gray-400'}`}>
              {step.label}
            </p>
          </div>
        )
      })}
    </div>
  )
}

function StatusChip({ status }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1
                      rounded-full capitalize ${STATUS_STYLE[status] || 'bg-gray-100 text-gray-600'}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {status}
    </span>
  )
}

/* ══════════════════════════════════════
   SINGLE ORDER CARD
══════════════════════════════════════ */
function OrderCard({ order }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-card overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center justify-between p-4 lg:p-5 hover:bg-gray-50/50 transition-colors"
      >
        <div className="flex items-start gap-3 text-left">
          <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center shrink-0">
            <Package className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">{order.orderId}</p>
            <p className="text-xs text-gray-400 mt-0.5">{formatDate(order.createdAt)}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <StatusChip status={order.status} />
          <span className="font-bold text-gray-900 text-sm">{formatPrice(order.total)}</span>
          {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </div>
      </button>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-gray-100 p-4 lg:p-5 space-y-4">
          {/* Items */}
          <div className="space-y-3">
            {order.items.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden shrink-0">
                  {item.image && (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 line-clamp-1">{item.name}</p>
                  <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                </div>
                <p className="text-sm font-bold text-gray-900 shrink-0">
                  {formatPrice(item.price * item.quantity)}
                </p>
              </div>
            ))}
          </div>

          {/* Pricing */}
          <OrderFlow status={order.status} />

          {/* Pricing */}
          <div className="bg-gray-50 rounded-xl p-3 space-y-1.5 text-sm">
            <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
            <div className="flex justify-between text-gray-500"><span>GST</span><span>{formatPrice(order.gstAmount)}</span></div>
            <div className="flex justify-between text-gray-500"><span>Shipping</span>
              <span className={order.shippingCharge === 0 ? 'text-eco-600 font-semibold' : ''}>
                {order.shippingCharge === 0 ? 'Free' : formatPrice(order.shippingCharge)}
              </span>
            </div>
            <div className="flex justify-between font-bold text-gray-900 border-t border-gray-200 pt-1.5">
              <span>Total</span><span>{formatPrice(order.total)}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Payment</span>
              <span>{order.paymentMethod === 'cod' ? 'Pay on Delivery' : order.paymentStatus}</span>
            </div>
          </div>

          {/* Delivery address */}
          {order.shippingAddress && (
            <div className="flex items-start gap-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
              <span>
                {order.shippingAddress.line1}, {order.shippingAddress.city},&nbsp;
                {order.shippingAddress.state} – {order.shippingAddress.pincode}
              </span>
            </div>
          )}

          {/* Tracking */}
          {order.trackingId && (
            <div className="text-xs text-gray-500">
              Tracking: <strong>{order.trackingId}</strong> via {order.courier}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/* ══════════════════════════════════════
   ORDER HISTORY
══════════════════════════════════════ */
export function OrderHistory() {
  const [orders,  setOrders]  = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  useEffect(() => {
    api.get('/orders')
      .then(d => setOrders(d.orders || []))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center py-16">
      <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
    </div>
  )

  if (error) return (
    <div className="text-center py-12 text-red-500 text-sm">{error}</div>
  )

  if (orders.length === 0) return (
    <div className="text-center py-16">
      <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <Package className="w-8 h-8 text-gray-300" />
      </div>
      <h3 className="font-display font-bold text-gray-700 mb-2">No orders yet</h3>
      <p className="text-gray-400 text-sm mb-6">Your order history will appear here.</p>
      <Link to="/products" className="btn-primary text-sm">Browse Products</Link>
    </div>
  )

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-500">{orders.length} order{orders.length !== 1 ? 's' : ''}</p>
      {orders.map(order => <OrderCard key={order._id} order={order} />)}
    </div>
  )
}

/* ══════════════════════════════════════
   ADDRESS BOOK
══════════════════════════════════════ */
const TYPE_ICON = { home: Home, work: Briefcase, other: MoreHorizontal }

export function AddressBook() {
  const { user, updateUser } = useAuth()
  const [deleting, setDeleting] = useState(null)
  const addresses = user?.addresses || []

  const deleteAddress = async (id) => {
    setDeleting(id)
    try {
      const data = await api.delete(`/auth/addresses/${id}`)
      updateUser({ addresses: data.addresses })
    } catch (err) { alert(err.message) }
    finally { setDeleting(null) }
  }

  const setDefault = async (id) => {
    try {
      const data = await api.patch(`/auth/addresses/${id}`, { isDefault: true })
      updateUser({ addresses: data.addresses })
    } catch (err) { alert(err.message) }
  }

  if (addresses.length === 0) return (
    <div className="text-center py-12">
      <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <MapPin className="w-7 h-7 text-gray-300" />
      </div>
      <h3 className="font-display font-bold text-gray-700 mb-2">No saved addresses</h3>
      <p className="text-gray-400 text-sm">Addresses you add during checkout will appear here.</p>
    </div>
  )

  return (
    <div className="space-y-3">
      {addresses.map(addr => {
        const Icon = TYPE_ICON[addr.type] || Home
        return (
          <div key={addr._id} className="bg-white border border-gray-100 rounded-2xl shadow-card p-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 bg-primary-50 rounded-xl flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4 text-primary-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  <p className="font-semibold text-sm text-gray-900">{addr.name}</p>
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider">{addr.type}</span>
                  {addr.isDefault && (
                    <span className="text-[10px] font-bold text-eco-600 bg-eco-50 px-2 py-0.5 rounded-full">
                      Default
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {addr.line1}{addr.line2 ? ', ' + addr.line2 : ''},&nbsp;
                  {addr.city}, {addr.state} – {addr.pincode}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{addr.phone}</p>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {!addr.isDefault && (
                  <button onClick={() => setDefault(addr._id)}
                          className="text-xs text-primary-600 font-semibold px-2 py-1 rounded-lg hover:bg-primary-50">
                    Set default
                  </button>
                )}
                <button onClick={() => deleteAddress(addr._id)}
                        disabled={deleting === addr._id}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                  {deleting === addr._id
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <Trash2 className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
