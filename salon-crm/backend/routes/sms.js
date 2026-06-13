const express = require('express');
const router = express.Router();
const SMSCampaign = require('../models/SMSCampaign');
const auth = require('../middleware/auth');

router.post('/send', auth, async (req, res) => {
    try {
        const { phone, name, message } = req.body;
        if (!phone || !message) {
            return res.status(400).json({ message: 'Phone and message are required' });
        }
        const campaign = new SMSCampaign({ phone, name, message });
        const saved = await campaign.save();
        res.status(201).json({ message: 'SMS campaign recorded', campaign: saved });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/campaigns', auth, async (req, res) => {
    try {
        const campaigns = await SMSCampaign.find().sort({ sentAt: -1 });
        res.json(campaigns);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
