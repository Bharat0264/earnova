import { MousePointerClick, ShoppingBag, IndianRupee, Wallet } from 'lucide-react'
import { formatPrice } from '../../utils/formatters'

const CARDS = [
  {
    key:     'totalClicks',
    label:   'Total Clicks',
    sub:     (s) => `${s.conversionRate}% conversion rate`,
    Icon:    MousePointerClick,
    bg:      'bg-primary-50',
    iconBg:  'bg-primary-100',
    iconCol: 'text-primary-600',
    valCol:  'text-primary-900',
    format:  (v) => v.toLocaleString('en-IN'),
  },
  {
    key:     'totalConversions',
    label:   'Conversions',
    sub:     (s) => `${s.totalReferrals} registered referrals`,
    Icon:    ShoppingBag,
    bg:      'bg-eco-50',
    iconBg:  'bg-eco-100',
    iconCol: 'text-eco-600',
    valCol:  'text-eco-800',
    format:  (v) => v.toLocaleString('en-IN'),
  },
  {
    key:     'totalEarned',
    label:   'Total Earned',
    sub:     (_s) => 'Lifetime commission',
    Icon:    IndianRupee,
    bg:      'bg-yellow-50',
    iconBg:  'bg-yellow-100',
    iconCol: 'text-yellow-600',
    valCol:  'text-yellow-900',
    format:  (v) => formatPrice(v),
  },
  {
    key:     'walletBalance',
    label:   'Wallet Balance',
    sub:     (s) => `₹${s.pendingAmount?.toLocaleString('en-IN') || 0} pending`,
    Icon:    Wallet,
    bg:      'bg-orange-50',
    iconBg:  'bg-orange-100',
    iconCol: 'text-orange-600',
    valCol:  'text-orange-900',
    format:  (v) => formatPrice(v),
  },
]

function StatCard({ card, value, sub, loading }) {
  const { label, Icon, bg, iconBg, iconCol, valCol, format } = card
  return (
    <div className={`${bg} rounded-2xl border border-white/60 p-5 shadow-card`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${iconCol}`} />
        </div>
      </div>
      {loading ? (
        <>
          <div className="h-7 w-24 bg-gray-200/60 rounded-full animate-pulse mb-1.5" />
          <div className="h-3.5 w-32 bg-gray-200/60 rounded-full animate-pulse" />
        </>
      ) : (
        <>
          <p className={`font-display font-extrabold text-2xl ${valCol} mb-1`}>
            {format(value ?? 0)}
          </p>
          <p className="text-xs text-gray-500 font-medium">{label}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>
        </>
      )}
    </div>
  )
}

export default function ReferralStats({ stats, loading }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {CARDS.map(card => (
        <StatCard
          key={card.key}
          card={card}
          value={stats?.[card.key]}
          sub={stats ? card.sub(stats) : '—'}
          loading={loading}
        />
      ))}
    </div>
  )
}
