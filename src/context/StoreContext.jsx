import { createContext, useContext, useMemo, useState, useCallback, useEffect, useRef } from 'react'
import { prefersReducedMotion } from '../motion/gsap'
import { products as seedProducts } from '../data/products'
import { demoUsers, seedOrders } from '../data/seed'
import { useLocalStorage } from '../hooks/useLocalStorage'

const StoreContext = createContext(null)

export const TAX_RATE = 0.075
export const FREE_SHIPPING_THRESHOLD = 250
export const FLAT_SHIPPING = 12

export function StoreProvider({ children }) {
  
  const [catalog, setCatalog] = useLocalStorage('voltix.catalog', seedProducts)

  /* --------------------------------------------------------------- cart */
  const [cart, setCart] = useLocalStorage('voltix.cart', [])
  const [cartOpen, setCartOpen] = useState(false)
  const openTimer = useRef(null)

  useEffect(() => () => window.clearTimeout(openTimer.current), [])

  /* ----------------------------------------------------------- wishlist */
  const [wishlist, setWishlist] = useLocalStorage('voltix.wishlist', [])

  /* --------------------------------------------------------------- auth */
  const [user, setUser] = useLocalStorage('voltix.user', null)
  const [accounts, setAccounts] = useLocalStorage('voltix.accounts', demoUsers)

  /* ------------------------------------------------------------- orders */
  const [orders, setOrders] = useLocalStorage('voltix.orders', seedOrders)

  /* -------------------------------------------------------------- theme */
  const [theme, setTheme] = useLocalStorage('voltix.theme', 'light')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === 'light' ? 'dark' : 'light'))
  }, [setTheme])

  /* ------------------------------------------------------------- toasts */
  const [toasts, setToasts] = useState([])

  const notify = useCallback((message, tone = 'default') => {
    const id = Date.now() + Math.random()
    setToasts((list) => [...list, { id, message, tone }])
    setTimeout(() => setToasts((list) => list.filter((t) => t.id !== id)), 3200)
  }, [])

  /* -------------------------------------------------------- cart actions */
  const lineKey = (productId, variant) => `${productId}::${variant ?? ''}`

  const addToCart = useCallback(
    (product, quantity = 1, variant = null, { openDrawer = true } = {}) => {
      const key = lineKey(product.id, variant)
      setCart((current) => {
        const existing = current.find((l) => l.key === key)
        if (existing) {
          return current.map((l) =>
            l.key === key ? { ...l, quantity: Math.min(l.quantity + quantity, product.stock) } : l
          )
        }
        return [
          ...current,
          {
            key,
            productId: product.id,
            slug: product.slug,
            name: product.name,
            image: product.image,
            price: product.price,
            stock: product.stock,
            variant,
            quantity: Math.min(quantity, product.stock),
          },
        ]
      })
      notify(`${product.name} added to bag`)

      /* "Buy it now" navigates straight to checkout, so it opts out — a drawer
         appearing half a second into the next page would be nonsense. */
      if (!openDrawer) return

      /* Otherwise let the fly-to-bag clone land before the drawer slides over
         the bag icon it is flying towards. The toast and the count bubble
         confirm the add immediately, so nothing is waiting on this. */
      if (prefersReducedMotion()) {
        setCartOpen(true)
      } else {
        window.clearTimeout(openTimer.current)
        openTimer.current = window.setTimeout(() => setCartOpen(true), 620)
      }
    },
    [setCart, notify]
  )

  const updateQuantity = useCallback(
    (key, quantity) => {
      setCart((current) =>
        quantity <= 0
          ? current.filter((l) => l.key !== key)
          : current.map((l) => (l.key === key ? { ...l, quantity: Math.min(quantity, l.stock) } : l))
      )
    },
    [setCart]
  )

  const removeFromCart = useCallback(
    (key) => {
      setCart((current) => current.filter((l) => l.key !== key))
      notify('Removed from bag')
    },
    [setCart, notify]
  )

  const clearCart = useCallback(() => setCart([]), [setCart])

  /* ---------------------------------------------------- wishlist actions */
  const toggleWishlist = useCallback(
    (product) => {
      setWishlist((current) => {
        const has = current.includes(product.id)
        notify(has ? 'Removed from wishlist' : 'Saved to wishlist')
        return has ? current.filter((id) => id !== product.id) : [...current, product.id]
      })
    },
    [setWishlist, notify]
  )

  const inWishlist = useCallback((id) => wishlist.includes(id), [wishlist])

    /* -------------------------------------------------------- auth actions */
  const login = useCallback(
    (email, password) => {
      const found = accounts.find(
        (a) => a.email.toLowerCase() === email.trim().toLowerCase() && a.password === password
      )
      if (!found) return { ok: false, error: 'That email and password combination does not match an account.' }
      const { password: _pw, ...safe } = found
      setUser(safe)
      notify(`Welcome back, ${safe.name.split(' ')[0]}`)
      return { ok: true, user: safe }
    },
    [accounts, setUser, notify]
  )

  const register = useCallback(
    ({ name, email, password }) => {
      const exists = accounts.some((a) => a.email.toLowerCase() === email.trim().toLowerCase())
      if (exists) return { ok: false, error: 'An account with that email already exists.' }
      const account = { id: `u-${Date.now()}`, name, email: email.trim(), password, role: 'customer' }
      setAccounts((current) => [...current, account])
      const { password: _pw, ...safe } = account
      setUser(safe)
      notify(`Account created — welcome, ${name.split(' ')[0]}`)
      return { ok: true, user: safe }
    },
    [accounts, setAccounts, setUser, notify]
  )

  const logout = useCallback(() => {
    setUser(null)
    notify('Signed out')
  }, [setUser, notify])

  /* ------------------------------------------------------ order actions */
  const placeOrder = useCallback(
    (details) => {
      const subtotal = cart.reduce((sum, l) => sum + l.price * l.quantity, 0)
      const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING
      const tax = +(subtotal * TAX_RATE).toFixed(2)
      const order = {
        id: `VLT-${Math.floor(24100 + Math.random() * 800)}`,
        userId: user?.id ?? 'guest',
        customer: { name: details.name, email: details.email },
        date: new Date().toISOString(),
        status: 'Pending',
        items: cart.map((l) => ({
          productId: l.productId,
          name: l.name,
          slug: l.slug,
          image: l.image,
          price: l.price,
          quantity: l.quantity,
          variant: l.variant,
        })),
        subtotal,
        shipping,
        tax,
        total: +(subtotal + shipping + tax).toFixed(2),
        shippingAddress: {
          line1: details.address,
          city: details.city,
          state: details.state,
          postcode: details.postcode,
          country: details.country,
        },
        payment: `Card ending ${details.cardNumber.replace(/\s/g, '').slice(-4)}`,
      }
      setOrders((current) => [order, ...current])
      clearCart()
      return order
    },
    [cart, user, setOrders, clearCart]
  )

  const updateOrderStatus = useCallback(
    (orderId, status) => {
      setOrders((current) => current.map((o) => (o.id === orderId ? { ...o, status } : o)))
      notify(`Order ${orderId} marked ${status.toLowerCase()}`)
    },
    [setOrders, notify]
  )

  /* --------------------------------------------- admin catalogue actions */
  const saveProduct = useCallback(
    (draft) => {
      setCatalog((current) => {
        const exists = current.some((p) => p.id === draft.id)
        return exists ? current.map((p) => (p.id === draft.id ? { ...p, ...draft } : p)) : [{ ...draft }, ...current]
      })
      notify(`${draft.name} saved`)
    },
    [setCatalog, notify]
  )

  const deleteProduct = useCallback(
    (id) => {
      setCatalog((current) => current.filter((p) => p.id !== id))
      notify('Product deleted')
    },
    [setCatalog, notify]
  )

  const resetDemoData = useCallback(() => {
    setCatalog(seedProducts)
    setOrders(seedOrders)
    setCart([])
    setWishlist([])
    notify('Demo data reset')
  }, [setCatalog, setOrders, setCart, setWishlist, notify])

  /* ------------------------------------------------------------ totals */
  const totals = useMemo(() => {
    const subtotal = cart.reduce((sum, l) => sum + l.price * l.quantity, 0)
    const shipping = subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING
    const tax = +(subtotal * TAX_RATE).toFixed(2)
    return {
      subtotal,
      shipping,
      tax,
      total: +(subtotal + shipping + tax).toFixed(2),
      itemCount: cart.reduce((sum, l) => sum + l.quantity, 0),
      freeShippingGap: Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal),
    }
  }, [cart])

  const value = useMemo(
    () => ({
      catalog,
      cart,
      totals,
      cartOpen,
      setCartOpen,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      wishlist,
      toggleWishlist,
      inWishlist,
      user,
      login,
      register,
      logout,
      orders,
      placeOrder,
      updateOrderStatus,
      saveProduct,
      deleteProduct,
      resetDemoData,
      theme,
      toggleTheme,
      toasts,
      notify,
    }),
    [
      catalog, cart, totals, cartOpen, addToCart, updateQuantity, removeFromCart, clearCart,
      wishlist, toggleWishlist, inWishlist, user, login, register, logout, orders, placeOrder,
      updateOrderStatus, saveProduct, deleteProduct, resetDemoData, theme, toggleTheme, toasts, notify,
    ]
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used inside <StoreProvider>')
  return ctx
}

export const formatPrice = (value) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(value)

export const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })