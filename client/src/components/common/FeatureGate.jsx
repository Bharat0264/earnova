import { Link, Navigate, useLocation } from 'react-router-dom'
import { LockKeyhole } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { FEATURES } from '../../config/features'

export default function FeatureGate({ feature, children }) {
  const { isAuthenticated, loading, hasFeature } = useAuth()
  const location = useLocation()
  const details = FEATURES.find(item => item.key === feature)

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary-200 border-t-primary-700 rounded-full animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/?login=1" replace state={{ from: location.pathname + location.search }} />
  }

  if (feature && !hasFeature(feature)) {
    return (
      <div className="min-h-[65vh] bg-slate-50 flex items-center justify-center px-4">
        <div className="max-w-lg text-center bg-white border border-slate-200 rounded-3xl shadow-card p-8">
          <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <LockKeyhole className="w-8 h-8 text-amber-700" />
          </div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-700">Admin-controlled access</p>
          <h1 className="font-display text-2xl font-bold text-slate-950 mt-2">
            {details?.label || feature} is not enabled
          </h1>
          <p className="text-slate-500 mt-3 leading-relaxed">
            Your Earnova account is active, but an administrator must enable this service for you.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/" className="btn-secondary">Back to home</Link>
            {hasFeature('freelancing') && feature !== 'freelancing' && (
              <Link to="/freelance" className="btn-primary">Go to Freelancing</Link>
            )}
          </div>
        </div>
      </div>
    )
  }

  return children
}
