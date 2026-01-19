const { Staff } = require('../models');
const { sendResponse, validationError, isMongoID } = require('../utils');
const { createStaffSchema, updateStaffSchema, deleteStaffSchema } = require('../validations/staff.validation');

const getAllStaff = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = { isDeleted: false };

    const [staff, total] = await Promise.all([
      Staff.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Staff.countDocuments(filter),
    ]);

    return sendResponse(res, 'success', 200, 'Staff retrieved successfully', {
      staff,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit,
      },
    });
  } catch (error) {
    return sendResponse(res, 'fail', 500, 'Error retrieving staff', null);
  }
};

const addStaff = async (req, res) => {
  try {
    // Extract data from FormData (multer puts file in req.file, fields in req.body)
    const staffData = {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      dob: req.body.dob,
      address: req.body.address,
      salary: req.body.salary ? parseFloat(req.body.salary) : undefined,
      shift_start: req.body.shift_start,
      shift_end: req.body.shift_end,
      notes: req.body.notes || '',
      photo: req.file ? req.file.filename : (req.body.photo || ''),
    };

    const { error, value } = createStaffSchema.validate(staffData);
    if (error) {
      // If validation fails and file was uploaded, delete it
      if (req.file) {
        const fs = require('fs');
        const path = require('path');
        const filePath = path.join(__dirname, '../uploads', req.file.filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      return sendResponse(res, 'fail', 400, validationError(error));
    }

    const staff = new Staff(value);
    const savedStaff = await staff.save();
    return sendResponse(res, 'success', 201, 'Staff created successfully', savedStaff);
  } catch (error) {
    // If error occurs and file was uploaded, delete it
    if (req.file) {
      const fs = require('fs');
      const path = require('path');
      const filePath = path.join(__dirname, '../uploads', req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    return sendResponse(res, 'fail', 500, 'Error creating staff', null);
  }
};

const updateStaff = async (req, res) => {
  const { id } = req.params;

  if (!isMongoID(id)) {
    return sendResponse(res, 'fail', 400, 'Invalid staff ID');
  }

  try {
    // Extract data from FormData
    const staffData = {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      dob: req.body.dob,
      address: req.body.address,
      salary: req.body.salary ? parseFloat(req.body.salary) : undefined,
      shift_start: req.body.shift_start,
      shift_end: req.body.shift_end,
      notes: req.body.notes || '',
    };

    // Only include photo if a new file was uploaded
    if (req.file) {
      staffData.photo = req.file.filename;
      // Delete old photo if exists
      const staff = await Staff.findOne({ _id: id, isDeleted: false });
      if (staff && staff.photo) {
        const fs = require('fs');
        const path = require('path');
        const filePath = path.join(__dirname, '../uploads', staff.photo);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    } else if (req.body.photo) {
      staffData.photo = req.body.photo;
    }

    const { error, value } = updateStaffSchema.validate(staffData);
    if (error) {
      // If validation fails and file was uploaded, delete it
      if (req.file) {
        const fs = require('fs');
        const path = require('path');
        const filePath = path.join(__dirname, '../uploads', req.file.filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      return sendResponse(res, 'fail', 400, validationError(error));
    }

    const staff = await Staff.findOne({ _id: id, isDeleted: false });
    if (!staff) {
      // If staff not found and file was uploaded, delete it
      if (req.file) {
        const fs = require('fs');
        const path = require('path');
        const filePath = path.join(__dirname, '../uploads', req.file.filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      return sendResponse(res, 'fail', 404, 'Staff not found');
    }

    Object.assign(staff, value);
    const updatedStaff = await staff.save();
    return sendResponse(res, 'success', 200, 'Staff updated successfully', updatedStaff);
  } catch (error) {
    // If error occurs and file was uploaded, delete it
    if (req.file) {
      const fs = require('fs');
      const path = require('path');
      const filePath = path.join(__dirname, '../uploads', req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    return sendResponse(res, 'fail', 500, 'Error updating staff', null);
  }
};

const deleteStaff = async (req, res) => {
  const { error, value } = deleteStaffSchema.validate(req.body || {});
  if (error) {
    return sendResponse(res, 'fail', 400, validationError(error));
  }

  const { ids } = value;

  const invalidIds = ids.filter((id) => !isMongoID(id));
  if (invalidIds.length > 0) {
    return sendResponse(res, 'fail', 400, `Invalid IDs: ${invalidIds.join(', ')}`);
  }

  try {
    const result = await Staff.updateMany({ _id: { $in: ids } }, { $set: { isDeleted: true } });
    return sendResponse(res, 'success', 200, `Successfully deleted ${result.modifiedCount} staff member(s)`, {
      deletedCount: result.modifiedCount,
    });
  } catch (error) {
    return sendResponse(res, 'fail', 500, 'Error deleting staff', null);
  }
};

module.exports = {
  getAllStaff,
  addStaff,
  updateStaff,
  deleteStaff,
};
