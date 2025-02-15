const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['client', 'seller', 'admin'],
    default: 'client'
  },
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store'
  },
  phoneNumber: {
    type: String,
    required: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isSellerVerified: {
    type: Boolean,
    default: false
  },
  sellerInfo: {
    idNumber: String,
    businessNumber: String
  },
  verificationCode: String,
  verificationCodeExpires: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Şifre karşılaştırma metodu
UserSchema.methods.matchPassword = async function(enteredPassword) {
  try {
    if (!this.password || !enteredPassword) {
      console.log('Password check failed: missing data');
      return false;
    }

    const isMatch = await bcrypt.compare(enteredPassword, this.password);
    console.log('Password comparison:', {
      result: isMatch,
      hashedPassword: this.password
    });
    return isMatch;
  } catch (error) {
    console.error('Password match error:', error);
    return false;
  }
};

// Şifre değiştiğinde otomatik hash'leme
UserSchema.pre('save', async function(next) {
  try {
    // Şifre değişmemişse devam et
    if (!this.isModified('password')) {
      return next();
    }

    console.log('Hashing password for:', this.email);
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(this.password, salt);
    console.log('Password hashed:', {
      originalPassword: this.password,
      hashedResult: hashedPassword
    });
    
    this.password = hashedPassword;

    if (this.isNew && !this.role) {
      this.role = 'client';
    }
    
    next();
  } catch (error) {
    console.error('Password hashing error:', error);
    next(error);
  }
});

// Satıcı doğrulandığında otomatik store oluşturma
UserSchema.pre('save', async function(next) {
  try {
    // Eğer satıcı yeni doğrulandıysa ve henüz bir store'u yoksa
    if (this.isModified('isSellerVerified') && this.isSellerVerified && !this.store) {
      console.log('Creating store for verified seller:', this.email);
      
      const Store = mongoose.model('Store');
      const store = await Store.create({
        name: `${this.name}'s Store`,
        owner: this._id,
        phoneNumber: this.phoneNumber,
        isVerified: true,
        description: `مرحباً بكم في متجر ${this.name}! نحن نقدم منتجات عالية الجودة وخدمة عملاء ممتازة.` // Varsayılan Arapça açıklama
      });

      this.store = store._id;
      console.log('Store created successfully:', store._id);
    }
    next();
  } catch (error) {
    console.error('Store creation error:', error);
    next(error);
  }
});

module.exports = mongoose.model('User', UserSchema); 