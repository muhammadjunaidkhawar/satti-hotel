import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const AddMenuItem = ({ onClose, onSave, existingItem }) => {
  const [productImage, setProductImage] = useState(null);
  const [productName, setProductName] = useState("");
  const [itemId, setItemId] = useState("");
  const [stock, setStock] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [availability, setAvailability] = useState("Available");
  const [menuType, setMenuType] = useState("");
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (existingItem) {
      setProductName(existingItem.productName || "");
      setItemId(existingItem.itemId || "");
      setStock(existingItem.stock || "");
      setCategory(existingItem.category || "");
      setPrice(existingItem.price || "");
      setAvailability(existingItem.availability || "Available");
      setMenuType(existingItem.menuType || "");
    }
  }, [existingItem]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("productName", productName);
    formData.append("itemId", itemId);
    formData.append("stock", stock || 0);
    formData.append("category", category);
    formData.append("price", price || 0);
    formData.append("availability", availability);
    formData.append("menuType", menuType);
    if (productImage) formData.append("image", productImage);

    try {
      setSaving(true);
      let res;

      if (existingItem && existingItem._id) {
        res = await axios.put(
          `http://localhost:5000/api/menu/${existingItem._id}`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        alert("Menu item updated successfully!");
      } else {
        res = await axios.post("http://localhost:5000/api/menu", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert("Menu item added successfully!");
      }

      if (onSave) onSave(res.data);
      if (onClose) onClose();
    } catch (err) {
      console.error("Save error:", err);
      alert(err?.response?.data?.message || "Failed to save item");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onClose) onClose();
  };

  return (
    <>
      {/* Blurred background overlay */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Slide-in Form Panel */}
      <div className="fixed top-0 right-0 w-[35%] h-full bg-[#1a1a1a] border-l border-[#FF9500]/30 shadow-2xl p-6 overflow-y-auto z-50 transform transition-transform duration-500 ease-in-out translate-x-0 animate-fadeIn">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-3">
          <h2 className="text-xl font-semibold text-[#FF9500] tracking-wide">
            {existingItem ? "Edit Menu Item" : "Add New Menu Item"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-[#FF9500] transition"
          >
            <i className="fa-solid fa-chevron-right text-lg"></i>
          </button>
        </div>

        {/* Form Section */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-5 bg-[#222] p-6 rounded-xl border border-[#FF9500]/20 shadow-lg"
        >
          {/* Product Image */}
          <div>
            <label className="text-gray-300 text-sm mb-2 block">
              Upload Product Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setProductImage(e.target.files[0])}
              className="w-full bg-[#2a2a2a] border border-gray-700 p-2 rounded-md text-sm text-gray-400 focus:outline-none focus:border-[#FF9500]"
            />
          </div>

          {/* Select Menu */}
          <div>
            <label className="text-gray-300 text-sm mb-2 block">
              Select Menu
            </label>
            <select
              value={menuType}
              onChange={(e) => setMenuType(e.target.value)}
              className="w-full bg-[#2a2a2a] border border-gray-700 p-2 rounded-md text-sm text-gray-400 focus:outline-none focus:border-[#FF9500]"
            >
              <option value="">Select menu</option>
              <option value="Normal Menu">Normal Menu</option>
              <option value="Special Deals">Special Deals</option>
              <option value="New Year Special">New Year Special</option>
              <option value="Desserts & Drinks">Desserts & Drinks</option>
            </select>
          </div>

          {/* Product Name */}
          <div>
            <label className="text-gray-300 text-sm mb-2 block">
              Product Name
            </label>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className="w-full bg-[#2a2a2a] border border-gray-700 p-2 rounded-md text-sm text-gray-400 focus:outline-none focus:border-[#FF9500]"
              required
            />
          </div>

          {/* Item ID */}
          <div>
            <label className="text-gray-300 text-sm mb-2 block">Item ID</label>
            <input
              type="text"
              value={itemId}
              onChange={(e) => setItemId(e.target.value)}
              className="w-full bg-[#2a2a2a] border border-gray-700 p-2 rounded-md text-sm text-gray-400 focus:outline-none focus:border-[#FF9500]"
              required
            />
          </div>

          {/* Stock */}
          <div>
            <label className="text-gray-300 text-sm mb-2 block">Stock</label>
            <input
              type="number"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              className="w-full bg-[#2a2a2a] border border-gray-700 p-2 rounded-md text-sm text-gray-400 focus:outline-none focus:border-[#FF9500]"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="text-gray-300 text-sm mb-2 block">Category</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-[#2a2a2a] border border-gray-700 p-2 rounded-md text-sm text-gray-400 focus:outline-none focus:border-[#FF9500]"
              required
            />
          </div>

          {/* Price */}
          <div>
            <label className="text-gray-300 text-sm mb-2 block">Price</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full bg-[#2a2a2a] border border-gray-700 p-2 rounded-md text-sm text-gray-400 focus:outline-none focus:border-[#FF9500]"
              required
            />
          </div>

          {/* Availability */}
          <div>
            <label className="text-gray-300 text-sm mb-2 block">
              Availability
            </label>
            <select
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
              className="w-full bg-[#2a2a2a] border border-gray-700 p-2 rounded-md text-sm text-gray-400 focus:outline-none focus:border-[#FF9500]"
            >
              <option value="Available">In Stock</option>
              <option value="Out of Stock">Out of Stock</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="flex justify-between mt-4">
            <button
              type="button"
              onClick={handleCancel}
              className="bg-gray-600 text-white px-5 py-2 rounded-lg text-xs hover:bg-gray-500 transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="bg-[#FF9500] text-black px-5 py-2 rounded-lg text-xs font-semibold hover:bg-[#e68806] transition"
            >
              {saving
                ? "Saving..."
                : existingItem
                ? "Update Item"
                : "Save Item"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default AddMenuItem;
