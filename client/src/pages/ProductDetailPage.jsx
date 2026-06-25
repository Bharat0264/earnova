import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ShoppingCart, Heart, Zap, Minus, Plus, CheckCircle2, ArrowLeft, Share2, Wallet } from 'lucide-react'
import ImageGallery from '../components/products/ImageGallery'
import StarRating from '../components/products/StarRating'
import { SpecsTable, ProductFAQ } from '../components/products/SpecsTable'
import ProductCard, { ProductCardSkeleton } from '../components/products/ProductCard'
import { useProduct } from '../hooks/useProducts'
import { useCart } from '../context/CartContext'
import { formatPrice, discountPercent, savedAmount, CATEGORY_LABELS } from '../utils/formatters'
import { useAuth } from '../context/AuthContext'

const TABS = ['Specifications', 'Reviews', 'FAQ']

export default function ProductDetailPage() {
  const { id }  = useParams()
  const { product, related, loading, notFound } = useProduct(id)
  const { addToCart, isInCart, toggleWishlist, isInWishlist } = useCart()
  const { hasFeature } = useAuth()

  const [qty,       setQty]       = useState(1)
  const [activeTab, setActiveTab] = useState('Specifications')
  const [addedMsg,  setAddedMsg]  = useState(false)

  if (loading) return <DetailSkeleton />
  if (notFound || !product) return <NotFound />

  const {
    _id, name, brand, category, price, mrp, gstRate = 18,
    images, rating, reviewCount, stock, energySaving,
    description, highlights, specs, referralIncome,
  } = product

  const discount    = discountPercent(price, mrp)
  const saved       = savedAmount(price, mrp)
  const memberEarnings = Number(referralIncome) || 0
  const inCart      = isInCart(_id)
  const wishlisted  = isInWishlist(_id)
  const outOfStock  = stock === 0
  const gstOnItem   = Math.round((price * qty * gstRate) / 100)
  const lineTotal   = price * qty + gstOnItem

  const handleAddToCart = () => {
    addToCart(product, qty)
    setAddedMsg(true)
    setTimeout(() => setAddedMsg(false), 2000)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="section-wrapper py-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
          <Link to="/" className="hover:text-primary-600 transition-colors">Home</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-primary-600 transition-colors">Products</Link>
          <span>/</span>
          {category && (
            <><Link to={`/products?category=${category}`} className="hover:text-primary-600 transition-colors">
              {CATEGORY_LABELS[category]}
            </Link><span>/</span></>
          )}
          <span className="text-gray-600 line-clamp-1">{name}</span>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 xl:gap-12">
          {/* Left — Image gallery */}
          <div>
            <ImageGallery images={images} name={name} category={category} />
          </div>

          {/* Right — Product info */}
          <div className="flex flex-col gap-4">
            {/* Brand + share */}
            <div className="flex items-start justify-between">
              <span className="text-xs font-bold text-primary-600 uppercase tracking-widest">
                {brand}
              </span>
              <button
                onClick={() => navigator.share?.({ title: name, url: window.location.href })}
                className="p-2 rounded-xl text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>

            {/* Name */}
            <h1 className="font-display font-bold text-2xl lg:text-3xl text-gray-900 leading-snug">
              {name}
            </h1>

            {/* Rating */}
            {rating > 0 && <StarRating rating={rating} count={reviewCount} size="md" />}

            {/* Pricing */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-2">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-gray-900">{formatPrice(price)}</span>
                {mrp > price && (
                  <span className="text-base text-gray-400 line-through">{formatPrice(mrp)}</span>
                )}
                {discount > 0 && (
                  <span className="bg-red-100 text-red-600 text-sm font-bold px-2 py-0.5 rounded-full">
                    -{discount}%
                  </span>
                )}
              </div>

              {hasFeature('ecommerce') && memberEarnings > 0 && (
                <div className="flex items-center gap-2 text-eco-700">
                  <Wallet className="w-4 h-4 shrink-0" />
                  <span className="text-sm font-semibold">
                    Member earnings {formatPrice(memberEarnings)}
                  </span>
                </div>
              )}

            </div>

            {/* Energy saving */}
            {energySaving && (
              <div className="flex items-center gap-2 bg-eco-50 border border-eco-100 rounded-xl px-3 py-2.5">
                <Zap className="w-4 h-4 text-eco-600 shrink-0" />
                <span className="text-sm text-eco-700 font-medium">{energySaving}</span>
              </div>
            )}

            {/* Stock status */}
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 text-sm font-semibold ${outOfStock ? 'text-red-600' : 'text-eco-600'}`}>
                <span className={`w-2 h-2 rounded-full ${outOfStock ? 'bg-red-500' : 'bg-eco-500'}`} />
                {outOfStock ? 'Out of Stock' : `In Stock (${stock} left)`}
              </span>
            </div>

            {/* Quantity + actions */}
            {!outOfStock && (
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                  <button onClick={() => setQty(q => Math.max(1, q - 1))} disabled={qty <= 1}
                          className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-30">
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center font-bold text-gray-900">{qty}</span>
                  <button onClick={() => setQty(q => Math.min(stock, q + 1))} disabled={qty >= stock}
                          className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-30">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-gray-400">Max {stock} units</p>
              </div>
            )}

            {/* CTA buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                disabled={outOfStock}
                className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl
                            font-semibold text-sm transition-all duration-200 disabled:opacity-50
                            ${addedMsg
                              ? 'bg-eco-600 text-white'
                              : inCart
                                ? 'bg-eco-50 text-eco-700 border border-eco-200'
                                : 'btn-primary'
                            }`}
              >
                {addedMsg ? (
                  <><CheckCircle2 className="w-4 h-4" /> Added!</>
                ) : inCart ? (
                  <><CheckCircle2 className="w-4 h-4" /> In Cart</>
                ) : (
                  <><ShoppingCart className="w-4 h-4" /> Add to Cart</>
                )}
              </button>

              <button
                onClick={() => toggleWishlist(product)}
                className={`w-12 h-12 rounded-xl border flex items-center justify-center transition-all
                            ${wishlisted
                              ? 'bg-red-50 border-red-200 text-red-500'
                              : 'border-gray-200 text-gray-400 hover:border-red-200 hover:text-red-400'
                            }`}
              >
                <Heart className={`w-5 h-5 ${wishlisted ? 'fill-red-500' : ''}`} />
              </button>
            </div>

            {/* Description */}
            {description && (
              <p className="text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-4">
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-10 bg-white border border-gray-100 rounded-2xl shadow-card overflow-hidden">
          <div className="flex border-b border-gray-100">
            {TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-4 text-sm font-semibold transition-colors border-b-2 -mb-px ${
                  activeTab === tab
                    ? 'border-primary-700 text-primary-700'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="p-6">
            {activeTab === 'Specifications' && <SpecsTable specs={specs} highlights={highlights} />}
            {activeTab === 'Reviews' && <ReviewsPlaceholder />}
            {activeTab === 'FAQ' && <ProductFAQ category={category} />}
          </div>
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <div className="mt-10">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display font-bold text-xl text-gray-900">Related Products</h2>
              <Link to={`/products?category=${category}`}
                    className="text-sm font-semibold text-primary-600 hover:underline">
                View all
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {related.map(p => <ProductCard key={p._id} product={p} compact />)}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function ReviewsPlaceholder() {
  return (
    <div className="text-center py-10">
      <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <CheckCircle2 className="w-7 h-7 text-gray-300" />
      </div>
      <h3 className="font-display font-bold text-gray-700 mb-2">Reviews coming in Phase 3</h3>
      <p className="text-gray-400 text-sm">Login to verify your purchase and leave a review.</p>
    </div>
  )
}

function DetailSkeleton() {
  return (
    <div className="section-wrapper py-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="aspect-square bg-gray-100 rounded-2xl animate-pulse" />
        <div className="space-y-4">
          {[200, 300, 80, 160, 80, 120, 48].map((w, i) => (
            <div key={i} className={`h-${i === 1 ? '8' : '5'} bg-gray-100 rounded-full animate-pulse`}
                 style={{ width: `${w}px`, maxWidth: '100%' }} />
          ))}
        </div>
      </div>
    </div>
  )
}

function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center">
        <div className="font-display font-bold text-6xl text-gray-100 mb-4">404</div>
        <h1 className="font-display font-bold text-xl text-gray-800 mb-3">Product Not Found</h1>
        <p className="text-gray-500 text-sm mb-6">This product doesn't exist or has been removed.</p>
        <Link to="/products" className="btn-primary inline-flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Browse Products
        </Link>
      </div>
    </div>
  )
}
