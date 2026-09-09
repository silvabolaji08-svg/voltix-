import { useParams, Link, useLocation } from 'react-router-dom'
import Icon from '../components/Icon'
import { EmptyState } from '../components/ui'
import { statusTone } from '../data/seed'
import { useStore, formatPrice, formatDate } from '../context/StoreContext'

export default function OrderConfirmation() {
  const { orderId } = useParams()
  const { state } = useLocation()
  const { orders } = useStore()

  const order = orders.find((o) => o.id === orderId)

  if (!order) {
    return (
      <div className="container section">
        <EmptyState
          icon="receipt"
          title="Order not found"
          message={`We could not find an order with the reference ${orderId}.`}
          action={
            <Link to="/shop" className="btn btn-primary">
              Back to shop
            </Link>
          }
        />
      </div>
    )
  }

  const justPlaced = state?.justPlaced

  return (
    <div className="container-narrow">
      <div className="section">
        {justPlaced && (
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-7)' }}>
            <div className="success-mark" aria-hidden="true">
              <Icon name="check" size={30} strokeWidth={2.5} />
            </div>
            <h1>Order confirmed</h1>
            <p className="muted" style={{ marginTop: 'var(--space-3)' }}>
              Thanks {order.customer.name.split(' ')[0]} — a confirmation email is on its way to{' '}
              {order.customer.email}.
            </p>
          </div>
        )}

        <div className="order-card">
          <div className="order-card-head">
            <div>
              <span className="text-xs muted">Order reference</span>
              <div style={{ fontWeight: 600 }}>{order.id}</div>
            </div>
            <div>
              <span className="text-xs muted">Placed</span>
              <div className="text-sm">{formatDate(order.date)}</div>
            </div>
            <span className={`badge ${statusTone[order.status]}`}>{order.status}</span>
          </div>

          <div style={{ padding: 'var(--space-5)' }}>
            <ul>
              {order.items.map((item) => (
                <li className="line-item" key={`${item.productId}-${item.variant}`}>
                  <Link to={`/product/${item.slug}`} className="line-thumb">
                    <img src={item.image} alt="" width="76" height="76" />
                  </Link>
                  <div className="row-between" style={{ alignItems: 'flex-start' }}>
                    <div>
                      <Link to={`/product/${item.slug}`} className="line-title">
                        {item.name}
                      </Link>
                      <div className="text-xs muted" style={{ marginTop: 2 }}>
                        {item.variant ? `${item.variant} · ` : ''}Qty {item.quantity}
                      </div>
                    </div>
                    <span className="price">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                </li>
              ))}
            </ul>

            <hr className="divider" />

            <div className="stack" style={{ gap: 'var(--space-2)' }}>
              <div className="summary-row">
                <span className="muted">Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="summary-row">
                <span className="muted">Delivery</span>
                <span>{order.shipping === 0 ? 'Free' : formatPrice(order.shipping)}</span>
              </div>
              <div className="summary-row">
                <span className="muted">Tax</span>
                <span>{formatPrice(order.tax)}</span>
              </div>
              <div className="summary-total">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="form-grid" style={{ marginTop: 'var(--space-5)' }}>
          <div className="card">
            <h3 style={{ fontSize: 'var(--text-sm)', marginBottom: 'var(--space-3)' }}>Shipping address</h3>
            <p className="text-sm muted">
              {order.customer.name}
              <br />
              {order.shippingAddress.line1}
              <br />
              {order.shippingAddress.city}
              {order.shippingAddress.state && `, ${order.shippingAddress.state}`}
              <br />
              {order.shippingAddress.postcode}
              <br />
              {order.shippingAddress.country}
            </p>
          </div>

          <div className="card">
            <h3 style={{ fontSize: 'var(--text-sm)', marginBottom: 'var(--space-3)' }}>Payment</h3>
            <p className="text-sm muted row" style={{ gap: 'var(--space-2)' }}>
              <Icon name="card" size={16} />
              {order.payment}
            </p>
            <p className="text-xs muted" style={{ marginTop: 'var(--space-3)' }}>
              Demo checkout — no real charge was made.
            </p>
          </div>
        </div>

        <div className="row" style={{ marginTop: 'var(--space-6)', flexWrap: 'wrap' }}>
          <Link to="/shop" className="btn btn-primary btn-lg">
            Continue shopping
          </Link>
          <Link to="/account" className="btn btn-outline btn-lg">
            View all orders
          </Link>
        </div>
      </div>
    </div>
  )
}