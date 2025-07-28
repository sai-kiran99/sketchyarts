const mongoose = require('mongoose');

const SaleItemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  price: { type: Number, required: true },
  offer: { type: Number, default: 0 },
  images: [String], // support multiple images
  description: { type: String }, // long text
  details: { type: String },     // technical or product details
}, { timestamps: true });

module.exports = mongoose.model('ArtForSale', SaleItemSchema);
