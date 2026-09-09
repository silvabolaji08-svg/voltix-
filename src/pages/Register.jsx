import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Icon from '../components/Icon'
import { Field, ErrorSummary } from '../components/ui'
import { useStore } from '../context/StoreContext'

export default function Register() {
  const { register } = useStore()
  const navigate = useNavigate()

  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', terms: false })
  const [errors, setErrors] = useState({})
  const summaryRef = useRef(null)

  useEffect(() => {
    if (Object.keys(errors).length > 0) summaryRef.current?.focus()
  }, [errors])

  const strength = (() => {
    const p = form.password
    let score = 0
    if (p.length >= 8) score++
    if (/[A-Z]/.test(p)) score++
    if (/\d/.test(p)) score++
    if (/[^A-Za-z0-9]/.test(p)) score++
    return score
  })()

  const strengthLabel = ['Too short', 'Weak', 'Fair', 'Good', 'Strong'][form.password ? strength : 0]

  const submit = (e) => {
    e.preventDefault()
    const found = {}
    if (!form.name.trim()) found.name = 'Enter your full name'
    if (!form.email.trim()) found.email = 'Enter an email address'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email)) found.email = 'Enter a valid email address'
    if (form.password.length < 8) found.password = 'Password must be at least 8 characters'
    if (form.confirm !== form.password) found.confirm = 'Passwords do not match'
    if (!form.terms) found.terms = 'Accept the terms to create an account'

    if (Object.keys(found).length) {
      setErrors(found)
      return
    }

    const result = register(form)
    if (!result.ok) {
      setErrors({ email: result.error })
      return
    }
    navigate('/account', { replace: true })
  }

  return (
    <div className="container auth-wrap">
      <div className="auth-card">
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
          <span className="brand-mark" aria-hidden="true" style={{ marginInline: 'auto', marginBottom: 'var(--space-3)' }}>
            <Icon name="zap" size={16} filled strokeWidth={0} />
          </span>
          <h1 style={{ fontSize: 'var(--text-2xl)' }}>Create your account</h1>
          <p className="text-sm muted" style={{ marginTop: 'var(--space-2)' }}>
            Faster checkout, order history and a saved wishlist.
          </p>
        </div>

        <ErrorSummary errors={errors} headingRef={summaryRef} />

        <form onSubmit={submit} noValidate className="stack" style={{ gap: 'var(--space-4)' }}>
          <Field id="name" label="Full name" error={errors.name}>
            {(props) => (
              <input {...props} className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoComplete="name" />
            )}
          </Field>

          <Field id="email" label="Email address" error={errors.email}>
            {(props) => (
              <input {...props} type="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} autoComplete="email" />
            )}
          </Field>

          <Field id="password" label="Password" error={errors.password} hint="At least 8 characters">
            {(props) => (
              <input
                {...props}
                type="password"
                className="input"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                autoComplete="new-password"
              />
            )}
          </Field>

          {form.password && (
            <div>
              <div className="row" style={{ gap: 4 }}>
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      height: 4,
                      borderRadius: 999,
                      background: i <= strength ? 'var(--color-success)' : 'var(--color-muted)',
                    }}
                  />
                ))}
              </div>
              <p className="text-xs muted" style={{ marginTop: 6 }} aria-live="polite">
                Password strength: {strengthLabel}
              </p>
            </div>
          )}

          <Field id="confirm" label="Confirm password" error={errors.confirm}>
            {(props) => (
              <input
                {...props}
                type="password"
                className="input"
                value={form.confirm}
                onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                autoComplete="new-password"
              />
            )}
          </Field>

          <div>
            <label className="checkbox-row">
              <input
                id="terms"
                type="checkbox"
                checked={form.terms}
                onChange={(e) => setForm({ ...form, terms: e.target.checked })}
                aria-invalid={errors.terms ? 'true' : undefined}
                aria-describedby={errors.terms ? 'terms-error' : undefined}
              />
              <span className="text-sm">
                I agree to the terms of service and privacy policy
              </span>
            </label>
            {errors.terms && (
              <p className="field-error" id="terms-error">
                <Icon name="alert" size={14} />
                {errors.terms}
              </p>
            )}
          </div>

          <button type="submit" className="btn btn-primary btn-lg btn-block">
            Create account
          </button>
        </form>

        <p className="text-sm muted" style={{ textAlign: 'center', marginTop: 'var(--space-5)' }}>
          Already have an account?{' '}
          <Link to="/login" className="link-underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}