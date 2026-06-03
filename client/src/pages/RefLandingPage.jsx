import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Loader2, Zap, Leaf } from 'lucide-react'
import { apiUrl } from '../utils/api'

export default function RefLandingPage() {
  const { code }    = useParams()
  const navigate    = useNavigate()
  const [msg, setMsg] = useState('Setting up your referral…')

  useEffect(() => {
    if (!code) { navigate('/products', { replace: true }); return }

    const track = async () => {
      try {
        const res  = await fetch(apiUrl(`/referral/track/${code}`))
        const data = await res.json()

        if (data.success) {
          /* Store referral code in localStorage for 7 days */
          const expiry = Date.now() + 7 * 24 * 60 * 60 * 1000
          localStorage.setItem('earnova_ref', JSON.stringify({ code, expiry }))
          setMsg(`Welcome! You were referred by ${data.referrerName} 🎉`)
          await new Promise(r => setTimeout(r, 1200))
        }
      } catch {
        /* silently skip tracking errors */
      }
      navigate('/products', { replace: true })
    }

    track()
  }, [code, navigate])

  return (
    <div className="min-h-screen bg-hero flex items-center justify-center">
      <div className="text-center px-4">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 bg-primary-800 rounded-xl flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" strokeWidth={2.5} />
          </div>
          <span className="font-display font-bold text-2xl text-primary-900">Earnova</span>
        </div>

        {/* Spinner */}
        <Loader2 className="w-8 h-8 text-primary-400 animate-spin mx-auto mb-5" />

        <p className="text-gray-700 font-medium text-base">{msg}</p>
        <p className="text-gray-400 text-sm mt-2">
          Redirecting you to our products…
        </p>

        {/* Green badge */}
        <div className="inline-flex items-center gap-1.5 bg-eco-50 text-eco-700 text-xs font-semibold
                        px-3 py-1.5 rounded-full mt-6">
          <Leaf className="w-3 h-3" /> Green India Mission
        </div>
      </div>
    </div>
  )
}
