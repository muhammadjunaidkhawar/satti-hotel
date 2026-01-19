const mongoose = require('mongoose');

/* ===== ENUMS ===== */
const RESERVATION_STATUS = Object.freeze({
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
});

const RESERVATION_PAYMENT_METHOD = Object.freeze({
  CASH_ON_DELIVERY: 'cash on delivery',
  ONLINE_TRANSFER: 'online transfer',
  CARD: 'card',
  NO_ADVANCE_PAYMENT: 'no advance payment',
});

/* ===== SUBSCHEMA ===== */
const customerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
  },
  { _id: false }
);

const paymentSchema = new mongoose.Schema(
  {
    payment_method: {
      type: String,
      enum: Object.values(RESERVATION_PAYMENT_METHOD),
      required: true,
    },
    payment_status: { type: String, required: true },
    payment_amount: { type: Number, required: true },
  },
  { _id: false }
);

/* ===== SCHEMA ===== */
const reservationSchema = new mongoose.Schema(
  {
    table: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Table',
      required: true,
    },
    max_persons: { type: Number, required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    advance_fee: { type: Number },
    status: {
      type: String,
      enum: Object.values(RESERVATION_STATUS),
      required: true,
    },
    customer: { type: customerSchema, required: true },
    payment: { type: paymentSchema, required: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Reservation', reservationSchema);
module.exports.RESERVATION_STATUS = RESERVATION_STATUS;
module.exports.RESERVATION_PAYMENT_METHOD = RESERVATION_PAYMENT_METHOD;
