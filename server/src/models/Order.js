import mongoose from 'mongoose'

/* Must match src/data/seed.js on the frontend — the admin dropdown and the
   database have to agree on the exact strings. */
export const ORDER_STATUSES = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled']

/* Line items copy name, price and image rather than referencing the product.
   An order is a historical record: if the price changes next month, last
   month's invoice must still say what the customer actually paid. */
const orderItemSchema = new mongoose.Schema(
  {
    productId: { type: String, required: true },
    slug: { type: String, required: true },
    name: { type: String, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    variant: { type: String, default: null },
  },
  { _id: false }
)

const addressSchema = new mongoose.Schema(
  {
    line1: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, default: '', trim: true },
    postcode: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true },
  },
  { _id: false }
)

const orderSchema = new mongoose.Schema(
  {
    /* Human-readable reference the customer can quote. Separate from _id,
       which is for the database, not for people. */
    reference: { type: String, required: true, unique: true, index: true },

    /* Who placed it, if they were signed in. Guest checkout leaves this null,
       which is why customer name and email are stored on the order too. */
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    customer: {
      name: { type: String, required: true, trim: true },
      email: { type: String, required: true, trim: true, lowercase: true },
    },

    items: {
      type: [orderItemSchema],
      required: true,
      validate: [(v) => v.length > 0, 'An order needs at least one item'],
    },

    shippingAddress: { type: addressSchema, required: true },
    shippingMethod: { type: String, required: true },
    payment: { type: String, required: true },

    subtotal: { type: Number, required: true, min: 0 },
    shipping: { type: Number, required: true, min: 0 },
    tax: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },

    status: { type: String, enum: ORDER_STATUSES, default: 'Pending', index: true },
  },
  { timestamps: true }
)

orderSchema.set('toJSON', {
  versionKey: false,
  transform(_doc, ret) {
    ret.id = ret.reference
    ret._dbId = ret._id.toString()
    delete ret._id
    return ret
  },
})

export default mongoose.model('Order', orderSchema)