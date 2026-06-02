import { Trophy } from 'lucide-react'
import { formatPrice } from '../../utils/formatters'

const MEDAL = { 1: '🥇', 2: '🥈', 3: '🥉' }
const RANK_BG = {
  1: 'bg-yellow-50 border-yellow-200',
  2: 'bg-gray-50  border-gray-200',
  3: 'bg-orange-50 border-orange-200',
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 p-4 border-b border-gray-50">
      <div className="w-8 h-8 bg-gray-100 rounded-full animate-pulse shrink-0" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3.5 bg-gray-100 rounded-full animate-pulse w-2/5" />
        <div className="h-3 bg-gray-100 rounded-full animate-pulse w-1/4" />
      </div>
      <div className="h-5 w-20 bg-gray-100 rounded-full animate-pulse" />
    </div>
  )
}

export default function Leaderboard({ leaderboard, loading, myCode }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-gray-100 bg-gray-50">
        <Trophy className="w-5 h-5 text-yellow-500" />
        <h3 className="font-display font-bold text-gray-900">Top Earners This Month</h3>
      </div>

      {/* Rows */}
      <div className="divide-y divide-gray-50">
        {loading
          ? Array.from({ length: 10 }).map((_, i) => <SkeletonRow key={i} />)
          : leaderboard.length === 0
            ? (
              <div className="text-center py-10 text-gray-400 text-sm">
                No leaderboard data yet.
              </div>
            )
            : leaderboard.map((entry) => {
                const isTop3  = entry.rank <= 3
                const rowBg   = RANK_BG[entry.rank] || ''
                return (
                  <div
                    key={entry.rank}
                    className={`flex items-center gap-4 px-5 py-3.5 transition-colors
                                ${isTop3 ? `border-l-4 ${rowBg}` : 'hover:bg-gray-50/50'}`}
                  >
                    {/* Rank */}
                    <div className="w-9 shrink-0 text-center">
                      {MEDAL[entry.rank]
                        ? <span className="text-xl">{MEDAL[entry.rank]}</span>
                        : <span className="font-display font-bold text-sm text-gray-400">
                            #{entry.rank}
                          </span>
                      }
                    </div>

                    {/* Name + city */}
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold text-sm ${isTop3 ? 'text-gray-900' : 'text-gray-700'}`}>
                        {entry.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {entry.city} · {entry.referrals} referral{entry.referrals !== 1 ? 's' : ''}
                      </p>
                    </div>

                    {/* Earnings */}
                    <div className="shrink-0 text-right">
                      <span className={`font-display font-bold text-sm ${
                        entry.rank === 1
                          ? 'text-yellow-600'
                          : entry.rank <= 3
                            ? 'text-gray-700'
                            : 'text-gray-600'
                      }`}>
                        {formatPrice(entry.earned)}
                      </span>
                    </div>
                  </div>
                )
              })
        }
      </div>

      {/* Footer note */}
      <div className="px-5 py-3 bg-gray-50 border-t border-gray-100">
        <p className="text-[11px] text-gray-400 text-center">
          Names anonymised for privacy · Updated daily · {new Date().toLocaleString('en-IN', { month: 'long', year: 'numeric' })}
        </p>
      </div>
    </div>
  )
}
