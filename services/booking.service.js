const mysql = require('mysql2/promise');
require('dotenv').config();

// Create a connection pool for the Booking database
const poolBooking = mysql.createPool({
    host: process.env.DB_BOOKING_HOST,
    user: process.env.DB_BOOKING_USER,
    password: process.env.DB_BOOKING_PASS,
    database: process.env.DB_BOOKING_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = poolBooking;
