const mongoose = require('mongoose');

const AddressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
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
}, {
  timestamps: true
});

// Sadece bir tane varsayılan adres olabilir
AddressSchema.pre('save', async function(next) {
  if (this.isDefault) {
    await this.constructor.updateMany(
      { user: this.user, _id: { $ne: this._id } },
      { isDefault: false }
    );
  }
  next();
});

module.exports = mongoose.model('Address', AddressSchema); 