import { useEffect } from 'react'
import { X } from 'lucide-react'

/* ═══════════════════════════════════════════
   BADGE
═══════════════════════════════════════════ */
const BADGE_VARIANTS = {
  default:  'bg-gray-100 text-gray-700',
  primary:  'bg-primary-100 text-primary-700',
  eco:      'bg-eco-100 text-eco-700',
  warning:  'bg-amber-100 text-amber-700',
  danger:   'bg-red-100 text-red-700',
  success:  'bg-green-100 text-green-700',
  dark:     'bg-gray-800 text-white',
}

export function Badge({ children, variant = 'default', icon, dot, className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
                  text-xs font-semibold ${BADGE_VARIANTS[variant]} ${className}`}
    >
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current" />}
      {icon && <span className="w-3 h-3">{icon}</span>}
      {children}
    </span>
  )
}

/* ═══════════════════════════════════════════
   CARD
═══════════════════════════════════════════ */
export function Card({
  children,
  className = '',
  hover     = false,
  padding   = true,
  as: Tag   = 'div',
}) {
  return (
    <Tag
      className={[
        'bg-white border border-gray-100 rounded-2xl shadow-card',
        hover ? 'transition-all duration-300 hover:shadow-card-hover hover:-translate-y-0.5 cursor-pointer' : '',
        padding ? 'p-6' : '',
        className,
      ].join(' ')}
    >
      {children}
    </Tag>
  )
}

/* ═══════════════════════════════════════════
   MODAL
═══════════════════════════════════════════ */
const MODAL_SIZES = {
  sm:   'max-w-md',
  md:   'max-w-lg',
  lg:   'max-w-2xl',
  xl:   'max-w-4xl',
  full: 'max-w-7xl',
}

export function Modal({ isOpen, onClose, title, children, size = 'md', footer }) {
  /* lock body scroll */
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={`relative bg-white rounded-2xl shadow-2xl w-full ${MODAL_SIZES[size]}
                    max-h-[90vh] flex flex-col animate-fade-in-up`}
        style={{ animationDuration: '0.25s' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <h2 className="font-display font-bold text-lg text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 scrollbar-thin">
          {children}
        </div>

        {/* Optional footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-gray-100 shrink-0 flex justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════
   COMING SOON (Phase placeholder)
═══════════════════════════════════════════ */
export function ComingSoon({ phase, pageName, description, features = [] }) {
  return (
    <div className="min-h-[68vh] flex items-center justify-center py-20 px-4">
      <div className="max-w-md w-full text-center">

        {/* Icon */}
        <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <svg viewBox="0 0 24 24" className="w-8 h-8 text-primary-600" fill="none"
               stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
        </div>

        {/* Phase badge */}
        <span className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-700
                         text-xs font-bold px-3 py-1.5 rounded-full mb-4">
          Coming in Phase {phase}
        </span>

        <h1 className="font-display font-bold text-2xl text-gray-900 mb-2">{pageName}</h1>
        <p className="text-gray-500 text-sm mb-6 leading-relaxed">
          {description || `This section is being built in Phase ${phase}.`}
        </p>

        {features.length > 0 && (
          <ul className="text-left space-y-2.5 bg-gray-50 border border-gray-100
                         rounded-2xl p-5 mb-8 text-sm text-gray-600">
            {features.map((f) => (
              <li key={f} className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-400 mt-1.5 shrink-0" />
                {f}
              </li>
            ))}
          </ul>
        )}

        <a
          href="/"
          className="btn-primary inline-flex items-center gap-2"
        >
          ← Back to Home
        </a>
      </div>
    </div>
  )
}
