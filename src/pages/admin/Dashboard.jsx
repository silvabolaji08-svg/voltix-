import { Link } from 'react-router-dom'
import Icon from '../../components/Icon'
import { revenueByMonth, statusTone } from '../../data/seed'
import { useStore, formatPrice, formatDate } from '../../context/StoreContext'
import { useCountUp, useBarGrow, useScrollReveal } from '../../motion/hooks'

/* Data UI gets power2.out and no overshoot — the skill is explicit that
   back.out on informational surfaces reads as sloppy. */
function StatCard({ label, value, display, delta, dir }) {
  const ref = useCountUp(value, display)
  return (
    <div className="stat-card">
      <div className="stat-label">{label}</div>
      <div className="stat-value" ref={ref}>
        {display(value)}
      </div>
      <div className={`stat-delta ${dir}`}>
        <Icon name={dir === 'up' ? 'arrowUp' : 'arrowDown'} size={13} />
        {delta}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { orders, catalog } = useStore()

  const active = orders.filter((o) => o.status !== 'Cancelled')
  const revenue = active.reduce((sum, o) => sum + o.total, 0)
  const unitsSold = active.reduce((sum, o) => sum + o.items.reduce((n, i) => n + i.quantity, 0), 0)
  const avgOrder = active.length ? revenue / active.length : 0
  const lowStock = catalog.filter((p) => p.stock > 0 && p.stock <= 10)
  const outOfStock = catalog.filter((p) => p.stock === 0)

  const peak = Math.max(...revenueByMonth.map((m) => m.revenue))

  const statGridRef = useScrollReveal({ y: 14, stagger: 0.07, start: 'top 95%' })
  const chartRef = useBarGrow()

  const stats = [
    { label: 'Revenue', value: revenue, display: formatPrice, delta: '+18.2%', dir: 'up' },
    { label: 'Orders', value: orders.length, display: (n) => Math.round(n).toString(), delta: '+6 this week', dir: 'up' },
    { label: 'Units sold', value: unitsSold, display: (n) => Math.round(n).toString(), delta: '+11.4%', dir: 'up' },
    { label: 'Avg. order value', value: avgOrder, display: formatPrice, delta: '−2.1%', dir: 'down' },
  ]

  /* Units per product, highest first. */
  const topProducts = Object.values(
    active
      .flatMap((o) => o.items)
      .reduce((acc, item) => {
        acc[item.productId] = acc[item.productId] ?? { ...item, units: 0, revenue: 0 }
        acc[item.productId].units += item.quantity
        acc[item.productId].revenue += item.price * item.quantity
        return acc
      }, {})
  )
    .sort((a, b) => b.units - a.units)
    .slice(0, 5)

  return (
    <div className="stack" style={{ gap: 'var(--space-6)' }}>
      <div className="stat-grid" ref={statGridRef}>
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* Revenue is labelled on each bar as well as encoded by height — the
          chart never relies on visual comparison alone. */}
      <section className="card">
        <div className="row-between" style={{ marginBottom: 'var(--space-2)' }}>
          <h2 style={{ fontSize: 'var(--text-lg)' }}>Revenue, last 6 months</h2>
          <span className="badge">USD</span>
        </div>

        <div
          className="bar-chart"
          ref={chartRef}
          role="img"
          aria-label={`Monthly revenue: ${revenueByMonth.map((m) => `${m.month} ${formatPrice(m.revenue)}`).join(', ')}`}
        >
          {revenueByMonth.map((m) => (
            <div className="bar-col" key={m.month}>
              <span className="bar-label" style={{ fontVariantNumeric: 'tabular-nums' }}>
                {Math.round(m.revenue / 1000)}k
              </span>
              <div className="bar" data-bar style={{ height: `${(m.revenue / peak) * 100}%` }} />
              <span className="bar-label">{m.month}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="form-grid" style={{ gap: 'var(--space-5)' }}>
        <section className="card col-span-2">
          <div className="row-between" style={{ marginBottom: 'var(--space-4)' }}>
            <h2 style={{ fontSize: 'var(--text-lg)' }}>Recent orders</h2>
            <Link to="/admin/orders" className="link-underline text-sm">
              View all
            </Link>
          </div>

          <div className="table-wrap">
            <table className="table">
              <caption className="sr-only">Five most recent orders</caption>
              <thead>
                <tr>
                  <th scope="col">Order</th>
                  <th scope="col">Customer</th>
                  <th scope="col">Date</th>
                  <th scope="col">Status</th>
                  <th scope="col" style={{ textAlign: 'right' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 5).map((o) => (
                  <tr key={o.id}>
                    <td style={{ fontWeight: 600 }}>{o.id}</td>
                    <td>
                      {o.customer.name}
                      <div className="text-xs muted">{o.customer.email}</div>
                    </td>
                    <td className="text-sm muted">{formatDate(o.date)}</td>
                    <td>
                      <span className={`badge ${statusTone[o.status]}`}>{o.status}</span>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                      {formatPrice(o.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="card">
          <h2 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-4)' }}>Top products</h2>
          <ul className="stack" style={{ gap: 'var(--space-3)' }}>
            {topProducts.map((p, i) => (
              <li className="row" key={p.productId} style={{ gap: 'var(--space-3)' }}>
                <span className="avatar">{i + 1}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="text-sm" style={{ fontWeight: 500 }}>
                    {p.name}
                  </div>
                  <div className="text-xs muted">{p.units} units · {formatPrice(p.revenue)}</div>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="card">
          <h2 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-4)' }}>Inventory alerts</h2>

          {outOfStock.length === 0 && lowStock.length === 0 ? (
            <p className="text-sm muted">Everything is comfortably in stock.</p>
          ) : (
            <ul className="stack" style={{ gap: 'var(--space-3)' }}>
              {outOfStock.map((p) => (
                <li className="row" key={p.id} style={{ gap: 'var(--space-3)' }}>
                  <Icon name="alert" size={17} style={{ color: 'var(--color-destructive)', flex: '0 0 auto' }} />
                  <span className="text-sm" style={{ flex: 1, minWidth: 0 }}>
                    {p.name}
                  </span>
                  <span className="badge badge-danger">Out of stock</span>
                </li>
              ))}
              {lowStock.map((p) => (
                <li className="row" key={p.id} style={{ gap: 'var(--space-3)' }}>
                  <Icon name="alert" size={17} style={{ color: 'var(--color-warning)', flex: '0 0 auto' }} />
                  <span className="text-sm" style={{ flex: 1, minWidth: 0 }}>
                    {p.name}
                  </span>
                  <span className="badge badge-warning">{p.stock} left</span>
                </li>
              ))}
            </ul>
          )}

          <Link to="/admin/products" className="btn btn-outline btn-sm btn-block" style={{ marginTop: 'var(--space-4)' }}>
            Manage inventory
          </Link>
        </section>
      </div>
    </div>
  )
}