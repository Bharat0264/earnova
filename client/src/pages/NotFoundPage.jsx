import { Link } from 'react-router-dom'
import { Home, Zap } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center py-20 px-4">
      <div className="max-w-md w-full text-center">
        <div className="font-display font-extrabold text-[9rem] leading-none text-primary-100 mb-4 select-none">
          404
        </div>
        <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <Zap className="w-8 h-8 text-primary-600" strokeWidth={2.5} />
        </div>
        <h1 className="font-display font-bold text-2xl text-gray-900 mb-3">Page Not Found</h1>
        <p className="text-gray-500 text-sm mb-8 leading-relaxed">
          The page you're looking for doesn't exist or may have moved.
          Let's get you back on track.
        </p>
        <Link to="/" className="btn-primary inline-flex items-center gap-2">
          <Home className="w-4 h-4" />
          Back to Home
        </Link>
      </div>
    </div>
  )
}
