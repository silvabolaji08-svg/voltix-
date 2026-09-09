import { NavLink, Outlet, Link } from 'react-router-dom'
import Icon from '../../components/Icon'
import { useStore } from '../../context/StoreContext'

const nav = [
  { to: '/admin', label: 'Overview', icon: 'chart', end: true },
  { to: '/admin/products', label: 'Products', icon: 'package' },
  { to: '/admin/orders', label: 'Orders', icon: 'receipt' },
]

export default function AdminLayout() {
  const { user, resetDemoData } = useStore()

  return (
    <div className="container">
      <div className="page-head" style={{ border: 0 }}>
        <div className="row-between" style={{ flexWrap: 'wrap' }}>
          <div>
            <span className="eyebrow">Admin</span>
            <h1 style={{ fontSize: 'var(--text-3xl)', marginTop: 'var(--space-2)' }}>Store dashboard</h1>
            <p className="muted text-sm" style={{ marginTop: 'var(--space-2)' }}>
              Signed in as {user.name}
            </p>
          </div>
          <div className="row" style={{ flexWrap: 'wrap' }}>
            <button type="button" className="btn btn-ghost btn-sm" onClick={resetDemoData}>
              <Icon name="refresh" size={15} />
              Reset demo data
            </button>
            <Link to="/" className="btn btn-outline btn-sm">
              <Icon name="eye" size={15} />
              View storefront
            </Link>
          </div>
        </div>
      </div>

      <div className="admin-layout">
        <nav className="admin-nav" aria-label="Admin sections">
          {nav.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}>
              <Icon name={item.icon} size={17} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div>
          <Outlet />
        </div>
      </div>
    </div>
  )
}