import { useState } from 'react'
import { Search, ShieldCheck, User, Store, Plus } from 'lucide-react'
import { formatPrice, formatDate } from '../../utils/formatters'
import { api } from '../../utils/api'

const ROLE_STYLE = {
  admin: 'bg-primary-100 text-primary-700',
  dealer: 'bg-yellow-100 text-yellow-700',
  customer: 'bg-gray-100 text-gray-600'
}

const ROLE_ICON = {
  admin: ShieldCheck,
  dealer: Store,
  customer: User
}

export default function UsersTable({ data, loading, reload }) {
  const [search, setSearch] = useState('')
  const [role, setRole] = useState('all')
  const [updating, setUpdating] = useState(null)

  const [showCreate, setShowCreate] = useState(false)

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'customer'
  })

  const filtered = data.filter(u => {
    const matchRole = role === 'all' || u.role === role
    const matchQ =
      !search ||
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())

    return matchRole && matchQ
  })

  const toggleActive = async (u) => {
    setUpdating(u._id)

    try {
      await api.patch(`/admin/users/${u._id}`, {
        isActive: !u.isActive
      })

      reload?.()
    } catch (e) {
      alert(e.message)
    } finally {
      setUpdating(null)
    }
  }

  const changeRole = async (u, newRole) => {
    if (!window.confirm(`Change ${u.name} to ${newRole}?`)) return

    setUpdating(u._id)

    try {
      await api.patch(`/admin/users/${u._id}`, {
        role: newRole
      })

      reload?.()
    } catch (e) {
      alert(e.message)
    } finally {
      setUpdating(null)
    }
  }

  const createMember = async () => {
    try {
      await api.post('/admin/users', form)

      alert('Member created successfully')

      setForm({
        name: '',
        email: '',
        phone: '',
        password: '',
        role: 'customer'
      })

      setShowCreate(false)

      reload?.()
    } catch (err) {
      alert(err.message)
    }
  }

  return (
    <div className="space-y-4">

      {/* Top Bar */}
      <div className="flex flex-col lg:flex-row gap-3 justify-between">

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search name or email..."
              className="input-base pl-9 text-sm"
            />
          </div>

          <div className="flex gap-1.5">
            {['all', 'customer', 'dealer', 'admin'].map(r => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all capitalize ${
                  role === r
                    ? 'bg-primary-700 text-white border-primary-700'
                    : 'border-gray-200 text-gray-600'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 bg-primary-700 text-white px-4 py-2 rounded-xl text-sm font-semibold"
        >
          <Plus className="w-4 h-4" />
          Create Member
        </button>

      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {['User','Role','Wallet','Referrals','Joined','Status'].map(h => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-50">

            {loading ? (
              <tr>
                <td colSpan="6" className="p-8 text-center">
                  Loading...
                </td>
              </tr>
            ) : (
              filtered.map(u => {
                const RoleIcon = ROLE_ICON[u.role] || User

                return (
                  <tr key={u._id}>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-semibold">{u.name}</p>
                        <p className="text-xs text-gray-400">{u.email}</p>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">

                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${ROLE_STYLE[u.role]}`}>
                          <RoleIcon className="w-3 h-3" />
                          {u.role}
                        </span>

                        {u.role !== 'admin' && (
                          <select
                            value={u.role}
                            onChange={e => changeRole(u, e.target.value)}
                            className="border rounded px-1 py-0.5 text-xs"
                          >
                            <option value="customer">customer</option>
                            <option value="dealer">dealer</option>
                            <option value="admin">admin</option>
                          </select>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      {formatPrice(u.walletBalance || 0)}
                    </td>

                    <td className="px-4 py-3">
                      {u.referralCount || 0}
                    </td>

                    <td className="px-4 py-3">
                      {formatDate(u.createdAt)}
                    </td>

                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleActive(u)}
                        disabled={updating === u._id}
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          u.isActive
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {u.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                  </tr>
                )
              })
            )}

          </tbody>
        </table>
      </div>

      {/* Create Member Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

          <div className="bg-white rounded-2xl p-6 w-full max-w-md">

            <h2 className="font-bold text-lg mb-4">
              Create Member
            </h2>

            <div className="space-y-3">

              <input
                placeholder="Name"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="input-base"
              />

              <input
                placeholder="Email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className="input-base"
              />

              <input
                placeholder="Phone"
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                className="input-base"
              />

              <input
                type="password"
                placeholder="Password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                className="input-base"
              />

              <select
                value={form.role}
                onChange={e => setForm({ ...form, role: e.target.value })}
                className="input-base"
              >
                <option value="customer">Member</option>
                <option value="dealer">Dealer</option>
              </select>

            </div>

            <div className="flex gap-2 mt-5">

              <button
                onClick={() => setShowCreate(false)}
                className="flex-1 border rounded-xl py-2"
              >
                Cancel
              </button>

              <button
                onClick={createMember}
                className="flex-1 bg-primary-700 text-white rounded-xl py-2"
              >
                Create
              </button>

            </div>

          </div>

        </div>
      )}
    </div>
  )
}