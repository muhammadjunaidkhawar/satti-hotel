const Joi = require('joi');
const { RESERVATION_STATUS, RESERVATION_PAYMENT_METHOD } = require('../models/Reservation.model');

const createReservationSchema = Joi.object({
  table: Joi.string().hex().length(24).required(),
  max_persons: Joi.number().integer().min(1).required(),
  date: Joi.date().required(),
  time: Joi.string().required(),
  advance_fee: Joi.number().min(0).optional(),
  status: Joi.string()
    .valid(...Object.values(RESERVATION_STATUS))
    .required(),
  customer: Joi.object({
    name: Joi.string().required(),
    phone: Joi.string().required(),
    email: Joi.string().email().allow('').optional(),
  }).required(),
  payment: Joi.object({
    payment_method: Joi.string()
      .valid(...Object.values(RESERVATION_PAYMENT_METHOD))
      .required(),
    payment_status: Joi.string().required(),
    payment_amount: Joi.number().min(0).required(),
  }).required(),
});

const updateReservationSchema = Joi.object({
  table: Joi.string().hex().length(24).optional(),
  max_persons: Joi.number().integer().min(1).optional(),
  date: Joi.date().optional(),
  time: Joi.string().optional(),
  advance_fee: Joi.number().min(0).optional(),
  status: Joi.string()
    .valid(...Object.values(RESERVATION_STATUS))
    .optional(),
  customer: Joi.object({
    name: Joi.string().optional(),
    phone: Joi.string().optional(),
    email: Joi.string().email().allow('').optional(),
  }).optional(),
  payment: Joi.object({
    payment_method: Joi.string()
      .valid(...Object.values(RESERVATION_PAYMENT_METHOD))
      .optional(),
    payment_status: Joi.string().optional(),
    payment_amount: Joi.number().min(0).optional(),
  }).optional(),
});

module.exports = {
  createReservationSchema,
  updateReservationSchema,
};
