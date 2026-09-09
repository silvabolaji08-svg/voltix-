import Product from '../models/Product.js'
import { ApiError, asyncHandler } from '../middleware/error.js'

const SORTS = {
  featured: { rating: -1, reviewCount: -1 },
  'price-asc': { price: 1 },
  'price-desc': { price: -1 },
  'rating-desc': { rating: -1 },
  newest: { createdAt: -1 },
  'name-asc': { name: 1 },
}

/* GET /api/products
   Filtering happens in the database, not in the browser. The whole point of
   moving to an API is that the client stops downloading 26 products to show 4. */
export const listProducts = asyncHandler(async (req, res) => {
  const { q, category, brand, maxPrice, minRating, inStock, sale, sort, page = 1, limit = 24 } = req.query

  const filter = {}
  if (category && category !== 'all') filter.category = category
  if (brand) filter.brand = { $in: brand.split(',') }
  if (maxPrice) filter.price = { $lte: Number(maxPrice) }
  if (minRating) filter.rating = { $gte: Number(minRating) }
  if (inStock === '1') filter.stock = { $gt: 0 }
  if (sale === '1') filter.compareAt = { $ne: null }
  if (q) filter.$text = { $search: q }

  const perPage = Math.min(Number(limit) || 24, 100)
  const skip = (Math.max(Number(page) || 1, 1) - 1) * perPage

  /* Two queries in parallel — the page of results and the total count.
     Sequential awaits here would double the response time for no reason. */
  const [items, total] = await Promise.all([
    Product.find(filter)
      .sort(SORTS[sort] ?? SORTS.featured)
      .skip(skip)
      .limit(perPage),
    Product.countDocuments(filter),
  ])

  res.json({ items, total, page: Number(page), pages: Math.ceil(total / perPage) })
})

/* GET /api/products/meta — everything the Shop filter sidebar needs to render
   itself, in one request instead of deriving it from a full product download. */
export const productMeta = asyncHandler(async (_req, res) => {
  const [brands, categories, bounds] = await Promise.all([
    Product.distinct('brand'),
    Product.distinct('category'),
    Product.aggregate([{ $group: { _id: null, min: { $min: '$price' }, max: { $max: '$price' } } }]),
  ])

  res.json({
    brands: brands.sort(),
    categories: categories.sort(),
    priceBounds: {
      min: Math.floor(bounds[0]?.min ?? 0),
      max: Math.ceil(bounds[0]?.max ?? 0),
    },
  })
})

/* GET /api/products/:slug */
export const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug })
  if (!product) throw new ApiError(404, 'Product not found')

  const related = await Product.find({
    category: product.category,
    _id: { $ne: product._id },
  }).limit(4)

  res.json({ product, related })
})

/* POST /api/products — admin */
export const createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create(req.body)
  res.status(201).json(product)
})

/* PUT /api/products/:id — admin */
export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  })
  if (!product) throw new ApiError(404, 'Product not found')
  res.json(product)
})

/* DELETE /api/products/:id — admin */
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id)
  if (!product) throw new ApiError(404, 'Product not found')
  res.json({ id: req.params.id, deleted: true })
})