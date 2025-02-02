const db = require('../config/database');
const { asyncHandler } = require('../utils/asyncHandler');
const { ApiError } = require('../utils/ApiError');
const { ApiResponse } = require('../utils/ApiResponse');

const addTrain = asyncHandler(async (req, res) => {
  try {
    const { name, source, destination, totalSeats } = req.body;

    // input validation
    if (!name || !source || !destination || !totalSeats) {
        throw new ApiError(400, 'Please enter all fields');
    }

    // logic validation
    if (totalSeats < 1) {
        throw new ApiError(400, 'Total seats should be greater than 0');
    }
    
    await db.query(
      'INSERT INTO trains (name, source, destination, total_seats, available_seats) VALUES (?, ?, ?, ?, ?)',
      [name, source, destination, totalSeats, totalSeats]
    );
    
    // res.status(201).json({ message: 'Train added successfully' });
    res.json(new ApiResponse(201, 'Train added successfully'));
  } catch (error) {
    throw new ApiError(500, 'Error adding train');
  }
});

const getTrains = asyncHandler(async (req, res) => {
  try {
    const [trains] = await db.query('SELECT * FROM trains');
    res.json(new ApiResponse(200, 'Trains fetched successfully', trains));
  } catch (error) {
    throw new ApiError(500, 'Error fetching trains');
  }
});

const updateSeats = asyncHandler(async (req, res) => {
  try {
    const { trainId } = req.params;
    const { totalSeats } = req.body;
    
    await db.query(
      'UPDATE trains SET total_seats = ?, available_seats = ? WHERE id = ?',
      [totalSeats, totalSeats, trainId]
    );
    res.json(new ApiResponse(200, 'Seats updated successfully'));
  } catch (error) {
    throw new ApiError(500, 'Error updating seats');
  }
});

const getAvailability = asyncHandler(async (req, res) => {
  try {
    const { source, destination } = req.query;
    const [trains] = await db.query(
      'SELECT * FROM trains WHERE source = ? AND destination = ? AND available_seats > 0',
      [source, destination]
    );    
    res.json(new ApiResponse(200, 'Availability fetched successfully', trains));
  } catch (error) {
    throw new ApiError(500, 'Error fetching availability');
  }
});

module.exports = { addTrain, getTrains, updateSeats, getAvailability };