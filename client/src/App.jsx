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
import FreelancePage      from './pages/FreelancePage'
import FeatureGate        from './components/common/FeatureGate'

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <div className="min-h-screen flex flex-col font-sans bg-white">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/"             element={<HomePage />} />
              <Route path="/products"     element={<FeatureGate><ProductsPage /></FeatureGate>} />
              <Route path="/freelance"    element={<FeatureGate feature="freelancing"><FreelancePage /></FeatureGate>} />
              <Route path="/products/:id" element={<FeatureGate><ProductDetailPage /></FeatureGate>} />
              <Route path="/cart"         element={<FeatureGate><CartPage /></FeatureGate>} />
              <Route path="/checkout"     element={<FeatureGate><CheckoutPage /></FeatureGate>} />
              <Route path="/account"      element={<AccountPage />} />
              <Route path="/b2b"          element={<FeatureGate feature="ecommerce"><B2BPage /></FeatureGate>} />
              <Route path="/subsidy"      element={<FeatureGate feature="ecommerce"><SubsidyPage /></FeatureGate>} />
              <Route path="/referral"     element={<FeatureGate feature="ecommerce"><ReferralPage /></FeatureGate>} />
              <Route path="/ref/:code"    element={<FeatureGate feature="ecommerce"><RefLandingPage /></FeatureGate>} />
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
