const express = require('express');
const router = express.Router();
const {
  createStore,
  getStores,
  getStore,
  updateStore,
  deleteStore,
  followStore,
  getStoreProducts
} = require('../controllers/storeController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Configure multer for multiple file uploads
const multiUpload = upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'banner', maxCount: 1 }
]);

router.route('/')
  .get(getStores)
  .post(protect, authorize('seller'), multiUpload, createStore);

router.route('/:id')
  .get(getStore)
  .put(protect, authorize('seller'), multiUpload, updateStore)
  .delete(protect, authorize('seller'), deleteStore);

router.route('/:id/follow')
  .post(protect, authorize('client'), followStore);

router.route('/:id/products')
  .get(getStoreProducts);

module.exports = router; 