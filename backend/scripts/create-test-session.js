const mongoose = require('mongoose');
const User = require('./models/User');
const Session = require('./models/Session');
const dotenv = require('dotenv');
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/peer-learning';

mongoose.connect(MONGO_URI).then(async () => {
    const mentor = await User.findOne({ email: 'test-mentor@example.com' });
    const learner = await User.findOne({ email: 'test-learner@example.com' });
    
    if (!mentor || !learner) {
        console.log('Seed users not found. Run seed-test-data.js first.');
        process.exit(1);
    }

    const session = new Session({
        topic: 'React Hooks Deep Dive',
        participants: [mentor._id, learner._id],
        date: new Date(),
        time: '10:00 AM',
        status: 'scheduled'
    });

    await session.save();
    console.log('Session created ID:', session._id.toString());
    process.exit();
}).catch(err => {
    console.error(err);
    process.exit(1);
});
