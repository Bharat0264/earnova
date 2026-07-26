import { useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import PageMeta from '../components/common/PageMeta'
import { useAuth } from '../context/AuthContext'
import GetHelp from '../components/support/GetHelp'

const LINKS = [
  ['Overview', '/firm'],
  ['Cases', '/firm/cases'],
  ['Clients', '/firm/clients'],
  ['Team', '/firm/team'],
  ['Tasks', '/firm/tasks'],
  ['Documents', '/firm/documents'],
  ['Consultations', '/firm/consultations'],
  ['Services', '/firm/services'],
  ['Quotes', '/firm/quotes'],
  ['Billing', '/firm/billing'],
  ['Reports', '/firm/reports'],
  ['Support', '/firm/support'],
  ['Settings', '/firm/settings'],
]

export default function FirmLayout() {
  const [open, setOpen] = useState(false)
  const { user, logout } = useAuth()
  return (
    <div className="min-h-screen bg-slate-50">
      <PageMeta title="CA firm workspace" noIndex />
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
        <div className="section-wrapper flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <button type="button" className="icon-button lg:hidden" onClick={() => setOpen(true)} aria-label="Open firm navigation"><Menu className="h-5 w-5" /></button>
            <Link to="/"><img src="/earnova-logo.png" alt="Earnova" className="h-9 w-auto" /></Link>
            <span className="hidden text-sm font-bold text-slate-700 sm:inline">CA firm workspace</span>
          </div>
          <div className="text-right"><p className="text-sm font-bold text-slate-800">{user?.name}</p><button type="button" onClick={logout} className="text-xs text-slate-500 hover:text-red-700">Sign out</button></div>
        </div>
      </header>
      <div className="mx-auto flex max-w-[1600px]">
        {open && <button type="button" className="fixed inset-0 z-40 bg-slate-950/30 lg:hidden" aria-label="Close navigation" onClick={() => setOpen(false)} />}
        <aside className={`fixed inset-y-0 left-0 z-50 w-72 overflow-y-auto border-r border-slate-200 bg-white p-4 transition-transform lg:sticky lg:top-16 lg:z-0 lg:h-[calc(100vh-4rem)] lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="mb-4 flex items-center justify-between lg:hidden"><span className="font-bold">Firm workspace</span><button type="button" className="icon-button" onClick={() => setOpen(false)}><X className="h-5 w-5" /></button></div>
          <nav className="space-y-1" aria-label="CA firm workspace">
            {LINKS.map(([label, to]) => <NavLink key={to} end={to === '/firm'} to={to} onClick={() => setOpen(false)} className={({ isActive }) => `app-nav-link ${isActive ? 'app-nav-link-active' : ''}`}>{label}</NavLink>)}
          </nav>
          <div className="mt-6 rounded-2xl bg-emerald-50 p-4"><p className="text-sm font-bold text-emerald-950">Firm isolation is enforced</p><p className="mt-1 text-xs leading-relaxed text-emerald-800">Non-admin members see assigned cases only. Platform roles never imply a verified professional designation.</p></div>
        </aside>
        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8"><Outlet /></main>
      </div>
      <GetHelp service="ca" />
    </div>
  )
}
