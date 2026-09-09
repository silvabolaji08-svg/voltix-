import { Router } from 'express'
import {
  listProducts,
  productMeta,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController.js'
import { protect, adminOnly } from '../middleware/auth.js'

const router = Router()

/* /meta must be declared before /:slug, or Express matches "meta" as a slug. */
router.get('/meta', productMeta)

router.route('/').get(listProducts).post(protect, adminOnly, createProduct)

router.get('/:slug', getProduct)

router.route('/:id').put(protect, adminOnly, updateProduct).delete(protect, adminOnly, deleteProduct)

export default router