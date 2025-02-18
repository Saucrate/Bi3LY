const express = require('express');
const {
  getAddresses,
  getAddress,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress
} = require('../controllers/addressController');

const router = express.Router();

const { protect } = require('../middleware/auth');

router.use(protect);

router
  .route('/')
  .get(getAddresses)
  .post(createAddress);

router
  .route('/:id')
  .get(getAddress)
  .put(updateAddress)
  .delete(deleteAddress);

router.put('/:id/set-default', setDefaultAddress);

module.exports = router; 