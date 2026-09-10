import { createContext, useContext, useMemo, useState, useCallback, useEffect, useRef } from 'react'
import { prefersReducedMotion } from '../motion/gsap'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { productsApi, authApi, ordersApi, setToken, clearToken, getToken } from '../lib/api'

const StoreContext = createContext(null)

/* The server is the authority on these now — kept here only so the cart
   drawer can show "spend £X more for free delivery" before checkout. */
export const TAX_RATE = 0.08
export const FREE_SHIPPING_THRESHOLD = 250
export const FLAT_SHIPPING = 12

export function StoreProvider({ children }) {
  /* ---------------------------------------------------------- catalogue
     Comes from the API now. Not persisted — the database is the single
     source of truth, and a stale localStorage copy is exactly the bug
     that made editing products.js appear to do nothing. */
  const [catalog, setCatalog] = useState([])
  const [catalogLoading, setCatalogLoading] = useState(true)
  const [catalogError, setCatalogError] = useState(null)

  /* --------------------------------------------------------------- cart
     Stays local. A cart belongs to this browser until checkout. */
  const [cart, setCart] = useLocalStorage('voltix.cart', [])
  const [cartOpen, setCartOpen] = useState(false)
  const openTimer = useRef(null)

  useEffect(() => () => window.clearTimeout(openTimer.current), [])

  /* ----------------------------------------------------------- wishlist */
  const [wishlist, setWishlist] = useLocalStorage('voltix.wishlist', [])

  /* --------------------------------------------------------------- auth
     The token is in localStorage (see lib/api.js); the user object is
     fetched from /auth/me so a revoked or expired token fails closed. */
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(Boolean(getToken()))

  /* ------------------------------------------------------------- orders */
  const [orders, setOrders] = useState([])

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

  /* ------------------------------------------------------ load catalogue */
  const loadCatalog = useCallback(async (signal) => {
    setCatalogLoading(true)
    setCatalogError(null)
    try {
      const data = await productsApi.list({ limit: 100 }, { signal })
      setCatalog(data.items)
    } catch (err) {
      if (err.name === 'AbortError') return
      setCatalogError(err.message)
    } finally {
      setCatalogLoading(false)
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    loadCatalog(controller.signal)
    return () => controller.abort()
  }, [loadCatalog])

  /* --------------------------------------------------- restore a session
     A stored token proves nothing on its own — it may have expired or the
     account may be gone. Ask the server who it belongs to. */
  useEffect(() => {
    if (!getToken()) return

    const controller = new AbortController()
    authApi
      .me({ signal: controller.signal })
      .then(({ user: me }) => setUser(me))
      .catch(() => clearToken())
      .finally(() => setAuthLoading(false))

    return () => controller.abort()
  }, [])

  /* ---------------------------------------------------------- load orders
     Customers get their own; admins get every order for the dashboard. */
  const loadOrders = useCallback(async () => {
    if (!user) {
      setOrders([])
      return
    }
    try {
      const data = user.role === 'admin' ? await ordersApi.list() : await ordersApi.mine()
      setOrders(data)
    } catch {
      /* not fatal — pages fall back to their empty states */
    }
  }, [user])

  useEffect(() => {
    loadOrders()
  }, [loadOrders])

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
         the bag icon it is flying towards. */
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

  /* -------------------------------------------------------- auth actions
     Same { ok, error } shape the pages already expect, so Login.jsx and
     Register.jsx need almost no changes — only the await. */
  const login = useCallback(
    async (email, password) => {
      try {
        const { user: me, token } = await authApi.login({ email, password })
        setToken(token)
        setUser(me)
        notify(`Welcome back, ${me.name.split(' ')[0]}`)
        return { ok: true, user: me }
      } catch (err) {
        return { ok: false, error: err.message }
      }
    },
    [notify]
  )

  const register = useCallback(
    async ({ name, email, password }) => {
      try {
        const { user: me, token } = await authApi.register({ name, email, password })
        setToken(token)
        setUser(me)
        notify(`Account created — welcome, ${name.split(' ')[0]}`)
        return { ok: true, user: me }
      } catch (err) {
        return { ok: false, error: err.message }
      }
    },
    [notify]
  )

  const logout = useCallback(() => {
    clearToken()
    setUser(null)
    setOrders([])
    notify('Signed out')
  }, [notify])

    /* ------------------------------------------------------ order actions */
  const placeOrder = useCallback(
    async (details) => {
      const payload = {
        items: cart.map((l) => ({
          productId: l.productId,
          quantity: l.quantity,
          variant: l.variant,
        })),
        customer: { name: details.name, email: details.email },
        shippingAddress: {
          line1: details.address,
          city: details.city,
          state: details.state ?? '',
          postcode: details.postcode,
          country: details.country,
        },
        shippingMethod: details.shippingMethod ?? 'Standard',
        payment: `Card ending ${String(details.cardNumber ?? '').replace(/\s/g, '').slice(-4)}`,
        shippingCost: totals.shipping,
      }

      const order = await ordersApi.create(payload)
      setOrders((current) => [order, ...current])
      clearCart()
      /* Stock changed server-side, so the catalogue on screen is now stale. */
      loadCatalog()
      return order
    },
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
    [cart, clearCart, loadCatalog]
  )

  const updateOrderStatus = useCallback(
    async (reference, status) => {
      try {
        const updated = await ordersApi.setStatus(reference, status)
        setOrders((current) => current.map((o) => (o.id === reference ? updated : o)))
        notify(`Order ${reference} marked ${status.toLowerCase()}`)
      } catch (err) {
        notify(err.message, 'error')
      }
    },
    [notify]
  )

  /* --------------------------------------------- admin catalogue actions */
  const saveProduct = useCallback(
    async (draft) => {
      try {
        /* An id that exists in the catalogue means edit; anything else —
           including the placeholder AdminProducts invents — means create. */
        const isExisting = catalog.some((p) => p.id === draft.id)

        if (isExisting) {
          const updated = await productsApi.update(draft.id, draft)
          setCatalog((current) => current.map((p) => (p.id === updated.id ? updated : p)))
        } else {
          const { id: _ignored, ...fields } = draft
          const created = await productsApi.create(fields)
          setCatalog((current) => [created, ...current])
        }
        notify(`${draft.name} saved`)
      } catch (err) {
        notify(err.message, 'error')
      }
    },
    [catalog, notify]
  )

  const deleteProduct = useCallback(
    async (id) => {
      try {
        await productsApi.remove(id)
        setCatalog((current) => current.filter((p) => p.id !== id))
        notify('Product deleted')
      } catch (err) {
        notify(err.message, 'error')
      }
    },
    [notify]
  )

  /* Was "reset demo data" when everything lived in localStorage. The server
     owns the data now, so the honest version is a refresh. */
  const refreshData = useCallback(async () => {
    await Promise.all([loadCatalog(), loadOrders()])
    notify('Refreshed from server')
  }, [loadCatalog, loadOrders, notify])

  /* ------------------------------------------------------------ totals
     Still derived on the client so the cart updates instantly — but the
     server recomputes everything at checkout and its numbers win. */
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
      catalogLoading,
      catalogError,
      reloadCatalog: loadCatalog,
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
      authLoading,
      login,
      register,
      logout,
      orders,
      reloadOrders: loadOrders,
      placeOrder,
      updateOrderStatus,
      saveProduct,
      deleteProduct,
      refreshData,
      resetDemoData: refreshData,
      theme,
      toggleTheme,
      toasts,
      notify,
    }),
    [
      catalog, catalogLoading, catalogError, loadCatalog, cart, totals, cartOpen, addToCart,
      updateQuantity, removeFromCart, clearCart, wishlist, toggleWishlist, inWishlist, user,
      authLoading, login, register, logout, orders, loadOrders, placeOrder, updateOrderStatus,
      saveProduct, deleteProduct, refreshData, theme, toggleTheme, toasts, notify,
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