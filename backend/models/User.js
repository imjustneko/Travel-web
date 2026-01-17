
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  // ⭐ NEW SUBSCRIPTION FIELDS ⭐
  accountType: {
    type: String,
    enum: ['guest', 'premium'],
    default: 'guest'
  },
  subscriptionStatus: {
    type: String,
    enum: ['active', 'inactive', 'expired'],
    default: 'inactive'
  },
  subscriptionExpiry: {
    type: Date,
    default: null
  },
  // ⭐ END NEW FIELDS ⭐
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Method to check if subscription is valid
userSchema.methods.hasActiveSubscription = function() {
  return this.accountType === 'premium' && 
         this.subscriptionStatus === 'active' &&
         (!this.subscriptionExpiry || this.subscriptionExpiry > new Date());
};

// Method to get subscription benefits
userSchema.methods.getSubscriptionBenefits = function() {
  if (this.accountType === 'premium') {
    return [
      'Early booking access',
      '10% discount on all bookings',
      'Priority customer support',
      'Exclusive event invitations',
      'Free room upgrades (subject to availability)',
      'Late checkout'
    ];
  }
  return [
    'Standard booking',
    'Regular pricing',
    'Email support'
  ];
};

module.exports = mongoose.model('User', userSchema);