import { Loader2 } from 'lucide-react'

const VARIANTS = {
  primary:   'bg-primary-800 hover:bg-primary-900 text-white shadow-btn',
  secondary: 'border-2 border-primary-700 text-primary-700 hover:bg-primary-50',
  eco:       'bg-eco-600 hover:bg-eco-700 text-white shadow-eco-btn',
  ghost:     'text-primary-700 hover:bg-primary-50',
  outline:   'border border-gray-200 text-gray-700 hover:bg-gray-50',
  danger:    'bg-red-600 hover:bg-red-700 text-white',
  white:     'bg-white text-primary-800 hover:bg-primary-50 shadow-sm',
}

const SIZES = {
  xs: 'px-3 py-1.5 text-xs rounded-lg',
  sm: 'px-4 py-2   text-sm rounded-xl',
  md: 'px-5 py-2.5 text-sm rounded-xl',
  lg: 'px-6 py-3   text-base rounded-xl',
  xl: 'px-8 py-4   text-base rounded-2xl',
}

/**
 * @param {{ variant?: keyof VARIANTS, size?: keyof SIZES,
 *           loading?: boolean, icon?: React.ReactNode,
 *           iconRight?: React.ReactNode, fullWidth?: boolean }} props
 */
export default function Button({
  children,
  variant    = 'primary',
  size       = 'md',
  loading    = false,
  disabled   = false,
  icon,
  iconRight,
  fullWidth  = false,
  className  = '',
  type       = 'button',
  onClick,
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={[
        'inline-flex items-center justify-center gap-2 font-semibold select-none',
        'transition-all duration-200 hover:scale-[1.03] active:scale-[0.97]',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:!scale-100',
        VARIANTS[variant],
        SIZES[size],
        fullWidth ? 'w-full' : '',
        className,
      ].join(' ')}
    >
      {loading
        ? <Loader2 className="w-4 h-4 animate-spin" />
        : icon
          ? <span className="w-4 h-4 flex items-center">{icon}</span>
          : null
      }
      {children}
      {iconRight && !loading && (
        <span className="w-4 h-4 flex items-center">{iconRight}</span>
      )}
    </button>
  )
}
