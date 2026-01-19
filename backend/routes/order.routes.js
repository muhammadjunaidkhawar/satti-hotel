const express = require('express');
const router = express.Router();
const {
  getAllOrders,
  addOrder,
  updateOrderStatus,
  payOrder,
  getOrderStats,
  getDashboardStats,
  getSalesChartData,
} = require('../controllers/order.controller');

router.get('/', getAllOrders);
router.post('/', addOrder);
router.put('/:id/status', updateOrderStatus);
router.put('/:id/pay', payOrder);
router.get('/stats', getOrderStats);
router.get('/dashboard', getDashboardStats);
router.get('/chart', getSalesChartData);

module.exports = router;
