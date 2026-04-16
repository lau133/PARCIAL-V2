// 1. Import connections to BOTH databases using your specific filenames
const poolCultural = require('../services/cultural.service');
const poolBooking = require('../services/booking.service');

const createBooking = async (bookingData) => {
    // Extract data based on your 'booking' table columns
    const { organization, begin_date, end_date, capacity, id_space } = bookingData;

    // =====================================================================
    // RULE A and B: Validations in Cultural DB (cultural_space table)
    // =====================================================================
    
    // Find the cultural space by its ID
    const spaceQuery = 'SELECT maximum_capacity, state FROM cultural_space WHERE id_space = ?';
    const [spaces] = await poolCultural.execute(spaceQuery, [id_space]);

    // Validate that the space exists
    if (spaces.length === 0) {
        throw new Error("The cultural space does not exist in the Cultural database.");
    }

    const space = spaces[0];

    // Rule A: The state must be operational ('Operativo') at the time of the request
    if (space.state !== 'Operativo') {
        throw new Error("The cultural space is not currently operational.");
    }

    // Rule B: The requested capacity cannot exceed the maximum capacity
    // Note: Since 'capacity' is a VARCHAR in your DB, we use parseInt to compare it as a number
    if (parseInt(capacity) > space.maximum_capacity) {
        throw new Error(`The requested capacity (${capacity}) exceeds the maximum allowed capacity (${space.maximum_capacity}).`);
    }

    // =====================================================================
    // RULE C: Validations in Booking DB (booking table)
    // =====================================================================

    // Check for approved overlapping bookings for the same space
    // An overlap occurs if the new start date is <= an existing end date,
    // AND the new end date is >= an existing start date.
    const overlapQuery = `
        SELECT id_booking FROM booking 
        WHERE id_space = ? 
        AND state = 'Aprobada'
        AND (begin_date <= ? AND end_date >= ?)
    `;
    
    // Pass end_date and then begin_date in that order to match the '?' placeholders
    const [existingBookings] = await poolBooking.execute(overlapQuery, [id_space, end_date, begin_date]);

    if (existingBookings.length > 0) {
        throw new Error("Cannot create booking: There is already an approved booking for this space that overlaps with the requested dates.");
    }

    // =====================================================================
    // INSERTION: If all rules pass, save the request to Booking DB
    // =====================================================================
    
    // The initial state of a new request is 'Pendiente' (Pending)
    const insertQuery = `
        INSERT INTO booking (organization, begin_date, end_date, capacity, state, id_space) 
        VALUES (?, ?, ?, ?, 'Pendiente', ?)
    `;
    
    const [result] = await poolBooking.execute(insertQuery, [organization, begin_date, end_date, capacity, id_space]);
    
    // Return the ID of the newly generated booking
    return result.insertId;
};

// Exam Point 3: Consult the state of a booking
const getBookingState = async (id_booking) => {
    const query = 'SELECT state FROM booking WHERE id_booking = ?';
    const [result] = await poolBooking.execute(query, [id_booking]);
    
    if (result.length === 0) {
        throw new Error("The booking does not exist.");
    }
    
    return result[0];
};

module.exports = { 
    createBooking,
    getBookingState
};