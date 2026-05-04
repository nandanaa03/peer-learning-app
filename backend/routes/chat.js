const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Message = require('../models/Message');

// @route   GET /api/chat/:sessionId
// @desc    Get chat history for a session
// @access  Private
router.get('/:sessionId', auth, async (req, res) => {
  try {
    const messages = await Message.find({ session: req.params.sessionId })
      .populate('sender', 'name email')
      .sort({ timestamp: 1 });
    
    res.json(messages);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
