
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Review = require('../models/Review');
const Destination = require('../models/Destination');
const auth = require('../middleware/auth');

// @route   POST /api/reviews
// @desc    Create a review
// @access  Protected
router.post('/', auth, async (req, res) => {
  try {
    const { itemId, itemType, rating, comment } = req.body;

    // Validation
    if (!itemId || !itemType || !rating || !comment) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    if (comment.length < 10 || comment.length > 1000) {
      return res.status(400).json({ message: 'Comment must be between 10 and 1000 characters' });
    }

    // Check if item exists
    const item = await Destination.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Check if user already reviewed this item
    const existingReview = await Review.findOne({
      user: req.user.id,
      item: itemId
    });

    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this item' });
    }

    // Get user name
    const User = require('../models/User');
    const user = await User.findById(req.user.id);

    // Create review
    const review = new Review({
      user: req.user.id,
      userName: user.name,
      item: itemId,
      itemType,
      rating,
      comment
    });

    await review.save();

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      review
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ 
      message: 'Failed to submit review',
      error: error.message 
    });
  }
});

// @route   GET /api/reviews/item/:itemId
// @desc    Get all reviews for an item
// @access  Public
router.get('/item/:itemId', async (req, res) => {
  try {
    const { itemId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    console.log('Getting reviews for itemId:', itemId);

    // Convert itemId to ObjectId
    let objectId;
    try {
      objectId = new mongoose.Types.ObjectId(itemId);
    } catch (err) {
      console.error('Invalid ObjectId:', itemId, err);
      return res.status(400).json({ message: 'Invalid item ID format' });
    }

    const reviews = await Review.find({ item: objectId })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Review.countDocuments({ item: objectId });

    // Calculate average rating
    const avgResult = await Review.aggregate([
      { $match: { item: objectId } },
      { $group: { _id: null, avgRating: { $avg: '$rating' } } }
    ]);

    const averageRating = avgResult.length > 0 
      ? Math.round(avgResult[0].avgRating * 10) / 10 
      : 0;

    res.json({
      success: true,
      reviews,
      averageRating,
      totalReviews: count,
      pagination: {
        page: Number(page),
        pages: Math.ceil(count / limit),
        total: count
      }
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ 
      message: 'Failed to fetch reviews',
      error: error.message 
    });
  }
});

// @route   GET /api/reviews/user/my
// @desc    Get current user's reviews
// @access  Protected
router.get('/user/my', auth, async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.user.id })
      .populate('item', 'title category images')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      reviews
    });
  } catch (error) {
    console.error('Get user reviews error:', error);
    res.status(500).json({ 
      message: 'Failed to fetch reviews',
      error: error.message 
    });
  }
});

// @route   DELETE /api/reviews/:id
// @desc    Delete a review
// @access  Protected (own review or admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if user owns the review or is admin
    const User = require('../models/User');
    const user = await User.findById(req.user.id);
    
    if (review.user.toString() !== req.user.id && !user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this review' });
    }

    await review.deleteOne();

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ 
      message: 'Failed to delete review',
      error: error.message 
    });
  }
});

module.exports = router;