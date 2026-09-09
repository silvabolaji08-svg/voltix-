import { useState, useMemo, Fragment } from 'react'
import Icon from '../../components/Icons'
import { EmptyState } from '../../components/ui'
import { ORDER_STATUSES, statusTone } from '../../data/seed'
import { useStore, formatPrice, formatDate } from '../../context/StoreContext'

export default function AdminOrders() {
  const { orders, updateOrderStatus } = useStore()
  const [status, setStatus] = useState('all')
  const [query, setQuery] = useState('')
  const [expanded, setExpanded] = useState(null)

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return orders.filter((o) => {
      if (status !== 'all' && o.status !== status) return false
      if (!needle) return true
      return `${o.id} ${o.customer.name} ${o.customer.email}`.toLowerCase().includes(needle)
    })
  }, [orders, status, query])

  const counts = ORDER_STATUSES.reduce((acc, s) => {
    acc[s] = orders.filter((o) => o.status === s).length
    return acc
  }, {})

  return (
    <div className="stack" style={{ gap: 'var(--space-5)' }}>
      <div className="toolbar" style={{ marginBottom: 0 }}>
        <div className="row" style={{ flexWrap: 'wrap' }}>
          <div>
            <label htmlFor="order-search" className="sr-only">
              Search orders
            </label>
            <input
              id="order-search"
              className="input"
              type="search"
              placeholder="Search by order or customer"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{ minHeight: 40, width: 260, fontSize: 'var(--text-sm)' }}
            />
          </div>

          <div>
            <label htmlFor="order-status" className="sr-only">
              Filter by status
            </label>
            <select id="order-status" className="select" value={status} onChange={(e) => setStatus(e.target.value)} style={{ minHeight: 40 }}>
              <option value="all">All statuses ({orders.length})</option>
              {ORDER_STATUSES.map((s) => (
                <option value={s} key={s}>
                  {s} ({counts[s]})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <p className="text-sm muted" role="status" aria-live="polite">
        {rows.length} order{rows.length === 1 ? '' : 's'}
      </p>

      {rows.length === 0 ? (
        <EmptyState icon="receipt" title="No orders match" message="Try a different status or search term." />
      ) : (
        <div className="table-wrap">
          <table className="table">
            <caption className="sr-only">Customer orders</caption>
            <thead>
              <tr>
                <th scope="col">Order</th>
                <th scope="col">Customer</th>
                <th scope="col">Date</th>
                <th scope="col">Items</th>
                <th scope="col" style={{ textAlign: 'right' }}>Total</th>
                <th scope="col">Status</th>
                <th scope="col"><span className="sr-only">Details</span></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((o) => (
                <Fragment key={o.id}>
                  <tr>
                    <td style={{ fontWeight: 600 }}>{o.id}</td>
                    <td>
                      {o.customer.name}
                      <div className="text-xs muted">{o.customer.email}</div>
                    </td>
                    <td className="text-sm muted">{formatDate(o.date)}</td>
                    <td className="text-sm">{o.items.reduce((n, i) => n + i.quantity, 0)}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                      {formatPrice(o.total)}
                    </td>
                    <td>
                      <label htmlFor={`status-${o.id}`} className="sr-only">
                        Status for order {o.id}
                      </label>
                      <select
                        id={`status-${o.id}`}
                        className="select"
                        value={o.status}
                        onChange={(e) => updateOrderStatus(o.id, e.target.value)}
                        style={{ minHeight: 36, minWidth: 140, fontSize: 'var(--text-xs)' }}
                      >
                        {ORDER_STATUSES.map((s) => (
                          <option key={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => setExpanded(expanded === o.id ? null : o.id)}
                        aria-expanded={expanded === o.id}
                        aria-controls={`order-detail-${o.id}`}
                      >
                        {expanded === o.id ? 'Hide' : 'Details'}
                        <Icon name={expanded === o.id ? 'chevronDown' : 'chevronRight'} size={14} />
                      </button>
                    </td>
                  </tr>

                  {expanded === o.id && (
                    <tr id={`order-detail-${o.id}`}>
                      <td colSpan={7} style={{ background: 'var(--color-surface-sunken)' }}>
                        <div className="form-grid" style={{ padding: 'var(--space-2) 0' }}>
                          <div>
                            <h4 style={{ fontSize: 'var(--text-sm)', marginBottom: 'var(--space-3)' }}>Items</h4>
                            <ul className="stack" style={{ gap: 'var(--space-2)' }}>
                              {o.items.map((item) => (
                                <li className="row" key={`${item.productId}-${item.variant}`} style={{ gap: 'var(--space-3)' }}>
                                  <span className="table-thumb">
                                    <img src={item.image} alt="" width="44" height="44" />
                                  </span>
                                  <div style={{ flex: 1, minWidth: 0 }}>
                                    <div className="text-sm">{item.name}</div>
                                    <div className="text-xs muted">
                                      {item.variant ? `${item.variant} · ` : ''}Qty {item.quantity}
                                    </div>
                                  </div>
                                  <span className="text-sm" style={{ fontWeight: 600 }}>
                                    {formatPrice(item.price * item.quantity)}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <h4 style={{ fontSize: 'var(--text-sm)', marginBottom: 'var(--space-3)' }}>Shipping &amp; payment</h4>
                            <p className="text-sm muted">
                              {o.shippingAddress.line1}
                              <br />
                              {o.shippingAddress.city}
                              {o.shippingAddress.state && `, ${o.shippingAddress.state}`}
                              <br />
                              {o.shippingAddress.postcode}, {o.shippingAddress.country}
                            </p>
                            <p className="text-sm muted row" style={{ gap: 'var(--space-2)', marginTop: 'var(--space-3)' }}>
                              <Icon name="card" size={15} />
                              {o.payment}
                            </p>
                            <div className="stack" style={{ gap: 'var(--space-1)', marginTop: 'var(--space-4)' }}>
                              <div className="summary-row">
                                <span className="muted">Subtotal</span>
                                <span>{formatPrice(o.subtotal)}</span>
                              </div>
                              <div className="summary-row">
                                <span className="muted">Delivery</span>
                                <span>{o.shipping === 0 ? 'Free' : formatPrice(o.shipping)}</span>
                              </div>
                              <div className="summary-row">
                                <span className="muted">Tax</span>
                                <span>{formatPrice(o.tax)}</span>
                              </div>
                              <div className="summary-row" style={{ fontWeight: 600 }}>
                                <span>Total</span>
                                <span>{formatPrice(o.total)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}