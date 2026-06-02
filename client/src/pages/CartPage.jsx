import { Link } from 'react-router-dom'
import { ShoppingBag, ArrowRight, ShoppingCart } from 'lucide-react'
import CartItem from '../components/cart/CartItem'
import CartSummary from '../components/cart/CartSummary'
import ProductCard from '../components/products/ProductCard'
import { useCart } from '../context/CartContext'
import { MOCK_PRODUCTS } from '../data/mockProducts'

export default function CartPage() {
  const { cartItems, clearCart } = useCart()

  const suggestions = MOCK_PRODUCTS
    .filter(p => !cartItems.some(i => i._id === p._id))
    .slice(0, 4)

  if (cartItems.length === 0) return <EmptyCart />

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="section-wrapper py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display font-bold text-2xl text-gray-900">
              Shopping Cart
            </h1>
            <p className="text-gray-400 text-sm mt-0.5">
              {cartItems.length} item{cartItems.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={clearCart}
            className="text-sm text-red-500 hover:text-red-700 font-medium hover:underline"
          >
            Clear cart
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart items */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-gray-100 rounded-2xl shadow-card px-5 py-2">
              {cartItems.map(item => (
                <CartItem key={item._id} item={item} />
              ))}
            </div>

            {/* Continue shopping */}
            <Link
              to="/products"
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary-600
                         hover:underline underline-offset-4 mt-4"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
              Continue Shopping
            </Link>
          </div>

          {/* Summary panel */}
          <div className="lg:col-span-1">
            <CartSummary />
          </div>
        </div>

        {/* You may also like */}
        {suggestions.length > 0 && (
          <div className="mt-12">
            <h2 className="font-display font-bold text-xl text-gray-900 mb-5">
              You May Also Like
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {suggestions.map(p => <ProductCard key={p._id} product={p} compact />)}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function EmptyCart() {
  const suggestions = MOCK_PRODUCTS.filter(p => p.isFeatured).slice(0, 4)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="section-wrapper py-16">
        <div className="max-w-md mx-auto text-center mb-14">
          <div className="w-20 h-20 bg-primary-100 rounded-3xl flex items-center justify-center mx-auto mb-5">
            <ShoppingCart className="w-10 h-10 text-primary-600" />
          </div>
          <h1 className="font-display font-bold text-2xl text-gray-900 mb-3">
            Your cart is empty
          </h1>
          <p className="text-gray-500 text-sm leading-relaxed mb-7">
            Looks like you haven't added anything yet.
            Browse our energy-saving products and start saving!
          </p>
          <Link to="/products" className="btn-primary inline-flex items-center gap-2">
            <ShoppingBag className="w-4 h-4" />
            Browse Products
          </Link>
        </div>

        {/* Featured picks */}
        {suggestions.length > 0 && (
          <>
            <h2 className="font-display font-bold text-xl text-gray-900 mb-5 text-center">
              Popular Picks
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {suggestions.map(p => <ProductCard key={p._id} product={p} />)}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
