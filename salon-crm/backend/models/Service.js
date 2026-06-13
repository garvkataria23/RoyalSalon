const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    price: { type: Number, required: true },
    duration: { type: String, default: '60 mins' },
    category: { type: String, default: 'General' }
});

module.exports = mongoose.model('Service', serviceSchema);
