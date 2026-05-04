const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Profile = require('../models/Profile');
const Session = require('../models/Session');
const Answer = require('../models/Answer');
const ForumPost = require('../models/ForumPost');

// @route   GET /api/expert/update
// @desc    Analyze user performance and update expert tags
// @access  Private
router.get('/update', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user });
    if (!profile) return res.status(404).json({ message: 'Profile not found' });

    const subjects = profile.subjectsKnown;
    const newTags = [];

    for (const subject of subjects) {
      // Logic: User has conducted >= 3 sessions in this subject
      const sessionsCount = await Session.countDocuments({
        participants: req.user,
        topic: { $regex: subject, $options: 'i' }
      });

      // Logic: User has answered >= 5 forum questions in this subject
      const forumPosts = await ForumPost.find({ subject: { $regex: subject, $options: 'i' } });
      const postIds = forumPosts.map(p => p._id);
      const validAnswersCount = await Answer.countDocuments({
        user: req.user,
        post: { $in: postIds }
      });

      if (sessionsCount >= 3 || validAnswersCount >= 5) {
        newTags.push(`${subject} Expert`);
      }
    }

    const user = await User.findById(req.user);
    user.expertTags = newTags;
    await user.save();

    res.json(user.expertTags);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/expert/me
// @desc    Get current user's expert tags
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user).select('expertTags');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user.expertTags);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
