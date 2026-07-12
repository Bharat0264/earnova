import { useState } from 'react'
import { useSearchParams, Link, Navigate } from 'react-router-dom'
import { Package, User, MapPin, Heart, LogOut, Zap, Loader2, LayoutDashboard } from 'lucide-react'
import { OrderHistory } from '../components/account/OrderHistory'
import { AddressBook } from '../components/account/OrderHistory'
import ProfileForm from '../components/account/ProfileForm'
import ProductCard from '../components/products/ProductCard'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import MyServicesDashboard from '../components/account/MyServicesDashboard'

const TABS = [
  { key: 'services',  label: 'My Services', Icon: LayoutDashboard },
  { key: 'orders',    label: 'My Orders',  Icon: Package },
  { key: 'profile',   label: 'Profile',    Icon: User     },
  { key: 'addresses', label: 'Addresses',  Icon: MapPin },
  { key: 'wishlist',  label: 'Wishlist',   Icon: Heart },
]

export default function AccountPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { user, isAuthenticated, loading: authLoading, logout, hasFeature } = useAuth()
  const { wishlist } = useCart()
  const allowedTabs = TABS.filter(item => !item.feature || hasFeature(item.feature))
  const requestedTab = searchParams.get('tab')
  const tab = allowedTabs.some(item => item.key === requestedTab)
    ? requestedTab
    : 'services'

  if (authLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/?login=1" replace />
  }

  const switchTab = (key) => {
    setSearchParams({ tab: key })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="section-wrapper py-6">
        <div className="flex flex-col lg:flex-row gap-6">

          {/* ── Sidebar ── */}
          <aside className="lg:w-60 xl:w-64 shrink-0">
            {/* User card */}
            <div className="bg-gradient-to-br from-primary-700 to-primary-900 rounded-2xl p-5 text-white mb-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-3">
                <span className="font-display font-bold text-xl">
                  {user?.name?.[0]?.toUpperCase() || '?'}
                </span>
              </div>
              <p className="font-display font-bold text-lg leading-tight">{user?.name}</p>
              <p className="text-primary-200 text-xs mt-0.5 truncate">{user?.email}</p>
              {user?.referralCode && (
                <div className="mt-3 bg-white/10 rounded-xl px-3 py-2">
                  <p className="text-primary-300 text-[10px] font-bold uppercase tracking-widest">
                    Referral Code
                  </p>
                  <p className="text-white font-bold text-sm tracking-widest mt-0.5">
                    {user.referralCode}
                  </p>
                </div>
              )}
            </div>

            {/* Wallet quick stat */}
            <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-card mb-3">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-4 h-4 text-eco-600" />
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Referral Wallet
                </span>
              </div>
              <p className="font-display font-bold text-2xl text-gray-900">
                ₹{(user?.walletBalance || 0).toLocaleString('en-IN')}
              </p>
              {user?.walletBalance >= 100 ? (
                <Link to="/referral"
                      className="btn-primary text-xs mt-3 w-full flex items-center justify-center">
                  Withdraw
                </Link>
              ) : (
                <Link to="/referral"
                      className="text-xs text-primary-600 font-semibold hover:underline mt-1 inline-block">
                  View Referral Program →
                </Link>
              )}
            </div>

            {/* Nav tabs */}
            <nav className="bg-white border border-gray-100 rounded-2xl shadow-card overflow-hidden">
              {allowedTabs.map(({ key, label, Icon }) => (
                <button
                  key={key}
                  onClick={() => switchTab(key)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 text-sm font-medium
                              transition-colors border-l-2 ${
                                tab === key
                                  ? 'bg-primary-50 text-primary-700 border-primary-600'
                                  : 'text-gray-600 hover:bg-gray-50 border-transparent'
                              }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {label}
                  {key === 'wishlist' && wishlist.length > 0 && (
                    <span className="ml-auto text-xs font-bold text-primary-600 bg-primary-50
                                     px-1.5 py-0.5 rounded-full">
                      {wishlist.length}
                    </span>
                  )}
                </button>
              ))}
              <div className="h-px bg-gray-100" />
              <button
                onClick={logout}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-sm font-medium
                           text-red-500 hover:bg-red-50 transition-colors border-l-2 border-transparent"
              >
                <LogOut className="w-4 h-4 shrink-0" />
                Sign Out
              </button>
            </nav>
          </aside>

          {/* ── Main content ── */}
          <div className="flex-1 min-w-0">
            {tab === 'services'  && <MyServicesDashboard />}
            {tab === 'orders'    && <OrderHistory />}
            {tab === 'profile'   && <ProfileForm />}
            {tab === 'addresses' && (
              <div className="space-y-4">
                <h2 className="font-display font-bold text-xl text-gray-900">Saved Addresses</h2>
                <AddressBook />
              </div>
            )}
            {tab === 'wishlist'  && <WishlistTab wishlist={wishlist} />}
          </div>
        </div>
      </div>
    </div>
  )
}

function WishlistTab({ wishlist }) {
  if (wishlist.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Heart className="w-8 h-8 text-gray-300" />
        </div>
        <h3 className="font-display font-bold text-gray-700 mb-2">No wishlist items</h3>
        <p className="text-gray-400 text-sm mb-6">Tap the heart on any product to save it here.</p>
        <Link to="/products" className="btn-primary text-sm">Browse Products</Link>
      </div>
    )
  }
  return (
    <div>
      <h2 className="font-display font-bold text-xl text-gray-900 mb-5">
        Wishlist ({wishlist.length})
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {wishlist.map(p => <ProductCard key={p._id} product={p} />)}
      </div>
    </div>
  )
}
