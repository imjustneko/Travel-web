
const express = require('express');
const Destination = require('../models/Destination');

const router = express.Router();

// Search destinations by query and category
router.get('/', async (req, res) => {
  try {
    const { query, category } = req.query;

    let filter = {};

    // Category filtering
    if (category && category !== 'all') {
      filter.category = category;
    }

    // Text search with partial matching
    // FIXED: Allow empty query - just return all items of that category
    if (query && query.trim() !== '') {
      filter.$or = [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { location: { $regex: query, $options: 'i' } }
      ];
    }

    // IMPORTANT: If no query but category is selected, return all of that category
    // If no query and no category (or 'all'), return everything

    const destinations = await Destination.find(filter).sort({ createdAt: -1 });
    
    res.json(destinations);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ message: 'Search failed', error: error.message });
  }
});

module.exports = router;