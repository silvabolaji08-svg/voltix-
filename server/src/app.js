import 'dotenv/config'
import express from 'express'
import cors from 'cors'

import { connectDB } from './config/db.js'
import { notFound, errorHandler, asyncHandler } from './middleware/error.js'

import productRoutes from './routes/productRoutes.js'
import authRoutes from './routes/authRoutes.js'
import orderRoutes from './routes/orderRoutes.js'

const app = express()

/* Only the frontend origins listed in .env may call this API from a browser. */
const origins = (process.env.CLIENT_ORIGIN ?? 'http://localhost:5173').split(',').map((o) => o.trim())
app.use(cors({ origin: origins, credentials: true }))

/* Parses JSON request bodies into req.body. Without it, req.body is undefined. */
app.use(express.json({ limit: '1mb' }))

/* Health check needs no database, so it answers even if Mongo is unreachable —
   which is what makes it useful for telling "server down" from "db down". */
app.get('/api/health', (_req, res) => res.json({ ok: true, uptime: process.uptime() }))

/**
 * Make sure the database is connected before any route that needs it.
 *
 * On a long-running server this resolves instantly after the first request.
 * On serverless there is no startup phase, so this is the only place a
 * connection can be established — and connectDB caches it so warm
 * invocations reuse the existing one instead of opening another.
 */
app.use(
  asyncHandler(async (_req, _res, next) => {
    await connectDB()
    next()
  })
)

app.use('/api/products', productRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/orders', orderRoutes)

/* Order matters: these two are last, after every real route. */
app.use(notFound)
app.use(errorHandler)

export default app