const express = require('express');
const router = express.Router();
const {
  getAllRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom
} = require('../controllers/roomController');

const auth = require('../middleware/auth');
const adminAuth = require('../middleware/admin');

// Public routes
router.get('/', getAllRooms);
router.get('/:id', getRoomById);

// Admin routes
router.post('/', adminAuth, createRoom);
router.put('/:id', adminAuth, updateRoom);
router.delete('/:id', adminAuth, deleteRoom);

module.exports = router;