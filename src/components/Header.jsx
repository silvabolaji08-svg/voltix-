import { useState, useRef, useEffect } from 'react'
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom'
import Icon from './Icon'
import { useStore } from '../context/StoreContext'
import { gsap, motionContext, prefersReducedMotion } from '../motion/gsap'
const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/shop', label: 'Shop' },
  { to: '/shop?sale=1', label: 'Deals' },
]

export default function Header() {
  const { totals, wishlist, user, setCartOpen, theme, toggleTheme } = useStore()
  const [menuOpen, setMenuOpen] = useState(false)
    const [mounted, setMounted] = useState(false)
  const menuRef = useRef(null)

  /* Mount on open; on close, let the exit tween unmount us. With reduced
     motion no tween runs at all, so unmount immediately or the menu sticks. */
  useEffect(() => {
    if (menuOpen) setMounted(true)
    else if (prefersReducedMotion()) setMounted(false)
  }, [menuOpen])

  useEffect(() => {
    if (!mounted) return
    const el = menuRef.current
    if (!el) return

    return motionContext(el, () => {
      const items = el.querySelectorAll('form, .nav-link')

      if (menuOpen) {
        const tl = gsap.timeline()
        tl.from(el, { height: 0, duration: 0.34, ease: 'power3.out' }).from(
          items,
          { y: 14, opacity: 0, duration: 0.3, stagger: 0.05, ease: 'power2.out' },
          '-=0.2'
        )
        return () => tl.kill()
      }

      const tl = gsap.timeline({ onComplete: () => setMounted(false) })
      tl.to(items, { y: -8, opacity: 0, duration: 0.16, stagger: 0.025, ease: 'power2.in' }).to(
        el,
        { height: 0, duration: 0.24, ease: 'power3.inOut' },
        '-=0.1'
      )
      return () => tl.kill()
    })
  }, [mounted, menuOpen])
  const [query, setQuery] = useState('')
  const navigate = useNavigate()
  const location = useLocation()
  const searchRef = useRef(null)

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname, location.search])

  const submitSearch = (e) => {
    e.preventDefault()
    const q = query.trim()
    navigate(q ? `/shop?q=${encodeURIComponent(q)}` : '/shop')
  }

  return (
    <header className="header">
      <div className="container header-inner">
        <Link to="/" className="brand" aria-label="Voltix home">
          <span className="brand-mark" aria-hidden="true">
            <Icon name="zap" size={16} filled strokeWidth={0} />
          </span>
          Voltix
        </Link>

        <nav className="nav" aria-label="Main">
          {links.map((l) => (
            <NavLink
              key={l.label}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `nav-link ${isActive && location.search === (l.to.split('?')[1] ? `?${l.to.split('?')[1]}` : '') ? 'active' : ''}`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <form className="header-search" role="search" onSubmit={submitSearch}>
          <label htmlFor="site-search" className="sr-only">
            Search products
          </label>
          <div style={{ position: 'relative' }}>
            <Icon
              name="search"
              size={16}
              style={{
                position: 'absolute',
                left: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--color-muted-foreground)',
                pointerEvents: 'none',
              }}
            />
            <input
              id="site-search"
              ref={searchRef}
              className="input"
              type="search"
              placeholder="Search gadgets"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{ minHeight: 40, paddingLeft: 36, width: 220, fontSize: 'var(--text-sm)' }}
            />
          </div>
        </form>

        <div className="header-actions">
          <button
            type="button"
            className="icon-btn"
            onClick={toggleTheme}
            aria-label={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
          >
            <Icon name={theme === 'light' ? 'moon' : 'sun'} size={19} />
          </button>

          <Link to="/wishlist" className="icon-btn" aria-label={`Wishlist, ${wishlist.length} items`}>
            <Icon name="heart" size={19} />
            {wishlist.length > 0 && (
              <span className="count-bubble" aria-hidden="true">
                {wishlist.length}
              </span>
            )}
          </Link>

          <Link
            to={user ? (user.role === 'admin' ? '/admin' : '/account') : '/login'}
            className="icon-btn"
            aria-label={user ? `Account, signed in as ${user.name}` : 'Sign in'}
          >
            <Icon name="user" size={19} />
          </Link>

          <button
            type="button"
            className="icon-btn"
            id="cart-button"
            onClick={() => setCartOpen(true)}
            aria-label={`Open bag, ${totals.itemCount} items`}
          >
            <Icon name="bag" size={19} />
            {totals.itemCount > 0 && (
              <span className="count-bubble" aria-hidden="true">
                {totals.itemCount}
              </span>
            )}
          </button>

          <button
            type="button"
            className="icon-btn mobile-nav-toggle"
            onClick={() => setMenuOpen((o) => !o)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label="Toggle navigation menu"
          >
            <Icon name={menuOpen ? 'x' : 'menu'} size={20} />
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="mobile-menu" id="mobile-menu" ref={menuRef}>
          <div className="container">
            <form role="search" onSubmit={submitSearch} style={{ marginBottom: 'var(--space-3)' }}>
              <label htmlFor="mobile-search" className="sr-only">
                Search products
              </label>
              <input
                id="mobile-search"
                className="input"
                type="search"
                placeholder="Search gadgets"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </form>
            {links.map((l) => (
              <NavLink key={l.label} to={l.to} end={l.end} className="nav-link">
                {l.label}
              </NavLink>
            ))}
            <NavLink to="/wishlist" className="nav-link">
              Wishlist
            </NavLink>
            <NavLink to={user ? '/account' : '/login'} className="nav-link">
              {user ? 'My account' : 'Sign in'}
            </NavLink>
            {user?.role === 'admin' && (
              <NavLink to="/admin" className="nav-link">
                Admin dashboard
              </NavLink>
            )}
          </div>
        </div>
      )}
    </header>
  )
}