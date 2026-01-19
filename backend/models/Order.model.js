const mongoose = require('mongoose');

/* ===== ENUMS ===== */
const ORDER_STATUS = Object.freeze({
  IN_PROCESS: 'in process',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
});

const ORDER_PAYMENT_METHOD = Object.freeze({
  CASH_ON_DELIVERY: 'cash on delivery',
  ONLINE_TRANSFER: 'online transfer',
  CARD: 'card',
});

/* ===== SUBSCHEMA ===== */
const productItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    quantity: { type: Number, required: true },
    productSnapshot: {
      name: { type: String },
      description: { type: String },
      image: { type: String },
      productNumber: { type: String },
      price: { type: Number },
      menu: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Menu',
      },
    },
  },
  { _id: false }
);

const customerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
  },
  { _id: false }
);

/* ===== SCHEMA ===== */
const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: Number, unique: true },
    table: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Table',
    },
    products: [productItemSchema],
    price: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    total_price: { type: Number, default: 0 },
    customer: { type: customerSchema, required: true },
    status: {
      type: String,
      enum: Object.values(ORDER_STATUS),
      default: ORDER_STATUS.IN_PROCESS,
    },
    payment_method: {
      type: String,
      enum: Object.values(ORDER_PAYMENT_METHOD),
    },
    tip: { type: Number, default: 0 },
    date: { type: Date, default: Date.now },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
module.exports.ORDER_STATUS = ORDER_STATUS;
module.exports.ORDER_PAYMENT_METHOD = ORDER_PAYMENT_METHOD;
