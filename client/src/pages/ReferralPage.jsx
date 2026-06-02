import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Zap, ArrowRight, Info } from 'lucide-react'
import ReferralLinkCard   from '../components/referral/ReferralLinkCard'
import ReferralStats      from '../components/referral/ReferralStats'
import EarningsTable      from '../components/referral/EarningsTable'
import WithdrawalModal    from '../components/referral/WithdrawalModal'
import Leaderboard        from '../components/referral/Leaderboard'
import AuthModal          from '../components/auth/AuthModal'
import { useAuth }        from '../context/AuthContext'
import { useReferral }    from '../hooks/useReferral'

const TABS = ['Earnings', 'Withdrawals', 'Leaderboard']

const HOW_STEPS = [
  { n: '01', title: 'Get Your Link',      desc: 'Sign up or log in to receive your unique referral link instantly.' },
  { n: '02', title: 'Share It',           desc: 'Share via WhatsApp, Instagram, or email. Each click is tracked.' },
  { n: '03', title: 'They Buy, You Earn', desc: 'Earn 4–12% commission on every purchase made via your link.' },
  { n: '04', title: 'Withdraw',           desc: 'Withdraw to any UPI ID once your balance reaches ₹100.' },
]

export default function ReferralPage() {
  const { isAuthenticated, user }       = useAuth()
  const [showAuth,  setShowAuth]        = useState(false)
  const [activeTab, setActiveTab]       = useState('Earnings')
  const [showWd,    setShowWd]          = useState(false)

  const {
    stats, transactions, withdrawals, leaderboard,
    loading, submitWithdrawal,
  } = useReferral(isAuthenticated)

  const referralCode = user?.referralCode || stats?.referralCode || '——'

  return (
    <div className="min-h-screen bg-gray-50">
      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} onSuccess={() => setShowAuth(false)} />
      <WithdrawalModal
        isOpen={showWd}
        onClose={() => setShowWd(false)}
        walletBalance={stats?.walletBalance || 0}
        withdrawals={withdrawals}
        onSubmit={submitWithdrawal}
      />

      {/* ── Page header ── */}
      <div className="bg-white border-b border-gray-100">
        <div className="section-wrapper py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="font-display font-bold text-2xl text-gray-900">Referral Programme</h1>
              <p className="text-gray-500 text-sm mt-0.5">
                Share, earn, and withdraw — no limits, no fees
              </p>
            </div>
            {isAuthenticated && stats?.walletBalance >= 100 && (
              <button
                onClick={() => setShowWd(true)}
                className="btn-primary flex items-center gap-2 self-start sm:self-auto"
              >
                <Zap className="w-4 h-4" />
                Withdraw ₹{stats.walletBalance.toLocaleString('en-IN')}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="section-wrapper py-6 space-y-6">

        {/* ── Not logged in banner ── */}
        {!isAuthenticated && (
          <div className="bg-primary-50 border border-primary-100 rounded-2xl p-5 flex items-start gap-4">
            <Info className="w-5 h-5 text-primary-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-primary-800 text-sm">
                Sign in to access your personal referral link and earnings dashboard
              </p>
              <p className="text-primary-600 text-xs mt-0.5 mb-3">
                The stats below are from a demo account.
              </p>
              <button onClick={() => setShowAuth(true)} className="btn-primary text-sm flex items-center gap-2">
                Sign In / Create Account <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ── Referral link card ── */}
        <ReferralLinkCard referralCode={referralCode} loading={loading && isAuthenticated} />

        {/* ── Stats ── */}
        <ReferralStats stats={stats} loading={loading && isAuthenticated} />

        {/* ── How it works (collapsed on desktop if authenticated) ── */}
        {!isAuthenticated && (
          <div className="bg-white border border-gray-100 rounded-2xl shadow-card p-6">
            <h2 className="font-display font-bold text-xl text-gray-900 mb-6 text-center">
              How It Works
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {HOW_STEPS.map(({ n, title, desc }) => (
                <div key={n} className="text-center">
                  <div className="w-10 h-10 bg-primary-700 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <span className="font-display font-bold text-white text-sm">{n}</span>
                  </div>
                  <h3 className="font-display font-bold text-gray-900 text-sm mb-1">{title}</h3>
                  <p className="text-gray-500 text-xs leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Tabs ── */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-card overflow-hidden">
          {/* Tab bar */}
          <div className="flex border-b border-gray-100 bg-gray-50">
            {TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3.5 text-sm font-semibold transition-all ${
                  activeTab === tab
                    ? 'bg-white text-primary-700 border-b-2 border-primary-600 -mb-px'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab}
                {tab === 'Withdrawals' && withdrawals.length > 0 && (
                  <span className="ml-1.5 text-[10px] bg-gray-200 text-gray-600 font-bold
                                   px-1.5 py-0.5 rounded-full">
                    {withdrawals.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="p-5">
            {activeTab === 'Earnings' && (
              <EarningsTable transactions={transactions} loading={loading && isAuthenticated} />
            )}

            {activeTab === 'Withdrawals' && (
              <WithdrawalsPanel
                withdrawals={withdrawals}
                loading={loading && isAuthenticated}
                onNewWithdrawal={() => setShowWd(true)}
                balance={stats?.walletBalance || 0}
              />
            )}

            {activeTab === 'Leaderboard' && (
              <Leaderboard
                leaderboard={leaderboard}
                loading={loading && isAuthenticated}
                myCode={referralCode}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Withdrawals tab content ── */
function WithdrawalsPanel({ withdrawals, loading, onNewWithdrawal, balance }) {
  const STATUS = {
    pending:    'bg-amber-50  text-amber-700',
    processing: 'bg-blue-50   text-blue-700',
    completed:  'bg-eco-50    text-eco-700',
    failed:     'bg-red-50    text-red-600',
  }

  if (!loading && withdrawals.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Zap className="w-7 h-7 text-gray-300" />
        </div>
        <h3 className="font-display font-bold text-gray-700 mb-1">No withdrawals yet</h3>
        <p className="text-gray-400 text-sm mb-5">
          {balance >= 100
            ? 'You have balance available. Request a withdrawal anytime.'
            : 'Earn ₹100+ to make your first withdrawal.'}
        </p>
        {balance >= 100 && (
          <button onClick={onNewWithdrawal} className="btn-primary text-sm">
            Withdraw Now
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {loading
        ? Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
          ))
        : withdrawals.map(wd => (
            <div key={wd._id}
                 className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
              <div>
                <p className="font-bold text-gray-900 text-sm">₹{wd.amount.toLocaleString('en-IN')}</p>
                <p className="text-xs text-gray-400">{wd.upiId} · {new Date(wd.createdAt).toLocaleDateString('en-IN')}</p>
              </div>
              <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full capitalize ${STATUS[wd.status] || 'bg-gray-100 text-gray-600'}`}>
                {wd.status}
              </span>
            </div>
          ))
      }
      {!loading && balance >= 100 && (
        <button onClick={onNewWithdrawal}
                className="btn-secondary w-full text-sm mt-2">
          + Request Another Withdrawal
        </button>
      )}
    </div>
  )
}
