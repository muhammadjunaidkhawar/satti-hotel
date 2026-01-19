const Joi = require('joi');

const createMenuSchema = Joi.object({
  name: Joi.string().required(),
  category: Joi.string().hex().length(24).required(),
  image: Joi.string().required(),
});

const updateMenuSchema = Joi.object({
  name: Joi.string().optional(),
  category: Joi.string().hex().length(24).optional(),
  image: Joi.string().optional(),
});

module.exports = {
  createMenuSchema,
  updateMenuSchema,
};
