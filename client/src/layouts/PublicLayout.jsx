import { Outlet } from 'react-router-dom'
import Navbar from '../components/common/Navbar'
import Footer from '../components/common/Footer'
import GetHelp from '../components/support/GetHelp'
import MobileBottomNav from '../components/common/MobileBottomNav'

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <Navbar />
      <main id="main-content" className="min-h-[60vh]">
        <Outlet />
      </main>
      <Footer />
      <MobileBottomNav />
      <GetHelp />
    </div>
  )
}
