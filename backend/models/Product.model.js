const mongoose = require('mongoose');

/* ===== SCHEMA ===== */
const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
    productNumber: { type: String, required: true, unique: true },
    price: { type: Number, required: true },
    menu: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Menu',
    },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
