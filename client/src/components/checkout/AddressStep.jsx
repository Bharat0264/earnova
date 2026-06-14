import { useState } from 'react'
import { MapPin, Plus, CheckCircle2, Home, Briefcase, MoreHorizontal } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../utils/api'

const STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
  'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab',
  'Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh',
  'Uttarakhand','West Bengal','Andaman & Nicobar','Chandigarh','Delhi',
  'Jammu & Kashmir','Ladakh','Lakshadweep','Puducherry',
]

const TYPE_ICON = { home: Home, work: Briefcase, other: MoreHorizontal }

const EMPTY_FORM = {
  type: 'home', name: '', phone: '',
  line1: '', line2: '', city: '', state: '', pincode: '', isDefault: false,
}

function AddressField({ error, label, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
      {children}
      {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
    </div>
  )
}

function AddressCard({ address, selected, onSelect }) {
  const Icon = TYPE_ICON[address.type] || Home
  return (
    <button
      onClick={onSelect}
      className={`w-full text-left p-4 rounded-2xl border-2 transition-all duration-200 ${
        selected
          ? 'border-primary-600 bg-primary-50'
          : 'border-gray-200 hover:border-gray-300 bg-white'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-3">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
            selected ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-500'
          }`}>
            <Icon className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-semibold text-sm text-gray-900">{address.name}</p>
              <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wide">
                {address.type}
              </span>
              {address.isDefault && (
                <span className="text-[10px] font-bold uppercase text-eco-600 bg-eco-50
                                 px-1.5 py-0.5 rounded-full">Default</span>
              )}
            </div>
            <p className="text-sm text-gray-600 mt-0.5 leading-relaxed">
              {address.line1}{address.line2 ? ', ' + address.line2 : ''},<br />
              {address.city}, {address.state} – {address.pincode}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">{address.phone}</p>
          </div>
        </div>
        {selected && <CheckCircle2 className="w-5 h-5 text-primary-600 shrink-0" />}
      </div>
    </button>
  )
}

function AddressForm({ onSave, onCancel, loading }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }))

  const validate = () => {
    const e = {}
    if (!form.name.trim())    e.name    = 'Required'
    if (!form.phone.trim())   e.phone   = 'Required'
    if (!form.line1.trim())   e.line1   = 'Required'
    if (!form.city.trim())    e.city    = 'Required'
    if (!form.state)          e.state   = 'Required'
    if (!/^\d{6}$/.test(form.pincode)) e.pincode = '6-digit pincode required'
    return e
  }

  const handleSave = () => {
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    onSave(form)
  }

  return (
    <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 space-y-4">
      <h3 className="font-display font-semibold text-gray-900 text-sm">Add New Address</h3>

      {/* Address type */}
      <div className="flex gap-2">
        {['home', 'work', 'other'].map(t => (
          <button key={t} type="button"
                  onClick={() => setForm(f => ({ ...f, type: t }))}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold border-2 transition-all capitalize ${
                    form.type === t
                      ? 'border-primary-600 bg-primary-50 text-primary-700'
                      : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}>
            {t}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <AddressField label="Full Name *" error={errors.name}>
          <input
            type="text"
            value={form.name}
            onChange={set('name')}
            autoComplete="off"
            className={`input-base ${errors.name ? 'border-red-300 focus:border-red-400' : ''}`}
          />
        </AddressField>
        <AddressField label="Mobile Number *" error={errors.phone}>
          <input
            type="tel"
            value={form.phone}
            onChange={set('phone')}
            autoComplete="off"
            className={`input-base ${errors.phone ? 'border-red-300 focus:border-red-400' : ''}`}
          />
        </AddressField>
      </div>

      <AddressField label="Address Line 1 *" error={errors.line1}>
        <input
          type="text"
          value={form.line1}
          onChange={set('line1')}
          autoComplete="off"
          className={`input-base ${errors.line1 ? 'border-red-300 focus:border-red-400' : ''}`}
        />
      </AddressField>
      <AddressField label="Address Line 2" error={errors.line2}>
        <input
          type="text"
          value={form.line2}
          onChange={set('line2')}
          autoComplete="off"
          className={`input-base ${errors.line2 ? 'border-red-300 focus:border-red-400' : ''}`}
        />
      </AddressField>

      <div className="grid grid-cols-2 gap-3">
        <AddressField label="City *" error={errors.city}>
          <input
            type="text"
            value={form.city}
            onChange={set('city')}
            autoComplete="off"
            className={`input-base ${errors.city ? 'border-red-300 focus:border-red-400' : ''}`}
          />
        </AddressField>
        <AddressField label="Pincode *" error={errors.pincode}>
          <input
            type="tel"
            value={form.pincode}
            onChange={set('pincode')}
            autoComplete="off"
            className={`input-base ${errors.pincode ? 'border-red-300 focus:border-red-400' : ''}`}
          />
        </AddressField>
      </div>

      <AddressField label="State *" error={errors.state}>
        <select value={form.state} onChange={set('state')}
                className={`input-base ${errors.state ? 'border-red-300' : ''}`}>
          <option value="">Select state</option>
          {STATES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </AddressField>

      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={form.isDefault}
               onChange={e => setForm(f => ({ ...f, isDefault: e.target.checked }))}
               className="accent-primary-700 w-4 h-4" />
        <span className="text-sm text-gray-600">Set as default address</span>
      </label>

      <div className="flex gap-2 pt-1">
        <button onClick={handleSave} disabled={loading}
                className="btn-primary flex-1 py-2.5 text-sm flex items-center justify-center gap-2">
          {loading ? 'Saving…' : 'Save Address'}
        </button>
        <button onClick={onCancel}
                className="btn-secondary flex-1 py-2.5 text-sm">Cancel</button>
      </div>
    </div>
  )
}

/* ═══════════════ ADDRESS STEP ═══════════════ */
export default function AddressStep({ selected, onSelect, onContinue }) {
  const { user, updateUser } = useAuth()
  const [showForm,  setShowForm]  = useState(!user?.addresses?.length)
  const [saving,    setSaving]    = useState(false)

  const addresses = user?.addresses || []

  const saveAddress = async (form) => {
    setSaving(true)
    try {
      const data = await api.post('/auth/addresses', form)
      updateUser({ addresses: data.addresses })
      setShowForm(false)
      /* auto-select the new address */
      const newest = data.addresses[data.addresses.length - 1]
      onSelect(newest)
    } catch (err) {
      alert(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display font-bold text-xl text-gray-900 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary-600" /> Delivery Address
        </h2>
        {addresses.length > 0 && (
          <button onClick={() => setShowForm(v => !v)}
                  className="text-sm font-semibold text-primary-600 hover:underline flex items-center gap-1">
            <Plus className="w-4 h-4" /> Add New
          </button>
        )}
      </div>

      {showForm && (
        <AddressForm
          onSave={saveAddress}
          onCancel={() => addresses.length ? setShowForm(false) : null}
          loading={saving}
        />
      )}

      {addresses.length > 0 && (
        <div className="space-y-3">
          {addresses.map(addr => (
            <AddressCard
              key={addr._id}
              address={addr}
              selected={selected?._id === addr._id}
              onSelect={() => onSelect(addr)}
            />
          ))}
        </div>
      )}

      {addresses.length === 0 && !showForm && (
        <div className="text-center py-8 text-gray-400 text-sm">
          No saved addresses. Add one above.
        </div>
      )}

      <button
        onClick={onContinue}
        disabled={!selected}
        className="btn-primary w-full py-3.5 text-base disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Continue to Review →
      </button>
    </div>
  )
}
