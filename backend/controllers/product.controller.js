const { Product, Menu } = require('../models');
const { sendResponse, validationError, isMongoID } = require('../utils');
const { createProductSchema, updateProductSchema, deleteProductsSchema } = require('../validations/product.validation');

const getAllProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = { isDeleted: false };

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate('menu', 'name category')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Product.countDocuments(filter),
    ]);

    return sendResponse(res, 'success', 200, 'Products retrieved successfully', {
      products,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit,
      },
    });
  } catch (error) {
    return sendResponse(res, 'fail', 500, 'Error retrieving products', null);
  }
};

const addProduct = async (req, res) => {
  const { error, value } = createProductSchema.validate(req.body || {});
  if (error) {
    return sendResponse(res, 'fail', 400, validationError(error));
  }

  try {
    const menu = await Menu.findOne({ _id: value.menu, isDeleted: false });
    if (!menu) {
      return sendResponse(res, 'fail', 404, 'Menu not found');
    }

    const existingProduct = await Product.findOne({
      productNumber: value.productNumber,
      isDeleted: false,
    });
    if (existingProduct) {
      return sendResponse(res, 'fail', 400, 'Product number already exists');
    }

    const product = new Product(value);
    const savedProduct = await product.save();
    await savedProduct.populate('menu', 'name category');
    return sendResponse(res, 'success', 201, 'Product created successfully', savedProduct);
  } catch (error) {
    if (error.code === 11000) {
      return sendResponse(res, 'fail', 400, 'Product number already exists');
    }
    return sendResponse(res, 'fail', 500, 'Error creating product', null);
  }
};

const updateProduct = async (req, res) => {
  const { id } = req.params;

  if (!isMongoID(id)) {
    return sendResponse(res, 'fail', 400, 'Invalid product ID');
  }

  const { error, value } = updateProductSchema.validate(req.body || {});
  if (error) {
    return sendResponse(res, 'fail', 400, validationError(error));
  }

  try {
    const product = await Product.findOne({ _id: id, isDeleted: false });
    if (!product) {
      return sendResponse(res, 'fail', 404, 'Product not found');
    }

    if (value.menu) {
      const menu = await Menu.findOne({ _id: value.menu, isDeleted: false });
      if (!menu) {
        return sendResponse(res, 'fail', 404, 'Menu not found');
      }
    }

    if (value.productNumber && value.productNumber !== product.productNumber) {
      const existingProduct = await Product.findOne({
        productNumber: value.productNumber,
        isDeleted: false,
        _id: { $ne: id },
      });
      if (existingProduct) {
        return sendResponse(res, 'fail', 400, 'Product number already exists');
      }
    }

    Object.assign(product, value);
    const updatedProduct = await product.save();
    await updatedProduct.populate('menu', 'name category');
    return sendResponse(res, 'success', 200, 'Product updated successfully', updatedProduct);
  } catch (error) {
    if (error.code === 11000) {
      return sendResponse(res, 'fail', 400, 'Product number already exists');
    }
    return sendResponse(res, 'fail', 500, 'Error updating product', null);
  }
};

const deleteProducts = async (req, res) => {
  const { error, value } = deleteProductsSchema.validate(req.body || {});
  if (error) {
    return sendResponse(res, 'fail', 400, validationError(error));
  }

  const { ids } = value;

  const invalidIds = ids.filter((id) => !isMongoID(id));
  if (invalidIds.length > 0) {
    return sendResponse(res, 'fail', 400, `Invalid IDs: ${invalidIds.join(', ')}`);
  }

  try {
    const result = await Product.updateMany({ _id: { $in: ids } }, { $set: { isDeleted: true } });
    return sendResponse(res, 'success', 200, `Successfully deleted ${result.modifiedCount} product(s)`, {
      deletedCount: result.modifiedCount,
    });
  } catch (error) {
    return sendResponse(res, 'fail', 500, 'Error deleting products', null);
  }
};

const getRandomProducts = async (req, res) => {
  try {
    const products = await Product.aggregate([
      { $match: { isDeleted: false } },
      { $sample: { size: 10 } },
      {
        $lookup: {
          from: 'menus',
          localField: 'menu',
          foreignField: '_id',
          as: 'menuData',
        },
      },
      {
        $unwind: {
          path: '$menuData',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          name: 1,
          description: 1,
          image: 1,
          productNumber: 1,
          price: 1,
          menu: {
            _id: '$menuData._id',
            name: '$menuData.name',
            category: '$menuData.category',
          },
          createdAt: 1,
          updatedAt: 1,
        },
      },
    ]);

    return sendResponse(res, 'success', 200, 'Random products retrieved successfully', products);
  } catch (error) {
    return sendResponse(res, 'fail', 500, 'Error retrieving random products', null);
  }
};

module.exports = {
  getAllProducts,
  addProduct,
  updateProduct,
  deleteProducts,
  getRandomProducts,
};
