import 'dotenv/config'
import express from 'express'
import cors from 'cors'

import { connectDB } from './config/db.js'
import { notFound, errorHandler } from './middleware/error.js'

import productRoutes from './routes/productRoutes.js'
import authRoutes from './routes/authRoutes.js'
import orderRoutes from './routes/orderRoutes.js'

const app = express()

/* Only the frontend origins listed in .env may call this API from a browser. */
const origins = (process.env.CLIENT_ORIGIN ?? 'http://localhost:5173').split(',').map((o) => o.trim())
app.use(cors({ origin: origins, credentials: true }))

/* Parses JSON request bodies into req.body. Without it, req.body is undefined. */
app.use(express.json({ limit: '1mb' }))

/* Somewhere for a host's health check — and for you to confirm it's alive. */
app.get('/api/health', (_req, res) => res.json({ ok: true, uptime: process.uptime() }))

app.use('/api/products', productRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/orders', orderRoutes)

/* Order matters: these two are last, after every real route. */
app.use(notFound)
app.use(errorHandler)

const PORT = process.env.PORT || 5000

/* Connect first, listen second — an API that is up but database-less fails
   on every request instead of refusing to start once, loudly. */
connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`))
  })
  .catch((err) => {
    console.error('Failed to start:', err.message)
    process.exit(1)
  })