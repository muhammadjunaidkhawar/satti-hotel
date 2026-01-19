const express = require('express');
const router = express.Router();
const {
  getAllProducts,
  addProduct,
  updateProduct,
  deleteProducts,
  getRandomProducts,
} = require('../controllers/product.controller');

router.get('/', getAllProducts);
router.post('/', addProduct);
router.put('/:id', updateProduct);
router.delete('/', deleteProducts);
router.get('/random', getRandomProducts);

module.exports = router;
