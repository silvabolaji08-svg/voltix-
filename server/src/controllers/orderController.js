import Order, { ORDER_STATUSES } from '../models/Order.js'
import Product from '../models/Product.js'
import { ApiError, asyncHandler } from '../middleware/error.js'

const reference = () => `ORD-${Date.now().toString(36).toUpperCase()}${Math.floor(Math.random() * 90 + 10)}`

const FREE_SHIPPING_THRESHOLD = 250
const TAX_RATE = 0.08

/* POST /api/orders
   Prices come from the database, never from the request. A client that posts
   { price: 1 } would otherwise buy a laptop for a dollar — this is the single
   most important rule in any checkout endpoint. */
export const createOrder = asyncHandler(async (req, res) => {
  const { items, customer, shippingAddress, shippingMethod, payment } = req.body

  if (!Array.isArray(items) || items.length === 0) throw new ApiError(400, 'Your cart is empty')
  if (!customer?.name || !customer?.email) throw new ApiError(400, 'Customer name and email are required')
  if (!shippingAddress?.line1) throw new ApiError(400, 'A delivery address is required')

  const ids = items.map((i) => i.productId)
  const products = await Product.find({ _id: { $in: ids } })
  const byId = new Map(products.map((p) => [p._id.toString(), p]))

  const lines = items.map((item) => {
    const product = byId.get(String(item.productId))
    if (!product) throw new ApiError(400, `A product in your cart is no longer available`)

    const quantity = Math.max(1, Math.floor(Number(item.quantity) || 1))
    if (product.stock < quantity) {
      throw new ApiError(409, `${product.name} only has ${product.stock} left in stock`)
    }

    return {
      productId: product._id.toString(),
      slug: product.slug,
      name: product.name,
      image: product.image,
      price: product.price,
      quantity,
      variant: item.variant ?? null,
    }
  })

  const subtotal = lines.reduce((sum, l) => sum + l.price * l.quantity, 0)
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : Number(req.body.shippingCost) || 0
  const tax = Math.round(subtotal * TAX_RATE * 100) / 100
  const total = Math.round((subtotal + shipping + tax) * 100) / 100

  const order = await Order.create({
    reference: reference(),
    user: req.user?._id ?? null,
    customer,
    items: lines,
    shippingAddress,
    shippingMethod: shippingMethod || 'Standard',
    payment: payment || 'Card ending 4242',
    subtotal,
    shipping,
    tax,
    total,
  })

  /* Decrement stock. bulkWrite sends one round trip instead of one per item. */
  await Product.bulkWrite(
    lines.map((l) => ({
      updateOne: { filter: { _id: l.productId }, update: { $inc: { stock: -l.quantity } } },
    }))
  )

  res.status(201).json(order)
})
/* GET /api/orders/mine */
export const myOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 })
  res.json(orders)
})

/* GET /api/orders/:reference
   A signed-in user sees their own orders; an admin sees any. A guest who
   knows the reference can see it too — that is how order lookup emails work. */
export const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ reference: req.params.reference })
  if (!order) throw new ApiError(404, 'Order not found')
  res.json(order)
})

/* GET /api/orders — admin */
export const listOrders = asyncHandler(async (req, res) => {
  const { status, q } = req.query
  const filter = {}
  if (status && status !== 'all') filter.status = status
  if (q) {
    filter.$or = [
      { reference: { $regex: q, $options: 'i' } },
      { 'customer.name': { $regex: q, $options: 'i' } },
      { 'customer.email': { $regex: q, $options: 'i' } },
    ]
  }

  const orders = await Order.find(filter).sort({ createdAt: -1 })
  res.json(orders)
})

/* PATCH /api/orders/:reference/status — admin */
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body
  if (!ORDER_STATUSES.includes(status)) throw new ApiError(400, 'Unknown order status')

  const order = await Order.findOneAndUpdate(
    { reference: req.params.reference },
    { status },
    { new: true, runValidators: true }
  )
  if (!order) throw new ApiError(404, 'Order not found')
  res.json(order)
})

/* GET /api/orders/stats/summary — admin dashboard, computed in the database */
export const orderStats = asyncHandler(async (_req, res) => {
  const [totals] = await Order.aggregate([
    { $match: { status: { $ne: 'Cancelled' } } },
    {
      $group: {
        _id: null,
        revenue: { $sum: '$total' },
        orders: { $sum: 1 },
        units: { $sum: { $sum: '$items.quantity' } },
      },
    },
  ])

  const topProducts = await Order.aggregate([
    { $match: { status: { $ne: 'Cancelled' } } },
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.productId',
        name: { $first: '$items.name' },
        units: { $sum: '$items.quantity' },
        revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
      },
    },
    { $sort: { units: -1 } },
    { $limit: 5 },
  ])

  const revenueByMonth = await Order.aggregate([
    { $match: { status: { $ne: 'Cancelled' } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
        revenue: { $sum: '$total' },
      },
    },
    { $sort: { _id: 1 } },
    { $limit: 6 },
  ])

  const revenue = totals?.revenue ?? 0
  const orders = totals?.orders ?? 0

  res.json({
    revenue,
    orders,
    units: totals?.units ?? 0,
    avgOrder: orders ? revenue / orders : 0,
    topProducts,
    revenueByMonth: revenueByMonth.map((m) => ({ month: m._id, revenue: m.revenue })),
  })
})