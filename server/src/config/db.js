import mongoose from 'mongoose'

/**
 * Connects to MongoDB. Called once, before the server starts listening —
 * an API that is up but can't reach its database is worse than one that
 * refused to start, because it fails on every request instead of loudly once.
 */
export async function connectDB() {
  const uri = process.env.MONGO_URI
  if (!uri) throw new Error('MONGO_URI is missing. Copy .env.example to .env and fill it in.')

  mongoose.set('strictQuery', true)

  const conn = await mongoose.connect(uri)
  console.log(`MongoDB connected: ${conn.connection.host}/${conn.connection.name}`)
  return conn
}
