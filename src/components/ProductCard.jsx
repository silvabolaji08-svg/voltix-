import { useRef, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Icon from './Icon'
import { Rating } from './ui'
import { useStore, formatPrice } from '../context/StoreContext'
import { useHoverLift } from '../motion/hooks'
import { captureFlip } from '../motion/flip'
import { flyToCart } from '../motion/flyToCart'
import { gsap, prefersReducedMotion } from '../motion/gsap'

export default function ProductCard({ product }) {
  const { addToCart, toggleWishlist, inWishlist } = useStore()
  const cardRef = useHoverLift({ y: -4, scale: 1.02 })
  const imageRef = useRef(null)
  const heartRef = useRef(null)

  const saved = inWishlist(product.id)
  const outOfStock = product.stock === 0
  const lowStock = product.stock > 0 && product.stock <= 10
  const discount = product.compareAt
    ? Math.round(((product.compareAt - product.price) / product.compareAt) * 100)
    : 0

  const handleAdd = () => {
    flyToCart(imageRef.current)
    addToCart(product, 1, product.variants?.options?.[0] ?? null)
  }

    const [imgLoaded, setImgLoaded] = useState(false)

  useEffect(() => {
    if (imageRef.current?.complete) setImgLoaded(true)
  }, [])

  const handleWishlist = () => {
    if (!saved && heartRef.current && !prefersReducedMotion()) {
     
      gsap.fromTo(
        heartRef.current,
        { scale: 0.6 },
        { scale: 1, duration: 0.5, ease: 'elastic.out(1, 0.4)' }
      )
    }
    toggleWishlist(product)
  }

  return (
    <article className="product-card" ref={cardRef}>
      <div className="product-media">
               <img
          ref={imageRef}
          src={product.image}
          alt={product.name}
          loading="lazy"
          width="400"
          height="400"
          data-flip-id={product.slug}
          className={imgLoaded ? 'is-loaded' : ''}
          onLoad={() => setImgLoaded(true)}
          onError={() => setImgLoaded(true)}
        />

        <div className="product-flags">
          {discount > 0 && <span className="badge badge-danger">−{discount}%</span>}
          {product.tags.includes('new') && <span className="badge badge-accent">New</span>}
          {outOfStock && <span className="badge">Out of stock</span>}
          {lowStock && !outOfStock && <span className="badge badge-warning">Only {product.stock} left</span>}
        </div>

        <button
          type="button"
          className={`wish-btn ${saved ? 'is-active' : ''}`}
          onClick={handleWishlist}
          aria-pressed={saved}
          aria-label={saved ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
        >
          <span ref={heartRef} style={{ display: 'grid', placeItems: 'center' }}>
            <Icon name="heart" size={17} filled={saved} strokeWidth={saved ? 0 : 1.75} />
          </span>
        </button>
      </div>

      <div className="product-body">
        <span className="product-brand">{product.brand}</span>

        
        <h3 className="product-name">
          <Link to={`/product/${product.slug}`} onClick={() => captureFlip(imageRef.current, product.slug)}>
            {product.name}
          </Link>
        </h3>

        <Rating value={product.rating} count={product.reviewCount} />

        <div className="product-foot">
          <div>
            <span className="price">{formatPrice(product.price)}</span>
            {product.compareAt && <span className="price-old">{formatPrice(product.compareAt)}</span>}
          </div>

          <button
            type="button"
            className="add-btn"
            onClick={handleAdd}
            disabled={outOfStock}
            aria-label={outOfStock ? `${product.name} is out of stock` : `Add ${product.name} to bag`}
          >
            <Icon name={outOfStock ? 'x' : 'plus'} size={17} />
          </button>
        </div>
      </div>
    </article>
  )
}