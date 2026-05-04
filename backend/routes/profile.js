const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Profile = require('../models/Profile');

// Helper: parse subjects from string or array
const parseSubjects = (val) => {
  if (!val) return [];
  if (Array.isArray(val)) return val.map(s => s.trim()).filter(Boolean);
  return val.split(',').map(s => s.trim()).filter(Boolean);
};

// @route   GET /api/profile/me
// @desc    Get current user's profile
router.get('/me', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user });
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/profile
// @desc    Create profile
router.post('/', auth, async (req, res) => {
  const { name, subjectsKnown, subjectsToLearn, availability } = req.body;

  if (!name || !availability) {
    return res.status(400).json({ message: 'Name and availability are required' });
  }

  const profileFields = {
    user: req.user,
    name: name.trim(),
    subjectsKnown: parseSubjects(subjectsKnown),
    subjectsToLearn: parseSubjects(subjectsToLearn),
    availability: availability.trim(),
    updatedAt: Date.now()
  };

  try {
    let profile = await Profile.findOne({ user: req.user });

    if (profile) {
      profile = await Profile.findOneAndUpdate(
        { user: req.user },
        { $set: profileFields },
        { new: true }
      );
      return res.json(profile);
    }

    profile = new Profile(profileFields);
    await profile.save();
    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/profile
// @desc    Update existing profile (Edit Skill Profile - Use Case 10)
router.put('/', auth, async (req, res) => {
  const { name, subjectsKnown, subjectsToLearn, availability } = req.body;

  if (!name || !availability) {
    return res.status(400).json({ message: 'Name and availability are required' });
  }

  const subjectsKnownArr = parseSubjects(subjectsKnown);
  const subjectsToLearnArr = parseSubjects(subjectsToLearn);

  if (subjectsKnownArr.length === 0) {
    return res.status(400).json({ message: 'Please enter at least one subject you can teach' });
  }

  if (subjectsToLearnArr.length === 0) {
    return res.status(400).json({ message: 'Please enter at least one subject you want to learn' });
  }

  try {
    let profile = await Profile.findOne({ user: req.user });

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found. Please create your profile first.' });
    }

    profile = await Profile.findOneAndUpdate(
      { user: req.user },
      {
        $set: {
          name: name.trim(),
          subjectsKnown: subjectsKnownArr,
          subjectsToLearn: subjectsToLearnArr,
          availability: availability.trim(),
          updatedAt: Date.now()
        }
      },
      { new: true }
    );

    res.json({ message: 'Profile updated successfully!', profile });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
