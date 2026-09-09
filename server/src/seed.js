import 'dotenv/config'
import mongoose from 'mongoose'

import { connectDB } from './config/db.js'
import Product from './models/Product.js'
import User from './models/User.js'
import Order from './models/Order.js'

/* Imported straight from the frontend — one source of truth for the demo
   catalogue, so the seed can never drift from what the app was built against. */
import { products } from '../../src/data/products.js'
import { demoUsers, seedOrders } from '../../src/data/seed.js'

async function importData() {
  await Product.deleteMany()
  await User.deleteMany()
  await Order.deleteMany()

  /* Strip the hand-written ids — Mongo mints real ObjectIds. */
  const created = await Product.insertMany(
    products.map(({ id: _id, ...rest }) => ({
      ...rest,
      specs: rest.specs ?? {},
      reviews: (rest.reviews ?? []).map(({ id: _rid, ...r }) => r),
    }))
  )
  console.log(`Inserted ${created.length} products`)

  /* create(), not insertMany() — insertMany skips the pre('save') hook, so
     passwords would go in as plaintext. This is a real and quiet trap. */
  const users = []
  for (const u of demoUsers) {
    users.push(await User.create({ name: u.name, email: u.email, password: u.password, role: u.role }))
  }
  console.log(`Inserted ${users.length} users`)

  const bySlug = new Map(created.map((p) => [p.slug, p]))
  const byEmail = new Map(users.map((u) => [u.email, u]))

  const orders = seedOrders
    .map((o) => {
      const lines = o.items
        .map((item) => {
          const product = bySlug.get(item.slug)
          if (!product) return null
          return {
            productId: product._id.toString(),
            slug: product.slug,
            name: product.name,
            image: product.image,
            price: item.price,
            quantity: item.quantity,
            variant: item.variant ?? null,
          }
        })
        .filter(Boolean)

      if (lines.length === 0) return null

      return {
        reference: o.id,
        user: byEmail.get(o.customer.email)?._id ?? null,
        customer: o.customer,
        items: lines,
        shippingAddress: o.shippingAddress,
        shippingMethod: o.shippingMethod ?? 'Standard',
        payment: o.payment,
        subtotal: o.subtotal,
        shipping: o.shipping,
        tax: o.tax,
        total: o.total,
        status: o.status,
        createdAt: new Date(o.date),
      }
    })
    .filter(Boolean)

  await Order.insertMany(orders)
  console.log(`Inserted ${orders.length} orders`)
}

async function destroyData() {
  await Product.deleteMany()
  await User.deleteMany()
  await Order.deleteMany()
  console.log('All collections emptied')
}

try {
  await connectDB()
  if (process.argv.includes('--destroy')) await destroyData()
  else await importData()
  await mongoose.disconnect()
  process.exit(0)
} catch (err) {
  console.error(err)
  process.exit(1)
}