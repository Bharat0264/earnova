import { useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { Bell, Menu, PanelLeftClose, Settings, X } from 'lucide-react'
import { APP_NAV_LINKS } from '../config/navigation'
import { useAuth } from '../context/AuthContext'
import { useBusiness } from '../context/BusinessContext'
import PageMeta from '../components/common/PageMeta'
import GetHelp from '../components/support/GetHelp'

export default function AppLayout() {
  const [open, setOpen] = useState(false)
  const { user, logout } = useAuth()
  const { businesses, selectedBusinessId, selectBusiness } = useBusiness()

  return (
    <div className="min-h-screen bg-slate-50">
      <PageMeta title="Business workspace" noIndex />
      <a href="#workspace-content" className="skip-link">Skip to workspace</a>
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
        <div className="flex h-16 items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <button type="button" className="icon-button lg:hidden" onClick={() => setOpen(true)} aria-label="Open workspace navigation">
              <Menu className="h-5 w-5" />
            </button>
            <Link to="/" aria-label="Earnova home"><img src="/earnova-logo.png" alt="" className="h-9 w-auto" /></Link>
            <span className="hidden h-6 w-px bg-slate-200 sm:block" />
            {businesses.length ? (
              <label className="hidden sm:block">
                <span className="sr-only">Selected business</span>
                <select
                  className="min-h-10 max-w-52 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-bold text-slate-700"
                  value={selectedBusinessId}
                  onChange={event => selectBusiness(event.target.value)}
                >
                  {businesses.map(business => <option key={business._id} value={business._id}>{business.name}</option>)}
                </select>
              </label>
            ) : <span className="hidden text-sm font-semibold text-slate-600 sm:block">Business workspace</span>}
          </div>
          <div className="flex items-center gap-2">
            <Link to="/app/notifications" className="icon-button" aria-label="Notifications"><Bell className="h-5 w-5" /></Link>
            <Link to="/app/settings" className="icon-button" aria-label="Settings"><Settings className="h-5 w-5" /></Link>
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-slate-800">{user?.name}</p>
              <button type="button" onClick={logout} className="text-xs font-semibold text-slate-500 hover:text-red-600">Sign out</button>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1600px]">
        {open && <button type="button" aria-label="Close navigation" className="fixed inset-0 z-40 bg-slate-950/30 lg:hidden" onClick={() => setOpen(false)} />}
        <aside className={`fixed inset-y-0 left-0 z-50 w-72 border-r border-slate-200 bg-white p-4 transition-transform lg:sticky lg:top-16 lg:z-0 lg:h-[calc(100vh-4rem)] lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="mb-4 flex items-center justify-between lg:hidden">
            <span className="font-bold text-slate-900">Workspace</span>
            <button type="button" className="icon-button" onClick={() => setOpen(false)} aria-label="Close workspace navigation"><X className="h-5 w-5" /></button>
          </div>
          <nav className="space-y-1" aria-label="Workspace">
            {APP_NAV_LINKS.map(link => (
              <NavLink key={link.to} to={link.to} onClick={() => setOpen(false)} className={({ isActive }) => `app-nav-link ${isActive ? 'app-nav-link-active' : ''}`}>
                {link.label}
              </NavLink>
            ))}
          </nav>
          <div className="mt-6 rounded-2xl bg-brand-50 p-4">
            <PanelLeftClose className="h-5 w-5 text-brand-700" />
            <p className="mt-3 text-sm font-bold text-slate-900">Phase 2 operations</p>
            <p className="mt-1 text-xs leading-relaxed text-slate-600">Customers, sales, stock, expenses, invoices and data-grounded insights share one secure business workspace.</p>
          </div>
        </aside>
        <main id="workspace-content" className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
      <GetHelp />
    </div>
  )
}
