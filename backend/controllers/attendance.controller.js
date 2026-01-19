const { Attendance, Staff } = require('../models');
const { sendResponse, validationError } = require('../utils');
const { createAttendanceSchema } = require('../validations/attendance.validation');

const getAllAttendance = async (req, res) => {
  try {
    const { date } = req.query;
    const filter = { isDeleted: false };

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      filter.date = {
        $gte: startOfDay,
        $lte: endOfDay,
      };
    }

    const attendance = await Attendance.find(filter)
      .populate('staff', 'name email phone photo dob address salary shift_start shift_end')
      .sort({ createdAt: -1 });

    return sendResponse(res, 'success', 200, 'Attendance retrieved successfully', attendance);
  } catch (error) {
    return sendResponse(res, 'fail', 500, 'Error retrieving attendance', null);
  }
};

const addAttendance = async (req, res) => {
  const { error, value } = createAttendanceSchema.validate(req.body || {});
  if (error) {
    return sendResponse(res, 'fail', 400, validationError(error));
  }

  try {
    const staff = await Staff.findOne({ _id: value.staff, isDeleted: false });
    if (!staff) {
      return sendResponse(res, 'fail', 404, 'Staff not found');
    }

    const startOfDay = new Date(value.date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(value.date);
    endOfDay.setHours(23, 59, 59, 999);

    const existingAttendance = await Attendance.findOne({
      staff: value.staff,
      date: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
      isDeleted: false,
    });

    if (existingAttendance) {
      // Update existing attendance instead of creating new one
      existingAttendance.status = value.status;
      if (value.remarks) existingAttendance.remarks = value.remarks;
      const updatedAttendance = await existingAttendance.save();
      await updatedAttendance.populate('staff', 'name email phone photo dob address salary shift_start shift_end');
      return sendResponse(res, 'success', 200, 'Attendance updated successfully', updatedAttendance);
    }

    const attendance = new Attendance(value);
    const savedAttendance = await attendance.save();
    await savedAttendance.populate('staff', 'name email phone photo dob address salary shift_start shift_end');
    return sendResponse(res, 'success', 201, 'Attendance created successfully', savedAttendance);
  } catch (error) {
    return sendResponse(res, 'fail', 500, 'Error creating attendance', null);
  }
};

module.exports = {
  getAllAttendance,
  addAttendance,
};
