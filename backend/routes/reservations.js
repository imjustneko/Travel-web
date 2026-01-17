const express = require('express');
const router = express.Router();
const Reservation = require('../models/Reservation');
const Destination = require('../models/Destination');
const auth = require('../middleware/auth');

// @route   POST /api/reservations
// @desc    Create a new reservation
// @access  Protected (requires login)
router.post('/', auth, async (req, res) => {
  try {
    const { itemId, checkIn, checkOut, guests, notes } = req.body;

    // Validate itemId
    if (!itemId) {
      return res.status(400).json({ message: 'Room ID is required' });
    }

    // Fetch the item details
    const item = await Destination.findById(itemId);
    
    if (!item) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Create reservation with cached item details
    const reservation = new Reservation({
      user: req.user.id,
      item: itemId,
      itemDetails: {
        title: item.title,
        price: item.price,
        image: item.images && item.images.length > 0 ? item.images[0] : null,
        category: item.category
      },
      checkIn: checkIn || null,
      checkOut: checkOut || null,
      guests: guests || 1,
      notes: notes || '',
      status: 'confirmed'
    });

    await reservation.save();

    res.status(201).json({
      success: true,
      message: 'Reservation confirmed successfully!',
      reservation
    });
  } catch (error) {
    console.error('Reservation error:', error);
    res.status(500).json({ 
      message: 'Failed to create reservation',
      error: error.message 
    });
  }
});

// @route   GET /api/reservations/my
// @desc    Get current user's reservations
// @access  Protected (requires login)
router.get('/my', auth, async (req, res) => {
  try {
    const reservations = await Reservation.find({ user: req.user.id })
      .populate('item', '_id title price images category')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: reservations.length,
      reservations
    });
  } catch (error) {
    console.error('Fetch reservations error:', error);
    res.status(500).json({ 
      message: 'Failed to fetch reservations',
      error: error.message 
    });
  }
});

// @route   GET /api/reservations/:id
// @desc    Get single reservation details
// @access  Protected (requires login)
router.get('/:id', auth, async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id)
      .populate('item', 'title price images category description');

    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    // Verify reservation belongs to user (or user is admin)
    if (reservation.user.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({
      success: true,
      reservation
    });
  } catch (error) {
    console.error('Fetch reservation error:', error);
    res.status(500).json({ 
      message: 'Failed to fetch reservation',
      error: error.message 
    });
  }
});

// @route   PUT /api/reservations/:id/cancel
// @desc    Cancel a reservation
// @access  Protected (requires login)
router.put('/:id/cancel', auth, async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    // Verify reservation belongs to user (or user is admin)
    if (reservation.user.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Update status to cancelled
    reservation.status = 'cancelled';
    await reservation.save();

    res.json({
      success: true,
      message: 'Reservation cancelled successfully',
      reservation
    });
  } catch (error) {
    console.error('Cancel reservation error:', error);
    res.status(500).json({ 
      message: 'Failed to cancel reservation',
      error: error.message 
    });
  }
});

// @route   DELETE /api/reservations/:id
// @desc    Delete a reservation (admin only)
// @access  Admin
router.delete('/:id', auth, async (req, res) => {
  try {
    const reservation = await Reservation.findByIdAndDelete(req.params.id);

    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    res.json({
      success: true,
      message: 'Reservation deleted successfully'
    });
  } catch (error) {
    console.error('Delete reservation error:', error);
    res.status(500).json({ 
      message: 'Failed to delete reservation',
      error: error.message 
    });
  }
});

module.exports = router;