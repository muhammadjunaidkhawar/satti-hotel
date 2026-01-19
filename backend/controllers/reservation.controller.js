const { Reservation, Table } = require('../models');
const { sendResponse, validationError, isMongoID } = require('../utils');
const { createReservationSchema, updateReservationSchema } = require('../validations/reservation.validation');

const getAllReservations = async (req, res) => {
  const { date } = req.query;

  if (!date) {
    return sendResponse(res, 'fail', 400, 'Date parameter is required');
  }

  try {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const reservations = await Reservation.find({
      isDeleted: false,
      date: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    })
      .populate('table', 'number floor capacity status')
      .sort({ date: 1, time: 1 });

    return sendResponse(res, 'success', 200, 'Reservations retrieved successfully', reservations);
  } catch (error) {
    return sendResponse(res, 'fail', 500, 'Error retrieving reservations', null);
  }
};

const addReservation = async (req, res) => {
  const { error, value } = createReservationSchema.validate(req.body || {});
  if (error) {
    return sendResponse(res, 'fail', 400, validationError(error));
  }

  try {
    const table = await Table.findOne({ _id: value.table, isDeleted: false });
    if (!table) {
      return sendResponse(res, 'fail', 404, 'Table not found');
    }

    const reservation = new Reservation(value);
    const savedReservation = await reservation.save();
    await savedReservation.populate('table', 'number floor capacity status');
    return sendResponse(res, 'success', 201, 'Reservation created successfully', savedReservation);
  } catch (error) {
    return sendResponse(res, 'fail', 500, 'Error creating reservation', null);
  }
};

const updateReservation = async (req, res) => {
  const { id } = req.params;

  if (!isMongoID(id)) {
    return sendResponse(res, 'fail', 400, 'Invalid reservation ID');
  }

  const { error, value } = updateReservationSchema.validate(req.body || {});
  if (error) {
    return sendResponse(res, 'fail', 400, validationError(error));
  }

  try {
    const reservation = await Reservation.findOne({ _id: id, isDeleted: false });
    if (!reservation) {
      return sendResponse(res, 'fail', 404, 'Reservation not found');
    }

    if (value.table) {
      const table = await Table.findOne({ _id: value.table, isDeleted: false });
      if (!table) {
        return sendResponse(res, 'fail', 404, 'Table not found');
      }
    }

    Object.assign(reservation, value);
    const updatedReservation = await reservation.save();
    await updatedReservation.populate('table', 'number floor capacity status');
    return sendResponse(res, 'success', 200, 'Reservation updated successfully', updatedReservation);
  } catch (error) {
    return sendResponse(res, 'fail', 500, 'Error updating reservation', null);
  }
};

const getReservationCount = async (req, res) => {
  try {
    const totalReservations = await Reservation.countDocuments({ isDeleted: false });
    return sendResponse(res, 'success', 200, 'Reservation count retrieved successfully', {
      totalReservations,
    });
  } catch (error) {
    return sendResponse(res, 'fail', 500, 'Error retrieving reservation count', null);
  }
};

module.exports = {
  getAllReservations,
  addReservation,
  updateReservation,
  getReservationCount,
};
