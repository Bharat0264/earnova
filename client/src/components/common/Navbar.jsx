import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ShoppingCart, Heart, User, Menu, X, Zap, LogOut, Package, ChevronDown, Briefcase, SunMedium, BarChart3, FileCheck2 } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import AuthModal from '../auth/AuthModal'

const NAV_LINKS = [
  { to: '/investors', label: 'Investors', public: true },
  { to: '/products', label: 'Shop at Earnova', feature: 'ecommerce' },
  { to: '/referral', label: 'Earn & Refer', public: true },
]

const SERVICE_LINKS = [
  { to: '/freelance', label: 'Freelancing', description: 'Hire talent or work as a freelancer', icon: Briefcase, feature: 'freelancing', publicPreview: true },
  { to: '/energy-solutions', label: 'Energy Solutions', description: 'Solar and energy project support', icon: SunMedium, public: true },
  { to: '/business-solutions', label: 'Business Solutions', description: 'AI analytics for business owners', icon: BarChart3, public: true },
  { to: '/ca-services', label: 'CA Services', description: 'ITR, tax, audit and compliance help', icon: FileCheck2, public: true },
]

export default function Navbar() {
  const [scrolled,   setScrolled]   = useState(false)
  const [menuOpen,   setMenuOpen]   = useState(false)
  const [showAuth,   setShowAuth]   = useState(false)
  const [authTab,    setAuthTab]    = useState('login')
  const [profileOpen, setProfileOpen] = useState(false)
  const [servicesOpen, setServicesOpen] = useState(false)
  const profileRef = useRef(null)
  const servicesRef = useRef(null)

  const { cartCount }                     = useCart()
  const { user, isAuthenticated, isAdmin, logout, hasFeature } = useAuth()
  const location = useLocation()
  const visibleLinks = NAV_LINKS.filter(link =>
    link.public ||
    (link.publicPreview && !isAuthenticated) ||
    (isAuthenticated && (link.authenticated || hasFeature(link.feature)))
  )
  const visibleServiceLinks = SERVICE_LINKS.filter(link =>
    link.public ||
    (link.publicPreview && !isAuthenticated) ||
    (isAuthenticated && (link.authenticated || hasFeature(link.feature)))
  )
  const shoppingEnabled = isAuthenticated && hasFeature('ecommerce')
  const ecommerceEnabled = isAuthenticated && hasFeature('ecommerce')

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 18)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setMenuOpen(false); setProfileOpen(false); setServicesOpen(false) }, [location.pathname])

  /* Close profile dropdown on outside click */
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false)
      }
      if (servicesRef.current && !servicesRef.current.contains(e.target)) {
        setServicesOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  /* Open auth modal from URL param (e.g. /?login=1) */
  useEffect(() => {
    if (new URLSearchParams(location.search).get('login') === '1' && !isAuthenticated) {
      setShowAuth(true)
    }
  }, [location.search, isAuthenticated])

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(path + '/')

  const openLogin    = () => { setAuthTab('login');    setShowAuth(true) }
  const openRegister = () => { setAuthTab('register'); setShowAuth(true) }

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-md shadow-nav'
            : 'bg-white/80 backdrop-blur-sm border-b border-white/40'
        }`}
      >
        <div className="section-wrapper">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group shrink-0">
              <img src="/earnova-logo.png" alt="Earnova" className="w-[150px] sm:w-[210px] h-auto object-contain" />
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-7">
              <div ref={servicesRef} className="relative">
                <button
                  type="button"
                  onClick={() => setServicesOpen(value => !value)}
                  className={`nav-link inline-flex items-center gap-1.5 ${visibleServiceLinks.some(link => isActive(link.to)) ? 'active !text-primary-700' : ''}`}
                >
                  Earnova Services
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${servicesOpen ? 'rotate-180' : ''}`} />
                </button>
                {servicesOpen && (
                  <div className="absolute left-0 top-full mt-3 w-80 rounded-2xl border border-gray-100 bg-white p-2 shadow-card-hover z-50">
                    {visibleServiceLinks.map(({ to, label, description, icon: Icon }) => (
                      <Link
                        key={to}
                        to={to}
                        className={`flex items-start gap-3 rounded-xl px-3 py-3 transition-colors ${
                          isActive(to) ? 'bg-primary-50 text-primary-800' : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <span className="w-9 h-9 rounded-xl bg-primary-50 text-primary-700 flex items-center justify-center shrink-0">
                          <Icon className="w-4 h-4" />
                        </span>
                        <span>
                          <span className="block text-sm font-bold">{label}</span>
                          <span className="block text-xs text-gray-500 mt-0.5">{description}</span>
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
              {visibleLinks.map(({ to, label }) => (
                <Link key={to} to={to}
                      className={`nav-link ${isActive(to) ? 'active !text-primary-700' : ''}`}>
                  {label}
                </Link>
              ))}
            </nav>

            {/* Action icons */}
            <div className="flex items-center gap-1">

              {/* Wishlist */}
              {shoppingEnabled && (
                <Link to="/account?tab=wishlist"
                      className="hidden sm:block p-2.5 text-gray-500 hover:text-primary-700 hover:bg-primary-50
                                 rounded-xl transition-colors" aria-label="Wishlist">
                  <Heart className="w-5 h-5" />
                </Link>
              )}

              {/* Cart */}
              {shoppingEnabled && (
                <Link to="/cart"
                      className="relative p-2.5 text-gray-500 hover:text-primary-700 hover:bg-primary-50
                                 rounded-xl transition-colors" aria-label="Cart">
                  <ShoppingCart className="w-5 h-5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1
                                     bg-primary-700 text-white text-[10px] font-bold rounded-full
                                     flex items-center justify-center leading-none">
                      {cartCount > 99 ? '99+' : cartCount}
                    </span>
                  )}
                </Link>
              )}

              {/* Profile / Auth — desktop */}
              {isAuthenticated ? (
                <div ref={profileRef} className="relative hidden md:block">
                  <button
                    onClick={() => setProfileOpen(v => !v)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-primary-50
                               transition-colors text-gray-700"
                  >
                    <div className="w-7 h-7 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="font-bold text-xs text-primary-700">
                        {user?.name?.[0]?.toUpperCase()}
                      </span>
                    </div>
                    <span className="text-sm font-medium max-w-[90px] truncate">
                      {user?.name?.split(' ')[0]}
                    </span>
                    <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${
                      profileOpen ? 'rotate-180' : ''
                    }`} />
                  </button>

                  {/* Dropdown */}
                  {profileOpen && (
                    <div className="absolute right-0 top-full mt-1.5 w-52 bg-white rounded-2xl
                                    shadow-card-hover border border-gray-100 overflow-hidden z-50">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="font-semibold text-sm text-gray-900 truncate">{user?.name}</p>
                        <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                      </div>
                      {isAdmin && (
                        <Link to="/admin"
                              className="flex items-center gap-2.5 px-4 py-3 text-sm text-primary-700
                                         hover:bg-primary-50 transition-colors font-semibold">
                          <Zap className="w-4 h-4" /> Admin Panel
                        </Link>
                      )}
                      {shoppingEnabled && (
                        <Link to="/account?tab=orders"
                              className="flex items-center gap-2.5 px-4 py-3 text-sm text-gray-600
                                         hover:bg-gray-50 transition-colors">
                          <Package className="w-4 h-4" /> My Orders
                        </Link>
                      )}
                      <Link to="/account?tab=profile"
                            className="flex items-center gap-2.5 px-4 py-3 text-sm text-gray-600
                                       hover:bg-gray-50 transition-colors">
                        <User className="w-4 h-4" /> Profile
                      </Link>
                      <Link to="/freelance?mode=freelancer"
                            className="flex items-center gap-2.5 px-4 py-3 text-sm text-gray-600
                                       hover:bg-gray-50 transition-colors">
                        <Briefcase className="w-4 h-4" /> Freelancer Profile
                      </Link>
                      {ecommerceEnabled && (
                        <Link to="/referral"
                              className="flex items-center gap-2.5 px-4 py-3 text-sm text-gray-600
                                         hover:bg-gray-50 transition-colors">
                          <Zap className="w-4 h-4" /> Referral — ₹{(user?.walletBalance || 0).toLocaleString('en-IN')}
                        </Link>
                      )}
                      <div className="h-px bg-gray-100" />
                      <button onClick={logout}
                              className="flex items-center gap-2.5 px-4 py-3 text-sm text-red-500
                                         hover:bg-red-50 transition-colors w-full text-left">
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="hidden md:flex items-center gap-1">
                  <button onClick={openLogin}
                          className="px-3 py-2 text-sm font-semibold text-gray-600
                                     hover:text-primary-700 hover:bg-primary-50 rounded-xl transition-colors">
                    Sign In
                  </button>
                  <button onClick={openRegister}
                          className="btn-primary px-4 py-2 text-sm">
                    Sign Up
                  </button>
                </div>
              )}

              {/* Hamburger — mobile */}
              <button
                className="md:hidden p-2.5 text-gray-500 hover:text-primary-700 hover:bg-primary-50
                           rounded-xl transition-colors"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Menu"
              >
                {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      <div className={`fixed inset-0 z-40 md:hidden transition-all duration-300 ${
        menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}>
        <div className="absolute inset-0 bg-black/25 backdrop-blur-sm" onClick={() => setMenuOpen(false)} />
        <div className={`absolute top-0 right-0 h-full w-72 bg-white shadow-2xl
                        transition-transform duration-300 flex flex-col ${
                          menuOpen ? 'translate-x-0' : 'translate-x-full'
                        }`}>
          <div className="flex items-center justify-between px-5 h-16 border-b border-gray-100 shrink-0">
            <span className="font-display font-bold text-primary-900">Menu</span>
            <button onClick={() => setMenuOpen(false)} className="p-2 rounded-xl text-gray-400 hover:bg-gray-50">
              <X className="w-5 h-5" />
            </button>
          </div>
          <nav className="flex flex-col gap-1 p-4 flex-1 overflow-y-auto">
            <details open className="rounded-xl bg-gray-50">
              <summary className="list-none cursor-pointer px-4 py-3 rounded-xl text-sm font-bold text-gray-900 flex items-center justify-between">
                Earnova Services
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </summary>
              <div className="px-2 pb-2">
                {visibleServiceLinks.map(({ to, label, icon: Icon }) => (
                  <Link key={to} to={to}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                          isActive(to) ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-white'
                        }`}>
                    <Icon className="w-4 h-4" />
                    {label}
                  </Link>
                ))}
              </div>
            </details>
            {visibleLinks.map(({ to, label }) => (
              <Link key={to} to={to}
                    className={`px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                      isActive(to) ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50'
                    }`}>
                {label}
              </Link>
            ))}
            <div className="h-px bg-gray-100 my-2" />
            {isAuthenticated ? (
              <>
                <div className="px-4 py-3 bg-gray-50 rounded-xl mb-1">
                  <p className="font-semibold text-sm text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                </div>
                {isAdmin && (
                  <Link to="/admin" className="px-4 py-3 rounded-xl text-sm font-semibold text-primary-700 bg-primary-50 flex items-center gap-2">
                    <Zap className="w-4 h-4" /> Admin Panel
                  </Link>
                )}
                {shoppingEnabled && (
                  <Link to="/account?tab=orders" className="px-4 py-3 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 flex items-center gap-2">
                    <Package className="w-4 h-4" /> My Orders
                  </Link>
                )}
                <Link to="/account?tab=profile" className="px-4 py-3 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 flex items-center gap-2">
                  <User className="w-4 h-4" /> Profile
                </Link>
                <Link to="/freelance?mode=freelancer" className="px-4 py-3 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 flex items-center gap-2">
                  <Briefcase className="w-4 h-4" /> Freelancer Profile
                </Link>
                <button onClick={logout} className="px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 flex items-center gap-2 text-left w-full">
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </>
            ) : (
              <>
                <button onClick={() => { openLogin();    setMenuOpen(false) }}
                        className="px-4 py-3 rounded-xl text-sm font-semibold text-primary-700 bg-primary-50">
                  Sign In
                </button>
                <button onClick={() => { openRegister(); setMenuOpen(false) }}
                        className="btn-primary text-sm mt-1">
                  Create Account
                </button>
              </>
            )}
          </nav>
          <div className="p-4 border-t border-gray-100 shrink-0">
            <p className="text-xs text-gray-400 text-center">© 2026 Earnova Energy</p>
          </div>
        </div>
      </div>

      {/* Spacer */}
      <div className="h-16" />

      {/* Auth modal */}
      <AuthModal
        isOpen={showAuth}
        initialTab={authTab}
        onClose={() => setShowAuth(false)}
        onSuccess={() => setShowAuth(false)}
      />
    </>
  )
}
