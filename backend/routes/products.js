const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductDetails,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
  getSimilarProducts
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.route('/')
  .get(getProducts)
  .post(protect, authorize('seller', 'admin'), createProduct);

router.route('/:id')
  .get(getProductDetails)
  .put(protect, authorize('seller', 'admin'), upload.array('images', 5), updateProduct)
  .delete(protect, authorize('seller', 'admin'), deleteProduct);

router.route('/:id/reviews')
  .post(protect, authorize('client'), createProductReview);

router.route('/:id/similar')
  .get(getSimilarProducts);

module.exports = router; 