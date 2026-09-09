import User from '../models/User.js'
import { signToken } from '../utils/token.js'
import { ApiError, asyncHandler } from '../middleware/error.js'

/* POST /api/auth/register */
export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body

  if (!name?.trim()) throw new ApiError(400, 'Enter your name')
  if (!email?.trim()) throw new ApiError(400, 'Enter your email address')
  if (!password || password.length < 8) throw new ApiError(400, 'Password must be at least 8 characters')

  const exists = await User.findOne({ email: email.toLowerCase().trim() })
  if (exists) throw new ApiError(409, 'An account with that email already exists')

  /* Role is never taken from the request body. Anyone can POST
     { role: 'admin' } — admins are promoted in the database, not by signup. */
  const user = await User.create({ name: name.trim(), email, password })

  res.status(201).json({ user, token: signToken(user) })
})

/* POST /api/auth/login */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) throw new ApiError(400, 'Enter your email and password')

  /* The hash is select:false on the schema, so it has to be asked for. */
  const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password')

  /* One message for both "no such user" and "wrong password" — telling them
     apart lets an attacker enumerate which emails have accounts. */
  if (!user || !(await user.matchPassword(password))) {
    throw new ApiError(401, 'That email and password combination does not match an account')
  }

  res.json({ user, token: signToken(user) })
})

/* GET /api/auth/me — lets the frontend restore a session on page load
   by asking the server whether its stored token is still good. */
export const me = asyncHandler(async (req, res) => {
  res.json({ user: req.user })
})