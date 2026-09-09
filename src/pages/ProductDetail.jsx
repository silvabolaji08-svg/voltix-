import { useState, useMemo, useRef, useLayoutEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import Icon from '../components/Icon'
import ProductCard from '../components/ProductCard'
import { Rating, QuantityStepper, Breadcrumbs, EmptyState } from '../components/ui'
import { getCategory } from '../data/products'
import { useStore, formatPrice, formatDate } from '../context/StoreContext'
import { consumeFlip, playFlip } from '../motion/flip'
import { flyToCart } from '../motion/flyToCart'
import { useScrollReveal } from '../motion/hooks'

/* The mock catalogue ships one illustration per product; these transforms
   stand in for the extra photography a real product page would carry. */
const VIEWS = [
  { label: 'Front', style: {} },
  { label: 'Detail', style: { transform: 'scale(1.75)' } },
  { label: 'Angle', style: { transform: 'scale(1.12) rotate(-12deg)' } },
]

export default function ProductDetail() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { catalog, addToCart, toggleWishlist, inWishlist } = useStore()

  const product = catalog.find((p) => p.slug === slug)

  const [view, setView] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [variant, setVariant] = useState(product?.variants?.options?.[0] ?? null)
  const [tab, setTab] = useState('description')

  const mainImageRef = useRef(null)
  const buyBoxRef = useScrollReveal({ y: 18, stagger: 0.06, start: 'top 95%' })

  /* Page Transition · Complex — the card image the user clicked morphs into
     this one. consumeFlip returns null on a direct visit or a refresh, so the
     page just renders normally. */
  useLayoutEffect(() => {
    const state = consumeFlip(slug)
    if (state && mainImageRef.current) playFlip(state, mainImageRef.current)
  }, [slug])

  const related = useMemo(
    () => (product ? catalog.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4) : []),
    [catalog, product]
  )

  if (!product) {
    return (
      <div className="container section">
        <EmptyState
          icon="package"
          title="Product not found"
          message="That product may have been removed from the catalogue."
          action={
            <Link to="/shop" className="btn btn-primary">
              Back to shop
            </Link>
          }
        />
      </div>
    )
  }

  const category = getCategory(product.category)
  const saved = inWishlist(product.id)
  const outOfStock = product.stock === 0
  const discount = product.compareAt ? Math.round(((product.compareAt - product.price) / product.compareAt) * 100) : 0

  const ratingBreakdown = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: product.reviews.filter((r) => r.rating === star).length,
  }))

  return (
    <div className="container">
      <Breadcrumbs
        trail={[
          { label: 'Home', to: '/' },
          { label: 'Shop', to: '/shop' },
          { label: category.name, to: `/shop?category=${category.id}` },
          { label: product.name },
        ]}
      />

      <div className="section-tight" style={{ paddingTop: 0 }}>
        <div className="pdp-grid">
          {/* ------------------------------------------------- gallery */}
          <div className="pdp-gallery">
            <div className="pdp-main-image">
              <img
                ref={mainImageRef}
                data-flip-id={product.slug}
                src={product.image}
                alt={`${product.name} — ${VIEWS[view].label.toLowerCase()} view`}
                width="400"
                height="400"
                style={{ ...VIEWS[view].style, transition: 'transform var(--dur-slow) var(--ease-out)' }}
              />
            </div>

            <div className="pdp-thumbs" role="group" aria-label="Product views">
              {VIEWS.map((v, i) => (
                <button
                  type="button"
                  key={v.label}
                  className={`pdp-thumb ${view === i ? 'is-active' : ''}`}
                  onClick={() => setView(i)}
                  aria-pressed={view === i}
                  aria-label={`Show ${v.label.toLowerCase()} view`}
                >
                  <img src={product.image} alt="" style={v.style} />
                </button>
              ))}
            </div>
          </div>
                    {/* --------------------------------------------------- buybox */}
          <div className="stack" style={{ gap: 'var(--space-5)' }} ref={buyBoxRef}>
            <div className="stack" style={{ gap: 'var(--space-3)' }}>
              <div className="row" style={{ gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                <span className="product-brand">{product.brand}</span>
                {product.tags.includes('new') && <span className="badge badge-accent">New</span>}
                {product.tags.includes('bestseller') && <span className="badge">Bestseller</span>}
              </div>

              <h1 style={{ fontSize: 'var(--text-3xl)' }}>{product.name}</h1>

              <div className="row" style={{ gap: 'var(--space-4)', flexWrap: 'wrap' }}>
                <Rating value={product.rating} count={product.reviewCount} size={15} />
                <a href="#reviews" className="link-underline text-sm" onClick={() => setTab('reviews')}>
                  Read reviews
                </a>
              </div>

              <p className="muted">{product.short}</p>
            </div>

            <div className="row" style={{ gap: 'var(--space-3)', flexWrap: 'wrap' }}>
              <span className="pdp-price">{formatPrice(product.price)}</span>
              {product.compareAt && (
                <>
                  <span className="price-old" style={{ fontSize: 'var(--text-base)' }}>
                    {formatPrice(product.compareAt)}
                  </span>
                  <span className="badge badge-danger">Save {discount}%</span>
                </>
              )}
            </div>

            {/* stock status is text + colour, never colour alone */}
            <p className="row text-sm" style={{ gap: 'var(--space-2)' }}>
              <Icon
                name={outOfStock ? 'alert' : 'checkCircle'}
                size={16}
                style={{ color: outOfStock ? 'var(--color-destructive)' : 'var(--color-success)' }}
              />
              {outOfStock
                ? 'Out of stock — join the waitlist below'
                : product.stock <= 10
                  ? `Only ${product.stock} left in stock`
                  : 'In stock, dispatched within 48 hours'}
            </p>

            {product.variants && (
              <div className="stack" style={{ gap: 'var(--space-3)' }}>
                <span className="field-label" id="variant-label">
                  {product.variants.label}: <strong>{variant}</strong>
                </span>
                <div className="variant-row" role="group" aria-labelledby="variant-label">
                  {product.variants.options.map((option) => (
                    <button
                      type="button"
                      key={option}
                      className={`variant-btn ${variant === option ? 'is-active' : ''}`}
                      onClick={() => setVariant(option)}
                      aria-pressed={variant === option}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="row" style={{ gap: 'var(--space-3)', flexWrap: 'wrap' }}>
              <QuantityStepper value={quantity} onChange={setQuantity} max={Math.max(1, product.stock)} />

              <button
                type="button"
                className="btn btn-primary btn-lg"
                style={{ flex: 1, minWidth: 190 }}
                disabled={outOfStock}
                onClick={() => {
                  flyToCart(mainImageRef.current)
                  addToCart(product, quantity, variant)
                }}
              >
                <Icon name="bag" size={17} />
                {outOfStock ? 'Out of stock' : 'Add to bag'}
              </button>

              <button
                type="button"
                className={`btn btn-outline btn-icon btn-lg ${saved ? 'is-active' : ''}`}
                onClick={() => toggleWishlist(product)}
                aria-pressed={saved}
                aria-label={saved ? 'Remove from wishlist' : 'Save to wishlist'}
                style={{ width: 52, color: saved ? 'var(--color-destructive)' : undefined }}
              >
                <Icon name="heart" size={19} filled={saved} strokeWidth={saved ? 0 : 1.75} />
              </button>
            </div>

            {!outOfStock && (
              <button
                type="button"
                className="btn btn-accent btn-lg btn-block"
                onClick={() => {
                  addToCart(product, quantity, variant, { openDrawer: false })
                  navigate('/checkout')
                }}
              >
                Buy it now
              </button>
            )}
                        <ul className="stack" style={{ gap: 'var(--space-3)' }}>
              {product.highlights.map((h) => (
                <li className="row text-sm" key={h} style={{ alignItems: 'flex-start' }}>
                  <Icon name="check" size={16} style={{ color: 'var(--color-accent)', marginTop: 3, flex: '0 0 auto' }} />
                  {h}
                </li>
              ))}
            </ul>

            <div className="card" style={{ padding: 'var(--space-4)' }}>
              <ul className="stack" style={{ gap: 'var(--space-3)' }}>
                <li className="row text-sm">
                  <Icon name="truck" size={17} style={{ color: 'var(--color-muted-foreground)' }} />
                  Free delivery on orders over $250
                </li>
                <li className="row text-sm">
                  <Icon name="refresh" size={17} style={{ color: 'var(--color-muted-foreground)' }} />
                  30-day free returns
                </li>
                <li className="row text-sm">
                  <Icon name="shield" size={17} style={{ color: 'var(--color-muted-foreground)' }} />
                  {product.specs.Warranty ?? '2 years'} manufacturer warranty
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------------- tabs */}
      <section className="section-tight" id="reviews">
        <div className="tabs" role="tablist" aria-label="Product information">
          {[
            { id: 'description', label: 'Description' },
            { id: 'specs', label: 'Specifications' },
            { id: 'reviews', label: `Reviews (${product.reviews.length})` },
          ].map((t) => (
            <button
              type="button"
              key={t.id}
              role="tab"
              id={`tab-${t.id}`}
              aria-selected={tab === t.id}
              aria-controls={`panel-${t.id}`}
              tabIndex={tab === t.id ? 0 : -1}
              className={`tab ${tab === t.id ? 'is-active' : ''}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'description' && (
          <div role="tabpanel" id="panel-description" aria-labelledby="tab-description" style={{ maxWidth: '68ch' }}>
            <p style={{ marginBottom: 'var(--space-4)' }}>{product.description}</p>
            <p className="muted text-sm">
              Every Voltix order ships with a two-year warranty and a 30-day no-questions return window.
            </p>
          </div>
        )}

        {tab === 'specs' && (
          <div role="tabpanel" id="panel-specs" aria-labelledby="tab-specs" style={{ maxWidth: '640px' }}>
            <table className="spec-table">
              <caption className="sr-only">Technical specifications for {product.name}</caption>
              <tbody>
                {Object.entries(product.specs).map(([key, value]) => (
                  <tr key={key}>
                    <th scope="row">{key}</th>
                    <td>{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'reviews' && (
          <div role="tabpanel" id="panel-reviews" aria-labelledby="tab-reviews">
            <div className="row" style={{ gap: 'var(--space-7)', alignItems: 'flex-start', flexWrap: 'wrap', marginBottom: 'var(--space-5)' }}>
              <div>
                <div style={{ fontSize: 'var(--text-4xl)', fontWeight: 600, letterSpacing: '-0.03em' }}>
                  {product.rating.toFixed(1)}
                </div>
                <Rating value={product.rating} size={15} />
                <p className="text-xs muted" style={{ marginTop: 'var(--space-2)' }}>
                  Based on {product.reviewCount} verified reviews
                </p>
              </div>

              <div className="stack" style={{ gap: 'var(--space-2)', minWidth: 220, flex: 1, maxWidth: 340 }}>
                {ratingBreakdown.map(({ star, count }) => {
                  const pct = product.reviews.length ? (count / product.reviews.length) * 100 : 0
                  return (
                    <div className="row" key={star} style={{ gap: 'var(--space-3)' }}>
                      <span className="text-xs muted" style={{ width: 34 }}>
                        {star} star
                      </span>
                      <div style={{ flex: 1, height: 6, background: 'var(--color-muted)', borderRadius: 999, overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: 'var(--color-warning)' }} />
                      </div>
                      <span className="text-xs muted" style={{ width: 18, textAlign: 'right' }}>
                        {count}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            <ul>
              {product.reviews.map((review) => (
                <li className="review" key={review.id}>
                  <div className="row" style={{ gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
                    <span className="avatar" aria-hidden="true">
                      {review.author.slice(0, 1)}
                    </span>
                    <div>
                      <div className="row" style={{ gap: 'var(--space-3)', flexWrap: 'wrap' }}>
                        <strong className="text-sm">{review.author}</strong>
                        <span className="badge badge-success">
                          <Icon name="check" size={11} /> Verified
                        </span>
                      </div>
                      <span className="text-xs muted">{formatDate(review.date)}</span>
                    </div>
                    <div style={{ marginLeft: 'auto' }}>
                      <Rating value={review.rating} size={13} />
                    </div>
                  </div>
                  <h4 style={{ fontSize: 'var(--text-sm)', marginBottom: 4 }}>{review.title}</h4>
                  <p className="text-sm muted">{review.body}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* ------------------------------------------------------- related */}
      {related.length > 0 && (
        <section className="section-tight">
          <div className="section-head">
            <h2>More in {category.name}</h2>
            <Link to={`/shop?category=${category.id}`} className="link-underline">
              View all
            </Link>
          </div>
          <div className="product-grid">
            {related.map((p) => (
              <ProductCard product={p} key={p.id} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}