const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const ForumPost = require('../models/ForumPost');
const Answer = require('../models/Answer');

// @route   POST /api/forum
// @desc    Create a new doubt
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, subject } = req.body;
    const newPost = new ForumPost({
      user: req.user,
      title,
      description,
      subject
    });
    const post = await newPost.save();
    res.json(post);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/forum
// @desc    Get all doubts
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const posts = await ForumPost.find()
      .populate('user', 'name expertTags')
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/forum/:id
// @desc    Get post + answers
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id).populate('user', 'name');
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    const answers = await Answer.find({ post: req.params.id })
      .populate('user', 'name expertTags')
      .sort({ createdAt: 1 });
    res.json({ post, answers });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/forum/:id/answer
// @desc    Add answer to a post
// @access  Private
router.post('/:id/answer', auth, async (req, res) => {
  try {
    const { answer } = req.body;
    const newAnswer = new Answer({
      post: req.params.id,
      user: req.user,
      answer
    });
    const savedAnswer = await newAnswer.save();
    const populatedAnswer = await Answer.findById(savedAnswer._id).populate('user', 'name');
    res.json(populatedAnswer);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
