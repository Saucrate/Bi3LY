const express = require('express');
const { getProfile, updateProfile } = require('../controllers/profileController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Protect all routes
router.use(protect);

// Configure multer for avatar upload
const avatarUpload = upload.fields([
  { name: 'avatar', maxCount: 1 }
]);

router
  .route('/')
  .get(getProfile)
  .put(avatarUpload, updateProfile);

module.exports = router; 