const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Store name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Store description is required']
  },
  logo: {
    type: String,
    default: 'https://via.placeholder.com/150'
  },
  banner: {
    type: String,
    default: 'https://via.placeholder.com/1200x300'
  },
  category: {
    type: String,
    default: 'General Store',
    trim: true
  },
  location: {
    type: String,
    required: [true, 'Store location is required'],
    default: 'Default Location'
  },
  contactPhone: {
    type: String
  },
  contactEmail: {
    type: String
  },
  socialMedia: {
    facebook: String,
    instagram: String,
    twitter: String
  },
  businessHours: {
    open: String,
    close: String,
    weekends: Boolean
  },
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  rating: {
    type: Number,
    default: 0
  },
  totalRatings: {
    type: Number,
    default: 0
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  isSponsored: {
    type: Boolean,
    default: false
  },
  sponsorshipEnd: {
    type: Date
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verifiedAt: {
    type: Date
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual field for follower count
storeSchema.virtual('followerCount').get(function() {
  return this.followers ? this.followers.length : 0;
});

// Virtual field for product count
storeSchema.virtual('productCount', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'store',
  count: true
});

// Sponsorluk süresini kontrol eden middleware
storeSchema.pre('save', async function(next) {
  if (this.isSponsored && this.sponsorshipEnd && this.sponsorshipEnd < new Date()) {
    this.isSponsored = false;
    this.sponsorshipEnd = null;
  }
  next();
});

module.exports = mongoose.model('Store', storeSchema); 