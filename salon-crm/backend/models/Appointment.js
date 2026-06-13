const mongoose = require('mongoose');
const appointmentSchema = new mongoose.Schema({
    clientName: String,
    clientPhone: String,
    staffId: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' },
    staffName: String,
    date: Date,
    timeSlot: String,
    service: String,
    price: Number,
    discount: { type: Number, default: 0 },
    notes: String,
    status: { type: String, enum: ['Booked', 'Completed', 'Cancelled'], default: 'Booked' }
});
module.exports = mongoose.model('Appointment', appointmentSchema);
