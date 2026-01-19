const mongoose = require('mongoose');
const { MONGO_URI } = require('../constants');

// Export ONLY database-related concerns from this module to avoid circular deps.
const User = require('./User.model');
const Category = require('./Category.model');
const Menu = require('./Menu.model');
const Product = require('./Product.model');
const Order = require('./Order.model');
const Reservation = require('./Reservation.model');
const Table = require('./Table.model');
const Staff = require('./Staff.model');
const Attendance = require('./Attendance.model');

// Export enums
const { ORDER_STATUS, ORDER_PAYMENT_METHOD } = require('./Order.model');
const { TABLE_STATUS } = require('./Table.model');
const { CATEGORY_STATUS } = require('./Category.model');
const { RESERVATION_STATUS, RESERVATION_PAYMENT_METHOD } = require('./Reservation.model');

const connect_database = () => {
  mongoose
    .connect(MONGO_URI)
    .then(() => {
      return console.log(`DATABASE CONNECTION SUCCESSFUL !`);
    })
    .catch((error) => {
      console.log('Error connecting to database: ', error.message);
      return process.exit(1);
    });
};

module.exports = {
  connect_database,
  User,
  Category,
  Menu,
  Product,
  Order,
  Reservation,
  Table,
  Staff,
  Attendance,
  ORDER_STATUS,
  ORDER_PAYMENT_METHOD,
  TABLE_STATUS,
  CATEGORY_STATUS,
  RESERVATION_STATUS,
  RESERVATION_PAYMENT_METHOD,
};
