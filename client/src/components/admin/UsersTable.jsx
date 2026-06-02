import { useState } from 'react'
import { Search, ShieldCheck, User, Store, Loader2 } from 'lucide-react'
import { formatPrice, formatDate } from '../../utils/formatters'
import { api } from '../../utils/api'

const ROLE_STYLE = { admin: 'bg-primary-100 text-primary-700', dealer: 'bg-yellow-100 text-yellow-700', customer: 'bg-gray-100 text-gray-600' }
const ROLE_ICON  = { admin: ShieldCheck, dealer: Store, customer: User }

export default function UsersTable({ data, loading, reload }) {
  const [search,  setSearch]  = useState('')
  const [role,    setRole]    = useState('all')
  const [updating,setUpdating]= useState(null)

  const filtered = data.filter(u => {
    const matchRole = role === 'all' || u.role === role
    const matchQ    = !search || u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase())
    return matchRole && matchQ
  })

  const toggleActive = async (u) => {
    setUpdating(u._id)
    try { await api.patch(`/admin/users/${u._id}`, { isActive: !u.isActive }); reload?.() }
    catch (e) { alert(e.message) }
    finally { setUpdating(null) }
  }

  const changeRole = async (u, newRole) => {
    if (!confirm(`Change ${u.name} to ${newRole}?`)) return
    setUpdating(u._id)
    try { await api.patch(`/admin/users/${u._id}`, { role: newRole }); reload?.() }
    catch (e) { alert(e.message) }
    finally { setUpdating(null) }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
                 placeholder="Search name or email…" className="input-base pl-9 text-sm" />
        </div>
        <div className="flex gap-1.5">
          {['all','customer','dealer','admin'].map(r => (
            <button key={r} onClick={() => setRole(r)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all capitalize ${
                      role === r ? 'bg-primary-700 text-white border-primary-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}>{r}</button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {['User','Role','Wallet','Referrals','Joined','Status'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-50">
            {loading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>{Array.from({length:6}).map((_,j) => (
                    <td key={j} className="px-4 py-3"><div className="h-3.5 bg-gray-100 rounded-full animate-pulse" style={{width:`${[70,50,45,35,55,40][j]}%`}} /></td>
                  ))}</tr>
                ))
              : filtered.map(u => {
                  const RoleIcon = ROLE_ICON[u.role] || User
                  return (
                    <tr key={u._id} className={`hover:bg-gray-50/50 transition-colors ${!u.isActive ? 'opacity-50' : ''}`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center shrink-0">
                            <span className="font-bold text-xs text-primary-700">{u.name?.[0]?.toUpperCase()}</span>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 text-xs">{u.name}</p>
                            <p className="text-[11px] text-gray-400">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${ROLE_STYLE[u.role]}`}>
                            <RoleIcon className="w-3 h-3" />{u.role}
                          </span>
                          {u.role !== 'admin' && (
                            <select value={u.role} onChange={e => changeRole(u, e.target.value)}
                                    disabled={updating === u._id}
                                    onClick={e => e.stopPropagation()}
                                    className="text-[10px] border border-gray-200 rounded px-1 py-0.5 bg-white cursor-pointer ml-1 text-gray-500">
                              <option value="customer">customer</option>
                              <option value="dealer">dealer</option>
                              <option value="admin">admin</option>
                            </select>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs font-semibold text-gray-700">{formatPrice(u.walletBalance || 0)}</td>
                      <td className="px-4 py-3 text-xs text-gray-600">{u.referralCount || 0}</td>
                      <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{formatDate(u.createdAt)}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => toggleActive(u)} disabled={updating === u._id}
                                className={`text-[11px] font-bold px-2.5 py-1 rounded-full transition-colors ${
                                  u.isActive ? 'bg-eco-50 text-eco-700 hover:bg-eco-100' : 'bg-red-50 text-red-600 hover:bg-red-100'
                                }`}>
                          {updating === u._id ? '…' : u.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                    </tr>
                  )
                })
            }
          </tbody>
        </table>
      </div>
    </div>
  )
}
