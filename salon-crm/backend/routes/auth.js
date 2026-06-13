const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Staff = require('../models/Staff');
const Client = require('../models/Client');
const Appointment = require('../models/Appointment');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');

const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

router.post('/login', async (req, res) => {
    const { userId, password } = req.body;
    try {
        const user = await User.findOne({ userId });
        if (!user) return res.status(400).json({ message: 'User not found' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'salon_secret', { expiresIn: '24h' });
        res.json({ token, user: { id: user._id, userId: user.userId, name: user.name, role: user.role } });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/create-staff', auth, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });
    const { userId, password, name, email } = req.body;
    try {
        let existing = await User.findOne({ userId });
        if (existing) return res.status(400).json({ message: 'User ID is already taken' });

        if (email) {
            if (!validateEmail(email)) return res.status(400).json({ message: 'Invalid email format' });
            let emailExists = await User.findOne({ email });
            if (emailExists) return res.status(400).json({ message: 'Email is already in use' });
        }

        const hashed = await bcrypt.hash(password, 10);
        const user = new User({ userId, email: email || undefined, password: hashed, name, role: 'staff' });
        await user.save();
        res.status(201).json({ message: 'Staff account created', user: { id: user._id, userId: user.userId, name: user.name, role: user.role } });
    } catch (err) {
        res.status(500).json({ message: 'Error creating staff account' });
    }
});

router.get('/users', auth, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.delete('/users/:id', auth, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });
    try {
        const target = await User.findById(req.params.id);
        if (!target) return res.status(404).json({ message: 'User not found' });
        if (target.role === 'admin') return res.status(400).json({ message: 'Cannot delete admin account' });
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'Staff account removed' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/seed', async (req, res) => {
    try {
        const adminExists = await User.findOne({ userId: 'admin' });
        if (!adminExists) {
            const hashed = await bcrypt.hash('aurashineinfotech', 10);
            await new User({ userId: 'admin', password: hashed, name: 'Royal Admin', email: 'admin@royalsalon.com', role: 'admin' }).save();
        } else {
            const hashed = await bcrypt.hash('aurashineinfotech', 10);
            await User.updateOne({ userId: 'admin' }, { password: hashed, role: 'admin' });
        }

        const staffData = [
            { name: 'Alexander Gold', specialization: 'Master Stylist', email: 'alex@royalsalon.com', phone: '9876543210' },
            { name: 'Elena Rose', specialization: 'Skin Specialist', email: 'elena@royalsalon.com', phone: '9876543211' }
        ];
        for (const s of staffData) {
            const exists = await Staff.findOne({ email: s.email });
            if (!exists) await new Staff(s).save();
        }

        const clientData = [
            { name: 'Lady Genevieve', phone: '1112223333', email: 'gen@client.com' },
            { name: 'Sir William', phone: '4445556666', email: 'will@client.com' }
        ];
        for (const c of clientData) {
            const exists = await Client.findOne({ phone: c.phone });
            if (!exists) await new Client(c).save();
        }

        res.json({ message: 'Boutique data seeded successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Seed error: ' + err.message });
    }
});

module.exports = router;
