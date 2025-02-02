const db = require('../config/database');
const { asyncHandler } = require('../utils/asyncHandler');
const { ApiError } = require('../utils/ApiError');
const { ApiResponse } = require('../utils/ApiResponse');

const bookSeat = asyncHandler(async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { trainId } = req.body;
    const userId = req.user.id;
    
    // Check seat availability with lock
    const [trains] = await connection.query(
      'SELECT * FROM trains WHERE id = ? AND available_seats > 0 FOR UPDATE',
      [trainId]
    );
    
    if (trains.length === 0) {
      await connection.rollback();
        throw new ApiError(400, 'No seats available');
    }
    
    // Create booking
    const [booking] = await connection.query(
      'INSERT INTO bookings (user_id, train_id, booking_date) VALUES (?, ?, NOW())',
      [userId, trainId]
    );
    
    // Update available seats
    await connection.query(
      'UPDATE trains SET available_seats = available_seats - 1 WHERE id = ?',
      [trainId]
    );
    
    await connection.commit();

    res.json(new ApiResponse(201, 'Booking successful', { bookingId: booking.insertId }));
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ message: 'Error booking seat' });
  } finally {
    connection.release();
  }
});

// Method - GET
const getBookingDetails = asyncHandler(async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user.id;
    
    const [bookings] = await db.query(
      `SELECT b.*, t.name as train_name, t.source, t.destination 
       FROM bookings b 
       JOIN trains t ON b.train_id = t.id 
       WHERE b.id = ? AND b.user_id = ?`,
      [bookingId, userId]
    );
    
    if (bookings.length === 0) {
        throw new ApiError(404, 'Booking not found');
    }
    
    res.json(new ApiResponse(200, 'Booking details fetched successfully', bookings[0]));
  } catch (error) {
    throw new ApiError(500, 'Error fetching booking details');
  }
});

// Method -  DELETE
const cancelBooking = asyncHandler(async (req, res) => {
    const connection = await db.getConnection();
    
    try {
        await connection.beginTransaction();
        
        const { bookingId } = req.params;
        const userId = req.user.id;
        
        // Check booking
        const [bookings] = await connection.query(
            'SELECT * FROM bookings WHERE id = ? AND user_id = ? FOR UPDATE',
            [bookingId, userId]
        );
        
        if (bookings.length === 0) {
            await connection.rollback();
            throw new ApiError(404, 'Booking not found');
        }
        
        // Delete booking
        await connection.query(
            'DELETE FROM bookings WHERE id = ?',
            [bookingId]
        );
        
        // Update available seats
        await connection.query(
            'UPDATE trains SET available_seats = available_seats + 1 WHERE id = ?',
            [bookings[0].train_id]
        );
        
        await connection.commit();
        res.json(new ApiResponse(200, 'Booking cancelled successfully'));
    } catch (error) {
        await connection.rollback();
        throw new ApiError(500, 'Error cancelling booking');
    } finally {
        connection.release();
    }
});

module.exports = { bookSeat, getBookingDetails,cancelBooking };