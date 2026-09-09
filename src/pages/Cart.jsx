import { Link } from 'react-router-dom'
import Icon from '../components/Icon'
import { QuantityStepper, EmptyState, Breadcrumbs } from '../components/ui'
import { useStore, formatPrice, FREE_SHIPPING_THRESHOLD } from '../context/StoreContext'

export default function Cart() {
  const { cart, totals, updateQuantity, removeFromCart, clearCart } = useStore()

  if (cart.length === 0) {
    return (
      <div className="container">
        <Breadcrumbs trail={[{ label: 'Home', to: '/' }, { label: 'Bag' }]} />
        <div className="section">
          <EmptyState
            icon="bag"
            title="Your bag is empty"
            message="Browse the shop and add something you actually want."
            action={
              <Link to="/shop" className="btn btn-primary btn-lg">
                Start shopping
              </Link>
            }
          />
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <Breadcrumbs trail={[{ label: 'Home', to: '/' }, { label: 'Bag' }]} />

      <div className="page-head" style={{ border: 0, paddingTop: 0 }}>
        <div className="row-between" style={{ flexWrap: 'wrap' }}>
          <h1>Your bag</h1>
          <button type="button" className="btn btn-ghost btn-sm" onClick={clearCart}>
            <Icon name="trash" size={15} />
            Empty bag
          </button>
        </div>
        <p className="muted" style={{ marginTop: 'var(--space-2)' }}>
          {totals.itemCount} item{totals.itemCount === 1 ? '' : 's'}
        </p>
      </div>

      <div className="section-tight" style={{ paddingTop: 'var(--space-4)' }}>
        <div className="cart-layout">
          <div>
            <ul className="card" style={{ padding: '0 var(--space-5)' }}>
              {cart.map((line) => (
                <li className="line-item" key={line.key}>
                  <Link to={`/product/${line.slug}`} className="line-thumb">
                    <img src={line.image} alt="" width="76" height="76" />
                  </Link>

                  <div className="stack" style={{ gap: 'var(--space-2)' }}>
                    <div className="row-between" style={{ alignItems: 'flex-start' }}>
                      <div>
                        <Link to={`/product/${line.slug}`} className="line-title">
                          {line.name}
                        </Link>
                        {line.variant && (
                          <div className="text-xs muted" style={{ marginTop: 2 }}>
                            {line.variant}
                          </div>
                        )}
                      </div>
                      <span className="price">{formatPrice(line.price * line.quantity)}</span>
                    </div>

                    <div className="row-between">
                      <QuantityStepper
                        value={line.quantity}
                        max={line.stock}
                        onChange={(q) => updateQuantity(line.key, q)}
                        label={`Quantity of ${line.name}`}
                      />
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => removeFromCart(line.key)}
                        aria-label={`Remove ${line.name} from bag`}
                      >
                        <Icon name="trash" size={14} />
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <Link to="/shop" className="btn btn-ghost" style={{ marginTop: 'var(--space-4)' }}>
              <Icon name="chevronLeft" size={16} />
              Continue shopping
            </Link>
          </div>

          {/* -------------------------------------------------- summary */}
          <aside className="summary" aria-label="Order summary">
            <div className="card stack">
              <h2 style={{ fontSize: 'var(--text-lg)' }}>Summary</h2>

              <div className="summary-row">
                <span className="muted">Subtotal</span>
                <span>{formatPrice(totals.subtotal)}</span>
              </div>
              <div className="summary-row">
                <span className="muted">Delivery</span>
                <span>{totals.shipping === 0 ? 'Free' : formatPrice(totals.shipping)}</span>
              </div>
              <div className="summary-row">
                <span className="muted">Estimated tax (7.5%)</span>
                <span>{formatPrice(totals.tax)}</span>
              </div>

              <div className="summary-total">
                <span>Total</span>
                <span>{formatPrice(totals.total)}</span>
              </div>

              {totals.freeShippingGap > 0 && (
                <p className="text-xs muted">
                  Add {formatPrice(totals.freeShippingGap)} more for free delivery (over{' '}
                  {formatPrice(FREE_SHIPPING_THRESHOLD)}).
                </p>
              )}

              <Link to="/checkout" className="btn btn-primary btn-lg btn-block">
                Proceed to checkout
                <Icon name="arrowRight" size={17} />
              </Link>

              <p className="text-xs muted row" style={{ justifyContent: 'center' }}>
                <Icon name="lock" size={13} />
                Secure checkout — this is a demo, no real payment is taken
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}