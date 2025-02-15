const jwt = require('jsonwebtoken');
const asyncHandler = require('./async');
const User = require('../models/User');

// Protect routes
exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Please login to access this resource'
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token:', decoded); // Debug için

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not found'
      });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('Token verification error:', err); // Debug için
    return res.status(401).json({
      success: false,
      error: 'Invalid token'
    });
  }
});

// Admin rolü kontrolü için middleware
exports.admin = asyncHandler(async (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({
      success: false,
      error: 'غير مصرح للمستخدمين غير المسؤولين'
    });
  }
});

// Satıcı rolü kontrolü için middleware
exports.seller = asyncHandler(async (req, res, next) => {
  if (req.user && req.user.role === 'seller') {
    next();
  } else {
    return res.status(403).json({
      success: false,
      error: 'غير مصرح للمستخدمين غير البائعين'
    });
  }
});

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'User not found in request'
      });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
}; 