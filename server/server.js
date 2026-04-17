require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendRideBookingEmail } = require('./services/emailService');


const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: ['http://localhost:5173', process.env.CLIENT_URL || ''],
  credentials: true
}));
app.use(express.json());

const connectDB = async () => {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
    console.log('✅ MongoDB connected successfully (remote)');
  } catch (err) {
    console.error('❌ MongoDB connection FAILED:', err.message);
    console.error('Check: 1) Atlas IP whitelist  2) DB user credentials  3) Cluster is not paused');
    process.exit(1);
  }
};
connectDB();

// User Schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  full_name: { type: String, required: true },
  profile_completed: { type: Boolean, default: false }
});

const User = mongoose.model('User', userSchema);

// Auth middleware
const authMiddleware = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No token' });
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) return res.status(401).json({ error: 'User not found' });
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, full_name } = req.body;
    const hashed = await bcrypt.hash(password, 12);
    const user = new User({ email, password: hashed, full_name });
    await user.save();
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, email, full_name } });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, email: user.email, full_name: user.full_name } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/auth/me', authMiddleware, async (req, res) => {
  res.json(req.user);
});

app.put('/api/auth/profile', authMiddleware, async (req, res) => {
  const user = await User.findByIdAndUpdate(req.user._id, req.body, { new: true }).select('-password');
  res.json(user);
});

// Ride Schema
const rideSchema = new mongoose.Schema({
  driver_email: String,
  driver_name: String,
  pickup_location: String,
  pickup_lat: Number,
  pickup_lng: Number,
  dropoff_location: String,
  dropoff_lat: Number,
  dropoff_lng: Number,
  departure_date: String,
  departure_time: String,
  price_per_seat: Number,
  total_seats: Number,
  booked_seats: { type: Number, default: 0 },
  vehicle_make: String,
  vehicle_color: String,
  vehicle_plate: String,
  notes: String,
  status: { type: String, default: 'active', enum: ['active', 'completed', 'cancelled'] }
});

const Booking = require('./models/Booking');
const Message = require('./models/Message');
const Review = require('./models/Review');
const Ride = mongoose.model('Ride', rideSchema);

// Rides API
app.get('/api/rides', async (req, res) => {
  try {
    const { status = 'active', limit = 50 } = req.query;
    const rides = await Ride.find({ status }).sort({ createdAt: -1 }).limit(Number(limit));
    res.json(rides);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/rides', authMiddleware, async (req, res) => {
  try {
    req.body.driver_email = req.user.email;
    if (req.user.full_name) {
      req.body.driver_name = req.user.full_name;
    }
    const ride = new Ride(req.body);
    await ride.save();
    res.status(201).json(ride);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/rides/:id', async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);
    if (!ride) return res.status(404).json({ error: 'Ride not found' });
    res.json(ride);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/rides/:id', authMiddleware, async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);
    if (!ride || ride.driver_email !== req.user.email) return res.status(403).json({ error: 'Not authorized' });
    const updated = await Ride.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.use('/api', (req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Add Booking endpoints
app.get('/api/bookings', authMiddleware, async (req, res) => {
  const bookings = await Booking.find({ rider_email: req.user.email }).populate('ride_id');
  res.json(bookings);
});

app.post('/api/bookings', authMiddleware, async (req, res) => {
  try {
    const ride = await Ride.findById(req.body.ride_id);
    if (!ride) return res.status(404).json({ error: 'Ride not found' });
    if (ride.driver_email === req.user.email) {
      return res.status(400).json({ error: 'You cannot book your own ride' });
    }

    const booking = new Booking({
      ...req.body,
      rider_email: req.user.email,
      rider_name: req.user.full_name || req.body.rider_name
    });
    await booking.save();
    // Update ride booked_seats
    await Ride.findByIdAndUpdate(req.body.ride_id, { 
      $inc: { booked_seats: req.body.seats_booked || 1 } 
    });

    // Send Booking Confirmation Email
    sendRideBookingEmail(req.user.email, booking.rider_name, ride, booking);

    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/bookings/:id', authMiddleware, async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    res.json(booking);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Messages API
app.get('/api/messages', authMiddleware, async (req, res) => {
  try {
    const { sender_email, receiver_email, conversation_key } = req.query;
    const query = {};
    if (sender_email) query.sender_email = sender_email;
    if (receiver_email) query.receiver_email = receiver_email;
    if (conversation_key) query.conversation_key = conversation_key;
    const messages = await Message.find(query).sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/messages', authMiddleware, async (req, res) => {
  try {
    const payload = { ...req.body, sender_email: req.user.email };
    if (!payload.ride_id) delete payload.ride_id;
    const msg = new Message(payload);
    await msg.save();
    res.status(201).json(msg);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/messages/:id', authMiddleware, async (req, res) => {
  try {
    const msg = await Message.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!msg) return res.status(404).json({ error: 'Message not found' });
    res.json(msg);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Reviews API
app.get('/api/reviews', async (req, res) => {
  try {
    const { reviewee_email, ride_id } = req.query;
    const query = {};
    if (reviewee_email) query.reviewee_email = reviewee_email;
    if (ride_id) query.ride_id = ride_id;
    const reviews = await Review.find(query).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/reviews', authMiddleware, async (req, res) => {
  try {
    const payload = { ...req.body, reviewer_email: req.user.email };
    if (!payload.ride_id) delete payload.ride_id;
    const review = new Review(payload);
    await review.save();
    res.status(201).json(review);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
