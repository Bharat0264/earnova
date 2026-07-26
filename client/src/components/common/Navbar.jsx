import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { LayoutDashboard, LogOut, Menu, ShoppingCart, UserRound, X } from 'lucide-react'
import { PUBLIC_NAV_LINKS } from '../../config/navigation'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const { isAuthenticated, user, logout } = useAuth()
  const { cartCount } = useCart()
  const location = useLocation()

  useEffect(() => setOpen(false), [location.pathname])

  useEffect(() => {
    if (!open) return undefined
    const onKeyDown = event => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur">
      <div className="section-wrapper flex h-16 items-center justify-between gap-4">
        <Link to="/" className="shrink-0" aria-label="Earnova home">
          <img src="/earnova-logo.png" alt="Earnova" className="h-10 w-auto max-w-[150px] object-contain sm:max-w-[180px]" />
        </Link>
        <nav className="hidden items-center gap-5 lg:flex" aria-label="Primary navigation">
          {PUBLIC_NAV_LINKS.map(link => (
            <NavLink key={link.to} to={link.to} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>{link.label}</NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-1.5">
          {cartCount > 0 && (
            <Link to="/cart" className="icon-button relative" aria-label={`Cart with ${cartCount} items`}>
              <ShoppingCart className="h-5 w-5" />
              <span className="absolute -right-1 -top-1 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-brand-700 px-1 text-[10px] font-bold text-white">{cartCount > 99 ? '99+' : cartCount}</span>
            </Link>
          )}
          {isAuthenticated ? (
            <>
              <Link to="/app/overview" className="hidden min-h-10 items-center gap-2 rounded-xl px-3 text-sm font-bold text-slate-700 hover:bg-slate-100 sm:flex">
                <LayoutDashboard className="h-4 w-4" /> Workspace
              </Link>
              <button type="button" onClick={logout} className="hidden min-h-10 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-slate-600 hover:bg-red-50 hover:text-red-700 md:flex">
                <LogOut className="h-4 w-4" /> Sign out
              </button>
            </>
          ) : (
            <div className="hidden items-center gap-1 sm:flex">
              <Link to="/login" className="min-h-10 rounded-xl px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-100">Login</Link>
              <Link to="/register" className="btn-primary !min-h-10 !px-4 !py-2 text-sm">Get Started</Link>
            </div>
          )}
          <button type="button" className="icon-button lg:hidden" onClick={() => setOpen(true)} aria-expanded={open} aria-controls="mobile-menu" aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation menu">
          <button type="button" className="absolute inset-0 bg-slate-950/35" onClick={() => setOpen(false)} aria-label="Close menu" />
          <div id="mobile-menu" className="absolute right-0 top-0 flex h-dvh w-[min(86vw,340px)] flex-col bg-white p-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <p className="font-bold text-slate-950">Menu</p>
              <button type="button" className="icon-button" onClick={() => setOpen(false)} aria-label="Close menu"><X className="h-5 w-5" /></button>
            </div>
            {isAuthenticated && (
              <div className="mt-5 rounded-2xl bg-slate-50 p-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-brand-700"><UserRound className="h-4 w-4" /></span>
                  <div className="min-w-0"><p className="truncate text-sm font-bold text-slate-900">{user?.name}</p><p className="truncate text-xs text-slate-500">{user?.email}</p></div>
                </div>
              </div>
            )}
            <nav className="mt-5 flex flex-1 flex-col gap-1 overflow-y-auto" aria-label="Mobile navigation">
              {PUBLIC_NAV_LINKS.map(link => <NavLink key={link.to} to={link.to} className={({ isActive }) => `rounded-xl px-4 py-3 text-sm font-semibold ${isActive ? 'bg-brand-50 text-brand-800' : 'text-slate-700 hover:bg-slate-50'}`}>{link.label}</NavLink>)}
              {isAuthenticated && <NavLink to="/app/overview" className="mt-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-bold text-white">Open workspace</NavLink>}
            </nav>
            <div className="border-t border-slate-200 pt-4">
              {isAuthenticated ? (
                <button type="button" onClick={logout} className="btn-secondary w-full"><LogOut className="h-4 w-4" /> Sign out</button>
              ) : (
                <div className="grid grid-cols-2 gap-2"><Link to="/login" className="btn-secondary">Login</Link><Link to="/register" className="btn-primary">Get Started</Link></div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
