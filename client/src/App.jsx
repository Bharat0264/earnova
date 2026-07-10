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
import EnergySolutionsPage from './pages/EnergySolutionsPage'
import BusinessSolutionsPage from './pages/BusinessSolutionsPage'
import CAServicesPage     from './pages/CAServicesPage'
import InvestorsPage      from './pages/InvestorsPage'
import ProjectsPage       from './pages/ProjectsPage'
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
              <Route path="/products"     element={<FeatureGate feature="ecommerce"><ProductsPage /></FeatureGate>} />
              <Route path="/freelance"    element={<FreelancePage />} />
              <Route path="/energy-solutions" element={<FeatureGate feature="energySolutions"><EnergySolutionsPage /></FeatureGate>} />
              <Route path="/business-solutions" element={<BusinessSolutionsPage />} />
              <Route path="/ca-services" element={<CAServicesPage />} />
              <Route path="/projects" element={<ProjectsPage />} />
              <Route path="/investors" element={<InvestorsPage />} />
              <Route path="/products/:id" element={<FeatureGate feature="ecommerce"><ProductDetailPage /></FeatureGate>} />
              <Route path="/cart"         element={<FeatureGate><CartPage /></FeatureGate>} />
              <Route path="/checkout"     element={<FeatureGate><CheckoutPage /></FeatureGate>} />
              <Route path="/account"      element={<AccountPage />} />
              <Route path="/b2b"          element={<FeatureGate feature="b2bPrograms"><B2BPage /></FeatureGate>} />
              <Route path="/subsidy"      element={<FeatureGate feature="subsidies"><SubsidyPage /></FeatureGate>} />
              <Route path="/referral"     element={<FeatureGate feature="referrals"><ReferralPage /></FeatureGate>} />
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
