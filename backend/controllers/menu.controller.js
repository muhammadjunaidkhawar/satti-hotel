const { Menu, Category } = require('../models');
const { sendResponse, validationError, isMongoID } = require('../utils');
const { createMenuSchema, updateMenuSchema } = require('../validations/menu.validation');

const getAllMenus = async (req, res) => {
  try {
    const menus = await Menu.find({ isDeleted: false })
      .populate('category', 'name description type image status')
      .sort({ createdAt: -1 });
    return sendResponse(res, 'success', 200, 'Menus retrieved successfully', menus);
  } catch (error) {
    return sendResponse(res, 'fail', 500, 'Error retrieving menus', null);
  }
};

const addMenu = async (req, res) => {
  const { error, value } = createMenuSchema.validate(req.body || {});
  if (error) {
    return sendResponse(res, 'fail', 400, validationError(error));
  }

  try {
    const category = await Category.findOne({ _id: value.category, isDeleted: false });
    if (!category) {
      return sendResponse(res, 'fail', 404, 'Category not found');
    }

    const menu = new Menu(value);
    const savedMenu = await menu.save();
    await savedMenu.populate('category', 'name description type image status');
    return sendResponse(res, 'success', 201, 'Menu created successfully', savedMenu);
  } catch (error) {
    return sendResponse(res, 'fail', 500, 'Error creating menu', null);
  }
};

const updateMenu = async (req, res) => {
  const { id } = req.params;

  if (!isMongoID(id)) {
    return sendResponse(res, 'fail', 400, 'Invalid menu ID');
  }

  const { error, value } = updateMenuSchema.validate(req.body || {});
  if (error) {
    return sendResponse(res, 'fail', 400, validationError(error));
  }

  try {
    const menu = await Menu.findOne({ _id: id, isDeleted: false });
    if (!menu) {
      return sendResponse(res, 'fail', 404, 'Menu not found');
    }

    if (value.category) {
      const category = await Category.findOne({ _id: value.category, isDeleted: false });
      if (!category) {
        return sendResponse(res, 'fail', 404, 'Category not found');
      }
    }

    Object.assign(menu, value);
    const updatedMenu = await menu.save();
    await updatedMenu.populate('category', 'name description type image status');
    return sendResponse(res, 'success', 200, 'Menu updated successfully', updatedMenu);
  } catch (error) {
    return sendResponse(res, 'fail', 500, 'Error updating menu', null);
  }
};

module.exports = {
  getAllMenus,
  addMenu,
  updateMenu,
};
