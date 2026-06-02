import { Routes, Route } from 'react-router-dom'
import { AuthProvider }   from './context/AuthContext'
import { CartProvider }   from './context/CartContext'
import Navbar             from './components/common/Navbar'
import Footer             from './components/common/Footer'

import HomePage           from './pages/HomePage'
import ProductsPage       from './pages/ProductsPage'
import ProductDetailPage  from './pages/ProductDetailPage'
import CartPage           from './pages/CartPage'
import CheckoutPage       from './pages/CheckoutPage'
import AccountPage        from './pages/AccountPage'
import B2BPage            from './pages/B2BPage'
import SubsidyPage        from './pages/SubsidyPage'
import ReferralPage       from './pages/ReferralPage'
import RefLandingPage     from './pages/RefLandingPage'
import AdminPage          from './pages/AdminPage'
import NotFoundPage       from './pages/NotFoundPage'

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <div className="min-h-screen flex flex-col font-sans bg-white">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/"             element={<HomePage />} />
              <Route path="/products"     element={<ProductsPage />} />
              <Route path="/products/:id" element={<ProductDetailPage />} />
              <Route path="/cart"         element={<CartPage />} />
              <Route path="/checkout"     element={<CheckoutPage />} />
              <Route path="/account"      element={<AccountPage />} />
              <Route path="/b2b"          element={<B2BPage />} />
              <Route path="/subsidy"      element={<SubsidyPage />} />
              <Route path="/referral"     element={<ReferralPage />} />
              <Route path="/ref/:code"    element={<RefLandingPage />} />
              <Route path="/admin/*"      element={<AdminPage />} />
              <Route path="*"             element={<NotFoundPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </CartProvider>
    </AuthProvider>
  )
}
