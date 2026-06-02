import { useState } from 'react'
import { Copy, CheckCircle2, Share2, ExternalLink, Zap } from 'lucide-react'

const COMMISSION_TIERS = [
  { category: 'Solar Panels', rate: '5%', color: 'bg-yellow-50 text-yellow-700 border-yellow-100' },
  { category: 'Fans',         rate: '6%', color: 'bg-primary-50 text-primary-700 border-primary-100' },
  { category: 'ACs',          rate: '4%', color: 'bg-sky-50 text-sky-700 border-sky-100' },
  { category: 'Accessories',  rate: '7%', color: 'bg-eco-50 text-eco-700 border-eco-100' },
  { category: 'Bulk Orders',  rate: '8–12%', color: 'bg-orange-50 text-orange-700 border-orange-100' },
]

export default function ReferralLinkCard({ referralCode, loading }) {
  const [copied, setCopied] = useState(false)

  const BASE_URL    = window.location.origin
  const referralUrl = `${BASE_URL}/ref/${referralCode}`

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(referralUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* fallback for older browsers */
      const ta = document.createElement('textarea')
      ta.value = referralUrl
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const shareWhatsApp = () => {
    const msg = encodeURIComponent(
      `🌿 Save on energy with Earnova!\nShop solar panels, BLDC fans, 5-star ACs & more.\nUse my link for the best deals:\n${referralUrl}`
    )
    window.open(`https://wa.me/?text=${msg}`, '_blank')
  }

  const nativeShare = async () => {
    try {
      await navigator.share({
        title: 'Earnova – Smart Energy Products',
        text:  'Shop solar panels, BLDC fans, and 5-star ACs on Earnova.',
        url:   referralUrl,
      })
    } catch { /* user cancelled */ }
  }

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(referralUrl)}&bgcolor=ffffff&color=5b21b6&margin=12&format=svg`

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-primary-700 to-primary-950 rounded-3xl p-6 animate-pulse">
        <div className="h-6 w-40 bg-white/20 rounded-full mb-4" />
        <div className="h-12 bg-white/10 rounded-2xl mb-3" />
        <div className="h-10 bg-white/20 rounded-xl" />
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-primary-800 via-primary-900 to-primary-950 rounded-3xl overflow-hidden">
      {/* Top strip */}
      <div className="px-6 pt-6 pb-5">
        <div className="flex items-start justify-between gap-4">
          {/* Left */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-yellow-400" strokeWidth={2.5} />
              <span className="text-primary-200 text-xs font-bold uppercase tracking-widest">
                Your Referral Link
              </span>
            </div>

            {/* Referral code badge */}
            <div className="inline-flex items-center gap-3 bg-white/10 border border-white/20
                            rounded-xl px-4 py-3 mb-4">
              <span className="font-display font-extrabold text-2xl text-white tracking-[0.15em]">
                {referralCode || '------'}
              </span>
            </div>

            {/* Full URL bar */}
            <div className="flex items-center gap-2 bg-black/30 border border-white/10
                            rounded-xl px-3 py-2.5 mb-4">
              <span className="text-primary-300 text-xs font-mono truncate flex-1">
                {referralUrl}
              </span>
              <button
                onClick={copy}
                className={`shrink-0 flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg
                            transition-all duration-200 ${
                              copied
                                ? 'bg-eco-500 text-white'
                                : 'bg-white/20 text-white hover:bg-white/30'
                            }`}
              >
                {copied
                  ? <><CheckCircle2 className="w-3.5 h-3.5" /> Copied!</>
                  : <><Copy className="w-3.5 h-3.5" /> Copy</>
                }
              </button>
            </div>

            {/* Share buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={shareWhatsApp}
                className="flex items-center gap-2 bg-[#25D366] hover:bg-[#20b858]
                           text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Share on WhatsApp
              </button>
              {'share' in navigator && (
                <button
                  onClick={nativeShare}
                  className="flex items-center gap-2 bg-white/20 hover:bg-white/30
                             text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-colors"
                >
                  <Share2 className="w-4 h-4" /> Share
                </button>
              )}
            </div>
          </div>

          {/* QR Code */}
          <div className="shrink-0 hidden sm:block">
            <div className="w-[100px] h-[100px] bg-white rounded-xl overflow-hidden p-1.5 shadow-lg">
              <img
                src={qrUrl}
                alt="Referral QR"
                className="w-full h-full"
                onError={e => { e.currentTarget.style.display = 'none' }}
              />
            </div>
            <p className="text-primary-400 text-[10px] text-center mt-1.5">Scan to share</p>
          </div>
        </div>
      </div>

      {/* Commission tiers */}
      <div className="bg-black/20 border-t border-white/10 px-6 py-4">
        <p className="text-primary-300 text-xs font-bold uppercase tracking-wider mb-3">
          Commission Rates
        </p>
        <div className="flex flex-wrap gap-2">
          {COMMISSION_TIERS.map(({ category, rate, color }) => (
            <span key={category}
                  className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1
                              rounded-full border ${color}`}>
              {category} · {rate}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
