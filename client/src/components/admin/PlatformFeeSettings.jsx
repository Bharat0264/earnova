import { useCallback, useEffect, useState } from 'react'
import { api } from '../../utils/api'

const emptyDraft = fee => ({
  customerFee: { type: fee.customerFee.type, value: fee.customerFee.value },
  providerFee: { type: fee.providerFee.type, value: fee.providerFee.value },
  reason: '',
})

const feeText = fee => Number(fee.value) === 0
  ? 'No fee'
  : fee.type === 'fixed'
    ? `₹${Number(fee.value).toLocaleString('en-IN')} fixed`
    : `${Number(fee.value).toLocaleString('en-IN')}%`

function FeeInput({ label, party, value, onChange }) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</span>
      <span className="mt-1 block text-sm font-semibold text-slate-800">{party}</span>
      <div className="mt-2 grid grid-cols-[1fr_1.2fr] gap-2">
        <select
          className="input-base bg-white"
          value={value.type}
          onChange={event => onChange({ ...value, type: event.target.value })}
        >
          <option value="percentage">Percentage</option>
          <option value="fixed">Fixed ₹</option>
        </select>
        <input
          className="input-base bg-white"
          type="number"
          min="0"
          max={value.type === 'percentage' ? '100' : undefined}
          step={value.type === 'percentage' ? '0.01' : '1'}
          value={value.value}
          onChange={event => onChange({ ...value, value: event.target.value })}
          aria-label={`${party} fee value`}
        />
      </div>
    </label>
  )
}

export default function PlatformFeeSettings() {
  const [fees, setFees] = useState([])
  const [drafts, setDrafts] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await api.get('/admin/fee-settings')
      setFees(data.fees || [])
      setDrafts(Object.fromEntries((data.fees || []).map(fee => [fee.key || fee.serviceKey, emptyDraft(fee)])))
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const updateDraft = (key, field, value) => {
    setDrafts(current => ({ ...current, [key]: { ...current[key], [field]: value } }))
  }

  const save = async fee => {
    const key = fee.key || fee.serviceKey
    setSaving(key)
    setError('')
    setMessage('')
    try {
      const draft = drafts[key]
      const result = await api.patch(`/admin/fee-settings/${key}`, {
        customerFee: { ...draft.customerFee, value: Number(draft.customerFee.value) },
        providerFee: { ...draft.providerFee, value: Number(draft.providerFee.value) },
        reason: draft.reason,
      })
      setMessage(result.message)
      await load()
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving('')
    }
  }

  return (
    <section>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-950">Platform fee settings</h2>
          <p className="mt-1 max-w-3xl text-sm text-slate-500">Set what Earnova charges each side independently. Updates apply only to new transactions; existing transactions retain their original fee snapshot.</p>
        </div>
        <button type="button" className="btn-secondary" onClick={load}>Refresh fees</button>
      </div>

      {message && <p className="mt-4 rounded-xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">{message}</p>}
      {error && <p className="mt-4 rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</p>}
      {loading && <p className="mt-5 state-panel text-slate-500">Loading current fee settings…</p>}

      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        {fees.map(fee => {
          const key = fee.key || fee.serviceKey
          const draft = drafts[key]
          if (!draft) return null
          return (
            <article key={key} className="surface-card p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-display text-lg font-bold text-slate-950">{fee.label}</h3>
                  <p className="mt-1 text-xs text-slate-500">Current: {feeText(fee.customerFee)} from {fee.customerPartyLabel}; {feeText(fee.providerFee)} from {fee.providerPartyLabel}</p>
                </div>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">v{fee.version || 1}</span>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <FeeInput label="Customer-side charge" party={fee.customerPartyLabel} value={draft.customerFee} onChange={value => updateDraft(key, 'customerFee', value)} />
                <FeeInput label="Provider-side charge" party={fee.providerPartyLabel} value={draft.providerFee} onChange={value => updateDraft(key, 'providerFee', value)} />
              </div>

              <label className="mt-4 block">
                <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Reason for change</span>
                <input className="input-base mt-2 bg-white" value={draft.reason} onChange={event => updateDraft(key, 'reason', event.target.value)} placeholder="Required for the audit log" />
              </label>

              <button type="button" className="btn-primary mt-4 w-full" disabled={saving === key} onClick={() => save(fee)}>
                {saving === key ? 'Saving…' : 'Save new fee version'}
              </button>
            </article>
          )
        })}
      </div>
    </section>
  )
}

