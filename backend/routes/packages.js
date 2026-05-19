const express = require('express');
const router = express.Router();
const Package = require('../models/Package');
const adminAuth = require('../middleware/admin');

// GET /api/packages
router.get('/', async (req, res) => {
  try {
    const packages = await Package.find({ available: true }).sort({ featured: -1, createdAt: -1 });
    res.json({ success: true, packages });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch packages', error: error.message });
  }
});

// GET /api/packages/:id
router.get('/:id', async (req, res) => {
  try {
    const pkg = await Package.findById(req.params.id);
    if (!pkg) return res.status(404).json({ message: 'Package not found' });
    res.json({ success: true, package: pkg });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch package', error: error.message });
  }
});

// POST /api/packages (admin)
router.post('/', adminAuth, async (req, res) => {
  try {
    const pkg = await Package.create(req.body);
    res.status(201).json({ success: true, package: pkg });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create package', error: error.message });
  }
});

// PUT /api/packages/:id (admin)
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const pkg = await Package.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!pkg) return res.status(404).json({ message: 'Package not found' });
    res.json({ success: true, package: pkg });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update package', error: error.message });
  }
});

// DELETE /api/packages/:id (admin)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    await Package.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Package deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete package', error: error.message });
  }
});

module.exports = router;
