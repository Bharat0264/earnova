import { Link } from 'react-router-dom'
import { Heart, ShoppingCart, Zap, CheckCircle2, Wallet } from 'lucide-react'
import StarRating from './StarRating'
import { formatPrice, discountPercent, savedAmount, CATEGORY_PLACEHOLDER_BG } from '../../utils/formatters'
import { useCart } from '../../context/CartContext'

/* Category icon colors for the placeholder */
const ICON_COLOR = {
  'solar-panels': 'text-yellow-400',
  'fans':         'text-indigo-400',
  'acs':          'text-sky-400',
  'accessories':  'text-emerald-400',
}

function ImagePlaceholder({ category }) {
  return (
    <div
      className={`w-full h-full bg-gradient-to-br ${CATEGORY_PLACEHOLDER_BG[category] || 'from-gray-900 to-gray-800'}
                  flex flex-col items-center justify-center gap-2`}
    >
      <Zap className={`w-10 h-10 ${ICON_COLOR[category] || 'text-gray-400'} opacity-70`} />
      <span className="text-white/40 text-[10px] uppercase tracking-widest">
        {category?.replace('-', ' ')}
      </span>
    </div>
  )
}

/**
 * @param {{ product: object, compact?: boolean }} props
 */
export default function ProductCard({ product, compact = false }) {
  const { addToCart, isInCart, toggleWishlist, isInWishlist } = useCart()

  const {
    _id, name, slug, brand, price, mrp, category,
    images, thumbnail, rating, reviewCount, stock, energySaving, referralIncome,
  } = product

  const discount = discountPercent(price, mrp)
  const saved    = savedAmount(price, mrp)
  const memberEarnings = Number(referralIncome) || 0
  const inCart   = isInCart(_id)
  const wishlisted = isInWishlist(_id)
  const outOfStock = stock === 0
  const imgSrc   = thumbnail || images?.[0]
  const href     = `/products/${slug || _id}`

  const handleAddToCart = (e) => {
    e.preventDefault()
    if (!outOfStock) addToCart(product, 1)
  }

  const handleWishlist = (e) => {
    e.preventDefault()
    toggleWishlist(product)
  }

  return (
    <Link
      to={href}
      className="group relative flex flex-col bg-white border border-gray-100 rounded-2xl
                 overflow-hidden shadow-card hover:shadow-card-hover hover:-translate-y-0.5
                 transition-all duration-300"
    >
      {/* ── Image area ── */}
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'flex' }}
          />
        ) : null}
        <div className={imgSrc ? 'hidden w-full h-full' : 'w-full h-full'}>
          <ImagePlaceholder category={category} />
        </div>

        {/* Discount badge */}
        {discount > 0 && (
          <span className="absolute top-2.5 left-2.5 bg-red-500 text-white
                           text-[10px] font-bold px-2 py-0.5 rounded-full">
            -{discount}%
          </span>
        )}

        {/* Wishlist button */}
        <button
          onClick={handleWishlist}
          className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm
                     flex items-center justify-center shadow-sm
                     hover:scale-110 transition-transform duration-200"
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart
            className={`w-4 h-4 transition-colors ${wishlisted ? 'text-red-500 fill-red-500' : 'text-gray-400'}`}
          />
        </button>

        {/* Out of stock overlay */}
        {outOfStock && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center">
            <span className="bg-gray-800 text-white text-xs font-bold px-3 py-1.5 rounded-full">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* ── Info ── */}
      <div className="flex flex-col flex-1 p-3.5 lg:p-4">
        {/* Brand */}
        <span className="text-xs font-semibold text-primary-600 uppercase tracking-wide mb-1">
          {brand}
        </span>

        {/* Product name */}
        <h3 className="text-sm font-semibold text-gray-900 leading-snug mb-1.5 line-clamp-2
                       group-hover:text-primary-800 transition-colors">
          {name}
        </h3>

        {/* Star rating */}
        {rating > 0 && (
          <div className="mb-2">
            <StarRating rating={rating} count={reviewCount} size="sm" />
          </div>
        )}

        {/* Energy saving tag */}
        {energySaving && !compact && (
          <div className="flex items-center gap-1 mb-2">
            <Zap className="w-3 h-3 text-eco-600 shrink-0" />
            <span className="text-[10px] text-eco-700 font-medium line-clamp-1">{energySaving}</span>
          </div>
        )}

        {/* Member earnings */}
        {memberEarnings > 0 && (
          <div className="flex items-center gap-1.5 mb-2 text-eco-700">
            <Wallet className="w-3.5 h-3.5 shrink-0" />
            <span className="text-[11px] font-semibold line-clamp-1">
              Member earnings {formatPrice(memberEarnings)}
            </span>
          </div>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Price row */}
        <div className="mb-3">
          <div className="flex items-baseline gap-2">
            <span className="text-base font-bold text-gray-900">{formatPrice(price)}</span>
            {mrp > price && (
              <span className="text-xs text-gray-400 line-through">{formatPrice(mrp)}</span>
            )}
          </div>
        </div>

        {/* Add to cart button */}
        <button
          onClick={handleAddToCart}
          disabled={outOfStock}
          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl
                      text-sm font-semibold transition-all duration-200
                      disabled:opacity-50 disabled:cursor-not-allowed
                      ${inCart
                        ? 'bg-eco-50 text-eco-700 border border-eco-200'
                        : 'bg-primary-800 hover:bg-primary-900 text-white hover:shadow-btn active:scale-95'
                      }`}
        >
          {inCart ? (
            <><CheckCircle2 className="w-4 h-4" /> Added to Cart</>
          ) : (
            <><ShoppingCart className="w-4 h-4" /> Add to Cart</>
          )}
        </button>
      </div>
    </Link>
  )
}

/* ── Skeleton loader ── */
export function ProductCardSkeleton() {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-card">
      <div className="aspect-square bg-gray-100 animate-pulse" />
      <div className="p-4 space-y-3">
        <div className="h-3 bg-gray-100 rounded-full animate-pulse w-1/4" />
        <div className="h-4 bg-gray-100 rounded-full animate-pulse w-4/5" />
        <div className="h-3 bg-gray-100 rounded-full animate-pulse w-3/5" />
        <div className="h-4 bg-gray-100 rounded-full animate-pulse w-2/5 mt-2" />
        <div className="h-10 bg-gray-100 rounded-xl animate-pulse mt-1" />
      </div>
    </div>
  )
}
