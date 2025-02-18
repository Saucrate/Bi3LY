const mongoose = require('mongoose');

const ClientSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  avatar: {
    type: String,
    default: 'https://via.placeholder.com/150'
  },
  addresses: [{
    title: {
      type: String,
      required: [true, 'Please add an address title'],
      trim: true
    },
    fullName: {
      type: String,
      required: [true, 'Please add a full name'],
      trim: true
    },
    phoneNumber: {
      type: String,
      required: [true, 'Please add a phone number']
    },
    wilaya: {
      type: String,
      required: [true, 'Please add a wilaya']
    },
    moughataa: {
      type: String,
      required: [true, 'Please add a moughataa']
    },
    street: {
      type: String,
      required: [true, 'Please add a street']
    },
    buildingNo: String,
    apartmentNo: String,
    additionalDirections: String,
    isDefault: {
      type: Boolean,
      default: false
    }
  }],
  preferences: {
    language: {
      type: String,
      default: 'ar'
    },
    currency: {
      type: String,
      default: 'MRU'
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      },
      sms: {
        type: Boolean,
        default: false
      }
    }
  }
}, {
  timestamps: true
});

// Sadece bir tane varsayılan adres olabilir
ClientSchema.pre('save', async function(next) {
  const defaultAddress = this.addresses.find(addr => addr.isDefault);
  if (defaultAddress) {
    this.addresses.forEach(addr => {
      if (addr._id.toString() !== defaultAddress._id.toString()) {
        addr.isDefault = false;
      }
    });
  } else if (this.addresses.length > 0) {
    // Eğer hiç varsayılan adres yoksa ve en az bir adres varsa
    // ilk adresi varsayılan yap
    this.addresses[0].isDefault = true;
  }
  next();
});

module.exports = mongoose.model('Client', ClientSchema); 