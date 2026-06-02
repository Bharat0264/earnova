import { formatPrice, formatDate } from '../../utils/formatters'

const STATUS = {
  pending:   { label: 'Pending',   cls: 'bg-amber-50  text-amber-700  border-amber-100'  },
  credited:  { label: 'Credited',  cls: 'bg-eco-50    text-eco-700    border-eco-100'    },
  withdrawn: { label: 'Withdrawn', cls: 'bg-gray-100  text-gray-600   border-gray-200'   },
}

function SkeletonRow() {
  return (
    <tr className="border-b border-gray-50">
      {[40, 80, 64, 56, 56].map((w, i) => (
        <td key={i} className="px-4 py-3">
          <div className={`h-3.5 bg-gray-100 rounded-full animate-pulse`} style={{ width: `${w}%` }} />
        </td>
      ))}
    </tr>
  )
}

export default function EarningsTable({ transactions, loading }) {
  if (!loading && transactions.length === 0) {
    return (
      <div className="text-center py-14">
        <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">💸</span>
        </div>
        <h3 className="font-display font-bold text-gray-700 mb-1">No earnings yet</h3>
        <p className="text-gray-400 text-sm">Share your referral link to start earning commissions.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-card">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-100">
            {['Date', 'Order', 'Referred User', 'Commission', 'Status'].map(h => (
              <th key={h} className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-50">
          {loading
            ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
            : transactions.map((tx) => {
                const st = STATUS[tx.commissionStatus] || STATUS.pending
                return (
                  <tr key={tx._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap text-xs">
                      {formatDate(tx.convertedAt || tx.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-800 text-xs">
                        {tx.order?.orderId || '—'}
                      </p>
                      {tx.order?.total && (
                        <p className="text-[11px] text-gray-400">{formatPrice(tx.order.total)}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs">
                      {tx.referee?.name || 'Anonymous'}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-bold text-gray-900 text-sm">
                        {formatPrice(tx.commissionAmount)}
                      </span>
                      <span className="text-[11px] text-gray-400 ml-1">
                        ({tx.commissionRate}%)
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 text-[11px] font-bold
                                        px-2 py-0.5 rounded-full border ${st.cls}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {st.label}
                      </span>
                    </td>
                  </tr>
                )
              })
          }
        </tbody>
      </table>
    </div>
  )
}
