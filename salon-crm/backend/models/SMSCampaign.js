const mongoose = require('mongoose');

const smsCampaignSchema = new mongoose.Schema({
    phone: { type: String, required: true },
    name: { type: String, required: true },
    message: { type: String, required: true },
    status: { type: String, default: 'sent' },
    sentAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SMSCampaign', smsCampaignSchema);
