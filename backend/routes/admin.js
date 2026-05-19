// backend/routes/admin.js
const express = require('express');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const Destination = require('../models/Destination');
const Reservation = require('../models/Reservation');
const User = require('../models/User');
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
    const { title, description, price, priceValue, location, images, rating, duration, featured, discount, originalPrice, category } = req.body;

    if (!title || !description || !location) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const destination = new Destination({
      title,
      description,
      price: price || 'Үнэгүй',
      location,
      images: images || [],
      rating: rating || 4.5,
      duration: duration || '5 days',
      featured: featured || false,
      discount,
      originalPrice,
      category: category || 'room',
      priceValue: priceValue ? Number(priceValue) : null,
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

// Get all users
router.get('/users', adminAuth, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch users', error: error.message });
  }
});

// Delete user
router.delete('/users/:id', adminAuth, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    await Reservation.deleteMany({ user: req.params.id });
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete user', error: error.message });
  }
});

// Get all reservations
router.get('/reservations', adminAuth, async (req, res) => {
  try {
    const reservations = await Reservation.find()
      .populate('user', 'name email accountType')
      .populate('item', 'title price category images')
      .sort({ createdAt: -1 });
    res.json(reservations);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch reservations', error: error.message });
  }
});

// Update reservation status
router.put('/reservations/:id/status', adminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    const reservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      { status, updatedAt: Date.now() },
      { new: true }
    ).populate('user', 'name email').populate('item', 'title price');
    if (!reservation) return res.status(404).json({ message: 'Reservation not found' });
    res.json(reservation);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update reservation', error: error.message });
  }
});

// Delete reservation
router.delete('/reservations/:id', adminAuth, async (req, res) => {
  try {
    const reservation = await Reservation.findByIdAndDelete(req.params.id);
    if (!reservation) return res.status(404).json({ message: 'Reservation not found' });
    res.json({ message: 'Reservation deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete reservation', error: error.message });
  }
});

// Revenue analytics
router.get('/revenue', adminAuth, async (req, res) => {
  try {
    const paid = await Reservation.find({ 'payment.status': 'paid' })
      .populate('item', 'title category')
      .sort({ createdAt: -1 });

    let totalRevenue = 0;
    const monthlyMap = {};
    const itemMap = {};

    paid.forEach(r => {
      const amount = parseFloat((r.payment?.amount || '').replace(/[^\d.]/g, '')) || 0;
      totalRevenue += amount;

      const month = new Date(r.createdAt).toISOString().slice(0, 7);
      monthlyMap[month] = (monthlyMap[month] || 0) + amount;

      const key = r.itemDetails?.title || r.item?.title || 'Бусад';
      if (!itemMap[key]) itemMap[key] = { count: 0, revenue: 0 };
      itemMap[key].count += 1;
      itemMap[key].revenue += amount;
    });

    // Last 12 months (fill gaps)
    const monthly = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date();
      d.setDate(1);
      d.setMonth(d.getMonth() - i);
      const key = d.toISOString().slice(0, 7);
      monthly.push({ month: key, revenue: Math.round(monthlyMap[key] || 0) });
    }

    const topItems = Object.entries(itemMap)
      .map(([title, d]) => ({ title, ...d, revenue: Math.round(d.revenue) }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    const thisMonth = monthly[monthly.length - 1]?.revenue || 0;
    const lastMonth = monthly[monthly.length - 2]?.revenue || 0;

    res.json({ totalRevenue: Math.round(totalRevenue), thisMonth, lastMonth, monthly, topItems, paidCount: paid.length });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch revenue', error: error.message });
  }
});

// Occupancy rate
router.get('/occupancy', adminAuth, async (req, res) => {
  try {
    const roomCount = await Destination.countDocuments({ category: 'room' });

    const reservations = await Reservation.find({
      status: { $ne: 'cancelled' },
      checkIn: { $ne: null },
      checkOut: { $ne: null },
    }).select('checkIn checkOut');

    const nightsPerMonth = {};
    reservations.forEach(r => {
      const ci = new Date(r.checkIn);
      const co = new Date(r.checkOut);
      const nights = Math.max(0, Math.floor((co - ci) / 86400000));
      for (let i = 0; i < nights; i++) {
        const d = new Date(ci);
        d.setDate(d.getDate() + i);
        const key = d.toISOString().slice(0, 7);
        nightsPerMonth[key] = (nightsPerMonth[key] || 0) + 1;
      }
    });

    const occupancy = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date();
      d.setDate(1);
      d.setMonth(d.getMonth() - i);
      const key = d.toISOString().slice(0, 7);
      const [yr, mo] = key.split('-').map(Number);
      const daysInMonth = new Date(yr, mo, 0).getDate();
      const totalNights = Math.max(1, roomCount * daysInMonth);
      const bookedNights = nightsPerMonth[key] || 0;
      occupancy.push({
        month: key,
        rate: Math.min(100, Math.round((bookedNights / totalNights) * 100)),
        bookedNights,
        totalNights,
      });
    }

    const busiest = [...occupancy].sort((a, b) => b.rate - a.rate)[0];
    res.json({ roomCount, occupancy, busiest });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch occupancy', error: error.message });
  }
});

// Export reservations as CSV
router.get('/reservations/export', adminAuth, async (req, res) => {
  try {
    const reservations = await Reservation.find()
      .populate('user', 'name email')
      .populate('item', 'title price category')
      .sort({ createdAt: -1 });

    const headers = ['ID', 'Хэрэглэгч', 'Имэйл', 'Захиалга', 'Ангилал', 'Төлбөрийн дүн', 'Зочид', 'Орох огноо', 'Гарах огноо', 'Төлбөрийн төлөв', 'Захиалгын төлөв', 'Захиалсан огноо'];

    const fmt = d => d ? new Date(d).toLocaleDateString('mn-MN') : '';
    const esc = v => `"${String(v ?? '').replace(/"/g, '""')}"`;

    const rows = reservations.map(r => [
      r._id,
      r.user?.name || '',
      r.user?.email || '',
      r.itemDetails?.title || r.item?.title || '',
      r.itemDetails?.category || r.item?.category || '',
      r.payment?.amount || r.itemDetails?.price || '',
      r.guests || 1,
      fmt(r.checkIn),
      fmt(r.checkOut),
      r.payment?.status || 'pending',
      r.status,
      fmt(r.createdAt),
    ].map(esc).join(','));

    const csv = '﻿' + [headers.map(esc).join(','), ...rows].join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="reservations-${Date.now()}.csv"`);
    res.send(csv);
  } catch (error) {
    res.status(500).json({ message: 'Export failed', error: error.message });
  }
});

// Dashboard stats
router.get('/stats', adminAuth, async (req, res) => {
  try {
    const [totalDestinations, totalUsers, totalReservations, confirmedReservations, cancelledReservations] = await Promise.all([
      Destination.countDocuments(),
      User.countDocuments(),
      Reservation.countDocuments(),
      Reservation.countDocuments({ status: 'confirmed' }),
      Reservation.countDocuments({ status: 'cancelled' }),
    ]);
    res.json({
      totalDestinations,
      totalUsers,
      totalReservations,
      confirmedReservations,
      cancelledReservations,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch stats', error: error.message });
  }
});

module.exports = router;