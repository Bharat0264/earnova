import { Star } from 'lucide-react'

/**
 * @param {{ rating: number, count?: number, size?: 'sm'|'md'|'lg', showCount?: boolean }} props
 */
export default function StarRating({ rating = 0, count, size = 'md', showCount = true }) {
  const sizes = { sm: 'w-3 h-3', md: 'w-4 h-4', lg: 'w-5 h-5' }
  const textSizes = { sm: 'text-xs', md: 'text-sm', lg: 'text-base' }
  const starSize = sizes[size]
  const rounded = Math.round(rating * 2) / 2   // round to nearest 0.5

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = rounded >= star
          const half   = !filled && rounded >= star - 0.5
          return (
            <span key={star} className="relative inline-block">
              {/* empty star base */}
              <Star className={`${starSize} text-gray-200`} fill="currentColor" />
              {/* filled overlay */}
              {(filled || half) && (
                <span
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: half ? '50%' : '100%' }}
                >
                  <Star className={`${starSize} text-yellow-400`} fill="currentColor" />
                </span>
              )}
            </span>
          )
        })}
      </div>

      {showCount && (
        <span className={`${textSizes[size]} text-gray-500 leading-none`}>
          <span className="font-semibold text-gray-700">{rating.toFixed(1)}</span>
          {count !== undefined && (
            <span className="ml-1">({count.toLocaleString('en-IN')})</span>
          )}
        </span>
      )}
    </div>
  )
}
