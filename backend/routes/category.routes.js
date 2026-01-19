const express = require('express');
const router = express.Router();
const { getAllCategories, addCategory, updateCategory } = require('../controllers/category.controller');

router.get('/', getAllCategories);
router.post('/', addCategory);
router.put('/:id', updateCategory);

module.exports = router;
