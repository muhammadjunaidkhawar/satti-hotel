const express = require('express');
const router = express.Router();
const { getAllAttendance, addAttendance } = require('../controllers/attendance.controller');

router.get('/', getAllAttendance);
router.post('/', addAttendance);

module.exports = router;
