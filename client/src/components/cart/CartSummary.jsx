import { Link } from 'react-router-dom'
import { Shield, Tag, ArrowRight, Zap } from 'lucide-react'
import { formatPrice } from '../../utils/formatters'
import { useCart } from '../../context/CartContext'

export default function CartSummary() {
  const { cartItems, cartSubtotal } = useCart()

  const itemCount = cartItems.reduce((s, i) => s + i.quantity, 0)

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-card p-5 sticky top-24">
      <h2 className="font-display font-bold text-gray-900 mb-5">Order Summary</h2>

      {/* Line items */}
      <div className="space-y-3 text-sm mb-5">
        <Row label={`Subtotal (${itemCount} item${itemCount !== 1 ? 's' : ''})`}
             value={formatPrice(cartSubtotal)} />

        <div className="h-px bg-gray-100 my-1" />

        <Row label="Total Payable" value={formatPrice(cartSubtotal)} bold />
      </div>

      {/* Checkout CTA */}
      <Link
        to="/checkout"
        className="btn-primary w-full flex items-center justify-center gap-2 text-base py-3.5 mb-4"
      >
        Proceed to Checkout <ArrowRight className="w-4 h-4" />
      </Link>

      {/* Trust badges */}
      <div className="space-y-2.5">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Shield className="w-4 h-4 text-blue-500 shrink-0" />
          <span>Secured by <strong>Razorpay</strong> — UPI, cards, EMI, wallets</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Tag className="w-4 h-4 text-eco-500 shrink-0" />
          <span>Inclusive of all taxes — no hidden charges</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Zap className="w-4 h-4 text-yellow-500 shrink-0" />
          <span>EMI available from ₹3,000 with 0-cost options</span>
        </div>
      </div>
    </div>
  )
}

function Row({ label, value, bold, muted, className = '' }) {
  return (
    <div className={`flex items-center justify-between ${bold ? 'font-bold text-gray-900' : 'text-gray-600'} ${muted ? 'text-gray-400' : ''} ${className}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  )
}
