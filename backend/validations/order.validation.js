const Joi = require('joi');
const { ORDER_STATUS, ORDER_PAYMENT_METHOD } = require('../models/Order.model');

const createOrderSchema = Joi.object({
  table: Joi.string().hex().length(24).required(),
  products: Joi.array()
    .items(
      Joi.object({
        product: Joi.string().hex().length(24).required(),
        quantity: Joi.number().integer().min(1).required(),
      })
    )
    .min(1)
    .required(),
  customer: Joi.object({
    name: Joi.string().required(),
  }).required(),
});

const updateOrderStatusSchema = Joi.object({
  status: Joi.string()
    .valid(...Object.values(ORDER_STATUS))
    .required(),
});

const payOrderSchema = Joi.object({
  price: Joi.number().min(0).required(),
  tax: Joi.number().min(0).required(),
  total_price: Joi.number().min(0).required(),
  payment_method: Joi.string()
    .valid(...Object.values(ORDER_PAYMENT_METHOD))
    .required(),
  tip: Joi.number().min(0).default(0).optional(),
  date: Joi.date().required(),
});

module.exports = {
  createOrderSchema,
  updateOrderStatusSchema,
  payOrderSchema,
};
