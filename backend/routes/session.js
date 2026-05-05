const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Profile = require('../models/Profile');
const Session = require('../models/Session');

// @route   POST /api/session/match
// @desc    Find match and create session
router.post('/match', auth, async (req, res) => {
  try {
    const userProfile = await Profile.findOne({ user: req.user });
    if (!userProfile) {
      return res.status(404).json({ message: 'Please create your profile first' });
    }

    if (!userProfile.subjectsToLearn.length) {
      return res.status(400).json({ message: 'Add subjects you want to learn in your profile first' });
    }

    const potentialMatches = await Profile.find({
  user: { $ne: req.user },
  subjectsKnown: { $in: userProfile.subjectsToLearn },
  $or: [
    { availability: userProfile.availability },
    { availability: 'flexible' },
    ...(userProfile.availability === 'flexible'
      ? [{ availability: 'weekday' }, { availability: 'weekend' }]
      : [])
  ]
}).populate('user', 'name');

    if (potentialMatches.length === 0) {
      return res.status(404).json({ message: 'No matches found yet. Try updating your interests!' });
    }

    const match = potentialMatches[0];
    
    const commonSubject = userProfile.subjectsToLearn.find(s => 
      match.subjectsKnown.includes(s)
    );

    const existingSession = await Session.findOne({
      topic: commonSubject,
      participants: { $all: [req.user, match.user._id] }
    });

    if (existingSession) {
      return res.status(400).json({ message: 'You already have a session scheduled for this topic with this mentor' });
    }

    const scheduledDate = new Date();
    scheduledDate.setDate(scheduledDate.getDate() + 2);

    const newSession = new Session({
      topic: commonSubject,
      participants: [req.user, match.user._id],
      date: scheduledDate,
      time: '10:00 AM',
      status: 'scheduled',
      mode: 'online'
    });

    await newSession.save();
    
    res.json({
      message: 'Session scheduled successfully!',
      session: newSession,
      mentor: match.user.name
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/session/my
// @desc    Get user's sessions
router.get('/my', auth, async (req, res) => {
  try {
    const sessions = await Session.find({
      participants: req.user
    }).populate('participants', 'name');
    
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/session/all
// @desc    Get all available sessions
router.get('/all', auth, async (req, res) => {
  try {
    const sessions = await Session.find({ status: 'scheduled' })
      .populate('participants', 'name');
    res.json(sessions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/session/join/:sessionId
// @desc    Join a session
router.post('/join/:sessionId', auth, async (req, res) => {
  try {
    const session = await Session.findById(req.params.sessionId);
    
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    if (session.status !== 'scheduled') {
      return res.status(400).json({ message: 'Cannot join a completed session' });
    }

    if (session.participants.includes(req.user)) {
      return res.status(400).json({ message: 'You have already joined this session' });
    }

    if (session.participants.length >= session.maxParticipants) {
      return res.status(400).json({ message: 'Session is full' });
    }

    session.participants.push(req.user);
    await session.save();

    const updatedSession = await Session.findById(req.params.sessionId).populate('participants', 'name');
    
    res.json({
      message: 'Joined session successfully!',
      session: updatedSession
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/session/mode/:sessionId
// @desc    Set session mode (online/offline) with optional link/location
router.put('/mode/:sessionId', auth, async (req, res) => {
  try {
    const { mode, meetingLink, location } = req.body;

    if (!mode || !['online', 'offline'].includes(mode)) {
      return res.status(400).json({ message: 'Invalid mode. Must be "online" or "offline".' });
    }

    const session = await Session.findById(req.params.sessionId);

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    // Only participants can update the mode
    const isParticipant = session.participants.some(p => p.toString() === req.user.toString());
    if (!isParticipant) {
      return res.status(403).json({ message: 'You are not a participant of this session' });
    }

    // Disable editing after session is completed
    if (session.status === 'completed') {
      return res.status(400).json({ message: 'Cannot edit a completed session' });
    }

    session.mode = mode;

    if (mode === 'online') {
      session.meetingLink = meetingLink || '';
      session.location = '';
    } else {
      session.location = location || '';
      session.meetingLink = '';
    }

    await session.save();

    const updatedSession = await Session.findById(req.params.sessionId).populate('participants', 'name email');

    res.json({
      message: 'Session mode updated successfully!',
      session: updatedSession
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/session/:id
// @desc    Get session details (includes mode info)
router.get('/:id', auth, async (req, res) => {
  try {
    const session = await Session.findById(req.params.id)
      .populate('participants', 'name email expertTags');
    
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    res.json(session);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
