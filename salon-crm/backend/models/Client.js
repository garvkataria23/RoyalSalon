const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    email: { type: String, unique: true, sparse: true },
    visits: { type: Number, default: 0 },
    lastVisit: Date,
    points: { type: Number, default: 0 }
});

module.exports = mongoose.model('Client', clientSchema);
