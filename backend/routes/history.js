const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Session = require('../models/Session');
const Profile = require('../models/Profile');

// @route   GET /api/history
// @desc    Get all sessions for logged-in user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const sessions = await Session.find({
      participants: req.user
    })
    .populate('participants', 'name email')
    .sort({ date: -1 });

    res.json(sessions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/history/progress
// @desc    Get progress metrics for logged-in user
// @access  Private
router.get('/progress', auth, async (req, res) => {
  try {
    // Get user profile to check known subjects
    const profile = await Profile.findOne({ user: req.user });
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    const sessions = await Session.find({
      participants: req.user
    });

    const totalSessions = sessions.length;
    let sessionsAsMentor = 0;
    const subjectsLearnedSet = new Set();

    sessions.forEach(session => {
      if (profile.subjectsKnown.includes(session.topic)) {
        sessionsAsMentor++;
      } else {
        // If they don't know it, they are learning it
        subjectsLearnedSet.add(session.topic);
      }
    });

    res.json({
      totalSessions,
      sessionsAsMentor,
      subjectsLearned: Array.from(subjectsLearnedSet)
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
