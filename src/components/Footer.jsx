import { Link } from 'react-router-dom'
import Icon from './Icon'
import { categories } from '../data/products'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <Link to="/" className="brand" style={{ marginBottom: 'var(--space-3)' }}>
              <span className="brand-mark" aria-hidden="true">
                <Icon name="zap" size={16} filled strokeWidth={0} />
              </span>
              Voltix
            </Link>
            <p className="text-sm muted" style={{ maxWidth: '34ch' }}>
              Considered tech for people who care how things are made. Free delivery over $250, 30-day
              returns, two-year warranty as standard.
            </p>
          </div>

          <div>
            <h4>Shop</h4>
            <ul className="footer-links">
              {categories.slice(0, 5).map((c) => (
                <li key={c.id}>
                  <Link to={`/shop?category=${c.id}`}>{c.name}</Link>
                </li>
              ))}
              <li>
                <Link to="/shop?sale=1">Deals</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4>Support</h4>
            <ul className="footer-links">
              <li><Link to="/shop">Track an order</Link></li>
              <li><Link to="/shop">Shipping &amp; returns</Link></li>
              <li><Link to="/shop">Warranty</Link></li>
              <li><Link to="/shop">Contact us</Link></li>
            </ul>
          </div>

          <div>
            <h4>Account</h4>
            <ul className="footer-links">
              <li><Link to="/login">Sign in</Link></li>
              <li><Link to="/register">Create account</Link></li>
              <li><Link to="/wishlist">Wishlist</Link></li>
              <li><Link to="/cart">Bag</Link></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Voltix. A portfolio project — not a real store.</span>
          <span>Built with React, React Router and plain CSS.</span>
        </div>
      </div>
    </footer>
  )
}