import { Link } from 'react-router-dom'
import { Trash2, Plus, Minus, Heart, Zap } from 'lucide-react'
import { formatPrice, calcGST, CATEGORY_PLACEHOLDER_BG } from '../../utils/formatters'
import { useCart } from '../../context/CartContext'

function ImgFallback({ category }) {
  return (
    <div className={`w-full h-full bg-gradient-to-br
                     ${CATEGORY_PLACEHOLDER_BG[category] || 'from-gray-800 to-gray-700'}
                     flex items-center justify-center`}>
      <Zap className="w-5 h-5 text-white/30" />
    </div>
  )
}

/**
 * @param {{ item: object }} props
 */
export default function CartItem({ item }) {
  const { updateQuantity, removeFromCart, toggleWishlist } = useCart()
  const { _id, name, slug, brand, price, gstRate = 18, quantity, images, thumbnail, category, itemType } = item
  const isService = itemType === 'service'

  const gst       = calcGST(price * quantity, gstRate)
  const lineTotal = price * quantity
  const thumb = (
    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden shrink-0 bg-gray-50 border border-gray-100">
      {(thumbnail || images?.[0]) ? (
        <img
          src={thumbnail || images[0]}
          alt={name}
          className="w-full h-full object-cover"
          onError={(e) => { e.currentTarget.style.display = 'none' }}
        />
      ) : (
        <ImgFallback category={category} />
      )}
    </div>
  )

  return (
    <div className="flex gap-4 py-5 border-b border-gray-100 last:border-0">
      {/* Thumbnail */}
      {isService ? thumb : (
        <Link to={`/products/${slug || _id}`} className="hover:opacity-90 transition-opacity">
          {thumb}
        </Link>
      )}

      {/* Details */}
      <div className="flex-1 min-w-0">
        <span className="text-[11px] font-semibold text-primary-600 uppercase tracking-wide">
          {brand}
        </span>
        {isService ? (
          <p className="block text-sm font-semibold text-gray-900 mt-0.5 line-clamp-2 leading-snug">{name}</p>
        ) : (
          <Link
            to={`/products/${slug || _id}`}
            className="block text-sm font-semibold text-gray-900 mt-0.5 line-clamp-2
                       hover:text-primary-700 transition-colors leading-snug"
          >
            {name}
          </Link>
        )}

        {/* GST note */}
        <p className="text-[11px] text-gray-400 mt-1">
          {isService ? 'Service item. Activated or processed after Razorpay confirmation.' : `Incl. ${gstRate}% GST (${formatPrice(gst)})`}
        </p>

        {/* Bottom row */}
        <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
          {/* Quantity stepper */}
          {!isService && <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
            <button
              onClick={() => updateQuantity(_id, quantity - 1)}
              disabled={quantity <= 1}
              className="w-8 h-8 flex items-center justify-center text-gray-500
                         hover:bg-gray-50 disabled:opacity-30 transition-colors"
              aria-label="Decrease"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-10 text-center text-sm font-semibold text-gray-900">
              {quantity}
            </span>
            <button
              onClick={() => updateQuantity(_id, quantity + 1)}
              disabled={quantity >= 99}
              className="w-8 h-8 flex items-center justify-center text-gray-500
                         hover:bg-gray-50 disabled:opacity-30 transition-colors"
              aria-label="Increase"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>}

          {/* Action buttons */}
          <div className="flex items-center gap-1">
            {!isService && <button
              onClick={() => { toggleWishlist(item); removeFromCart(_id) }}
              className="flex items-center gap-1 text-[11px] text-gray-500 hover:text-primary-600
                         px-2 py-1.5 rounded-lg hover:bg-primary-50 transition-colors"
              aria-label="Move to wishlist"
            >
              <Heart className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Wishlist</span>
            </button>}
            <button
              onClick={() => removeFromCart(_id)}
              className="flex items-center gap-1 text-[11px] text-gray-500 hover:text-red-600
                         px-2 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
              aria-label="Remove item"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Remove</span>
            </button>
          </div>
        </div>
      </div>

      {/* Price */}
      <div className="text-right shrink-0">
        <p className="text-base font-bold text-gray-900">{formatPrice(lineTotal)}</p>
        {quantity > 1 && (
          <p className="text-xs text-gray-400 mt-0.5">{formatPrice(price)} each</p>
        )}
      </div>
    </div>
  )
}
