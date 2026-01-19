const mongoose = require('mongoose');

/* ===== ENUMS ===== */
const CATEGORY_STATUS = Object.freeze({
  ACTIVE: 'active',
  INACTIVE: 'inactive',
});

/* ===== SCHEMA ===== */
const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    type: { type: String, required: true },
    image: { type: String, required: true },
    status: {
      type: String,
      enum: Object.values(CATEGORY_STATUS),
      required: true,
    },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Category', categorySchema);
module.exports.CATEGORY_STATUS = CATEGORY_STATUS;
