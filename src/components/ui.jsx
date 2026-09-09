import { useEffect, useLayoutEffect } from 'react'
import { Link, useLocation, Navigate } from 'react-router-dom'
import Icon from './Icon'
import { useStore } from '../context/StoreContext'

/* ------------------------------------------------------------------ Rating */
export function Rating({ value, count, size = 13 }) {
  const rounded = Math.round(value)
  return (
    <span className="rating">
      <span className="rating-stars" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((i) => (
          <Icon key={i} name="star" size={size} filled={i <= rounded} strokeWidth={i <= rounded ? 0 : 1.5} />
        ))}
      </span>
      <span>
        {value.toFixed(1)}
        {count != null && <span className="sr-only"> out of 5 stars from {count} reviews</span>}
        {count != null && <span aria-hidden="true"> ({count})</span>}
      </span>
    </span>
  )
}

/* --------------------------------------------------------- QuantityStepper */
export function QuantityStepper({ value, onChange, max = 99, label = 'Quantity' }) {
  return (
    <div className="qty" role="group" aria-label={label}>
      <button type="button" onClick={() => onChange(value - 1)} disabled={value <= 1} aria-label="Decrease quantity">
        <Icon name="minus" size={16} />
      </button>
      <span aria-live="polite" aria-atomic="true">
        {value}
        <span className="sr-only"> {label.toLowerCase()}</span>
      </span>
      <button type="button" onClick={() => onChange(value + 1)} disabled={value >= max} aria-label="Increase quantity">
        <Icon name="plus" size={16} />
      </button>
    </div>
  )
}

/* -------------------------------------------------------------- EmptyState */
export function EmptyState({ icon = 'package', title, message, action }) {
  return (
    <div className="empty-state">
      <Icon name={icon} size={44} strokeWidth={1.25} />
      <h3>{title}</h3>
      {message && <p>{message}</p>}
      {action}
    </div>
  )
}

/* ------------------------------------------------------------- Breadcrumbs */
export function Breadcrumbs({ trail }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="breadcrumbs">
        {trail.map((crumb, i) => (
          <li key={crumb.label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {i > 0 && <Icon name="chevronRight" size={13} />}
            {crumb.to ? (
              <Link to={crumb.to}>{crumb.label}</Link>
            ) : (
              <span aria-current="page" style={{ color: 'var(--color-foreground)' }}>
                {crumb.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

/* ------------------------------------------------------------------- Field */
/**
 * Label + control + inline error, wired with aria-describedby / aria-invalid
 * so the error is announced and reachable, not just red.
 */
export function Field({ id, label, error, hint, children, className = '' }) {
  const errorId = `${id}-error`
  const hintId = `${id}-hint`
  return (
    <div className={`field ${className}`}>
      <label className="field-label" htmlFor={id}>
        {label}
      </label>
      {hint && (
        <span className="field-hint" id={hintId}>
          {hint}
        </span>
      )}
      {children({
        id,
        'aria-invalid': error ? 'true' : undefined,
        'aria-describedby': [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(' ') || undefined,
      })}
      {error && (
        <p className="field-error" id={errorId}>
          <Icon name="alert" size={14} />
          {error}
        </p>
      )}
    </div>
  )
}


export function ErrorSummary({ errors, headingRef }) {
  const entries = Object.entries(errors)
  if (entries.length === 0) return null
  return (
    <div className="error-summary" role="alert" tabIndex={-1} ref={headingRef} aria-labelledby="error-summary-title">
      <h2 id="error-summary-title">There is a problem</h2>
      <ul>
        {entries.map(([field, message]) => (
          <li key={field}>
            <a
              href={`#${field}`}
              onClick={(e) => {
                e.preventDefault()
                document.getElementById(field)?.focus()
              }}
            >
              {message}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}


export function Toasts() {
  const { toasts } = useStore()
  return (
    <div className="toast-stack" role="status" aria-live="polite" aria-atomic="false">
      {toasts.map((t) => (
        <div className="toast" key={t.id}>
          <Icon name={t.tone === 'error' ? 'alert' : 'checkCircle'} size={17} />
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  )
}


export function ScrollToTop() {
  const { pathname } = useLocation()

  
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [pathname])

  return null
}


export function ProtectedRoute({ children, adminOnly = false }) {
  const { user } = useStore()
  const location = useLocation()

  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />
  if (adminOnly && user.role !== 'admin') return <Navigate to="/account" replace />
  return children
}


export function ProductSkeleton() {
  return (
    <div className="product-card" aria-hidden="true">
      <div className="skeleton" style={{ aspectRatio: '1 / 1', borderRadius: 0 }} />
      <div className="product-body">
        <div className="skeleton" style={{ height: 10, width: '40%' }} />
        <div className="skeleton" style={{ height: 14, width: '85%' }} />
        <div className="skeleton" style={{ height: 14, width: '60%' }} />
        <div className="skeleton" style={{ height: 22, width: '35%', marginTop: 'auto' }} />
      </div>
    </div>
  )
}