const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const attendanceRoutes = require('./attendance.routes');
const categoryRoutes = require('./category.routes');
const fileRoutes = require('./file.routes');
const menuRoutes = require('./menu.routes');
const orderRoutes = require('./order.routes');
const productRoutes = require('./product.routes');
const reservationRoutes = require('./reservation.routes');
const staffRoutes = require('./staff.routes');
const tableRoutes = require('./table.routes');
const userRoutes = require('./user.routes');

router.use('/auth', authRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/categories', categoryRoutes);
router.use('/files', fileRoutes);
router.use('/menus', menuRoutes);
router.use('/orders', orderRoutes);
router.use('/products', productRoutes);
router.use('/reservations', reservationRoutes);
router.use('/staff', staffRoutes);
router.use('/tables', tableRoutes);
router.use('/users', userRoutes);

module.exports = router;
