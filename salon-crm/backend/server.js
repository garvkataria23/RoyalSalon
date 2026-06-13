const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config({ path: require('path').join(__dirname, '.env') });

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/salon_crm';

mongoose.connect(MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Could not connect to MongoDB', err));

const authRoutes = require('./routes/auth');
const appointmentRoutes = require('./routes/appointments');
const staffRoutes = require('./routes/staff');
const clientRoutes = require('./routes/clients');
const serviceRoutes = require('./routes/services');

app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/services', serviceRoutes);

app.get('/', (req, res) => {
    res.send('Salon CRM API is running...');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
