import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { BusinessProvider } from './context/BusinessContext'
import { PageLoader } from './components/common/RouteStates'
import ProtectedRoute from './components/common/ProtectedRoute'
import FeatureGate from './components/common/FeatureGate'
import PublicLayout from './layouts/PublicLayout'
import AppLayout from './layouts/AppLayout'
import PartnerLayout from './layouts/PartnerLayout'

const HomePage = lazy(() => import('./pages/HomePage'))
const PublicPage = lazy(() => import('./pages/PublicPage'))
const MarketplacePage = lazy(() => import('./pages/MarketplacePage'))
const PricingPage = lazy(() => import('./pages/PricingPage'))
const CompanyPage = lazy(() => import('./pages/CompanyPage'))
const AuthPage = lazy(() => import('./pages/AuthPage'))
const RecoveryPage = lazy(() => import('./pages/RecoveryPage'))
const OnboardingPage = lazy(() => import('./pages/OnboardingPage'))
const AppOverviewPage = lazy(() => import('./pages/AppOverviewPage'))
const AppModulePage = lazy(() => import('./pages/AppModulePage'))
const BusinessRecordsPage = lazy(() => import('./pages/BusinessRecordsPage'))
const BusinessAIPage = lazy(() => import('./pages/BusinessAIPage'))
const PartnerPage = lazy(() => import('./pages/PartnerPage'))
const AccessPage = lazy(() => import('./pages/AccessPage'))
const ProductsPage = lazy(() => import('./pages/ProductsPage'))
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'))
const CartPage = lazy(() => import('./pages/CartPage'))
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'))
const AccountPage = lazy(() => import('./pages/AccountPage'))
const B2BPage = lazy(() => import('./pages/B2BPage'))
const SubsidyPage = lazy(() => import('./pages/SubsidyPage'))
const ReferralPage = lazy(() => import('./pages/ReferralPage'))
const RefLandingPage = lazy(() => import('./pages/RefLandingPage'))
const AdminPage = lazy(() => import('./pages/AdminPage'))
const FreelancePage = lazy(() => import('./pages/FreelancePage'))
const EnergySolutionsPage = lazy(() => import('./pages/EnergySolutionsPage'))
const BusinessSolutionsPage = lazy(() => import('./pages/BusinessSolutionsPage'))
const CAServicesPage = lazy(() => import('./pages/CAServicesPage'))
const InvestorsPage = lazy(() => import('./pages/InvestorsPage'))
const ProjectsPage = lazy(() => import('./pages/ProjectsPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))

const APP_MODULES = {
  sales: 'Record, search, filter and export authorized sales.',
  customers: 'Manage customer profiles, notes and activity history.',
  leads: 'Track pipeline stages, values, owners and follow-up dates.',
  inventory: 'Manage SKUs, quantities, reorder levels and stock adjustments.',
  invoices: 'Create calculated invoices with clear payment status and downloadable output.',
  expenses: 'Record categorized business expenses and receipt metadata.',
  analytics: 'Review deterministic revenue, expense, customer and inventory metrics.',
  ai: 'Ask questions grounded only in the current authorized business data.',
  orders: 'Review commerce orders and their fulfilment states.',
  services: 'Track professional and energy service requests from one place.',
  referrals: 'See transparent referral eligibility, commission and payout states.',
  notifications: 'Receive relevant business, service, order and account updates.',
  settings: 'Manage workspace preferences, access and account details.',
}

const PARTNER_TYPES = ['freelancer', 'ca_consultant', 'product_seller', 'energy_partner']

function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader label="Loading Earnova" />}>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<HomePage />} />
          <Route path="business" element={<PublicPage page="business" />} />
          <Route path="business-ai" element={<PublicPage page="businessAi" />} />
          <Route path="services" element={<PublicPage page="services" />} />
          <Route path="services/freelancers" element={<FreelancePage />} />
          <Route path="services/ca" element={<CAServicesPage />} />
          <Route path="services/business-consulting" element={<PublicPage page="consulting" />} />
          <Route path="energy" element={<FeatureGate feature="energySolutions"><EnergySolutionsPage /></FeatureGate>} />
          <Route path="marketplace" element={<MarketplacePage />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="pricing" element={<PricingPage />} />
          <Route path="about" element={<CompanyPage page="about" />} />
          <Route path="contact" element={<CompanyPage page="contact" />} />
          <Route path="privacy" element={<CompanyPage page="privacy" />} />
          <Route path="terms" element={<CompanyPage page="terms" />} />
          <Route path="refund-policy" element={<CompanyPage page="refund" />} />
          <Route path="login" element={<AuthPage mode="login" />} />
          <Route path="register" element={<AuthPage mode="register" />} />
          <Route path="forgot-password" element={<RecoveryPage mode="forgot" />} />
          <Route path="reset-password/:token" element={<RecoveryPage mode="reset" />} />
          <Route path="products" element={<FeatureGate feature="ecommerce"><ProductsPage /></FeatureGate>} />
          <Route path="products/:id" element={<FeatureGate feature="ecommerce"><ProductDetailPage /></FeatureGate>} />
          <Route path="cart" element={<FeatureGate><CartPage /></FeatureGate>} />
          <Route path="checkout" element={<FeatureGate><CheckoutPage /></FeatureGate>} />
          <Route path="b2b" element={<FeatureGate feature="b2bPrograms"><B2BPage /></FeatureGate>} />
          <Route path="subsidy" element={<FeatureGate feature="subsidies"><SubsidyPage /></FeatureGate>} />
          <Route path="ref/:code" element={<RefLandingPage />} />
          <Route path="investors" element={<InvestorsPage />} />
          <Route path="unauthorized" element={<AccessPage />} />
          <Route path="forbidden" element={<AccessPage forbidden />} />
          <Route path="account" element={<AccountPage />} />
          <Route path="referral" element={<ReferralPage />} />
          <Route path="freelance" element={<Navigate to="/services/freelancers" replace />} />
          <Route path="ca-services" element={<Navigate to="/services/ca" replace />} />
          <Route path="energy-solutions" element={<Navigate to="/energy" replace />} />
          <Route path="business-solutions" element={<Navigate to="/business" replace />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="onboarding" element={<OnboardingPage />} />
          <Route path="app" element={<BusinessProvider><AppLayout /></BusinessProvider>}>
            <Route index element={<Navigate to="overview" replace />} />
            <Route path="overview" element={<AppOverviewPage />} />
            <Route path="business-dashboard" element={<BusinessSolutionsPage />} />
            {['sales', 'customers', 'leads', 'inventory', 'invoices', 'expenses', 'analytics'].map(path => (
              <Route key={path} path={path} element={<BusinessRecordsPage module={path} />} />
            ))}
            <Route path="ai" element={<BusinessAIPage />} />
            {Object.entries(APP_MODULES).filter(([path]) => !['sales', 'customers', 'leads', 'inventory', 'invoices', 'expenses', 'analytics', 'ai'].includes(path)).map(([path, description]) => (
              <Route key={path} path={path} element={<AppModulePage title={path === 'ai' ? 'Business AI' : path[0].toUpperCase() + path.slice(1)} description={description} />} />
            ))}
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedAccountTypes={PARTNER_TYPES} />}>
          <Route path="partner" element={<PartnerLayout />}>
            <Route index element={<Navigate to="overview" replace />} />
            {['overview', 'listings', 'orders', 'requests', 'earnings', 'reviews', 'settings'].map(path => (
              <Route key={path} path={path} element={<PartnerPage title={path[0].toUpperCase() + path.slice(1)} />} />
            ))}
          </Route>
        </Route>

        <Route element={<ProtectedRoute adminOnly />}>
          <Route path="admin/*" element={<AdminPage />} />
        </Route>
      </Routes>
    </Suspense>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppRoutes />
      </CartProvider>
    </AuthProvider>
  )
}
