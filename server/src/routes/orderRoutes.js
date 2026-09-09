import { Router } from 'express'
import {
  createOrder,
  myOrders,
  getOrder,
  listOrders,
  updateOrderStatus,
  orderStats,
} from '../controllers/orderController.js'
import { protect, adminOnly } from '../middleware/auth.js'

const router = Router()

/* Specific paths before parameterised ones, same reason as /meta. */
router.get('/stats/summary', protect, adminOnly, orderStats)
router.get('/mine', protect, myOrders)

router.route('/').post(createOrder).get(protect, adminOnly, listOrders)

router.get('/:reference', getOrder)
router.patch('/:reference/status', protect, adminOnly, updateOrderStatus)

export default router