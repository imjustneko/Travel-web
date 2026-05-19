const express = require('express');
const router = express.Router();
const Favorite = require('../models/Favorite');
const Destination = require('../models/Destination');
const auth = require('../middleware/auth');

// GET /api/favorites
router.get('/', auth, async (req, res) => {
  try {
    const favorites = await Favorite.find({ user: req.user.id })
      .populate('item', '_id title price images category location description rating originalPrice discount')
      .sort({ createdAt: -1 });
    res.json({ success: true, favorites });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch favorites', error: error.message });
  }
});

// POST /api/favorites
router.post('/', auth, async (req, res) => {
  try {
    const { itemId } = req.body;
    if (!itemId) return res.status(400).json({ message: 'itemId is required' });

    const item = await Destination.findById(itemId);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    const favorite = await Favorite.create({
      user: req.user.id,
      item: itemId,
      itemType: item.category,
    });
    res.status(201).json({ success: true, favorite });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Already in favorites' });
    }
    res.status(500).json({ message: 'Failed to add favorite', error: error.message });
  }
});

// DELETE /api/favorites/:itemId
router.delete('/:itemId', auth, async (req, res) => {
  try {
    await Favorite.findOneAndDelete({ user: req.user.id, item: req.params.itemId });
    res.json({ success: true, message: 'Removed from favorites' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to remove favorite', error: error.message });
  }
});

module.exports = router;
