const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Profile = require('./models/Profile');
const dotenv = require('dotenv');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/peer-learning';

const seedData = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing test data
    await User.deleteMany({ email: /test-.*@example.com/ });
    await Profile.deleteMany({});

    // 1. Create Mentor (User B)
    const salt = await bcrypt.genSalt(10);
    const mentorPassword = await bcrypt.hash('password123', salt);
    
    const mentor = new User({
      name: 'Mentor Mike (Test)',
      email: 'test-mentor@example.com',
      password: mentorPassword
    });
    await mentor.save();

    const mentorProfile = new Profile({
      user: mentor._id,
      name: mentor.name,
      subjectsKnown: ['React', 'JavaScript', 'Node.js'],
      subjectsToLearn: ['Python'],
      availability: 'Weekend'
    });
    await mentorProfile.save();

    // 2. Create Learner (User A)
    const learnerPassword = await bcrypt.hash('password123', salt);
    const learner = new User({
      name: 'Learner Lucy (Test)',
      email: 'test-learner@example.com',
      password: learnerPassword
    });
    await learner.save();

    const learnerProfile = new Profile({
      user: learner._id,
      name: learner.name,
      subjectsKnown: ['HTML', 'CSS'],
      subjectsToLearn: ['React'],
      availability: 'Weekend'
    });
    await learnerProfile.save();

    console.log('Seeding complete!');
    console.log('-------------------');
    console.log('Test Account 1 (Mentor): test-mentor@example.com / password123');
    console.log('Test Account 2 (Learner): test-learner@example.com / password123');
    console.log('-------------------');
    console.log('Matching Subject: React');
    console.log('Common Availability: Weekend');
    
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedData();
