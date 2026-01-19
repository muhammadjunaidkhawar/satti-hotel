const express = require('express');
const router = express.Router();
const { getAllMenus, addMenu, updateMenu } = require('../controllers/menu.controller');

router.get('/', getAllMenus);
router.post('/', addMenu);
router.put('/:id', updateMenu);

module.exports = router;
