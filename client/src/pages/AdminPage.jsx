import { useSearchParams, Navigate, Link } from 'react-router-dom'
import {
  LayoutDashboard, Package, ShoppingBag, Users,
  Building2, Sun, Wallet, LogOut, Zap, ChevronRight,
} from 'lucide-react'
import { DashboardStats, RevenueChart } from '../components/admin/DashboardStats'
import OrdersTable      from '../components/admin/OrdersTable'
import ProductsTable    from '../components/admin/ProductsTable'
import UsersTable       from '../components/admin/UsersTable'
import B2BInbox         from '../components/admin/B2BInbox'
import SubsidyInbox     from '../components/admin/SubsidyInbox'
import WithdrawalQueue  from '../components/admin/WithdrawalQueue'
import { useAuth }      from '../context/AuthContext'
import {
  useAdminStats, useAdminOrders, useAdminProducts,
  useAdminUsers, useAdminB2B, useAdminSubsidy, useAdminWithdrawals,
} from '../hooks/useAdmin'

export default function AdminPage() {
  const { user, isAuthenticated, isAdmin, loading: authLoading, logout } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const tab = searchParams.get('tab') || 'dashboard'

  const { stats, loading: statsLoading, reload: reloadStats } = useAdminStats()

  /* Lazy-load data per tab */
  const orders      = useAdminOrders()
  const products    = useAdminProducts()
  const users       = useAdminUsers()
  const b2b         = useAdminB2B()
  const subsidy     = useAdminSubsidy()
  const withdrawals = useAdminWithdrawals()

  if (authLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary-200 border-t-primary-700 rounded-full animate-spin" />
    </div>
  )

  if (!isAuthenticated) return <Navigate to="/?login=1" replace />

  if (!isAdmin) return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center">
        <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Zap className="w-8 h-8 text-red-500" />
        </div>
        <h1 className="font-display font-bold text-xl text-gray-900 mb-2">Access Denied</h1>
        <p className="text-gray-500 text-sm mb-6">You need admin privileges to access this panel.</p>
        <Link to="/" className="btn-primary text-sm">← Back to Home</Link>
      </div>
    </div>
  )

  const NAV = [
    { key: 'dashboard',   label: 'Dashboard',      Icon: LayoutDashboard, badge: null                    },
    { key: 'orders',      label: 'Orders',          Icon: Package,          badge: stats?.orders?.pending  },
    { key: 'products',    label: 'Products',        Icon: ShoppingBag,      badge: null                    },
    { key: 'users',       label: 'Users',           Icon: Users,            badge: null                    },
    { key: 'b2b',         label: 'B2B Quotes',      Icon: Building2,        badge: stats?.b2bPending       },
    { key: 'subsidy',     label: 'Subsidy',         Icon: Sun,              badge: stats?.subsidyPending   },
    { key: 'withdrawals', label: 'Withdrawals',     Icon: Wallet,           badge: stats?.withdrawals?.pending },
  ]

  const switchTab = (key) => setSearchParams({ tab: key })

  const PAGE_TITLE = {
    dashboard: 'Dashboard', orders: 'Orders', products: 'Products',
    users: 'Users', b2b: 'B2B Quotes', subsidy: 'Subsidy Requests', withdrawals: 'Withdrawals',
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">

      {/* ── Sidebar ── */}
      <aside className="hidden lg:flex w-56 xl:w-60 shrink-0 flex-col bg-white border-r border-gray-100 shadow-sm fixed h-screen top-0 left-0 z-30">
        {/* Logo */}
        <div className="flex items-center gap-2 px-5 h-16 border-b border-gray-100">
          <div className="w-7 h-7 bg-primary-800 rounded-lg flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <p className="font-display font-bold text-sm text-primary-900">Earnova</p>
            <p className="text-[10px] text-gray-400 -mt-0.5">Admin Panel</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
          {NAV.map(({ key, label, Icon, badge }) => (
            <button key={key} onClick={() => switchTab(key)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium
                                transition-all ${
                                  tab === key
                                    ? 'bg-primary-50 text-primary-700 font-semibold'
                                    : 'text-gray-600 hover:bg-gray-50'
                                }`}>
              <Icon className="w-4 h-4 shrink-0" />
              <span className="flex-1 text-left">{label}</span>
              {badge > 0 && (
                <span className="min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold
                                 rounded-full flex items-center justify-center">
                  {badge > 99 ? '99+' : badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* User + logout */}
        <div className="border-t border-gray-100 p-3">
          <div className="flex items-center gap-2.5 px-2 py-2 mb-1">
            <div className="w-7 h-7 bg-primary-100 rounded-full flex items-center justify-center shrink-0">
              <span className="font-bold text-xs text-primary-700">{user?.name?.[0]?.toUpperCase()}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-xs text-gray-800 truncate">{user?.name}</p>
              <p className="text-[10px] text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>
          <Link to="/" className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-gray-500 hover:bg-gray-50">
            <ChevronRight className="w-3.5 h-3.5 rotate-180" /> Back to Store
          </Link>
          <button onClick={logout} className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs
                                               text-red-500 hover:bg-red-50 transition-colors">
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main area ── */}
      <div className="flex-1 lg:ml-56 xl:ml-60 min-w-0">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-100 px-5 lg:px-8 h-14 flex items-center justify-between sticky top-0 z-20 shadow-sm">
          <div className="flex items-center gap-3">
            {/* Mobile nav */}
            <div className="lg:hidden">
              <select value={tab} onChange={e => switchTab(e.target.value)}
                      className="text-sm font-semibold text-gray-700 border border-gray-200 rounded-xl px-3 py-1.5 bg-white">
                {NAV.map(n => <option key={n.key} value={n.key}>{n.label}</option>)}
              </select>
            </div>
            <h1 className="hidden lg:block font-display font-bold text-lg text-gray-900">
              {PAGE_TITLE[tab]}
            </h1>
          </div>
          <Link to="/" className="text-sm text-gray-500 hover:text-primary-600 flex items-center gap-1">
            View Store <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </header>

        {/* Page content */}
        <main className="p-5 lg:p-8 space-y-6">

          {/* Dashboard */}
          {tab === 'dashboard' && (
            <>
              <DashboardStats stats={stats} loading={statsLoading} />

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Revenue chart */}
                <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl shadow-card p-5">
                  <h2 className="font-display font-bold text-gray-900 mb-4">Revenue — Last 6 Months</h2>
                  <RevenueChart data={stats?.monthlyRevenue || []} loading={statsLoading} />
                </div>

                {/* Quick stats column */}
                <div className="space-y-4">
                  <div className="bg-white border border-gray-100 rounded-2xl shadow-card p-5">
                    <h3 className="font-display font-semibold text-gray-900 text-sm mb-3">Pending Actions</h3>
                    <div className="space-y-2.5">
                      {[
                        { label: 'B2B Quotes',    val: stats?.b2bPending,                 tab: 'b2b',         color: 'text-primary-600' },
                        { label: 'Subsidy Reqs',  val: stats?.subsidyPending,              tab: 'subsidy',     color: 'text-yellow-600'  },
                        { label: 'Withdrawals',   val: stats?.withdrawals?.pending,        tab: 'withdrawals', color: 'text-orange-600'  },
                        { label: 'Open Orders',   val: stats?.orders?.pending,             tab: 'orders',      color: 'text-blue-600'    },
                      ].map(({ label, val, tab: t, color }) => (
                        <button key={label} onClick={() => switchTab(t)}
                                className="w-full flex items-center justify-between text-sm hover:bg-gray-50 rounded-xl px-3 py-2 transition-colors">
                          <span className="text-gray-600">{label}</span>
                          <span className={`font-bold ${color}`}>{statsLoading ? '…' : val ?? 0}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-primary-700 to-primary-950 rounded-2xl p-5 text-white">
                    <p className="text-primary-200 text-xs font-bold uppercase tracking-wider mb-1">Total Paid Out</p>
                    <p className="font-display font-extrabold text-2xl">
                      {statsLoading ? '…' : `₹${((stats?.withdrawals?.totalPaid || 0) / 1000).toFixed(0)}K`}
                    </p>
                    <p className="text-primary-300 text-xs mt-0.5">Referral commissions paid to date</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {tab === 'orders'      && <OrdersTable      data={orders.data}      loading={orders.loading}      reload={orders.reload} />}
          {tab === 'products'    && <ProductsTable    data={products.data}    loading={products.loading}    reload={products.reload} />}
          {tab === 'users'       && <UsersTable       data={users.data}       loading={users.loading}       reload={() => { users.reload(); reloadStats() }} />}
          {tab === 'b2b'         && <B2BInbox         data={b2b.data}         loading={b2b.loading}         reload={() => { b2b.reload(); reloadStats() }} />}
          {tab === 'subsidy'     && <SubsidyInbox     data={subsidy.data}     loading={subsidy.loading}     reload={() => { subsidy.reload(); reloadStats() }} />}
          {tab === 'withdrawals' && <WithdrawalQueue  data={withdrawals.data} loading={withdrawals.loading} reload={() => { withdrawals.reload(); reloadStats() }} />}
        </main>
      </div>
    </div>
  )
}
