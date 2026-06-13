const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    email: { type: String, unique: true, sparse: true },
    password: { type: String, required: true },
    name: String,
    role: { type: String, default: 'admin' }
});

module.exports = mongoose.model('User', userSchema);
