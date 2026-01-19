const express = require('express');
const router = express.Router();
const { getAllTables, addTable, updateTable, getTableOccupancyCount } = require('../controllers/table.controller');

router.get('/', getAllTables);
router.post('/', addTable);
router.put('/:id', updateTable);
router.get('/occupancy-count', getTableOccupancyCount);

module.exports = router;
