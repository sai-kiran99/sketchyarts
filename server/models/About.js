const mongoose = require('mongoose');

const AboutSchema = new mongoose.Schema({
  photo: { type: String, required: true },
  description: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('About', AboutSchema);
