
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  // User who wrote the review
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Cached user name for display
  userName: {
    type: String,
    required: true
  },
  
  // Item being reviewed
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Destination',
    required: true
  },
  
  // Type of item
  itemType: {
    type: String,
    enum: ['room', 'dining', 'activity', 'event', 'offer'],
    required: true
  },
  
  // Rating (1-5 stars)
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  
  // Review comment
  comment: {
    type: String,
    required: true,
    minlength: 10,
    maxlength: 1000
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries
reviewSchema.index({ item: 1, createdAt: -1 });
reviewSchema.index({ user: 1 });

// Virtual for formatted date
reviewSchema.virtual('formattedDate').get(function() {
  return this.createdAt.toLocaleDateString();
});

module.exports = mongoose.model('Review', reviewSchema);