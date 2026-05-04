const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/peer-learning';

mongoose.connect(MONGO_URI).then(async () => {
    const mentor = await User.findOne({ email: 'test-mentor@example.com' });
    const learner = await User.findOne({ email: 'test-learner@example.com' });
    console.log('Mentor ID:', mentor ? mentor._id : 'not found');
    console.log('Learner ID:', learner ? learner._id : 'not found');
    process.exit();
}).catch(err => {
    console.error(err);
    process.exit(1);
});
