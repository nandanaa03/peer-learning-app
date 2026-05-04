const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  topic: {
    type: String,
    required: true
  },
  participants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  ],
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['scheduled', 'completed'],
    default: 'scheduled'
  },
  maxParticipants: {
    type: Number,
    default: 5
  },
  mode: {
    type: String,
    enum: ['online', 'offline'],
    default: 'online'
  },
  meetingLink: {
    type: String,
    default: ''
  },
  location: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Session', sessionSchema);
