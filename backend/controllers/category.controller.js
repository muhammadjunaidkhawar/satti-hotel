const { Category } = require('../models');
const { sendResponse, validationError, isMongoID } = require('../utils');
const { createCategorySchema, updateCategorySchema } = require('../validations/category.validation');

const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isDeleted: false }).sort({ createdAt: -1 });
    return sendResponse(res, 'success', 200, 'Categories retrieved successfully', categories);
  } catch (error) {
    return sendResponse(res, 'fail', 500, 'Error retrieving categories', null);
  }
};

const addCategory = async (req, res) => {
  const { error, value } = createCategorySchema.validate(req.body || {});
  if (error) {
    return sendResponse(res, 'fail', 400, validationError(error));
  }

  try {
    const category = new Category(value);
    const savedCategory = await category.save();
    return sendResponse(res, 'success', 201, 'Category created successfully', savedCategory);
  } catch (error) {
    return sendResponse(res, 'fail', 500, 'Error creating category', null);
  }
};

const updateCategory = async (req, res) => {
  const { id } = req.params;

  if (!isMongoID(id)) {
    return sendResponse(res, 'fail', 400, 'Invalid category ID');
  }

  const { error, value } = updateCategorySchema.validate(req.body || {});
  if (error) {
    return sendResponse(res, 'fail', 400, validationError(error));
  }

  try {
    const category = await Category.findOne({ _id: id, isDeleted: false });
    if (!category) {
      return sendResponse(res, 'fail', 404, 'Category not found');
    }

    Object.assign(category, value);
    const updatedCategory = await category.save();
    return sendResponse(res, 'success', 200, 'Category updated successfully', updatedCategory);
  } catch (error) {
    return sendResponse(res, 'fail', 500, 'Error updating category', null);
  }
};

module.exports = {
  getAllCategories,
  addCategory,
  updateCategory,
};
