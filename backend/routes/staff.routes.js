const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload');
const { getAllStaff, addStaff, updateStaff, deleteStaff } = require('../controllers/staff.controller');

router.get('/', getAllStaff);
router.post('/', upload.single('photo'), addStaff);
router.put('/:id', upload.single('photo'), updateStaff);
router.delete('/', deleteStaff);

module.exports = router;
