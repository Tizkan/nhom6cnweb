require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require("path");

const app = express();

// ================= MIDDLEWARE =================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set('trust proxy', 1);

// ================= ROUTES =================
const authRoutes = require('./routes/authRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const roomRoutes = require('./routes/roomRoutes');
const customerRoutes = require('./routes/customerRoutes');

// ⚠️ ĐÚNG THEO FILE CỦA BẠN
const reportRouters = require('./routes/reportRoutes');
const paymentRoutes = require('./routes/payment');

app.use('/auth', authRoutes);
app.use('/bookings', bookingRoutes);
app.use('/rooms', roomRoutes);
app.use('/customers', customerRoutes);
app.use('/reports', reportRouters);
app.use('/api/payment', paymentRoutes);

// ================= FRONTEND ANGULAR =================
const frontendPath = path.join(__dirname, '../frontend/dist/frontend/browser');

app.use(express.static(frontendPath));

const apiPrefixes = [
  '/auth',
  '/bookings',
  '/rooms',
  '/customers',
  '/reports',
  '/api/payment'
];

app.use((req, res, next) => {

  if (req.method !== 'GET') return next();

  if (apiPrefixes.some(p => req.path.startsWith(p))) {
    return next();
  }

  res.sendFile(path.join(frontendPath, 'index.html'));
});

// ================= START SERVER =================
app.listen(3000, () => {
  console.log('Server running on port 3000');
});