const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: [
      'STORE_SPONSORSHIP',
      'PRODUCT_SPONSORSHIP',
      'BLUE_BADGE',
      'USER_COMPLAINT',
      'NEW_PRODUCT'  // Yeni ürün request tipi eklendi
    ]
  },
  // Kim talep ediyor
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Hangi mağaza için (sponsorluk ve mavi tık için)
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true
  },
  // Eğer ürün sponsorluğu ise
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  },
  // Sponsorluk detayları
  amount: {
    type: Number
  },
  duration: {
    type: Number
  },
  sponsorshipStartDate: {
    type: Date
  },
  sponsorshipEndDate: {
    type: Date
  },
  // Talep açıklaması
  description: {
    type: String,
    required: true
  },
  // Talep durumu
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  // Ret nedeni
  rejectReason: {
    type: String
  },
  // Onay tarihi
  approvedAt: Date,
  // Varsa görseller (sponsorluk reklamı veya şikayet için)
  images: [{
    type: String
  }]
}, {
  timestamps: true
});

// Compound index
requestSchema.index({ status: 1, createdAt: -1 });

// Status değiştiğinde tetiklenecek middleware
requestSchema.pre('save', async function(next) {
  if (this.isModified('status')) {
    // Eğer request onaylandı veya reddedildiyse
    if (this.status === 'approved' || this.status === 'rejected') {
      // Request'i arşivle veya sil
      // Burada tercihe göre ya soft delete yapılabilir ya da tamamen silinebilir
      await this.model('Request').deleteOne({ _id: this._id });
    }
  }
  next();
});

module.exports = mongoose.model('Request', requestSchema); 