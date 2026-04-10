const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  ride_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Ride', required: true },
  rider_email: String,
  rider_name: String,
  seats_booked: { type: Number, default: 1 },
  total_price: Number,
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled', 'completed'], default: 'pending' },
  pickup_location: String,
  dropoff_location: String,
  departure_date: String,
  departure_time: String
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);

