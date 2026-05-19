// backend/routes/admin.js
const express = require('express');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const Destination = require('../models/Destination');
const adminAuth = require('../middleware/admin');

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure multer with Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'resort-destinations',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [{ width: 1200, height: 800, crop: 'limit', quality: 'auto' }],
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

// Upload images
router.post('/upload', adminAuth, upload.array('images', 5), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const fileUrls = req.files.map(file => file.path);
    res.json({ urls: fileUrls });
  } catch (error) {
    res.status(500).json({ message: 'Upload failed', error: error.message });
  }
});

// Create new destination
router.post('/destinations', adminAuth, async (req, res) => {
  try {
    const { title, description, price, location, images, rating, duration, featured, discount, originalPrice } = req.body;

    // Validate required fields
    if (!title || !description || !price || !location) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const destination = new Destination({
      title,
      description,
      price,
      location,
      images: images || [],
      rating: rating || 4.5,
      duration: duration || '5 days',
      featured: featured || false,
      discount,
      originalPrice
    });

    await destination.save();
    res.status(201).json(destination);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create destination', error: error.message });
  }
});

// Update destination
router.put('/destinations/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const destination = await Destination.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );

    if (!destination) {
      return res.status(404).json({ message: 'Destination not found' });
    }

    res.json(destination);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update destination', error: error.message });
  }
});

// Delete destination
router.delete('/destinations/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const destination = await Destination.findByIdAndDelete(id);

    if (!destination) {
      return res.status(404).json({ message: 'Destination not found' });
    }

    // Delete associated images from Cloudinary
    if (destination.images && destination.images.length > 0) {
      for (const imageUrl of destination.images) {
        try {
          // Extract public_id from Cloudinary URL
          const parts = imageUrl.split('/');
          const filename = parts[parts.length - 1].split('.')[0];
          const folder = parts[parts.length - 2];
          await cloudinary.uploader.destroy(`${folder}/${filename}`);
        } catch (err) {
          console.error('Failed to delete image from Cloudinary:', err.message);
        }
      }
    }

    res.json({ message: 'Destination deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete destination', error: error.message });
  }
});

// Get all destinations (admin view)
router.get('/destinations', adminAuth, async (req, res) => {
  try {
    const destinations = await Destination.find().sort({ createdAt: -1 });
    res.json(destinations);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch destinations', error: error.message });
  }
});

module.exports = router;