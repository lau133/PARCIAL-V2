const express = require('express');
const path = require('path');
require('dotenv').config();

// Import routes
const culturalRoutes = require('./routes/cultural.routes');
const bookingRoutes = require('./routes/booking.routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Middleware to serve static files (your HTML web page)
app.use(express.static(path.join(__dirname, 'public')));

// Mount routes
app.use('/api/cultural', culturalRoutes);
app.use('/api/booking', bookingRoutes);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});