const express = require('express');
const router = express.Router();
const {
  getAdminStatistics,
  getSellerStatistics,
  getClientStatistics
} = require('../controllers/statisticsController');
const { protect, authorize } = require('../middleware/auth');

router.get('/admin', protect, authorize('admin'), getAdminStatistics);
router.get('/seller', protect, authorize('seller'), getSellerStatistics);
router.get('/client', protect, authorize('client'), getClientStatistics);

module.exports = router; 