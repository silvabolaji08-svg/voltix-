import { useMemo, useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import Icon from '../components/Icon'
import ProductCard from '../components/ProductCard'
import { EmptyState, Breadcrumbs } from '../components/ui'
import { categories, brands, priceBounds } from '../data/products'
import { useStore, formatPrice } from '../context/StoreContext'
import { useGridStagger } from '../motion/hooks'

const SORTS = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'rating', label: 'Highest rated' },
  { value: 'newest', label: 'Newest first' },
  { value: 'name', label: 'Name A–Z' },
]

const bounds = priceBounds()

export default function Shop() {
  const { catalog } = useStore()
  const [params, setParams] = useSearchParams()
  const [filtersOpen, setFiltersOpen] = useState(false)

  const query = params.get('q') ?? ''
  const activeCategories = params.getAll('category')
  const activeBrands = params.getAll('brand')
  const maxPrice = Number(params.get('maxPrice') ?? bounds.max)
  const minRating = Number(params.get('rating') ?? 0)
  const inStockOnly = params.get('inStock') === '1'
  const saleOnly = params.get('sale') === '1'
  const sort = params.get('sort') ?? 'featured'

  /* Announce result counts to screen readers after a filter change. */
  const [announcement, setAnnouncement] = useState('')

  const update = (mutate) => {
    const next = new URLSearchParams(params)
    mutate(next)
    setParams(next, { replace: true })
  }

  const toggleMulti = (key, value) => {
    update((next) => {
      const current = next.getAll(key)
      next.delete(key)
      const updated = current.includes(value) ? current.filter((v) => v !== value) : [...current, value]
      updated.forEach((v) => next.append(key, v))
    })
  }

  const setSingle = (key, value, defaultValue) => {
    update((next) => {
      if (value === defaultValue || value === '' || value == null) next.delete(key)
      else next.set(key, String(value))
    })
  }

  const clearAll = () => setParams(new URLSearchParams(), { replace: true })

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase()

    let list = catalog.filter((p) => {
      if (needle) {
        const haystack = `${p.name} ${p.brand} ${p.short} ${p.category} ${p.tags.join(' ')}`.toLowerCase()
        if (!haystack.includes(needle)) return false
      }
      if (activeCategories.length && !activeCategories.includes(p.category)) return false
      if (activeBrands.length && !activeBrands.includes(p.brand)) return false
      if (p.price > maxPrice) return false
      if (minRating && p.rating < minRating) return false
      if (inStockOnly && p.stock === 0) return false
      if (saleOnly && !p.compareAt) return false
      return true
    })

    const sorters = {
      'price-asc': (a, b) => a.price - b.price,
      'price-desc': (a, b) => b.price - a.price,
      rating: (a, b) => b.rating - a.rating,
      newest: (a, b) => Number(b.tags.includes('new')) - Number(a.tags.includes('new')),
      name: (a, b) => a.name.localeCompare(b.name),
      featured: (a, b) => Number(b.tags.includes('bestseller')) - Number(a.tags.includes('bestseller')),
    }

    return [...list].sort(sorters[sort] ?? sorters.featured)
  }, [catalog, query, activeCategories, activeBrands, maxPrice, minRating, inStockOnly, saleOnly, sort])

  useEffect(() => {
    setAnnouncement(`${results.length} product${results.length === 1 ? '' : 's'} found`)
  }, [results.length])

  /* Re-runs whenever the result set changes, so filtering replays the wave
     rather than swapping the grid instantly. Keyed on ids, not length —
     a re-sort is a different set even at the same count. */
  const gridRef = useGridStagger([results.map((p) => p.id).join(',')], { each: 0.04 })

  const countFor = (key, value) =>
    catalog.filter((p) => (key === 'category' ? p.category === value : p.brand === value)).length

  const activeChips = [
    ...activeCategories.map((c) => ({
      key: `category-${c}`,
      label: categories.find((x) => x.id === c)?.name ?? c,
      remove: () => toggleMulti('category', c),
    })),
    ...activeBrands.map((b) => ({ key: `brand-${b}`, label: b, remove: () => toggleMulti('brand', b) })),
    ...(maxPrice < bounds.max
      ? [{ key: 'price', label: `Under ${formatPrice(maxPrice)}`, remove: () => setSingle('maxPrice', bounds.max, bounds.max) }]
      : []),
    ...(minRating ? [{ key: 'rating', label: `${minRating}★ & up`, remove: () => setSingle('rating', 0, 0) }] : []),
    ...(inStockOnly ? [{ key: 'stock', label: 'In stock', remove: () => setSingle('inStock', '', '') }] : []),
    ...(saleOnly ? [{ key: 'sale', label: 'On sale', remove: () => setSingle('sale', '', '') }] : []),
    ...(query ? [{ key: 'q', label: `“${query}”`, remove: () => setSingle('q', '', '') }] : []),
  ]

  return (
        <div className="section-tight" style={{ paddingTop: 'var(--space-5)' }}>
        <div className="shop-layout">
          {/* ------------------------------------------------- filters */}
          <aside className={`filter-panel ${filtersOpen ? 'is-open' : ''}`} id="filters" aria-label="Product filters">
            <div className="row-between">
              <h2 style={{ fontSize: 'var(--text-base)' }}>Filters</h2>
              {activeChips.length > 0 && (
                <button type="button" className="btn btn-ghost btn-sm" onClick={clearAll}>
                  Clear all
                </button>
              )}
            </div>

            <div className="filter-group">
              <h4>Category</h4>
              <div className="filter-options">
                {categories.map((c) => (
                  <label className="filter-option" key={c.id}>
                    <input
                      type="checkbox"
                      checked={activeCategories.includes(c.id)}
                      onChange={() => toggleMulti('category', c.id)}
                    />
                    {c.name}
                    <span className="count">{countFor('category', c.id)}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="filter-group">
              <h4>Brand</h4>
              <div className="filter-options" style={{ maxHeight: 220, overflowY: 'auto' }}>
                {brands.map((b) => (
                  <label className="filter-option" key={b}>
                    <input type="checkbox" checked={activeBrands.includes(b)} onChange={() => toggleMulti('brand', b)} />
                    {b}
                    <span className="count">{countFor('brand', b)}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="filter-group">
              <h4>
                <label htmlFor="price-range">Max price</label>
              </h4>
              <input
                id="price-range"
                type="range"
                min={bounds.min}
                max={bounds.max}
                step={10}
                value={maxPrice}
                onChange={(e) => setSingle('maxPrice', e.target.value, bounds.max)}
                style={{ width: '100%', accentColor: 'var(--color-accent)' }}
              />
              <div className="range-row text-xs muted" style={{ justifyContent: 'space-between' }}>
                <span>{formatPrice(bounds.min)}</span>
                <span style={{ color: 'var(--color-foreground)', fontWeight: 600 }}>{formatPrice(maxPrice)}</span>
              </div>
            </div>

            <div className="filter-group">
              <h4>Rating</h4>
              <div className="filter-options">
                {[4.5, 4, 3.5, 0].map((r) => (
                  <label className="filter-option" key={r}>
                    <input type="radio" name="rating" checked={minRating === r} onChange={() => setSingle('rating', r, 0)} />
                    {r === 0 ? 'Any rating' : `${r}★ and up`}
                  </label>
                ))}
              </div>
            </div>

            <div className="filter-group">
              <h4>Availability</h4>
              <div className="filter-options">
                <label className="filter-option">
                  <input type="checkbox" checked={inStockOnly} onChange={() => setSingle('inStock', inStockOnly ? '' : '1', '')} />
                  In stock only
                </label>
                <label className="filter-option">
                  <input type="checkbox" checked={saleOnly} onChange={() => setSingle('sale', saleOnly ? '' : '1', '')} />
                  On sale
                </label>
              </div>
            </div>
          </aside>

          {/* ------------------------------------------------- results */}
          <div>
            <div className="toolbar">
              <button
                type="button"
                className="btn btn-outline btn-sm filter-toggle"
                onClick={() => setFiltersOpen((o) => !o)}
                aria-expanded={filtersOpen}
                aria-controls="filters"
              >
                <Icon name="filter" size={15} />
                {filtersOpen ? 'Hide filters' : 'Filters'}
                {activeChips.length > 0 && <span className="badge badge-accent">{activeChips.length}</span>}
              </button>

              <div className="row" style={{ marginLeft: 'auto' }}>
                <label htmlFor="sort" className="text-sm muted">
                  Sort
                </label>
                <select id="sort" className="select" value={sort} onChange={(e) => setSingle('sort', e.target.value, 'featured')}>
                  {SORTS.map((s) => (
                    <option value={s.value} key={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {activeChips.length > 0 && (
              <div className="chip-row">
                {activeChips.map((chip) => (
                  <button type="button" className="chip" key={chip.key} onClick={chip.remove}>
                    {chip.label}
                    <Icon name="x" size={13} />
                    <span className="sr-only">Remove filter</span>
                  </button>
                ))}
              </div>
            )}

            {results.length === 0 ? (
              <EmptyState
                icon="search"
                title="No products match those filters"
                message="Try widening the price range or clearing a filter or two."
                action={
                  <button type="button" className="btn btn-primary" onClick={clearAll}>
                    Clear all filters
                  </button>
                }
              />
            ) : (
              <div className="product-grid cols-3" ref={gridRef}>
                {results.map((p) => (
                  <ProductCard product={p} key={p.id} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
  )
}