import { useState, useMemo, useEffect, useRef } from 'react'
import Icon from '../../components/Icon'
import { Field, EmptyState } from '../../components/ui'
import { categories, brands } from '../../data/products'
import { useStore, formatPrice } from '../../context/StoreContext'

const blank = {
  id: '',
  slug: '',
  name: '',
  brand: 'Aurora',
  category: 'audio',
  price: '',
  compareAt: '',
  stock: '',
  image: '/products/aurora-anc-headphones.svg',
  rating: 4.5,
  reviewCount: 0,
  tags: [],
  short: '',
  description: '',
  highlights: [],
  specs: {},
  variants: null,
  reviews: [],
}

const slugify = (s) =>
  s.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-')

function ProductForm({ initial, onSave, onClose }) {
  const [form, setForm] = useState(initial)
  const [errors, setErrors] = useState({})
  const panelRef = useRef(null)
  const firstFieldRef = useRef(null)

  useEffect(() => {
    firstFieldRef.current?.focus()
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const submit = (e) => {
    e.preventDefault()
    const found = {}
    if (!form.name.trim()) found.name = 'Enter a product name'
    if (form.price === '' || Number(form.price) <= 0) found.price = 'Enter a price above zero'
    if (form.stock === '' || Number(form.stock) < 0) found.stock = 'Enter a stock level of zero or more'
    if (!form.short.trim()) found.short = 'Enter a short description'

    setErrors(found)
    if (Object.keys(found).length) return

    onSave({
      ...form,
      id: form.id || `p-${Date.now()}`,
      slug: form.slug || slugify(form.name),
      price: Number(form.price),
      compareAt: form.compareAt === '' ? null : Number(form.compareAt),
      stock: Number(form.stock),
      rating: Number(form.rating) || 4.5,
      description: form.description || form.short,
      tags: Array.isArray(form.tags) ? form.tags : [],
      highlights: Array.isArray(form.highlights) ? form.highlights : [],
      specs: form.specs ?? {},
      reviews: form.reviews ?? [],
    })
    onClose()
  }

  return (
    <>
      <div className="overlay" onClick={onClose} aria-hidden="true" />
      <aside className="drawer" role="dialog" aria-modal="true" aria-labelledby="product-form-title" ref={panelRef}>
        <div className="drawer-head">
          <h2 id="product-form-title" style={{ fontSize: 'var(--text-lg)' }}>
            {initial.id ? 'Edit product' : 'New product'}
          </h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close form">
            <Icon name="x" size={20} />
          </button>
        </div>

        <form onSubmit={submit} noValidate style={{ display: 'contents' }}>
          <div className="drawer-body stack" style={{ gap: 'var(--space-4)' }}>
            <Field id="p-name" label="Product name" error={errors.name}>
              {(props) => <input {...props} ref={firstFieldRef} className="input" value={form.name} onChange={set('name')} />}
            </Field>

            <Field id="p-short" label="Short description" error={errors.short}>
              {(props) => <textarea {...props} className="textarea" style={{ minHeight: 80 }} value={form.short} onChange={set('short')} />}
            </Field>

            <div className="form-grid">
              <Field id="p-brand" label="Brand">
                {(props) => (
                  <select {...props} className="select" value={form.brand} onChange={set('brand')}>
                    {brands.map((b) => (
                      <option key={b}>{b}</option>
                    ))}
                  </select>
                )}
              </Field>

              <Field id="p-category" label="Category">
                {(props) => (
                  <select {...props} className="select" value={form.category} onChange={set('category')}>
                    {categories.map((c) => (
                      <option value={c.id} key={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                )}
              </Field>

              <Field id="p-price" label="Price (USD)" error={errors.price}>
                {(props) => <input {...props} type="number" min="0" step="1" className="input" value={form.price} onChange={set('price')} />}
              </Field>

              <Field id="p-compare" label="Compare-at price" hint="Optional">
                {(props) => <input {...props} type="number" min="0" step="1" className="input" value={form.compareAt ?? ''} onChange={set('compareAt')} />}
              </Field>

              <Field id="p-stock" label="Stock" error={errors.stock}>
                {(props) => <input {...props} type="number" min="0" step="1" className="input" value={form.stock} onChange={set('stock')} />}
              </Field>

              <Field id="p-rating" label="Rating" hint="0–5">
                {(props) => <input {...props} type="number" min="0" max="5" step="0.1" className="input" value={form.rating} onChange={set('rating')} />}
              </Field>
            </div>

            <Field id="p-image" label="Image path" hint="Files live in public/products">
              {(props) => <input {...props} className="input" value={form.image} onChange={set('image')} />}
            </Field>

            <div className="line-thumb" style={{ width: 96, height: 96 }}>
              <img src={form.image} alt="" width="96" height="96" />
            </div>
          </div>

          <div className="drawer-foot">
            <button type="submit" className="btn btn-primary btn-lg btn-block">
              {initial.id ? 'Save changes' : 'Create product'}
            </button>
            <button type="button" className="btn btn-ghost btn-block" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </aside>
    </>
  )
}

export default function AdminProducts() {
  const { catalog, saveProduct, deleteProduct } = useStore()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [editing, setEditing] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return catalog.filter((p) => {
      if (category !== 'all' && p.category !== category) return false
      if (!needle) return true
      return `${p.name} ${p.brand} ${p.slug}`.toLowerCase().includes(needle)
    })
  }, [catalog, query, category])

  return (
    <div className="stack" style={{ gap: 'var(--space-5)' }}>
      <div className="toolbar" style={{ marginBottom: 0 }}>
        <div className="row" style={{ flexWrap: 'wrap' }}>
          <div>
            <label htmlFor="admin-product-search" className="sr-only">
              Search products
            </label>
            <input
              id="admin-product-search"
              className="input"
              type="search"
              placeholder="Search products"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{ minHeight: 40, width: 240, fontSize: 'var(--text-sm)' }}
            />
          </div>

          <div>
            <label htmlFor="admin-category" className="sr-only">
              Filter by category
            </label>
            <select id="admin-category" className="select" value={category} onChange={(e) => setCategory(e.target.value)} style={{ minHeight: 40 }}>
              <option value="all">All categories</option>
              {categories.map((c) => (
                <option value={c.id} key={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button type="button" className="btn btn-primary" onClick={() => setEditing(blank)}>
          <Icon name="plus" size={16} />
          Add product
        </button>
      </div>

      <p className="text-sm muted" role="status" aria-live="polite">
        {rows.length} product{rows.length === 1 ? '' : 's'}
      </p>

      {rows.length === 0 ? (
        <EmptyState icon="package" title="No products match" message="Try a different search term or category." />
      ) : (
        <div className="table-wrap">
          <table className="table">
            <caption className="sr-only">Product catalogue</caption>
            <thead>
              <tr>
                <th scope="col">Product</th>
                <th scope="col">Category</th>
                <th scope="col" style={{ textAlign: 'right' }}>Price</th>
                <th scope="col" style={{ textAlign: 'right' }}>Stock</th>
                <th scope="col" style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div className="row" style={{ gap: 'var(--space-3)' }}>
                      <span className="table-thumb">
                        <img src={p.image} alt="" width="44" height="44" />
                      </span>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 500 }}>{p.name}</div>
                        <div className="text-xs muted">{p.brand}</div>
                      </div>
                    </div>
                  </td>
                  <td className="text-sm muted" style={{ textTransform: 'capitalize' }}>
                    {p.category}
                  </td>
                  <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                    {formatPrice(p.price)}
                    {p.compareAt && <div className="text-xs muted" style={{ textDecoration: 'line-through' }}>{formatPrice(p.compareAt)}</div>}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {p.stock === 0 ? (
                      <span className="badge badge-danger">Out</span>
                    ) : p.stock <= 10 ? (
                      <span className="badge badge-warning">{p.stock}</span>
                    ) : (
                      <span style={{ fontVariantNumeric: 'tabular-nums' }}>{p.stock}</span>
                    )}
                  </td>
                  <td>
                    {confirmDelete === p.id ? (
                      <div className="row" style={{ justifyContent: 'flex-end' }}>
                        <span className="text-xs muted">Delete?</span>
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          onClick={() => {
                            deleteProduct(p.id)
                            setConfirmDelete(null)
                          }}
                        >
                          Yes
                        </button>
                        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setConfirmDelete(null)}>
                          No
                        </button>
                      </div>
                    ) : (
                      <div className="row" style={{ justifyContent: 'flex-end' }}>
                        <button type="button" className="btn btn-outline btn-sm" onClick={() => setEditing(p)}>
                          <Icon name="edit" size={14} />
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          onClick={() => setConfirmDelete(p.id)}
                          aria-label={`Delete ${p.name}`}
                        >
                          <Icon name="trash" size={14} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && <ProductForm initial={editing} onSave={saveProduct} onClose={() => setEditing(null)} />}
    </div>
  )
}