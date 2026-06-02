import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, Package, ArrowLeft, Loader2 } from 'lucide-react'
import AddressStep from '../components/checkout/AddressStep'
import ReviewStep, { loadRazorpayScript } from '../components/checkout/ReviewStep'
import AuthModal from '../components/auth/AuthModal'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { api } from '../utils/api'
import { formatPrice } from '../utils/formatters'

const STEPS = ['Address', 'Review', 'Payment']

function StepIndicator({ current }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {STEPS.map((label, i) => {
        const n       = i + 1
        const done    = n < current
        const active  = n === current
        return (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                              transition-all duration-300 ${
                                done   ? 'bg-eco-500 text-white' :
                                active ? 'bg-primary-700 text-white ring-4 ring-primary-100' :
                                         'bg-gray-100 text-gray-400'
                              }`}>
                {done ? <CheckCircle2 className="w-4 h-4" /> : n}
              </div>
              <span className={`text-xs mt-1 font-medium ${active ? 'text-primary-700' : 'text-gray-400'}`}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`w-16 sm:w-24 h-0.5 mb-4 mx-1 transition-colors duration-300 ${
                n < current ? 'bg-eco-400' : 'bg-gray-200'
              }`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

export default function CheckoutPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const { cartItems, clearCart } = useCart()
  const [showAuth,    setShowAuth]    = useState(false)
  const [step,        setStep]        = useState(1)
  const [address,     setAddress]     = useState(null)
  const [paying,      setPaying]      = useState(false)
  const [payError,    setPayError]    = useState('')
  const [order,       setOrder]       = useState(null)

  /* Redirect to login if not authenticated */
  useEffect(() => {
    if (!authLoading && !isAuthenticated) setShowAuth(true)
  }, [authLoading, isAuthenticated])

  /* Pre-select default address */
  useEffect(() => {
    if (user?.addresses?.length) {
      const def = user.addresses.find(a => a.isDefault) || user.addresses[0]
      setAddress(def)
    }
  }, [user])

  /* Empty cart guard */
  if (!authLoading && isAuthenticated && cartItems.length === 0 && !order) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-gray-300" />
          </div>
          <h2 className="font-display font-bold text-xl text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-500 text-sm mb-6">Add products before checking out.</p>
          <Link to="/products" className="btn-primary">Browse Products</Link>
        </div>
      </div>
    )
  }

  /* ── Razorpay payment handler ── */
  const handlePay = async (totalAmount) => {
    setPaying(true); setPayError('')
    try {
      const loaded = await loadRazorpayScript()
      if (!loaded) throw new Error('Razorpay failed to load. Check your internet connection.')

      const { orderId: rzpId, amount, currency, keyId } =
        await api.post('/payment/create-order', { cartItems })

      await new Promise((resolve, reject) => {
        const options = {
          key:         keyId,
          amount,
          currency,
          name:        'Earnova Energy',
          description: `${cartItems.length} item${cartItems.length !== 1 ? 's' : ''}`,
          image:       '/favicon.svg',
          order_id:    rzpId,
          handler: async (response) => {
            try {
              const data = await api.post('/payment/verify', {
                razorpayOrderId:   response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                shippingAddress:   address,
                cartItems,
              })
              clearCart()
              setOrder(data.order)
              setStep(4)
              resolve()
            } catch (err) {
              reject(err)
            }
          },
          prefill: { name: user?.name, email: user?.email, contact: user?.phone },
          theme:   { color: '#5b21b6' },
          modal:   {
            ondismiss: () => {
              setPaying(false)
              setPayError('Payment cancelled. Try again when ready.')
              resolve()
            },
          },
        }
        const rzp = new window.Razorpay(options)
        rzp.on('payment.failed', (response) => {
          setPayError(`Payment failed: ${response.error.description}`)
          setPaying(false)
          resolve()
        })
        rzp.open()
      })
    } catch (err) {
      setPayError(err.message)
    } finally {
      setPaying(false)
    }
  }

  /* ── Order confirmation screen ── */
  if (step === 4 && order) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="section-wrapper py-12">
          <div className="max-w-lg mx-auto text-center">
            <div className="w-20 h-20 bg-eco-100 rounded-3xl flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 className="w-10 h-10 text-eco-600" />
            </div>
            <h1 className="font-display font-bold text-2xl text-gray-900 mb-2">Order Placed! 🎉</h1>
            <p className="text-gray-500 text-sm mb-6">
              A confirmation email has been sent to <strong>{user?.email}</strong>.
            </p>
            <div className="bg-white border border-gray-100 rounded-2xl shadow-card p-5 mb-6 text-left space-y-3">
              <Row label="Order ID"   value={order.orderId} bold />
              <Row label="Amount Paid" value={formatPrice(order.total)} />
              <Row label="Payment"    value="Razorpay · Paid" />
              <Row label="Estimated Delivery" value="5–7 business days" />
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/account?tab=orders" className="btn-primary flex items-center justify-center gap-2">
                <Package className="w-4 h-4" /> Track Order
              </Link>
              <Link to="/products" className="btn-secondary flex items-center justify-center gap-2">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Auth modal */}
      <AuthModal
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
        onSuccess={() => setShowAuth(false)}
      />

      {authLoading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
        </div>
      ) : (
        <div className="section-wrapper py-8">
          {/* Back */}
          <Link to="/cart" className="inline-flex items-center gap-1.5 text-sm text-gray-500
                                       hover:text-primary-600 transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to Cart
          </Link>

          <div className="max-w-xl mx-auto">
            <h1 className="font-display font-bold text-2xl text-gray-900 text-center mb-6">
              Checkout
            </h1>

            <StepIndicator current={step} />

            {step === 1 && (
              <AddressStep
                selected={address}
                onSelect={setAddress}
                onContinue={() => setStep(2)}
              />
            )}
            {step === 2 && (
              <ReviewStep
                address={address}
                onBack={() => setStep(1)}
                onPay={handlePay}
                loading={paying}
                error={payError}
              />
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function Row({ label, value, bold }) {
  return (
    <div className={`flex justify-between items-center text-sm ${bold ? 'font-bold text-gray-900' : 'text-gray-600'}`}>
      <span>{label}</span><span>{value}</span>
    </div>
  )
}
