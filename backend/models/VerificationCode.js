const mongoose = require('mongoose');

const verificationCodeSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required']
  },
  code: {
    type: String,
    required: [true, 'Verification code is required']
  },
  expiresAt: {
    type: Date,
    required: true,
    default: function() {
      return new Date(Date.now() + 10 * 60 * 1000); // 10 dakika
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Süresi dolmuş kodları otomatik sil
verificationCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('VerificationCode', verificationCodeSchema); 