const mongoose = require('mongoose');

const packageSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  price: { type: String, required: true },
  priceValue: { type: Number, default: null },
  originalPrice: { type: String, default: null },
  discount: { type: String, default: null },
  images: { type: [String], default: [] },
  duration: { type: String, default: '1 шөнө' },
  maxGuests: { type: Number, default: 2 },
  featured: { type: Boolean, default: false },
  available: { type: Boolean, default: true },
  includes: {
    room: { type: String, default: null },
    dining: { type: String, default: null },
    activities: [{ type: String }],
  },
  highlights: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Package', packageSchema);
