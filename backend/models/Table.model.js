const mongoose = require('mongoose');

/* ===== ENUMS ===== */
const TABLE_STATUS = Object.freeze({
  AVAILABLE: 'available',
  NOT_AVAILABLE: 'not available',
});

/* ===== SCHEMA ===== */
const tableSchema = new mongoose.Schema(
  {
    number: { type: Number, required: true },
    floor: { type: Number, required: true },
    capacity: { type: Number, required: true },
    status: {
      type: String,
      enum: Object.values(TABLE_STATUS),
      required: true,
    },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

/* ===== INDEX ===== */
tableSchema.index({ number: 1, floor: 1 }, { unique: true });

module.exports = mongoose.model('Table', tableSchema);
module.exports.TABLE_STATUS = TABLE_STATUS;
