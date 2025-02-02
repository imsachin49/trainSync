const db = require('../config/database');
const { asyncHandler } = require('../utils/asyncHandler');
const { ApiError } = require('../utils/ApiError');
const { ApiResponse } = require('../utils/ApiResponse');

const bookSeat = asyncHandler(async (req, res) => {
  console.log("heyy")
  const connection = await db.connect();
  
  console.log("uyoo")
  try {
    await connection.query('BEGIN');
    
    console.log("22222")
    const { trainId } = req.body;
    const userId = req.user.id;
    
    console.log("33333")
    // Check seat availability with lock
    const results = await connection.query(
      'SELECT * FROM trains WHERE id = $1 AND available_seats > 0 FOR UPDATE',
      [trainId]
    );
    console.log("44444")
    const trains=results.rows;
    
    console.log("55555")
    if (trains.length === 0) {
      // await connection.rollback();
        await connection.query('ROLLBACK');
        throw new ApiError(400, 'No seats available');
    }
    
    console.log("66666")
    // Create booking
    const result = await connection.query(
      'INSERT INTO bookings (user_id, train_id, booking_date, status) VALUES ($1, $2, NOW(), $3) RETURNING *',
    [userId, trainId, 'Booked']
    );
    console.log("77777")
    const booking=result.rows;
    console.log("booking",booking)

    // Update available seats
    await connection.query(
      'UPDATE trains SET available_seats = available_seats - 1 WHERE id = $1',
      [trainId]
    );    
    await connection.query('COMMIT');
    
    return res.json(new ApiResponse(200, 'Seat booked successfully', booking));
  } catch (error) {
    // await connection.rollback();
    await connection.query('ROLLBACK');
    console.log("error",error)
    res.status(500).json({ message: 'Error booking seat' });
  } finally {
    // connection.release();
    await connection.release();
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
            'SELECT * FROM bookings WHERE id = $1 AND user_id = $1 FOR UPDATE',
            [bookingId, userId]
        );
        
        if (bookings.length === 0) {
            await connection.rollback();
            throw new ApiError(404, 'Booking not found');
        }
        
        // Delete booking
        await connection.query(
            'DELETE FROM bookings WHERE id = $1',
            [bookingId]
        );
        
        // Update available seats
        await connection.query(
            'UPDATE trains SET available_seats = available_seats + 1 WHERE id = $1',
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