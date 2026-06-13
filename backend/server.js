require('dotenv').config(); 
const express = require('express');
const cors = require('cors');
const path = require("path");

const authRoutes = require('./routes/authRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const roomRoutes = require('./routes/roomRoutes');
const customerRoutes = require('./routes/customerRoutes');

const app = express();

app.set('trust proxy', 1);                        
app.use(express.urlencoded({ extended: true }));  
app.use((req, res, next) => {                     
  res.setHeader('ngrok-skip-browser-warning', 'true');
  next();
});

app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/bookings', bookingRoutes);
app.use('/rooms', roomRoutes);
app.use('/customers', customerRoutes);

// Serve frontend static files (built Angular app)
const frontendPath = path.join(__dirname, '../frontend/dist/frontend/browser');
app.use(express.static(frontendPath));

// SPA fallback: for any GET request that is not an API route, serve index.html
const apiPrefixes = ['/auth', '/bookings', '/rooms', '/customers', '/api/auth', '/api/bookings', '/api/rooms', '/api/customers', '/api/payment'];

const paymentRouter = require('./routes/payment');
app.use('/api/payment', paymentRouter);

app.use((req, res, next) => {
  console.log('>>> MIDDLEWARE path:', req.path, '| method:', req.method);
  // only handle GET requests here
  if (req.method !== 'GET') return next();

  // if request path starts with any API prefix, pass through to API handlers
  if (apiPrefixes.some((prefix) => req.path.startsWith(prefix))) {
    return next();
  }

  // otherwise serve the Angular app entrypoint
  res.sendFile(path.join(frontendPath, 'index.html'));
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
const reportRoutes = require("./routes/reportRoutes");


app.use(
"/api/reports",
reportRoutes
);