const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  ride_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Ride', required: true },
  reviewer_email: String,
  reviewer_name: String,
  reviewee_email: String,
  rating: { type: Number, min: 1, max: 5 },
  comment: String
}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);

