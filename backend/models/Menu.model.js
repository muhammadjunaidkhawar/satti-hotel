const mongoose = require('mongoose');

/* ===== SCHEMA ===== */
const menuSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    image: { type: String, required: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Menu', menuSchema);
