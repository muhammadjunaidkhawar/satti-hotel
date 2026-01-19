const mongoose = require('mongoose');

/* ===== SCHEMA ===== */
const staffSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    dob: { type: Date, required: true },
    address: { type: String, required: true },
    phone: { type: String, required: true },
    photo: { type: String, default: '' },
    salary: { type: Number, required: true },
    shift_start: { type: String, required: true },
    shift_end: { type: String, required: true },
    notes: { type: String },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Staff', staffSchema);
