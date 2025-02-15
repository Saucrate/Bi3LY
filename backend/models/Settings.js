const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    unique: true
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  }
}, { timestamps: true });

const Settings = mongoose.model('Settings', settingsSchema);
module.exports = Settings; 