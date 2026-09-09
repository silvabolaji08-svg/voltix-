import mongoose from 'mongoose'

/* Sub-documents. `_id: false` because these are values inside a product,
   not records anyone will ever look up on their own. */

const reviewSchema = new mongoose.Schema(
  {
    author: { type: String, required: true, trim: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    date: { type: String, required: true },
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true, trim: true },
  },
  { _id: true, timestamps: false }
)

const variantSchema = new mongoose.Schema(
  {
    label: { type: String, required: true },
    options: { type: [String], default: [] },
  },
  { _id: false }
)

const productSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    name: { type: String, required: true, trim: true },
    brand: { type: String, required: true, trim: true, index: true },
    category: { type: String, required: true, trim: true, lowercase: true, index: true },

    price: { type: Number, required: true, min: 0 },
    compareAt: { type: Number, default: null, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },

    image: { type: String, required: true },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0, min: 0 },

    tags: { type: [String], default: [] },
    short: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    highlights: { type: [String], default: [] },

    /* Map, not a plain object: spec keys differ per product ("Driver",
       "Refresh rate"), so there is no fixed shape to declare. */
    specs: { type: Map, of: String, default: {} },

    variants: { type: variantSchema, default: null },
    reviews: { type: [reviewSchema], default: [] },
  },
  { timestamps: true }
)

/* Text index powers ?q= search across the fields a shopper would type into. */
productSchema.index({ name: 'text', brand: 'text', short: 'text', description: 'text' })

/* The frontend expects `id`, not `_id`, and has no use for `__v`. Doing the
   rename here means no component ever learns that Mongo calls it `_id`. */
productSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform(_doc, ret) {
    ret.id = ret._id.toString()
    delete ret._id
    /* Map serialises to an object, which is what the UI already expects. */
    return ret
  },
})

export default mongoose.model('Product', productSchema)