// models/Setting.js
const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
  marqueeText: { type: String, default: '🎉 Use OFF20 at checkout to get 20% off!' },
  showMarquee: { type: Boolean, default: true },
  popupMessage: { type: String, default: 'Apply OFF20 to get 20% off your first order!' },
  showPopup: { type: Boolean, default: true }
}, { timestamps: true }); // ⬅️ Add this line

module.exports = mongoose.model('Setting', settingSchema);
