import { useEffect, useState } from 'react'
import { api } from '../../utils/api'

const formatFee = fee => {
  const value = Number(fee?.value) || 0
  if (value === 0) return 'No platform fee'
  return fee?.type === 'fixed'
    ? `₹${value.toLocaleString('en-IN')} fixed`
    : `${value.toLocaleString('en-IN')}%`
}

export default function CurrentFeeSchedule({ compact = false }) {
  const [fees, setFees] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/fees')
      .then(data => setFees(data.fees || []))
      .catch(requestError => setError(requestError.message))
  }, [])

  if (error) return <p className="rounded-2xl bg-red-50 p-4 text-sm text-red-700">Current fees could not be loaded: {error}</p>
  if (!fees.length) return <p className="rounded-2xl bg-slate-100 p-4 text-sm text-slate-500">Loading current platform fees…</p>

  return (
    <div className={compact ? 'overflow-hidden rounded-2xl border border-slate-200' : 'mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm'}>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-950 text-white">
            <tr>
              <th className="px-4 py-3 font-bold">Service</th>
              <th className="px-4 py-3 font-bold">Customer side</th>
              <th className="px-4 py-3 font-bold">Provider side</th>
              <th className="px-4 py-3 font-bold">Effective</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {fees.map(fee => (
              <tr key={fee.key || fee.serviceKey} className="bg-white">
                <td className="px-4 py-4 font-bold text-slate-950">{fee.label}</td>
                <td className="px-4 py-4 text-slate-700">
                  <span className="block text-xs text-slate-500">{fee.customerPartyLabel}</span>
                  {formatFee(fee.customerFee)}
                </td>
                <td className="px-4 py-4 text-slate-700">
                  <span className="block text-xs text-slate-500">{fee.providerPartyLabel}</span>
                  {formatFee(fee.providerFee)}
                </td>
                <td className="px-4 py-4 text-slate-500">
                  {fee.effectiveAt ? new Date(fee.effectiveAt).toLocaleDateString('en-IN') : 'Current default'}
                  <span className="block text-xs">Version {fee.version || 1}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

