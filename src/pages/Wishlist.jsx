import { Link } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import { EmptyState, Breadcrumbs } from '../components/ui'
import { useStore } from '../context/StoreContext'

export default function Wishlist() {
  const { wishlist, catalog } = useStore()
  const saved = catalog.filter((p) => wishlist.includes(p.id))

  return (
    <div className="container">
      <Breadcrumbs trail={[{ label: 'Home', to: '/' }, { label: 'Wishlist' }]} />

      <div className="page-head" style={{ border: 0, paddingTop: 0 }}>
        <h1>Wishlist</h1>
        <p className="muted" style={{ marginTop: 'var(--space-2)' }}>
          {saved.length} saved item{saved.length === 1 ? '' : 's'}
        </p>
      </div>

      <div className="section-tight">
        {saved.length === 0 ? (
          <EmptyState
            icon="heart"
            title="Nothing saved yet"
            message="Tap the heart on any product to keep it here for later."
            action={
              <Link to="/shop" className="btn btn-primary btn-lg">
                Browse products
              </Link>
            }
          />
        ) : (
          <div className="product-grid">
            {saved.map((p) => (
              <ProductCard product={p} key={p.id} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}