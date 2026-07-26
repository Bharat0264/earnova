import { Link, NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import PageMeta from '../components/common/PageMeta'
import GetHelp from '../components/support/GetHelp'

const LINKS = [
  ['Overview', '/partner/overview'],
  ['Listings', '/partner/listings'],
  ['Orders', '/partner/orders'],
  ['Requests', '/partner/requests'],
  ['Earnings', '/partner/earnings'],
  ['Reviews', '/partner/reviews'],
  ['Support', '/partner/support'],
  ['Settings', '/partner/settings'],
]

export default function PartnerLayout() {
  const { user, logout } = useAuth()
  return (
    <div className="min-h-screen bg-slate-50">
      <PageMeta title="Partner workspace" noIndex />
      <header className="border-b border-slate-200 bg-white">
        <div className="section-wrapper flex min-h-16 items-center justify-between gap-4 py-3">
          <Link to="/"><img src="/earnova-logo.png" alt="Earnova" className="h-9 w-auto" /></Link>
          <div className="text-right">
            <p className="text-sm font-semibold text-slate-800">{user?.name}</p>
            <button type="button" onClick={logout} className="text-xs text-slate-500 hover:text-red-600">Sign out</button>
          </div>
        </div>
      </header>
      <div className="section-wrapper py-6">
        <nav className="mb-6 flex gap-2 overflow-x-auto pb-2" aria-label="Partner workspace">
          {LINKS.map(([label, to]) => <NavLink key={to} to={to} className={({ isActive }) => `whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold ${isActive ? 'bg-brand-700 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'}`}>{label}</NavLink>)}
        </nav>
        <Outlet />
      </div>
      <GetHelp />
    </div>
  )
}
