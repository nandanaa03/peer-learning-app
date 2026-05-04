const mongoose = require('mongoose');
const Session = require('./models/Session');
const dotenv = require('dotenv');
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/peer-learning';

mongoose.connect(MONGO_URI).then(async () => {
    const sessions = await Session.find();
    console.log('Sessions found:', JSON.stringify(sessions, null, 2));
    process.exit();
}).catch(err => {
    console.error(err);
    process.exit(1);
});
