const express = require('express');
const router = express.Router();
const {
  getAllReservations,
  addReservation,
  updateReservation,
  getReservationCount,
} = require('../controllers/reservation.controller');

router.get('/', getAllReservations);
router.post('/', addReservation);
router.put('/:id', updateReservation);
router.get('/count', getReservationCount);

module.exports = router;
