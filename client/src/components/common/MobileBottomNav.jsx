import { Home, LayoutList, PlusCircle, UserRound } from 'lucide-react'
import { Link, NavLink } from 'react-router-dom'

export default function MobileBottomNav() {
  return <nav className="mobile-bottom" aria-label="Mobile navigation"><NavLink to="/" aria-label="Home"><Home /><span>Home</span></NavLink><NavLink to="/start"><LayoutList /><span>Start</span></NavLink><Link className="mobile-create" to="/start" aria-label="Start a business"><PlusCircle /></Link><NavLink to="/activity"><LayoutList /><span>Activity</span></NavLink><NavLink to="/account"><UserRound /><span>Account</span></NavLink></nav>
}
