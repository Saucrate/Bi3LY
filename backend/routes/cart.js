const express = require('express');
const {
  getCart,
  addToCart,
  updateQuantity,
  removeFromCart,
  clearCart,
  getCartSummary
} = require('../controllers/cartController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect); // Tüm rotalar için auth gerekli

router.route('/')
  .get(getCart);

router.route('/add')
  .post(addToCart);

router.route('/update')
  .put(updateQuantity);

router.route('/remove/:productId')
  .delete(removeFromCart);

router.route('/clear')
  .delete(clearCart);

router.route('/summary')
  .get(getCartSummary);

module.exports = router; 