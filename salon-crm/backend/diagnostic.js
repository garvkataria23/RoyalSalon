const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/salon_crm';

mongoose.connect(MONGODB_URI)
    .then(async () => {
        console.log('Diagnostic: Connected to MongoDB');
        const users = await User.find({}, 'userId email name');
        console.log('Current Users in DB:', JSON.stringify(users, null, 2));
        
        const count = await User.countDocuments({});
        console.log('Total User Count:', count);
        
        process.exit(0);
    })
    .catch(err => {
        console.error('Diagnostic Failed:', err);
        process.exit(1);
    });
