const Joi = require('joi');
const { CATEGORY_STATUS } = require('../models/Category.model');

const createCategorySchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().allow('').optional(),
  type: Joi.string().required(),
  image: Joi.string().required(),
  status: Joi.string()
    .valid(...Object.values(CATEGORY_STATUS))
    .required(),
});

const updateCategorySchema = Joi.object({
  name: Joi.string().optional(),
  description: Joi.string().allow('').optional(),
  type: Joi.string().optional(),
  image: Joi.string().optional(),
  status: Joi.string()
    .valid(...Object.values(CATEGORY_STATUS))
    .optional(),
});

module.exports = {
  createCategorySchema,
  updateCategorySchema,
};
