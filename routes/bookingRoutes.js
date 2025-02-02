const express = require('express');
const router = express.Router();
const { verifyToken} = require('../middlewares/verifyUser');
const { 
  bookSeat,
  getBookingDetails,
  cancelBooking 
} = require('../controllers/bookingController');

router.post('/', verifyToken, bookSeat);
router.get('/:bookingId', verifyToken, getBookingDetails);
router.delete('/:bookingId', verifyToken, cancelBooking);

module.exports = router;