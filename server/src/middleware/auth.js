import User from '../models/User.js'
import { verifyToken } from '../utils/token.js'
import { ApiError, asyncHandler } from './error.js'

/**
 * Reads the Bearer token, verifies it, and attaches the live user to the
 * request. The user is fetched fresh every time rather than trusted from the
 * token, so a deleted account or a demoted admin loses access immediately
 * instead of when their token happens to expire.
 */
export const protect = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization ?? ''
  if (!header.startsWith('Bearer ')) throw new ApiError(401, 'Sign in to continue')

  const token = header.slice(7)

  let payload
  try {
    payload = verifyToken(token)
  } catch {
    throw new ApiError(401, 'Your session has expired. Sign in again.')
  }

  const user = await User.findById(payload.id)
  if (!user) throw new ApiError(401, 'That account no longer exists')

  req.user = user
  next()
})

/* Always mounted after protect, so req.user is guaranteed to exist. */
export function adminOnly(req, _res, next) {
  if (req.user?.role !== 'admin') return next(new ApiError(403, 'Admin access required'))
  next()
}