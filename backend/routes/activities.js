const express = require('express');
const router = express.Router();

// Get all activities
router.get('/', (req, res) => {
  try {
    res.json({ message: 'Get all activities' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get activity by ID
router.get('/:id', (req, res) => {
  try {
    res.json({ message: 'Get activity by ID' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create activity
router.post('/', (req, res) => {
  try {
    res.json({ message: 'Create activity' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
