const express = require('express');
const router = express.Router();
const {
  createOrder,
  getOrders,
  getOrder,
  updateOrderStatus,
  cancelOrder
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .post(protect, authorize('client'), createOrder)
  .get(protect, getOrders);

router.route('/:id')
  .get(protect, getOrder);

router.route('/:id/status')
  .put(protect, authorize('seller'), updateOrderStatus);

router.route('/:id/cancel')
  .put(protect, cancelOrder);

module.exports = router; 