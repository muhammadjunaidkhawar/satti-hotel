const Joi = require('joi');

const createProductSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().required(),
  image: Joi.string().required(),
  productNumber: Joi.string().required(),
  price: Joi.number().min(0).required(),
  menu: Joi.string().hex().length(24).required(),
});

const updateProductSchema = Joi.object({
  name: Joi.string().optional(),
  description: Joi.string().optional(),
  image: Joi.string().optional(),
  productNumber: Joi.string().optional(),
  price: Joi.number().min(0).optional(),
  menu: Joi.string().hex().length(24).optional(),
});

const deleteProductsSchema = Joi.object({
  ids: Joi.array().items(Joi.string().hex().length(24)).min(1).required(),
});

module.exports = {
  createProductSchema,
  updateProductSchema,
  deleteProductsSchema,
};
