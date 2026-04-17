const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  conversation_key: String,
  ride_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Ride' },
  sender_email: String,
  sender_name: String,
  receiver_email: String,
  content: String,
  is_read: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);

