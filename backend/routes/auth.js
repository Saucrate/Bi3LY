const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  register,
  login,
  verifyEmail,
  forgotPassword,
  resetPassword,
  sendVerificationCode,
  logout,
  checkAuth
} = require('../controllers/authController');

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/verify-email', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/send-verification', sendVerificationCode);

// Protected routes (token gerekli)
router.post('/logout', protect, logout);
router.get('/check-auth', protect, checkAuth);

module.exports = router; 