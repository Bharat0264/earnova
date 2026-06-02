import { useState } from 'react'
import { Wallet, X, Loader2, CheckCircle2, AlertCircle, IndianRupee } from 'lucide-react'
import { formatPrice, formatDate } from '../../utils/formatters'

const STATUS_STYLE = {
  pending:    'bg-amber-50 text-amber-700',
  processing: 'bg-blue-50  text-blue-700',
  completed:  'bg-eco-50   text-eco-700',
  failed:     'bg-red-50   text-red-600',
}

/* ── Withdrawal history row ── */
function WithdrawalRow({ wd }) {
  const st = STATUS_STYLE[wd.status] || 'bg-gray-100 text-gray-600'
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
      <div>
        <p className="text-sm font-semibold text-gray-900">{formatPrice(wd.amount)}</p>
        <p className="text-xs text-gray-400">{wd.upiId} · {formatDate(wd.createdAt)}</p>
      </div>
      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full capitalize ${st}`}>
        {wd.status}
      </span>
    </div>
  )
}

/* ═══════════════ MODAL ═══════════════ */
export default function WithdrawalModal({ isOpen, onClose, walletBalance, withdrawals, onSubmit }) {
  const [amount,      setAmount]      = useState('')
  const [upiId,       setUpiId]       = useState('')
  const [accountName, setAccountName] = useState('')
  const [loading,     setLoading]     = useState(false)
  const [success,     setSuccess]     = useState(null)
  const [error,       setError]       = useState('')

  if (!isOpen) return null

  const maxAmount  = walletBalance || 0
  const numAmount  = Number(amount)
  const canSubmit  = numAmount >= 100 && numAmount <= maxAmount && upiId.trim() && accountName.trim()

  const reset = () => {
    setAmount(''); setUpiId(''); setAccountName('')
    setError(''); setSuccess(null)
  }

  const handleClose = () => { reset(); onClose() }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!canSubmit) return
    setLoading(true); setError('')
    try {
      const data = await onSubmit({ amount: numAmount, upiId: upiId.trim(), accountName: accountName.trim() })
      setSuccess(data.message || 'Withdrawal request submitted!')
      setAmount(''); setUpiId(''); setAccountName('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const quickAmounts = [100, 500, 1000, maxAmount].filter((v, i, a) => v > 0 && v <= maxAmount && a.indexOf(v) === i)

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose} />

      <div className="relative bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl
                      shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-primary-600" />
            <h2 className="font-display font-bold text-lg text-gray-900">Withdraw Earnings</h2>
          </div>
          <button onClick={handleClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="p-5 space-y-5">

            {/* Balance card */}
            <div className="bg-gradient-to-r from-primary-700 to-primary-900 rounded-2xl p-4 text-white">
              <p className="text-primary-200 text-xs font-bold uppercase tracking-widest mb-1">Available Balance</p>
              <p className="font-display font-extrabold text-3xl">{formatPrice(maxAmount)}</p>
              {maxAmount < 100 && (
                <p className="text-primary-300 text-xs mt-1">
                  Minimum withdrawal is ₹100. Keep earning!
                </p>
              )}
            </div>

            {/* Success state */}
            {success && (
              <div className="bg-eco-50 border border-eco-100 rounded-2xl p-4 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-eco-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-eco-800 text-sm">{success}</p>
                  <p className="text-eco-600 text-xs mt-0.5">
                    Funds arrive in 24–48 hours after processing.
                  </p>
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* Form */}
            {maxAmount >= 100 && (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Amount */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    Withdrawal Amount *
                  </label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="number"
                      value={amount}
                      onChange={e => setAmount(e.target.value)}
                      placeholder="Enter amount"
                      min="100"
                      max={maxAmount}
                      className="input-base pl-8"
                    />
                  </div>
                  {/* Quick amounts */}
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {quickAmounts.map(v => (
                      <button key={v} type="button" onClick={() => setAmount(String(v))}
                              className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${
                                Number(amount) === v
                                  ? 'bg-primary-700 text-white border-primary-700'
                                  : 'border-gray-200 text-gray-600 hover:border-primary-300'
                              }`}>
                        {v === maxAmount ? 'All' : formatPrice(v)}
                      </button>
                    ))}
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1.5">
                    Min ₹100 · Max {formatPrice(maxAmount)}
                  </p>
                </div>

                {/* UPI ID */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    UPI ID *
                  </label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={e => setUpiId(e.target.value)}
                    placeholder="yourname@upi or 9876543210@paytm"
                    className="input-base"
                  />
                </div>

                {/* Account name */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    Account Holder Name *
                  </label>
                  <input
                    type="text"
                    value={accountName}
                    onChange={e => setAccountName(e.target.value)}
                    placeholder="Name as registered with UPI"
                    className="input-base"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!canSubmit || loading}
                  className="btn-primary w-full py-3.5 text-base flex items-center justify-center gap-2
                             disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {loading ? 'Processing…' : `Withdraw ${amount ? formatPrice(numAmount) : '—'}`}
                </button>
              </form>
            )}

            {/* Withdrawal history */}
            {withdrawals?.length > 0 && (
              <div>
                <h3 className="font-display font-semibold text-gray-800 text-sm mb-3">
                  Withdrawal History
                </h3>
                <div className="bg-gray-50 rounded-2xl px-4 py-1">
                  {withdrawals.map(wd => <WithdrawalRow key={wd._id} wd={wd} />)}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
