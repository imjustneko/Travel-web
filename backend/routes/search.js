// backend/routes/search.js
const express = require('express');
const Destination = require('../models/Destination');

const router = express.Router();

// Search destinations by query and category
router.get('/', async (req, res) => {
  try {
    const { query, category } = req.query;

    let filter = {};

    // Text search across title, description, and location
    if (query) {
      filter.$or = [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { location: { $regex: query, $options: 'i' } }
      ];
    }

    // Filter by category (if you add category field to destinations)
    if (category && category !== 'all') {
      filter.category = category;
    }

    const destinations = await Destination.find(filter).sort({ createdAt: -1 });
    res.json(destinations);
  } catch (error) {
    res.status(500).json({ message: 'Search failed', error: error.message });
  }
});

module.exports = router;