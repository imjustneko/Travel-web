// backend/models/Destination.js
const mongoose = require('mongoose');

const destinationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  images: {
    type: [String],
    default: []
  },
  rating: {
    type: Number,
    default: 4.5,
    min: 0,
    max: 5
  },
  duration: {
    type: String,
    default: '5 days'
  },
  featured: {
    type: Boolean,
    default: false
  },
  discount: {
    type: String,
    default: null
  },
  originalPrice: {
    type: String,
    default: null
  },
  // ⭐ ADD THIS NEW FIELD ⭐
  category: {
    type: String,
    enum: ['room', 'dining', 'activity', 'event', 'offer'],
    default: 'room'
  },
  // ⭐ END OF NEW FIELD ⭐
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Destination', destinationSchema);