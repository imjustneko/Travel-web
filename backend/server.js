const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const homeRoutes = require('./routes/home');
const adminRoutes = require('./routes/admin');
const destinationRoutes = require('./routes/destinations');
const searchRoutes = require('./routes/search');
const userRoutes = require('./routes/user');
const reservationRoutes = require('./routes/reservations');
const reviewRoutes = require('./routes/reviews');
const subscriptionRoutes = require('./routes/subscription');
const eventsRoutes = require('./routes/events');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/travel-app', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB Connected'))
.catch(err => console.log('❌ MongoDB Connection Error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', homeRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/destinations', destinationRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/user', userRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/subscription', subscriptionRoutes);
app.use('/api/events', eventsRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'Resort API v2 is running!' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// THAT'S IT! Only 2 lines added to existing server.js