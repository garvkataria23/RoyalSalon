const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/salon_crm';

mongoose.connect(MONGODB_URI)
    .then(async () => {
        console.log('Index Fix: Connected to MongoDB');
        try {
            await User.collection.dropIndexes();
            console.log('Indexes dropped successfully');
            
            // Re-sync indexes
            await User.createIndexes();
            console.log('Indexes recreated successfully');
        } catch (e) {
            console.log('No indexes to drop or error:', e.message);
        }
        process.exit(0);
    })
    .catch(err => {
        console.error('Index Fix Failed:', err);
        process.exit(1);
    });
