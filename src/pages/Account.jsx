import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Icon from '../components/Icon'
import { EmptyState, Breadcrumbs } from '../components/ui'
import { statusTone } from '../data/seed'
import { useStore, formatPrice, formatDate } from '../context/StoreContext'

const TABS = [
  { id: 'orders', label: 'Orders', icon: 'receipt' },
  { id: 'details', label: 'Details', icon: 'user' },
  { id: 'wishlist', label: 'Wishlist', icon: 'heart' },
]

export default function Account() {
  const { user, orders, logout, wishlist, catalog } = useStore()
  const navigate = useNavigate()
  const [tab, setTab] = useState('orders')

  const myOrders = orders.filter((o) => o.userId === user.id)
  const savedItems = catalog.filter((p) => wishlist.includes(p.id))
  const totalSpent = myOrders.filter((o) => o.status !== 'Cancelled').reduce((sum, o) => sum + o.total, 0)

  return (
    <div className="container">
      <Breadcrumbs trail={[{ label: 'Home', to: '/' }, { label: 'Account' }]} />

      <div className="page-head" style={{ border: 0, paddingTop: 0 }}>
        <div className="row-between" style={{ flexWrap: 'wrap' }}>
          <div>
            <h1>Hello, {user.name.split(' ')[0]}</h1>
            <p className="muted" style={{ marginTop: 'var(--space-2)' }}>
              {user.email}
              {user.role === 'admin' && <span className="badge badge-accent" style={{ marginLeft: 'var(--space-3)' }}>Admin</span>}
            </p>
          </div>
          <div className="row">
            {user.role === 'admin' && (
              <Link to="/admin" className="btn btn-outline">
                <Icon name="grid" size={16} />
                Admin dashboard
              </Link>
            )}
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                logout()
                navigate('/')
              }}
            >
              <Icon name="logout" size={16} />
              Sign out
            </button>
          </div>
        </div>
      </div>

      <div className="section-tight" style={{ paddingTop: 'var(--space-4)' }}>
        <div className="account-layout">
          <nav className="admin-nav" aria-label="Account sections">
            {TABS.map((t) => (
              <button
                type="button"
                key={t.id}
                className={`admin-nav-link ${tab === t.id ? 'active' : ''}`}
                onClick={() => setTab(t.id)}
                aria-current={tab === t.id ? 'page' : undefined}
              >
                <Icon name={t.icon} size={17} />
                {t.label}
              </button>
            ))}
          </nav>

          <div>
            {tab === 'orders' && (
              <>
                <div className="stat-grid" style={{ marginBottom: 'var(--space-6)', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
                  <div className="stat-card">
                    <div className="stat-label">Orders placed</div>
                    <div className="stat-value">{myOrders.length}</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">Total spent</div>
                    <div className="stat-value">{formatPrice(totalSpent)}</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">Saved items</div>
                    <div className="stat-value">{savedItems.length}</div>
                  </div>
                </div>
                                {myOrders.length === 0 ? (
                  <EmptyState
                    icon="receipt"
                    title="No orders yet"
                    message="When you place an order it will appear here with its tracking status."
                    action={
                      <Link to="/shop" className="btn btn-primary">
                        Start shopping
                      </Link>
                    }
                  />
                ) : (
                  <ul className="stack" style={{ gap: 'var(--space-4)' }}>
                    {myOrders.map((order) => (
                      <li className="order-card" key={order.id}>
                        <div className="order-card-head">
                          <div>
                            <span className="text-xs muted">Order</span>
                            <div style={{ fontWeight: 600 }}>{order.id}</div>
                          </div>
                          <div>
                            <span className="text-xs muted">Placed</span>
                            <div className="text-sm">{formatDate(order.date)}</div>
                          </div>
                          <div>
                            <span className="text-xs muted">Total</span>
                            <div className="text-sm" style={{ fontWeight: 600 }}>
                              {formatPrice(order.total)}
                            </div>
                          </div>
                          <span className={`badge ${statusTone[order.status]}`}>{order.status}</span>
                        </div>

                        <div style={{ padding: 'var(--space-4) var(--space-5)' }}>
                          <div className="row" style={{ gap: 'var(--space-3)', flexWrap: 'wrap' }}>
                            {order.items.map((item) => (
                              <Link
                                to={`/product/${item.slug}`}
                                className="line-thumb"
                                key={`${item.productId}-${item.variant}`}
                                title={item.name}
                              >
                                <img src={item.image} alt={item.name} width="76" height="76" />
                              </Link>
                            ))}
                            <Link to={`/order/${order.id}`} className="btn btn-outline btn-sm" style={{ marginLeft: 'auto' }}>
                              View order
                            </Link>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}

            {tab === 'details' && (
              <div className="card stack" style={{ gap: 'var(--space-5)', maxWidth: 520 }}>
                <h2 style={{ fontSize: 'var(--text-lg)' }}>Account details</h2>

                <div className="stack" style={{ gap: 'var(--space-4)' }}>
                  <div>
                    <div className="text-xs muted">Full name</div>
                    <div>{user.name}</div>
                  </div>
                  <div>
                    <div className="text-xs muted">Email address</div>
                    <div>{user.email}</div>
                  </div>
                  <div>
                    <div className="text-xs muted">Account type</div>
                    <div style={{ textTransform: 'capitalize' }}>{user.role}</div>
                  </div>
                </div>

                <p className="text-xs muted">
                  Editing account details will be wired up when the Express + MongoDB backend lands.
                </p>
              </div>
            )}

            {tab === 'wishlist' && (
              <>
                {savedItems.length === 0 ? (
                  <EmptyState
                    icon="heart"
                    title="Nothing saved yet"
                    message="Tap the heart on any product to keep it for later."
                    action={
                      <Link to="/shop" className="btn btn-primary">
                        Browse products
                      </Link>
                    }
                  />
                ) : (
                  <ul className="stack" style={{ gap: 'var(--space-3)' }}>
                    {savedItems.map((p) => (
                      <li className="card row" key={p.id} style={{ gap: 'var(--space-4)' }}>
                        <span className="line-thumb">
                          <img src={p.image} alt="" width="76" height="76" />
                        </span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <Link to={`/product/${p.slug}`} className="line-title">
                            {p.name}
                          </Link>
                          <div className="text-xs muted">{p.brand}</div>
                        </div>
                        <span className="price">{formatPrice(p.price)}</span>
                        <Link to={`/product/${p.slug}`} className="btn btn-outline btn-sm">
                          View
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}