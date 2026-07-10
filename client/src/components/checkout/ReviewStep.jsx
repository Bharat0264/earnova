import { MapPin, ShoppingBag, Loader2, Shield, Truck } from 'lucide-react'
import { formatPrice } from '../../utils/formatters'
import { useCart } from '../../context/CartContext'

/* ── Razorpay script loader ── */
let scriptPromise = null
export function loadRazorpayScript() {
  if (window.Razorpay) return Promise.resolve(true)
  if (scriptPromise) return scriptPromise
  scriptPromise = new Promise((resolve) => {
    const s = document.createElement('script')
    s.src  = 'https://checkout.razorpay.com/v1/checkout.js'
    s.async = true
    s.onload  = () => resolve(true)
    s.onerror = () => { scriptPromise = null; resolve(false) }
    document.body.appendChild(s)
  })
  return scriptPromise
}

export default function ReviewStep({ address, onBack, onPay, loading, error }) {
  const { cartItems } = useCart()

  const total = cartItems.reduce((s, i) => s + i.price * i.quantity, 0)
  const solarOnly = cartItems.length > 0 && cartItems.every(i => i.category === 'solar-panels')
  const serviceOnly = cartItems.length > 0 && cartItems.every(i => i.itemType === 'service')

  return (
    <div className="space-y-5">
      <h2 className="font-display font-bold text-xl text-gray-900 flex items-center gap-2">
        <ShoppingBag className="w-5 h-5 text-primary-600" /> Review Order
      </h2>

      {/* Items list */}
      <div className="bg-white border border-gray-100 rounded-2xl divide-y divide-gray-50 shadow-card overflow-hidden">
        {cartItems.map(item => (
          <div key={item._id} className="flex items-center gap-3 p-4">
            <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 shrink-0">
              {(item.thumbnail || item.images?.[0]) && (
                <img
                  src={item.thumbnail || item.images?.[0]}
                  alt={item.name}
                  className="w-full h-full object-cover"
                  onError={e => { e.currentTarget.style.opacity = '0' }}
                />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 line-clamp-1">{item.name}</p>
              <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
            </div>
            <p className="text-sm font-bold text-gray-900 shrink-0">
              {formatPrice(item.price * item.quantity)}
            </p>
          </div>
        ))}
      </div>

      {/* Delivery address */}
      {!serviceOnly && address && <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-card">
        <div className="flex items-start gap-3">
          <MapPin className="w-4 h-4 text-primary-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
              Delivering to
            </p>
            <p className="text-sm font-semibold text-gray-900">{address.name}</p>
            <p className="text-sm text-gray-500 mt-0.5 leading-relaxed">
              {address.line1}{address.line2 ? ', ' + address.line2 : ''},&nbsp;
              {address.city}, {address.state} – {address.pincode}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">{address.phone}</p>
          </div>
          <button onClick={onBack}
                  className="ml-auto text-xs text-primary-600 font-semibold hover:underline shrink-0">
            Change
          </button>
        </div>
      </div>}

      {/* Price summary */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-card space-y-2.5">
        <h3 className="font-display font-semibold text-sm text-gray-900 mb-3">Total Amount</h3>
        <Row label={`Amount (${cartItems.length} item${cartItems.length !== 1 ? 's' : ''})`}
             value={formatPrice(total)} bold />
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {/* Payment buttons */}
      <button
        onClick={() => onPay('razorpay')}
        disabled={loading}
        className="btn-primary w-full py-4 text-base flex items-center justify-center gap-3"
      >
        {loading ? (
          <><Loader2 className="w-5 h-5 animate-spin" /> Processing…</>
        ) : (
          <><Shield className="w-5 h-5" /> Pay {formatPrice(total)} with Razorpay</>
        )}
      </button>

      {solarOnly && !serviceOnly && (
        <button
          onClick={() => onPay('cod')}
          disabled={loading}
          className="btn-secondary w-full py-4 text-base flex items-center justify-center gap-3"
        >
          {loading ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Creating order...</>
          ) : (
            <><Truck className="w-5 h-5" /> Pay on Delivery</>
          )}
        </button>
      )}

      <p className="text-center text-xs text-gray-400">
        {solarOnly
          ? 'Solar products support Razorpay or pay on delivery'
          : serviceOnly
            ? 'Business access activates only after Razorpay confirms this cart payment'
            : 'Secured prepaid checkout by Razorpay for this category'}
      </p>
    </div>
  )
}

function Row({ label, value, bold, muted }) {
  return (
    <div className={`flex justify-between items-center text-sm ${
      bold ? 'font-bold text-gray-900' : muted ? 'text-gray-400' : 'text-gray-600'
    }`}>
      <span>{label}</span><span>{value}</span>
    </div>
  )
}
