const express = require('express');
const router = express.Router();

// Get all dining options
router.get('/', (req, res) => {
  try {
    res.json({ message: 'Get all dining options' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get dining by ID
router.get('/:id', (req, res) => {
  try {
    res.json({ message: 'Get dining by ID' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create dining
router.post('/', (req, res) => {
  try {
    res.json({ message: 'Create dining' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
