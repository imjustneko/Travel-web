const express = require('express');
const router = express.Router();
const Destination = require('../models/Destination');

// Get all events
router.get('/', async (req, res) => {
  try {
    console.log('Fetching events with category=event');
    const events = await Destination.find({ category: 'event' }).sort({ createdAt: -1 });
    console.log('Found events:', events.length);
    console.log('Events data:', events);
    res.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ message: 'Failed to fetch events', error: error.message });
  }
});

// Get event by ID
router.get('/:id', async (req, res) => {
  try {
    const event = await Destination.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.json(event);
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ message: 'Failed to fetch event', error: error.message });
  }
});

module.exports = router;
