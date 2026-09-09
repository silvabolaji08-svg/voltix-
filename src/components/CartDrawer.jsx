import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Icon from './Icon'
import { QuantityStepper, EmptyState } from './ui'
import { useStore, formatPrice, FREE_SHIPPING_THRESHOLD } from '../context/StoreContext'
import { gsap, prefersReducedMotion } from '../motion/gsap'

export default function CartDrawer() {
  const { cartOpen, setCartOpen, cart, totals, updateQuantity, removeFromCart } = useStore()

  /* The drawer stays mounted through its exit tween, then unmounts. Without
     this, closing would just cut to nothing — CSS animations can't run on an
     element React has already removed. */
  const [mounted, setMounted] = useState(cartOpen)

  const panelRef = useRef(null)
  const overlayRef = useRef(null)
  const closeRef = useRef(null)
  const lastFocused = useRef(null)
  const timelineRef = useRef(null)

  useEffect(() => {
    if (cartOpen) setMounted(true)
  }, [cartOpen])

  /* ------------------------------------------------------ enter / exit */
  useLayoutEffect(() => {
    if (!mounted) return
    const panel = panelRef.current
    const overlay = overlayRef.current
    if (!panel || !overlay) return

    timelineRef.current?.kill()

    if (prefersReducedMotion()) {
      if (!cartOpen) setMounted(false)
      return
    }

    if (cartOpen) {
      const items = panel.querySelectorAll('[data-drawer-item]')
      timelineRef.current = gsap
        .timeline()
        .fromTo(overlay, { opacity: 0 }, { opacity: 1, duration: 0.25, ease: 'power1.out' }, 0)
        .fromTo(panel, { xPercent: 100 }, { xPercent: 0, duration: 0.42, ease: 'power3.out' }, 0)
        /* Stagger stays at 0.04 — a long bag shouldn't take a second to read. */
        .from(items, { opacity: 0, x: 24, duration: 0.3, stagger: 0.04, ease: 'power2.out' }, 0.18)
    } else {
      timelineRef.current = gsap
        .timeline({ onComplete: () => setMounted(false) })
        .to(panel, { xPercent: 100, duration: 0.3, ease: 'power2.in' }, 0)
        .to(overlay, { opacity: 0, duration: 0.28, ease: 'power1.in' }, 0)
    }

    return () => timelineRef.current?.kill()
  }, [cartOpen, mounted])

  /* --------------------------------------------- focus trap + Escape */
  useEffect(() => {
    if (!cartOpen || !mounted) return

    lastFocused.current = document.activeElement
    closeRef.current?.focus()
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        setCartOpen(false)
        return
      }
      if (e.key !== 'Tab') return

      const focusables = panelRef.current?.querySelectorAll(
        'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      if (!focusables?.length) return

      const first = focusables[0]
      const last = focusables[focusables.length - 1]

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
      lastFocused.current?.focus?.()
    }
  }, [cartOpen, mounted, setCartOpen])

  if (!mounted) return null
    const progress = Math.min(100, (totals.subtotal / FREE_SHIPPING_THRESHOLD) * 100)

  return (
    <>
      <div className="overlay" ref={overlayRef} onClick={() => setCartOpen(false)} aria-hidden="true" />

      <aside
        className="drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-drawer-title"
        ref={panelRef}
      >
        <div className="drawer-head">
          <h2 id="cart-drawer-title" style={{ fontSize: 'var(--text-lg)' }}>
            Your bag ({totals.itemCount})
          </h2>
          <button type="button" className="icon-btn" onClick={() => setCartOpen(false)} ref={closeRef} aria-label="Close bag">
            <Icon name="x" size={20} />
          </button>
        </div>

        <div className="drawer-body">
          {cart.length === 0 ? (
            <EmptyState
              icon="bag"
              title="Your bag is empty"
              message="Once you add something it will show up here."
              action={
                <Link to="/shop" className="btn btn-primary" onClick={() => setCartOpen(false)}>
                  Browse the shop
                </Link>
              }
            />
          ) : (
            <>
              {totals.freeShippingGap > 0 ? (
                <div className="card" style={{ padding: 'var(--space-3) var(--space-4)', marginBottom: 'var(--space-3)' }}>
                  <p className="text-xs" style={{ marginBottom: 'var(--space-2)' }}>
                    <strong>{formatPrice(totals.freeShippingGap)}</strong> away from free delivery
                  </p>
                  <div style={{ height: 5, background: 'var(--color-muted)', borderRadius: 999, overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${progress}%`,
                        background: 'var(--color-accent)',
                        transition: 'width var(--dur-base) var(--ease-out)',
                      }}
                    />
                  </div>
                </div>
              ) : (
                <p className="badge badge-success" style={{ marginBottom: 'var(--space-3)' }}>
                  <Icon name="truck" size={13} /> Free delivery unlocked
                </p>
              )}

              <ul>
                {cart.map((line) => (
                  <li className="line-item" key={line.key} data-drawer-item>
                    <Link to={`/product/${line.slug}`} className="line-thumb" onClick={() => setCartOpen(false)}>
                      <img src={line.image} alt="" width="76" height="76" />
                    </Link>

                    <div className="stack" style={{ gap: 'var(--space-2)' }}>
                      <div className="row-between" style={{ alignItems: 'flex-start' }}>
                        <Link to={`/product/${line.slug}`} className="line-title" onClick={() => setCartOpen(false)}>
                          {line.name}
                        </Link>
                        <button
                          type="button"
                          className="icon-btn"
                          style={{ width: 32, height: 32, flex: '0 0 auto' }}
                          onClick={() => removeFromCart(line.key)}
                          aria-label={`Remove ${line.name} from bag`}
                        >
                          <Icon name="trash" size={15} />
                        </button>
                      </div>

                      {line.variant && <span className="text-xs muted">{line.variant}</span>}

                      <div className="row-between">
                        <QuantityStepper
                          value={line.quantity}
                          max={line.stock}
                          onChange={(q) => updateQuantity(line.key, q)}
                          label={`Quantity of ${line.name}`}
                        />
                        <span className="price">{formatPrice(line.price * line.quantity)}</span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        {cart.length > 0 && (
          <div className="drawer-foot">
            <div className="summary-row">
              <span className="muted">Subtotal</span>
              <span>{formatPrice(totals.subtotal)}</span>
            </div>
            <div className="summary-row">
              <span className="muted">Delivery</span>
              <span>{totals.shipping === 0 ? 'Free' : formatPrice(totals.shipping)}</span>
            </div>
            <div className="summary-row">
              <span className="muted">Estimated tax</span>
              <span>{formatPrice(totals.tax)}</span>
            </div>
            <div className="summary-total">
              <span>Total</span>
              <span>{formatPrice(totals.total)}</span>
            </div>

            <Link to="/checkout" className="btn btn-primary btn-lg btn-block" onClick={() => setCartOpen(false)}>
              Checkout
            </Link>
            <Link to="/cart" className="btn btn-outline btn-block" onClick={() => setCartOpen(false)}>
              View full bag
            </Link>
          </div>
        )}
      </aside>
    </>
  )
}