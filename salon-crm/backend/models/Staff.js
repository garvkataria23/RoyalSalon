const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
    name: { type: String, required: true },
    specialization: String,
    email: { type: String, unique: true, sparse: true },
    phone: { type: String, unique: true, sparse: true }
});

module.exports = mongoose.model('Staff', staffSchema);
