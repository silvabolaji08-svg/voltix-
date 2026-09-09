import { useState, useRef, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Icon from '../components/Icon'
import { Field, ErrorSummary, EmptyState } from '../components/ui'
import { useStore, formatPrice, FLAT_SHIPPING } from '../context/StoreContext'

const STEPS = ['Contact', 'Delivery', 'Payment']

const SHIPPING_METHODS = [
  { id: 'standard', label: 'Standard delivery', detail: '3–5 working days', price: 0 },
  { id: 'express', label: 'Express delivery', detail: '1–2 working days', price: 14 },
  { id: 'nextday', label: 'Next-day delivery', detail: 'Order before 3pm', price: 24 },
]

const required = (value, message) => (value.trim() ? null : message)
 
const validators = {
  0: (f) => ({
    name: required(f.name, 'Enter your full name'),
    email: !f.email.trim()
      ? 'Enter an email address'
      : /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email)
        ? null
        : 'Enter an email address in the format name@example.com',
    phone: !f.phone.trim()
      ? 'Enter a phone number'
      : f.phone.replace(/\D/g, '').length >= 7
        ? null
        : 'Enter a phone number with at least 7 digits',
    address: required(f.address, 'Enter your street address'),
    city: required(f.city, 'Enter your city'),
    postcode: required(f.postcode, 'Enter your postcode'),
    country: required(f.country, 'Enter your country'),
  }),
  1: () => ({}),
  2: (f) => ({
    cardName: required(f.cardName, 'Enter the name on the card'),
    cardNumber: !f.cardNumber.trim()
      ? 'Enter your card number'
      : f.cardNumber.replace(/\s/g, '').length === 16
        ? null
        : 'Card number must be 16 digits',
    expiry: !f.expiry.trim()
      ? 'Enter the expiry date'
      : /^(0[1-9]|1[0-2])\/\d{2}$/.test(f.expiry)
        ? null
        : 'Use MM/YY format',
    cvc: !f.cvc.trim() ? 'Enter the security code' : /^\d{3,4}$/.test(f.cvc) ? null : 'Security code is 3 or 4 digits',
  }),
}

const clean = (errors) => Object.fromEntries(Object.entries(errors).filter(([, v]) => v))

export default function Checkout() {
  const { cart, totals, placeOrder, user } = useStore()
  const [busy, setBusy] = useState(false)
  const navigate = useNavigate()

  const [step, setStep] = useState(0)
  const [shippingMethod, setShippingMethod] = useState('standard')
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const summaryRef = useRef(null)

  const [form, setForm] = useState({
    name: user?.name ?? '',
    email: user?.email ?? '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postcode: '',
    country: 'Nigeria',
    cardName: '',
    cardNumber: '',
    expiry: '',
    cvc: '',
    saveDetails: true,
  })

  useEffect(() => {
    if (Object.keys(errors).length > 0) summaryRef.current?.focus()
  }, [errors])

  if (cart.length === 0) {
    return (
      <div className="container section">
        <EmptyState
          icon="bag"
          title="Nothing to check out"
          message="Your bag is empty — add something first."
          action={
            <Link to="/shop" className="btn btn-primary btn-lg">
              Browse the shop
            </Link>
          }
        />
      </div>
    )
  }

  const method = SHIPPING_METHODS.find((m) => m.id === shippingMethod)
  const shippingCost = totals.subtotal >= 250 && method.id === 'standard' ? 0 : method.price || FLAT_SHIPPING * 0
  const orderTotal = +(totals.subtotal + shippingCost + totals.tax).toFixed(2)
    const set = (key) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm((f) => ({ ...f, [key]: value }))
   
    if (touched[key]) {
      const next = clean(validators[step]({ ...form, [key]: value }))
      setErrors((prev) => {
        const copy = { ...prev }
        if (next[key]) copy[key] = next[key]
        else delete copy[key]
        return copy
      })
    }
  }

 
  const blur = (key) => () => {
    setTouched((t) => ({ ...t, [key]: true }))
    const next = clean(validators[step](form))
    setErrors((prev) => {
      const copy = { ...prev }
      if (next[key]) copy[key] = next[key]
      else delete copy[key]
      return copy
    })
  }

  const advance = async (e) => {
    e.preventDefault()
    const found = clean(validators[step](form))

    if (Object.keys(found).length > 0) {
      setErrors(found)
      setTouched((t) => ({ ...t, ...Object.fromEntries(Object.keys(found).map((k) => [k, true])) }))
      return
    }

        setErrors({})

    if (step < 2) {
      setStep(step + 1)
      window.scrollTo({ top: 0 })
      return
    }

    setBusy(true)
    try {
      const order = await placeOrder({ ...form, shippingMethod: method.label })
      navigate(`/order/${order.id}`, { state: { justPlaced: true } })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="container">
      <div className="page-head" style={{ border: 0 }}>
        <h1>Checkout</h1>
      </div>

      <div className="section-tight" style={{ paddingTop: 'var(--space-4)' }}>
        {/* -------------------------------------------------------- steps */}
        <ol className="stepper" aria-label="Checkout progress">
          {STEPS.map((label, i) => (
            <li key={label} style={{ display: 'contents' }}>
              <div className={`step ${i === step ? 'is-active' : ''} ${i < step ? 'is-done' : ''}`}>
                <span className="step-dot" aria-hidden="true">
                  {i < step ? <Icon name="check" size={13} /> : i + 1}
                </span>
                <span>
                  {label}
                  {i === step && <span className="sr-only"> (current step)</span>}
                </span>
              </div>
              {i < STEPS.length - 1 && <span className="step-sep" aria-hidden="true" />}
            </li>
          ))}
        </ol>

        <div className="cart-layout">
          <form onSubmit={advance} noValidate>
            <ErrorSummary errors={errors} headingRef={summaryRef} />
                        {/* ------------------------------------------ step 1: contact */}
            {step === 0 && (
              <div className="card stack" style={{ gap: 'var(--space-5)' }}>
                <h2 style={{ fontSize: 'var(--text-xl)' }}>Contact &amp; shipping address</h2>

                <div className="form-grid">
                  <Field id="name" label="Full name" error={errors.name} className="col-span-2">
                    {(props) => (
                      <input {...props} className="input" value={form.name} onChange={set('name')} onBlur={blur('name')} autoComplete="name" />
                    )}
                  </Field>

                  <Field id="email" label="Email address" error={errors.email} hint="Order updates are sent here">
                    {(props) => (
                      <input {...props} type="email" className="input" value={form.email} onChange={set('email')} onBlur={blur('email')} autoComplete="email" />
                    )}
                  </Field>

                  <Field id="phone" label="Phone number" error={errors.phone}>
                    {(props) => (
                      <input {...props} type="tel" className="input" value={form.phone} onChange={set('phone')} onBlur={blur('phone')} autoComplete="tel" />
                    )}
                  </Field>

                  <Field id="address" label="Street address" error={errors.address} className="col-span-2">
                    {(props) => (
                      <input {...props} className="input" value={form.address} onChange={set('address')} onBlur={blur('address')} autoComplete="street-address" />
                    )}
                  </Field>

                  <Field id="city" label="City" error={errors.city}>
                    {(props) => (
                      <input {...props} className="input" value={form.city} onChange={set('city')} onBlur={blur('city')} autoComplete="address-level2" />
                    )}
                  </Field>

                  <Field id="state" label="State / region">
                    {(props) => (
                      <input {...props} className="input" value={form.state} onChange={set('state')} autoComplete="address-level1" />
                    )}
                  </Field>

                  <Field id="postcode" label="Postcode" error={errors.postcode}>
                    {(props) => (
                      <input {...props} className="input" value={form.postcode} onChange={set('postcode')} onBlur={blur('postcode')} autoComplete="postal-code" />
                    )}
                  </Field>

                  <Field id="country" label="Country" error={errors.country}>
                    {(props) => (
                      <select {...props} className="select" value={form.country} onChange={set('country')} onBlur={blur('country')} autoComplete="country-name">
                        <option>Nigeria</option>
                        <option>Ghana</option>
                        <option>Kenya</option>
                        <option>United Kingdom</option>
                        <option>United States</option>
                        <option>Germany</option>
                      </select>
                    )}
                  </Field>
                </div>
              </div>
            )}

            
            {step === 1 && (
              <div className="card stack" style={{ gap: 'var(--space-4)' }}>
                <h2 style={{ fontSize: 'var(--text-xl)' }}>Delivery method</h2>

                <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
                  <legend className="sr-only">Choose a delivery method</legend>
                  <div className="stack" style={{ gap: 'var(--space-3)' }}>
                    {SHIPPING_METHODS.map((m) => {
                      const free = m.id === 'standard' && totals.subtotal >= 250
                      return (
                        <label
                          key={m.id}
                          className="card row"
                          style={{
                            cursor: 'pointer',
                            padding: 'var(--space-4)',
                            borderColor: shippingMethod === m.id ? 'var(--color-foreground)' : undefined,
                            borderWidth: shippingMethod === m.id ? 2 : 1,
                          }}
                        >
                          <input
                            type="radio"
                            name="shipping"
                            value={m.id}
                            checked={shippingMethod === m.id}
                            onChange={() => setShippingMethod(m.id)}
                            style={{ width: 18, height: 18, accentColor: 'var(--color-accent)' }}
                          />
                          <div>
                            <div className="text-sm" style={{ fontWeight: 600 }}>
                              {m.label}
                            </div>
                            <div className="text-xs muted">{m.detail}</div>
                          </div>
                          <strong className="text-sm" style={{ marginLeft: 'auto' }}>
                            {free || m.price === 0 ? 'Free' : formatPrice(m.price)}
                          </strong>
                        </label>
                      )
                    })}
                  </div>
                </fieldset>

                <div className="card" style={{ background: 'var(--color-surface-sunken)' }}>
                  <p className="text-sm" style={{ fontWeight: 600, marginBottom: 4 }}>
                    Delivering to
                  </p>
                  <p className="text-sm muted">
                    {form.name}
                    <br />
                    {form.address}
                    <br />
                    {form.city}
                    {form.state && `, ${form.state}`} {form.postcode}
                    <br />
                    {form.country}
                  </p>
                  <button type="button" className="link-underline text-sm" style={{ marginTop: 'var(--space-3)', background: 'none', border: 0, padding: 0 }} onClick={() => setStep(0)}>
                    Edit address
                  </button>
                </div>
              </div>
            )}
                       
            {step === 2 && (
              <div className="card stack" style={{ gap: 'var(--space-5)' }}>
                <div className="row-between">
                  <h2 style={{ fontSize: 'var(--text-xl)' }}>Payment</h2>
                  <span className="badge">
                    <Icon name="lock" size={12} /> Demo only
                  </span>
                </div>

                <div className="demo-hint">
                  This is a portfolio demo — no payment is processed and no card details are stored or sent
                  anywhere. Use any 16 digits, e.g. <strong>4242 4242 4242 4242</strong>.
                </div>

                <div className="form-grid">
                  <Field id="cardName" label="Name on card" error={errors.cardName} className="col-span-2">
                    {(props) => (
                      <input {...props} className="input" value={form.cardName} onChange={set('cardName')} onBlur={blur('cardName')} autoComplete="cc-name" />
                    )}
                  </Field>

                  <Field id="cardNumber" label="Card number" error={errors.cardNumber} className="col-span-2">
                    {(props) => (
                      <input
                        {...props}
                        className="input"
                        inputMode="numeric"
                        placeholder="4242 4242 4242 4242"
                        maxLength={19}
                        value={form.cardNumber}
                        onChange={(e) => {
                          const digits = e.target.value.replace(/\D/g, '').slice(0, 16)
                          const spaced = digits.replace(/(.{4})/g, '$1 ').trim()
                          set('cardNumber')({ target: { value: spaced, type: 'text' } })
                        }}
                        onBlur={blur('cardNumber')}
                        autoComplete="cc-number"
                      />
                    )}
                  </Field>

                  <Field id="expiry" label="Expiry date" error={errors.expiry} hint="MM/YY">
                    {(props) => (
                      <input
                        {...props}
                        className="input"
                        inputMode="numeric"
                        placeholder="09/29"
                        maxLength={5}
                        value={form.expiry}
                        onChange={(e) => {
                          const digits = e.target.value.replace(/\D/g, '').slice(0, 4)
                          const formatted = digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits
                          set('expiry')({ target: { value: formatted, type: 'text' } })
                        }}
                        onBlur={blur('expiry')}
                        autoComplete="cc-exp"
                      />
                    )}
                  </Field>

                  <Field id="cvc" label="Security code" error={errors.cvc} hint="3 digits on the back">
                    {(props) => (
                      <input
                        {...props}
                        className="input"
                        inputMode="numeric"
                        maxLength={4}
                        value={form.cvc}
                        onChange={(e) => set('cvc')({ target: { value: e.target.value.replace(/\D/g, ''), type: 'text' } })}
                        onBlur={blur('cvc')}
                        autoComplete="cc-csc"
                      />
                    )}
                  </Field>
                </div>

                <label className="checkbox-row">
                  <input type="checkbox" checked={form.saveDetails} onChange={set('saveDetails')} />
                  <span className="text-sm">Save these details for next time</span>
                </label>
              </div>
            )}

            <div className="row" style={{ marginTop: 'var(--space-5)', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
              {step > 0 && (
                <button type="button" className="btn btn-outline btn-lg" onClick={() => setStep(step - 1)}>
                  <Icon name="chevronLeft" size={16} />
                  Back
                </button>
              )}
                            <button type="submit" className="btn btn-primary btn-lg" style={{ flex: 1, minWidth: 200 }} disabled={busy}>
                {busy ? 'Placing order…' : step === 2 ? `Pay ${formatPrice(orderTotal)}` : 'Continue'}
                {step < 2 && !busy && <Icon name="arrowRight" size={17} />}
              </button>
            </div>
          </form>

         
          <aside className="summary" aria-label="Order summary">
            <div className="card stack">
              <h2 style={{ fontSize: 'var(--text-lg)' }}>Order summary</h2>

              <ul className="stack" style={{ gap: 'var(--space-3)' }}>
                {cart.map((line) => (
                  <li className="row" key={line.key} style={{ gap: 'var(--space-3)', alignItems: 'flex-start' }}>
                    <span className="line-thumb" style={{ width: 52, height: 52 }}>
                      <img src={line.image} alt="" width="52" height="52" />
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="text-sm" style={{ fontWeight: 500 }}>
                        {line.name}
                      </div>
                      <div className="text-xs muted">
                        {line.variant ? `${line.variant} · ` : ''}Qty {line.quantity}
                      </div>
                    </div>
                    <span className="text-sm" style={{ fontWeight: 600 }}>
                      {formatPrice(line.price * line.quantity)}
                    </span>
                  </li>
                ))}
              </ul>

              <hr className="divider" />

              <div className="summary-row">
                <span className="muted">Subtotal</span>
                <span>{formatPrice(totals.subtotal)}</span>
              </div>
              <div className="summary-row">
                <span className="muted">Delivery ({method.label.split(' ')[0]})</span>
                <span>{shippingCost === 0 ? 'Free' : formatPrice(shippingCost)}</span>
              </div>
              <div className="summary-row">
                <span className="muted">Tax</span>
                <span>{formatPrice(totals.tax)}</span>
              </div>
              <div className="summary-total">
                <span>Total</span>
                <span>{formatPrice(orderTotal)}</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}