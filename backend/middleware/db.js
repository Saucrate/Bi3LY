const mongoose = require('mongoose');

// Veritabanı bağlantısını kontrol eden middleware
exports.checkDBConnection = async (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      error: 'Database connection is not available'
    });
  }
  next();
};

// Mongoose sorguları için timeout middleware'i
exports.queryTimeout = (timeout = 30000) => {
  return (req, res, next) => {
    req.queryTimeout = timeout;
    next();
  };
}; 