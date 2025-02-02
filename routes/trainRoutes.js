const express = require('express');
const router = express.Router();
const { verifyAdmin,verifyToken } = require('../middlewares/verifyUser');
const { 
  addTrain, 
  getTrains,
  updateSeats,
  getAvailability 
} = require('../controllers/trainController');

router.post('/', verifyAdmin, addTrain);
router.get('/', verifyToken, getTrains);
router.put('/:trainId/seats', verifyAdmin, updateSeats);
router.get('/availability', verifyToken, getAvailability);

module.exports = router;