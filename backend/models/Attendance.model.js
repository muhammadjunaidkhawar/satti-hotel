const mongoose = require('mongoose');

/* ===== SCHEMA ===== */
const attendanceSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    status: { type: String, required: true },
    remarks: { type: String },
    staff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Staff',
      required: true,
    },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Attendance', attendanceSchema);
