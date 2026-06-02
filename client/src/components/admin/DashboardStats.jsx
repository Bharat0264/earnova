import { useState } from 'react'
import { TrendingUp, TrendingDown, Package, Users, IndianRupee, Wallet } from 'lucide-react'
import { formatPrice } from '../../utils/formatters'

/* ═══════════ STAT CARD ═══════════ */
function StatCard({ title, value, sub, growth, Icon, accent, loading }) {
  const up = growth >= 0
  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-card p-5">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 ${accent} rounded-xl flex items-center justify-center`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        {growth !== undefined && !loading && (
          <div className={`flex items-center gap-1 text-xs font-bold ${up ? 'text-eco-600' : 'text-red-500'}`}>
            {up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(growth)}%
          </div>
        )}
      </div>
      {loading ? (
        <>
          <div className="h-7 w-28 bg-gray-100 rounded-full animate-pulse mb-1.5" />
          <div className="h-3.5 w-20 bg-gray-100 rounded-full animate-pulse" />
        </>
      ) : (
        <>
          <p className="font-display font-extrabold text-2xl text-gray-900">{value}</p>
          <p className="text-xs text-gray-500 mt-0.5">{sub}</p>
        </>
      )}
    </div>
  )
}

export function DashboardStats({ stats, loading }) {
  const cards = [
    {
      title: 'Total Revenue', Icon: IndianRupee, accent: 'bg-primary-600',
      value:  formatPrice(stats?.revenue?.total || 0),
      sub:    `${formatPrice(stats?.revenue?.thisMonth || 0)} this month`,
      growth: stats?.revenue?.growth,
    },
    {
      title: 'Total Orders', Icon: Package, accent: 'bg-eco-600',
      value:  (stats?.orders?.total || 0).toLocaleString('en-IN'),
      sub:    `${stats?.orders?.pending || 0} pending · ${stats?.orders?.shipped || 0} shipped`,
    },
    {
      title: 'Registered Users', Icon: Users, accent: 'bg-blue-600',
      value:  (stats?.users?.total || 0).toLocaleString('en-IN'),
      sub:    `${stats?.users?.newThisMonth || 0} joined this month`,
    },
    {
      title: 'Pending Withdrawals', Icon: Wallet, accent: 'bg-orange-500',
      value:  formatPrice(stats?.withdrawals?.pendingAmount || 0),
      sub:    `${stats?.withdrawals?.pending || 0} requests · ${stats?.b2bPending || 0} B2B · ${stats?.subsidyPending || 0} subsidy`,
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(c => <StatCard key={c.title} {...c} loading={loading} />)}
    </div>
  )
}

/* ═══════════ REVENUE CHART ═══════════ */
export function RevenueChart({ data = [], loading }) {
  const [tooltip, setTooltip] = useState(null)

  if (loading) return (
    <div className="h-44 bg-gray-50 rounded-2xl animate-pulse" />
  )

  const cW = 540, cH = 180
  const padL = 58, padB = 28, padT = 12, padR = 10
  const w = cW - padL - padR
  const h = cH - padB - padT
  const maxVal = Math.max(...data.map(d => d.revenue), 1)
  const barW   = Math.max(Math.floor((w / data.length) * 0.55), 28)
  const step   = w / data.length
  const yTicks = [0, 0.25, 0.5, 0.75, 1]

  const fmt = (v) => v >= 100000 ? `₹${(v / 100000).toFixed(1)}L` : `₹${(v / 1000).toFixed(0)}K`

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${cW} ${cH}`} className="w-full" style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id="barGrad6" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#5b21b6" stopOpacity="0.85" />
          </linearGradient>
        </defs>

        {/* Y-axis grid + labels */}
        {yTicks.map((t, i) => {
          const y = padT + h * (1 - t)
          return (
            <g key={i}>
              <line x1={padL} y1={y} x2={cW - padR} y2={y} stroke="#f3f4f6" strokeWidth={t === 0 ? 1.5 : 1} />
              <text x={padL - 6} y={y + 4} fontSize="9" fill="#9ca3af" textAnchor="end">
                {fmt(maxVal * t)}
              </text>
            </g>
          )
        })}

        {/* Bars */}
        {data.map((d, i) => {
          const x   = padL + i * step + (step - barW) / 2
          const bH  = Math.max((d.revenue / maxVal) * h, 2)
          const y   = padT + h - bH
          return (
            <g key={d.month}>
              <rect
                x={x} y={y} width={barW} height={bH}
                fill={tooltip?.i === i ? '#6d28d9' : 'url(#barGrad6)'}
                rx="5" className="cursor-pointer transition-colors"
                onMouseEnter={() => setTooltip({ i, x: x + barW / 2, y, val: d.revenue, month: d.month, orders: d.orders })}
                onMouseLeave={() => setTooltip(null)}
              />
              <text x={x + barW / 2} y={cH - 8} fontSize="9" fill="#9ca3af" textAnchor="middle">
                {d.month}
              </text>
            </g>
          )
        })}

        {/* Tooltip */}
        {tooltip && (
          <g>
            <rect x={tooltip.x - 42} y={tooltip.y - 36} width={84} height={30} rx="6" fill="#1f2937" />
            <text x={tooltip.x} y={tooltip.y - 22} fontSize="9.5" fill="white" textAnchor="middle" fontWeight="bold">
              {fmt(tooltip.val)}
            </text>
            <text x={tooltip.x} y={tooltip.y - 10} fontSize="8" fill="#9ca3af" textAnchor="middle">
              {tooltip.orders} orders
            </text>
          </g>
        )}
      </svg>
    </div>
  )
}
