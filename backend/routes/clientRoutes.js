const express = require('express');
const {
  getClientProfile,
  updateClientProfile,
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  changePassword
} = require('../controllers/clientController');

const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Protect all routes
router.use(protect);

// Profile routes
router
  .route('/profile')
  .get(getClientProfile)
  .put(upload.single('image'), updateClientProfile);

// Password change route
router.put('/profile/change-password', changePassword);

// Address routes
router
  .route('/addresses')
  .get(getAddresses)
  .post(addAddress);

router
  .route('/addresses/:addressId')
  .put(updateAddress)
  .delete(deleteAddress);

router.put('/addresses/:addressId/set-default', setDefaultAddress);

module.exports = router; 