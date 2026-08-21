import { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from './AuthContext'
import { api } from '../utils/api'
import { track } from '../utils/analytics'

const CartContext = createContext(null)
const load = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback } catch { return fallback } }
const localCart = () => load('earnova_cart', [])

export function CartProvider({ children }) {
  const { user, loading: authLoading } = useAuth()
  const [cartItems, setCartItems] = useState(localCart)
  const [wishlist, setWishlist] = useState(() => load('earnova_wishlist', []))
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    if (authLoading) return
    if (!user) { setCartItems(localCart()); setHydrated(true); return }
    setHydrated(false)
    api.get('/cart').then(async data => {
      const remote = data.items || []
      const guest = localCart().filter(item => item?._id && item.itemType !== 'service')
      const items = remote.length ? remote : guest
      setCartItems(items)
      if (!remote.length && guest.length) await api.put('/cart', { items: guest.map(item => ({ productId: item._id, quantity: item.quantity || 1 })) })
      localStorage.removeItem('earnova_cart')
    }).catch(() => setCartItems([])).finally(() => setHydrated(true))
  }, [authLoading, user])

  useEffect(() => { localStorage.setItem('earnova_wishlist', JSON.stringify(wishlist)) }, [wishlist])
  useEffect(() => {
    if (authLoading || !hydrated) return
    if (!user) { localStorage.setItem('earnova_cart', JSON.stringify(cartItems)); return }
    const timer = setTimeout(() => api.put('/cart', { items: cartItems.filter(item => item.itemType !== 'service').map(item => ({ productId: item._id, quantity: item.quantity })) }).catch(() => {}), 250)
    return () => clearTimeout(timer)
  }, [cartItems, user, authLoading, hydrated])

  const addToCart = (product, qty = 1) => { if (product.business?._id || product.business) track('ADD_TO_CART', { productId: product._id }); setCartItems(previous => {
    const existing = previous.find(item => item._id === product._id)
    return existing ? previous.map(item => item._id === product._id ? { ...item, quantity: product.itemType === 'service' ? 1 : Math.min((item.quantity || 1) + qty, product.stock ?? 100) } : item) : [...previous, { ...product, quantity: product.itemType === 'service' ? 1 : qty }]
  }) }
  const removeFromCart = productId => setCartItems(previous => previous.filter(item => item._id !== productId))
  const updateQuantity = (productId, quantity) => quantity <= 0 ? removeFromCart(productId) : setCartItems(previous => previous.map(item => item._id === productId ? { ...item, quantity } : item))
  const clearCart = () => setCartItems([])
  const toggleWishlist = product => setWishlist(previous => previous.some(item => item._id === product._id) ? previous.filter(item => item._id !== product._id) : [...previous, product])
  const isInWishlist = id => wishlist.some(item => item._id === id)
  const isInCart = id => cartItems.some(item => item._id === id)
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)
  const cartSubtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const gstAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity * (item.gstRate ?? 18)) / 100, 0)

  return <CartContext.Provider value={{ cartItems, cartCount, cartSubtotal, gstAmount, cartTotal: cartSubtotal + gstAmount, wishlist, isInWishlist, isInCart, addToCart, removeFromCart, updateQuantity, clearCart, toggleWishlist }}>{children}</CartContext.Provider>
}

export function useCart() { const context = useContext(CartContext); if (!context) throw new Error('useCart must be used inside <CartProvider>'); return context }
