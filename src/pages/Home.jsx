import { Link } from 'react-router-dom'
import Icon from '../components/Icon'
import ProductCard from '../components/ProductCard'
import { Rating } from '../components/ui'
import { categories, getProductBySlug } from '../data/products'
import { useStore, formatPrice } from '../context/StoreContext'
import {
  useGridStagger,
  useScrollReveal,
  useSplitHeadline,
  useParallax,
  useCountUp,
  useMagnetic,
} from '../motion/hooks'

const valueProps = [
  { icon: 'truck', title: 'Free delivery over $250', body: 'Two to four working days, tracked end to end.' },
  { icon: 'refresh', title: '30-day returns', body: 'Changed your mind? Send it back, no questions.' },
  { icon: 'shield', title: '2-year warranty', body: 'Standard on everything, extendable to four.' },
  { icon: 'lock', title: 'Secure checkout', body: 'Card details never touch our servers.' },
]


function Reveal({ children, className = '' }) {
  const ref = useScrollReveal()
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}


function ProductRail({ products, className = 'product-grid' }) {
  const ref = useGridStagger([products.map((p) => p.id).join(',')])
  return (
    <div className={className} ref={ref}>
      {products.map((p) => (
        <ProductCard product={p} key={p.id} />
      ))}
    </div>
  )
}

function Stat({ value, suffix = '', label, format }) {
  const ref = useCountUp(value, format)
  return (
    <div>
      <span className="hero-stat-value">
        <span ref={ref}>{format ? format(value) : value}</span>
        {suffix}
      </span>
      <span className="hero-stat-label">{label}</span>
    </div>
  )
}

export default function Home() {
  const { catalog } = useStore()
  const hero = getProductBySlug('aurora-anc-headphones')

  const headlineRef = useSplitHeadline({ delay: 0.15 })
  const heroVisualRef = useParallax({ distance: 44 })
  const ctaRef = useMagnetic({ strength: 0.3 })
  const categoryRef = useGridStagger([], { each: 0.05 })

  const bestsellers = catalog.filter((p) => p.tags.includes('bestseller')).slice(0, 4)
  const fresh = catalog.filter((p) => p.tags.includes('new')).slice(0, 4)
  const deals = catalog.filter((p) => p.compareAt).slice(0, 4)

  return (
    <>
      
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <span className="eyebrow">New season · Autumn 2026</span>

           
            <h1 ref={headlineRef} style={{ marginTop: 'var(--space-4)' }}>
              Tech that earns its place on your desk.
            </h1>

            <p className="hero-lede">
              A tightly edited range of audio, computing and photography gear. Nothing here is filler —
              every product had to justify the shelf space.
            </p>

            <div className="hero-cta">
              <Link to="/shop" className="btn btn-primary btn-lg" ref={ctaRef}>
                Shop all products
                <Icon name="arrowRight" size={17} />
              </Link>
              <Link to="/shop?sale=1" className="btn btn-outline btn-lg">
                View deals
              </Link>
            </div>

            <div className="hero-stats">
              <Stat value={catalog.length} label="Products in stock" />
              <Stat value={4.6} suffix="★" label="Average rating" format={(n) => n.toFixed(1)} />
              <Stat value={48} suffix="h" label="Typical dispatch" />
            </div>
          </div>

          
          <div className="hero-visual" ref={heroVisualRef}>
            <img src={hero.image} alt={hero.name} width="400" height="400" />
            <Link to={`/product/${hero.slug}`} className="hero-price-tag">
              <span className="text-xs muted" style={{ display: 'block' }}>
                {hero.brand}
              </span>
              <strong style={{ fontSize: 'var(--text-sm)' }}>{hero.name.split(' ').slice(0, 3).join(' ')}</strong>
              <div className="row" style={{ gap: 'var(--space-2)', marginTop: 4 }}>
                <span className="price">{formatPrice(hero.price)}</span>
                <Rating value={hero.rating} size={12} />
              </div>
            </Link>
          </div>
        </div>
      </section>
           
      <section className="section-tight">
        <div className="container">
          <Reveal className="value-props">
            {valueProps.map((v) => (
              <div className="value-prop" key={v.title}>
                <Icon name={v.icon} size={22} />
                <div>
                  <h4>{v.title}</h4>
                  <p>{v.body}</p>
                </div>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* --------------------------------------------------- categories */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="eyebrow">Browse</span>
              <h2 style={{ marginTop: 'var(--space-2)' }}>Shop by category</h2>
            </div>
            <Link to="/shop" className="link-underline">
              All products
            </Link>
          </div>

          <div className="category-grid" ref={categoryRef}>
            {categories.map((c) => (
              <Link to={`/shop?category=${c.id}`} className="category-card" key={c.id}>
                <img src={c.image} alt="" width="64" height="64" />
                <div>
                  <h3>{c.name}</h3>
                  <p className="text-sm muted">{c.blurb}</p>
                </div>
                <Icon name="arrowRight" size={18} style={{ marginLeft: 'auto', color: 'var(--color-muted-foreground)' }} />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* -------------------------------------------------- bestsellers */}
      <section className="section-tight">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="eyebrow">Most wanted</span>
              <h2 style={{ marginTop: 'var(--space-2)' }}>Bestsellers</h2>
              <p>What people keep coming back for, ranked by units shipped this quarter.</p>
            </div>
            <Link to="/shop?sort=rating" className="link-underline">
              See all
            </Link>
          </div>

          <ProductRail products={bestsellers} />
        </div>
      </section>

      {/* ------------------------------------------------------- banner */}
      <section className="section-tight">
        <div className="container">
          <Reveal>
            <div className="banner">
              <div>
                <span className="eyebrow" style={{ color: 'inherit', opacity: 0.65 }}>
                  Limited time
                </span>
                <h2 style={{ marginTop: 'var(--space-3)' }}>Up to 20% off selected audio</h2>
                <p>
                  Aurora and Pulse are discounted through the end of the season. Same two-year warranty,
                  same 30-day returns.
                </p>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Link
                  to="/shop?sale=1"
                  className="btn btn-lg"
                  style={{ background: 'var(--color-on-primary)', color: 'var(--color-primary)' }}
                >
                  Shop the deals
                  <Icon name="arrowRight" size={17} />
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* -------------------------------------------------- new arrivals */}
      <section className="section-tight">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="eyebrow">Just landed</span>
              <h2 style={{ marginTop: 'var(--space-2)' }}>New arrivals</h2>
            </div>
            <Link to="/shop?sort=newest" className="link-underline">
              See all
            </Link>
          </div>

          <ProductRail products={fresh} />
        </div>
      </section>

      {/* -------------------------------------------------------- deals */}
      <section className="section-tight" style={{ paddingBottom: 'var(--space-9)' }}>
        <div className="container">
          <div className="section-head">
            <div>
              <span className="eyebrow">Reduced</span>
              <h2 style={{ marginTop: 'var(--space-2)' }}>On sale now</h2>
            </div>
            <Link to="/shop?sort=newest" className="link-underline">
              All deals
            </Link>
          </div>

          <ProductRail products={deals} />
        </div>
      </section>
    </>
  )
}