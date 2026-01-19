const Joi = require('joi');

const createAttendanceSchema = Joi.object({
  staff: Joi.string().hex().length(24).required(),
  date: Joi.date().required(),
  status: Joi.string().required(),
  remarks: Joi.string().allow('').optional(),
});

module.exports = {
  createAttendanceSchema,
};
