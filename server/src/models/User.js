import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, 'Enter a valid email address'],
    },
    /* select: false keeps the hash out of every query result by default.
       You have to ask for it explicitly — see login(). */
    password: { type: String, required: true, minlength: 8, select: false },
    role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
  },
  { timestamps: true }
)

/* Hash on the way in, always — so no route can ever store a plaintext
   password by forgetting to hash it first. isModified guards against
   re-hashing an already-hashed value when some other field is updated. */
userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next()
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
  next()
})

userSchema.methods.matchPassword = function matchPassword(plain) {
  return bcrypt.compare(plain, this.password)
}

userSchema.set('toJSON', {
  versionKey: false,
  transform(_doc, ret) {
    ret.id = ret._id.toString()
    delete ret._id
    delete ret.password
    return ret
  },
})

export default mongoose.model('User', userSchema)