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

    console.log("111")

    // logic validation
    if (totalSeats < 1) {
        throw new ApiError(400, 'Total seats should be greater than 0');
    }

    console.log("222")
    
    await db.query(
      'INSERT INTO trains (name, source, destination, total_seats, available_seats) VALUES ($1, $2, $3, $4, $5)',
      [name, source, destination, totalSeats, totalSeats]
    );
    console.log("3333");
    
    // res.status(201).json({ message: 'Train added successfully' });
    res.json(new ApiResponse(201, 'Train added successfully'));
  } catch (error) {
    throw new ApiError(500, 'Error adding train');
  }
});

const getTrains = asyncHandler(async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM trains');
    const trains = result.rows;
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
      'UPDATE trains SET total_seats = $1, available_seats = $2 WHERE id = $3',
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
    const result = await db.query(
      'SELECT * FROM trains WHERE source = $1 AND destination = $2 AND available_seats > 0',
      [source, destination]
    );    
    const trains = result.rows;
    res.json(new ApiResponse(200, 'Availability fetched successfully', trains));
  } catch (error) {
    throw new ApiError(500, 'Error fetching availability');
  }
});

module.exports = { addTrain, getTrains, updateSeats, getAvailability };