import { useState } from 'react'
import { Plus, Search, ShieldCheck, Store, User } from 'lucide-react'
import { formatDate, formatPrice } from '../../utils/formatters'
import { api } from '../../utils/api'
import { DEFAULT_PUBLIC_ACCESS, FEATURES } from '../../config/features'

const ROLE_STYLE = {
  admin: 'bg-primary-100 text-primary-700',
  dealer: 'bg-yellow-100 text-yellow-700',
  customer: 'bg-gray-100 text-gray-600',
}
const ROLE_ICON = { admin: ShieldCheck, dealer: Store, customer: User }
const emptyForm = () => ({
  name: '',
  email: '',
  phone: '',
  password: '',
  role: 'customer',
  featureAccess: { ...DEFAULT_PUBLIC_ACCESS },
})

export default function UsersTable({ data, loading, reload }) {
  const [search, setSearch] = useState('')
  const [role, setRole] = useState('all')
  const [updating, setUpdating] = useState(null)
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState(emptyForm)

  const filtered = data.filter(user => {
    const matchRole = role === 'all' || user.role === role
    const query = search.toLowerCase()
    const matchQuery = !query || user.name?.toLowerCase().includes(query) || user.email?.toLowerCase().includes(query)
    return matchRole && matchQuery
  })

  const updateUser = async (user, changes) => {
    setUpdating(user._id)
    try {
      await api.patch(`/admin/users/${user._id}`, changes)
      reload?.()
    } catch (err) {
      alert(err.message)
    } finally {
      setUpdating(null)
    }
  }

  const toggleFeature = (user, feature) => {
    const current = user.featureAccess?.[feature] ?? DEFAULT_PUBLIC_ACCESS[feature] ?? false
    updateUser(user, {
      featureAccess: {
        ...DEFAULT_PUBLIC_ACCESS,
        ...(user.featureAccess || {}),
        [feature]: !current,
      },
    })
  }

  const createMember = async () => {
    try {
      await api.post('/admin/users', form)
      setForm(emptyForm())
      setShowCreate(false)
      reload?.()
    } catch (err) {
      alert(err.message)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row gap-3 justify-between">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search name or email..." className="input-base pl-9 text-sm" />
          </div>
          <div className="flex gap-1.5">
            {['all', 'customer', 'dealer', 'admin'].map(value => (
              <button key={value} onClick={() => setRole(value)} className={`px-3 py-1.5 text-xs font-semibold rounded-xl border capitalize ${role === value ? 'bg-primary-700 text-white border-primary-700' : 'border-gray-200 text-gray-600'}`}>
                {value}
              </button>
            ))}
          </div>
        </div>
        <button onClick={() => setShowCreate(true)} className="flex items-center justify-center gap-2 bg-primary-700 text-white px-4 py-2 rounded-xl text-sm font-semibold">
          <Plus className="w-4 h-4" /> Create Member
        </button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {['User', 'Role', 'Access To', 'Wallet', 'Referrals', 'Joined', 'Status'].map(title => (
                <th key={title} className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase whitespace-nowrap">{title}</th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan="7" className="p-8 text-center">Loading...</td></tr>
            ) : filtered.map(user => {
              const RoleIcon = ROLE_ICON[user.role] || User
              const isAdmin = user.role === 'admin'
              return (
                <tr key={user._id}>
                  <td className="px-4 py-3">
                    <p className="font-semibold">{user.name}</p>
                    <p className="text-xs text-gray-400">{user.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${ROLE_STYLE[user.role]}`}>
                        <RoleIcon className="w-3 h-3" /> {user.role}
                      </span>
                      {!isAdmin && (
                        <select value={user.role} onChange={event => updateUser(user, { role: event.target.value })} className="border rounded px-1 py-0.5 text-xs">
                          <option value="customer">customer</option><option value="dealer">dealer</option><option value="admin">admin</option>
                        </select>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 min-w-[230px]">
                    {isAdmin ? (
                      <span className="text-xs font-bold text-primary-700">All services</span>
                    ) : (
                      <div className="flex flex-wrap gap-3">
                        {FEATURES.map(feature => {
                          const checked = user.featureAccess?.[feature.key] ?? DEFAULT_PUBLIC_ACCESS[feature.key] ?? false
                          return (
                            <label key={feature.key} className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={checked}
                                disabled={updating === user._id}
                                onChange={() => toggleFeature(user, feature.key)}
                                className="w-4 h-4 accent-primary-700"
                              />
                              {feature.label}
                            </label>
                          )
                        })}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">{formatPrice(user.walletBalance || 0)}</td>
                  <td className="px-4 py-3">{user.referralCount || 0}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{formatDate(user.createdAt)}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => updateUser(user, { isActive: !user.isActive })} disabled={updating === user._id} className={`px-3 py-1 rounded-full text-xs font-semibold ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="font-display font-bold text-lg">Create Member</h2>
            <p className="text-sm text-gray-500 mt-1 mb-5">Choose exactly which Earnova services this user can access.</p>
            <div className="space-y-3">
              <input placeholder="Name" value={form.name} onChange={event => setForm({ ...form, name: event.target.value })} className="input-base" />
              <input type="email" placeholder="Email" value={form.email} onChange={event => setForm({ ...form, email: event.target.value })} className="input-base" />
              <input placeholder="Phone" value={form.phone} onChange={event => setForm({ ...form, phone: event.target.value })} className="input-base" />
              <input type="password" placeholder="Password" value={form.password} onChange={event => setForm({ ...form, password: event.target.value })} className="input-base" />
              <select value={form.role} onChange={event => setForm({ ...form, role: event.target.value })} className="input-base">
                <option value="customer">Member</option><option value="dealer">Dealer</option>
              </select>
              <div className="rounded-2xl border border-gray-200 p-4">
                <p className="text-sm font-bold text-gray-900 mb-3">Access To</p>
                <div className="space-y-3">
                  {FEATURES.map(feature => (
                    <label key={feature.key} className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(form.featureAccess[feature.key])}
                        onChange={event => setForm({
                          ...form,
                          featureAccess: { ...form.featureAccess, [feature.key]: event.target.checked },
                        })}
                        className="w-4 h-4 mt-0.5 accent-primary-700"
                      />
                      <span>
                        <span className="block text-sm font-semibold text-gray-800">{feature.label}</span>
                        <span className="block text-xs text-gray-500 mt-0.5">{feature.description}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setShowCreate(false)} className="flex-1 border rounded-xl py-2.5">Cancel</button>
              <button onClick={createMember} className="flex-1 bg-primary-700 text-white rounded-xl py-2.5 font-semibold">Create Member</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
