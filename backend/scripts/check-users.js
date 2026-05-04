const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/peer-learning';

mongoose.connect(MONGO_URI)
  .then(async () => {
    const users = await User.find({}, { name: 1, email: 1, _id: 0 });
    console.log('Registered Users in Database:');
    console.table(users);
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
