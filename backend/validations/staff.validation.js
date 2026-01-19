const Joi = require('joi');

const createStaffSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  dob: Joi.date().required(),
  address: Joi.string().required(),
  phone: Joi.string().required(),
  photo: Joi.string().allow('').optional().default(''), // Optional, defaults to empty string
  salary: Joi.number().min(0).required(),
  shift_start: Joi.string().required(),
  shift_end: Joi.string().required(),
  notes: Joi.string().allow('').optional(),
});

const updateStaffSchema = Joi.object({
  name: Joi.string().optional(),
  email: Joi.string().email().optional(),
  dob: Joi.date().optional(),
  address: Joi.string().optional(),
  phone: Joi.string().optional(),
  photo: Joi.string().optional(),
  salary: Joi.number().min(0).optional(),
  shift_start: Joi.string().optional(),
  shift_end: Joi.string().optional(),
  notes: Joi.string().allow('').optional(),
});

const deleteStaffSchema = Joi.object({
  ids: Joi.array().items(Joi.string().hex().length(24)).min(1).required(),
});

module.exports = {
  createStaffSchema,
  updateStaffSchema,
  deleteStaffSchema,
};
