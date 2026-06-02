import { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext(null)

function loadFromStorage(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback }
  catch { return fallback }
}

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => loadFromStorage('earnova_cart', []))
  const [wishlist,  setWishlist]  = useState(() => loadFromStorage('earnova_wishlist', []))

  /* persist on every change */
  useEffect(() => {
    localStorage.setItem('earnova_cart', JSON.stringify(cartItems))
  }, [cartItems])

  useEffect(() => {
    localStorage.setItem('earnova_wishlist', JSON.stringify(wishlist))
  }, [wishlist])

  /* ── Cart actions ── */
  const addToCart = (product, qty = 1) => {
    setCartItems(prev => {
      const exists = prev.find(i => i._id === product._id)
      if (exists) {
        return prev.map(i =>
          i._id === product._id ? { ...i, quantity: i.quantity + qty } : i
        )
      }
      return [...prev, { ...product, quantity: qty }]
    })
  }

  const removeFromCart = (productId) =>
    setCartItems(prev => prev.filter(i => i._id !== productId))

  const updateQuantity = (productId, qty) => {
    if (qty <= 0) { removeFromCart(productId); return }
    setCartItems(prev =>
      prev.map(i => i._id === productId ? { ...i, quantity: qty } : i)
    )
  }

  const clearCart = () => setCartItems([])

  /* ── Wishlist actions ── */
  const toggleWishlist = (product) => {
    setWishlist(prev =>
      prev.some(i => i._id === product._id)
        ? prev.filter(i => i._id !== product._id)
        : [...prev, product]
    )
  }

  const isInWishlist = (id) => wishlist.some(i => i._id === id)
  const isInCart     = (id) => cartItems.some(i => i._id === id)

  /* ── Derived values ── */
  const cartCount   = cartItems.reduce((sum, i) => sum + i.quantity, 0)
  const cartSubtotal = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const gstAmount   = cartItems.reduce((sum, i) => {
    const gstRate = i.gstRate ?? 18
    return sum + (i.price * i.quantity * gstRate) / 100
  }, 0)
  const cartTotal   = cartSubtotal + gstAmount

  return (
    <CartContext.Provider value={{
      cartItems, cartCount, cartSubtotal, gstAmount, cartTotal,
      wishlist, isInWishlist, isInCart,
      addToCart, removeFromCart, updateQuantity, clearCart, toggleWishlist,
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>')
  return ctx
}
