
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// @route   PUT /api/subscription/upgrade
// @desc    Upgrade to premium account
// @access  Protected
router.put('/upgrade', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.accountType === 'premium') {
      return res.status(400).json({ message: 'Already a premium member' });
    }

    // Mock upgrade (in production, integrate with payment gateway)
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + 1); // 1 month subscription

    user.accountType = 'premium';
    user.subscriptionStatus = 'active';
    user.subscriptionExpiry = expiryDate;
    
    await user.save();

    res.json({
      success: true,
      message: 'Successfully upgraded to Premium!',
      user: {
        accountType: user.accountType,
        subscriptionStatus: user.subscriptionStatus,
        subscriptionExpiry: user.subscriptionExpiry,
        benefits: user.getSubscriptionBenefits()
      }
    });
  } catch (error) {
    console.error('Upgrade error:', error);
    res.status(500).json({ 
      message: 'Failed to upgrade account',
      error: error.message 
    });
  }
});

// @route   PUT /api/subscription/downgrade
// @desc    Downgrade to guest account
// @access  Protected
router.put('/downgrade', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.accountType === 'guest') {
      return res.status(400).json({ message: 'Already a guest account' });
    }

    user.accountType = 'guest';
    user.subscriptionStatus = 'inactive';
    user.subscriptionExpiry = null;
    
    await user.save();

    res.json({
      success: true,
      message: 'Subscription cancelled. Downgraded to Guest account.',
      user: {
        accountType: user.accountType,
        subscriptionStatus: user.subscriptionStatus,
        benefits: user.getSubscriptionBenefits()
      }
    });
  } catch (error) {
    console.error('Downgrade error:', error);
    res.status(500).json({ 
      message: 'Failed to downgrade account',
      error: error.message 
    });
  }
});

// @route   GET /api/subscription/status
// @desc    Get subscription status
// @access  Protected
router.get('/status', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      success: true,
      accountType: user.accountType,
      subscriptionStatus: user.subscriptionStatus,
      subscriptionExpiry: user.subscriptionExpiry,
      isActive: user.hasActiveSubscription(),
      benefits: user.getSubscriptionBenefits()
    });
  } catch (error) {
    console.error('Get subscription status error:', error);
    res.status(500).json({ 
      message: 'Failed to get subscription status',
      error: error.message 
    });
  }
});

module.exports = router;