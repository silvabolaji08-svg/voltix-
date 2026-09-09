import { Link } from 'react-router-dom'
import Icon from '../components/Icon'

export default function NotFound() {
  return (
    <div className="container section" style={{ textAlign: 'center' }}>
      <p className="eyebrow">Error 404</p>
      <h1 style={{ fontSize: 'var(--text-5xl)', marginBlock: 'var(--space-4)' }}>Page not found</h1>
      <p className="muted" style={{ maxWidth: '46ch', marginInline: 'auto', marginBottom: 'var(--space-6)' }}>
        The page you were looking for has moved, or never existed. The shop is still where you left it.
      </p>
      <div className="row" style={{ justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link to="/" className="btn btn-primary btn-lg">
          <Icon name="home" size={17} />
          Back home
        </Link>
        <Link to="/shop" className="btn btn-outline btn-lg">
          Browse the shop
        </Link>
      </div>
    </div>
  )
}