const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  // User who made the reservation
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Room/item being reserved
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Destination',
    required: true
  },
  
  // Cache room details (in case room is deleted later)
  itemDetails: {
    title: String,
    price: String,
    image: String,
    category: String
  },
  
  // Reservation status
  status: {
    type: String,
    enum: ['confirmed', 'pending', 'cancelled'],
    default: 'confirmed'
  },
  
  // Optional: dates (can be added later)
  checkIn: {
    type: Date,
    default: null
  },
  
  checkOut: {
    type: Date,
    default: null
  },
  
  // Optional: number of guests
  guests: {
    type: Number,
    default: 1
  },
  
  // Optional: special requests
  notes: {
    type: String,
    default: ''
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update 'updatedAt' on save
reservationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Reservation', reservationSchema);