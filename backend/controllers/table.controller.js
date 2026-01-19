const { Table, Order } = require('../models');
const { sendResponse, validationError, isMongoID } = require('../utils');
const { createTableSchema, updateTableSchema } = require('../validations/table.validation');
const { ORDER_STATUS } = require('../models/Order.model');

const getAllTables = async (req, res) => {
  try {
    const tables = await Table.find({ isDeleted: false }).sort({ floor: 1, number: 1 });
    return sendResponse(res, 'success', 200, 'Tables retrieved successfully', tables);
  } catch (error) {
    return sendResponse(res, 'fail', 500, 'Error retrieving tables', null);
  }
};

const addTable = async (req, res) => {
  const { error, value } = createTableSchema.validate(req.body || {});
  if (error) {
    return sendResponse(res, 'fail', 400, validationError(error));
  }

  try {
    const existingTable = await Table.findOne({
      number: value.number,
      floor: value.floor,
      isDeleted: false,
    });

    if (existingTable) {
      return sendResponse(res, 'fail', 400, 'Table with this number and floor already exists');
    }

    const table = new Table(value);
    const savedTable = await table.save();
    return sendResponse(res, 'success', 201, 'Table created successfully', savedTable);
  } catch (error) {
    if (error.code === 11000) {
      return sendResponse(res, 'fail', 400, 'Table with this number and floor already exists');
    }
    return sendResponse(res, 'fail', 500, 'Error creating table', null);
  }
};

const updateTable = async (req, res) => {
  const { id } = req.params;

  if (!isMongoID(id)) {
    return sendResponse(res, 'fail', 400, 'Invalid table ID');
  }

  const { error, value } = updateTableSchema.validate(req.body || {});
  if (error) {
    return sendResponse(res, 'fail', 400, validationError(error));
  }

  try {
    const table = await Table.findOne({ _id: id, isDeleted: false });
    if (!table) {
      return sendResponse(res, 'fail', 404, 'Table not found');
    }

    if (value.number !== undefined || value.floor !== undefined) {
      const checkNumber = value.number !== undefined ? value.number : table.number;
      const checkFloor = value.floor !== undefined ? value.floor : table.floor;
      const existingTable = await Table.findOne({
        number: checkNumber,
        floor: checkFloor,
        isDeleted: false,
        _id: { $ne: id },
      });

      if (existingTable) {
        return sendResponse(res, 'fail', 400, 'Table with this number and floor already exists');
      }
    }

    Object.assign(table, value);
    const updatedTable = await table.save();
    return sendResponse(res, 'success', 200, 'Table updated successfully', updatedTable);
  } catch (error) {
    if (error.code === 11000) {
      return sendResponse(res, 'fail', 400, 'Table with this number and floor already exists');
    }
    return sendResponse(res, 'fail', 500, 'Error updating table', null);
  }
};

const getTableOccupancyCount = async (req, res) => {
  try {
    const totalTables = await Table.countDocuments({ isDeleted: false });

    const occupiedTablesResult = await Order.aggregate([
      {
        $match: {
          isDeleted: false,
          status: { $ne: ORDER_STATUS.COMPLETED },
        },
      },
      {
        $group: {
          _id: '$table',
        },
      },
      {
        $count: 'occupiedTables',
      },
    ]);

    const occupiedTables = occupiedTablesResult[0]?.occupiedTables || 0;

    return sendResponse(res, 'success', 200, 'Occupancy count retrieved successfully', {
      totalTables,
      occupiedTables,
    });
  } catch (error) {
    return sendResponse(res, 'fail', 500, 'Error retrieving occupancy count', null);
  }
};

module.exports = {
  getAllTables,
  addTable,
  updateTable,
  getTableOccupancyCount,
};
