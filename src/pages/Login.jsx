import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import Icon from '../components/Icon'
import { Field, ErrorSummary } from '../components/ui'
import { useStore } from '../context/StoreContext'

export default function Login() {
  const { login } = useStore()
  const navigate = useNavigate()
  const location = useLocation()

  const [form, setForm] = useState({ email: '', password: '' })
    const [errors, setErrors] = useState({})
  const [busy, setBusy] = useState(false)
  const summaryRef = useRef(null)

  useEffect(() => {
    if (Object.keys(errors).length > 0) summaryRef.current?.focus()
  }, [errors])

    const submit = async (e) => {
    e.preventDefault()
    if (busy) return

    const found = {}
    if (!form.email.trim()) found.email = 'Enter your email address'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email)) found.email = 'Enter a valid email address'
    if (!form.password) found.password = 'Enter your password'

    if (Object.keys(found).length) {
      setErrors(found)
      return
    }

    setBusy(true)
    try {
      const result = await login(form.email, form.password)
      if (!result.ok) {
        setErrors({ email: result.error })
        return
      }

      const target = location.state?.from ?? (result.user.role === 'admin' ? '/admin' : '/account')
      navigate(target, { replace: true })
    } finally {
      setBusy(false)
    }
  }

  const fill = (email, password) => setForm({ email, password })

  return (
    <div className="container auth-wrap">
      <div className="auth-card">
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
          <span className="brand-mark" aria-hidden="true" style={{ marginInline: 'auto', marginBottom: 'var(--space-3)' }}>
            <Icon name="zap" size={16} filled strokeWidth={0} />
          </span>
          <h1 style={{ fontSize: 'var(--text-2xl)' }}>Welcome back</h1>
          <p className="text-sm muted" style={{ marginTop: 'var(--space-2)' }}>
            Sign in to track orders and save your wishlist.
          </p>
        </div>

        <ErrorSummary errors={errors} headingRef={summaryRef} />

        <form onSubmit={submit} noValidate className="stack" style={{ gap: 'var(--space-4)' }}>
          <Field id="email" label="Email address" error={errors.email}>
            {(props) => (
              <input
                {...props}
                type="email"
                className="input"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                autoComplete="email"
              />
            )}
          </Field>

          <Field id="password" label="Password" error={errors.password}>
            {(props) => (
              <input
                {...props}
                type="password"
                className="input"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                autoComplete="current-password"
              />
            )}
          </Field>
                     <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={busy}>
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="text-sm muted" style={{ textAlign: 'center', marginTop: 'var(--space-5)' }}>
          No account yet?{' '}
          <Link to="/register" className="link-underline">
            Create one
          </Link>
        </p>

        <div className="demo-hint" style={{ marginTop: 'var(--space-5)' }}>
          <strong>Demo accounts</strong>
          <div className="row" style={{ marginTop: 'var(--space-2)', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
            <button type="button" className="chip" onClick={() => fill('demo@voltix.store', 'demo1234')}>
              Customer
            </button>
            <button type="button" className="chip" onClick={() => fill('silvabolaji08@gmail.com', 'admin1234')}>
              Admin
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}