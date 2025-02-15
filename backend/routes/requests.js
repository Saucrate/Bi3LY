const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  createRequest,
  getRequests,
  updateRequestStatus,
  getRequestById,
  createSponsorshipRequest,
  createBlueBadgeRequest,
  createComplaintRequest
} = require('../controllers/requestController');

// Tüm talepler için route'lar
router.route('/')
  .post(protect, createRequest)  // Herhangi bir kullanıcı talep oluşturabilir
  .get(protect, authorize('admin'), getRequests); // Sadece admin görebilir

router.route('/:id')
  .get(protect, getRequestById)
  .put(protect, authorize('admin'), updateRequestStatus);

// Özel request route'ları
router.post('/sponsorship', 
  protect, 
  authorize('seller'), 
  createSponsorshipRequest
);

router.post('/blue-badge', 
  protect, 
  authorize('seller'), 
  createBlueBadgeRequest
);

router.post('/complaint',
  protect,
  authorize('seller', 'client'),
  upload.array('file', 5),
  createComplaintRequest
);

module.exports = router; 