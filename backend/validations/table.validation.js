const Joi = require('joi');
const { TABLE_STATUS } = require('../models/Table.model');

const createTableSchema = Joi.object({
  number: Joi.number().integer().min(1).required(),
  floor: Joi.number().integer().min(0).required(),
  capacity: Joi.number().integer().min(1).required(),
  status: Joi.string()
    .valid(...Object.values(TABLE_STATUS))
    .required(),
});

const updateTableSchema = Joi.object({
  number: Joi.number().integer().min(1).optional(),
  floor: Joi.number().integer().min(0).optional(),
  capacity: Joi.number().integer().min(1).optional(),
  status: Joi.string()
    .valid(...Object.values(TABLE_STATUS))
    .optional(),
});

module.exports = {
  createTableSchema,
  updateTableSchema,
};
