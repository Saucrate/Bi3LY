const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUserProfile,
  updateProfile,
  getUserById,
  updateUser,
  deleteUser
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.route('/')
  .get(protect, authorize('admin'), getUsers);

router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, upload.single('profileImage'), updateProfile);

router.route('/:id')
  .get(protect, authorize('admin'), getUserById)
  .put(protect, authorize('admin'), updateUser)
  .delete(protect, authorize('admin'), deleteUser);

module.exports = router; 