/**
 * Catch-all wrapper so controllers can be plain async functions.
 * Without it, every `await` that rejects would need its own try/catch,
 * or the request would hang forever with no response.
 */
export const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

export class ApiError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

/* Reached only when no route matched. */
export function notFound(req, res, next) {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`))
}

/* Four arguments is how Express recognises an error handler. Remove `next`
   and it silently becomes ordinary middleware that never runs. */
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  let status = err.status || 500
  let message = err.message || 'Something went wrong'

  /* Mongoose validation — report every failing field at once. */
  if (err.name === 'ValidationError') {
    status = 400
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join('. ')
  }

  /* Duplicate key on a unique index (a taken email, a repeated slug). */
  if (err.code === 11000) {
    status = 409
    const field = Object.keys(err.keyValue ?? {})[0] ?? 'value'
    message = `That ${field} is already in use`
  }

  /* A malformed ObjectId in the URL is a bad request, not a server fault. */
  if (err.name === 'CastError') {
    status = 400
    message = `Invalid ${err.path}`
  }

  if (status >= 500) console.error(err)

  res.status(status).json({
    message,
    /* Stack traces leak file paths and logic. Development only. */
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  })
}