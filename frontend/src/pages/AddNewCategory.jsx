import React, { useState } from "react";
import axios from "axios";

export default function AddNewCategory({ onClose, onSave }) {
  const [categoryName, setCategoryName] = useState("");
  const [iconClass, setIconClass] = useState("fa-solid fa-list");
  const [imageFile, setImageFile] = useState(null);
  const [items, setItems] = useState("");
  const [saving, setSaving] = useState(false);

  const availableIcons = [
    { name: "Bakery", iconClass: "fa-solid fa-bread-slice" },
    { name: "Beverages", iconClass: "fa-solid fa-mug-hot" },
    { name: "Seafood", iconClass: "fa-solid fa-fish" },
    { name: "Chicken", iconClass: "fa-solid fa-drumstick-bite" },
    { name: "Pizza", iconClass: "fa-solid fa-pizza-slice" },
    { name: "Burgers", iconClass: "fa-solid fa-burger" },
    { name: "Italian", iconClass: "fa-solid fa-utensils" },
  ];

  const handleImageChange = (e) => {
    const f = e.target.files?.[0];
    if (f) {
      setImageFile(URL.createObjectURL(f));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!categoryName.trim()) return alert("Please enter category name");

    const itemsNumber = items === "" ? 0 : Number(items);
    if (isNaN(itemsNumber) || itemsNumber < 0) {
      return alert("Items must be a non-negative number");
    }

    try {
      setSaving(true);
      const payload = { name: categoryName.trim(), iconClass, items: itemsNumber };
      const res = await axios.post("http://localhost:5000/api/categories", payload);
      onSave && onSave(res.data);
      onClose && onClose();
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-end bg-black/50 z-50">
      <div
        className="w-[35%] h-full bg-[#1a1a1a] border-l border-gray-800 shadow-[0_0_40px_rgba(255,149,0,0.15)]
                   p-6 overflow-y-auto transform transition-all duration-500 ease-in-out translate-x-0"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-[#FF9500]">Add New Category</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-[#FF9500] transition text-lg"
          >
            <i className="fa-solid fa-chevron-right"></i>
          </button>
        </div>

        <hr className="border-gray-700 mb-5" />
        <form onSubmit={handleSave} className="space-y-6 animate-fadeIn">
          {/* Image Upload Preview */}
          <div className="flex flex-col items-center">
            <div className="w-40 h-32 bg-[#2a2a2a] flex items-center justify-center rounded-lg mb-3 overflow-hidden border border-gray-700">
              {imageFile ? (
                <img src={imageFile} className="w-full h-full object-cover" alt="preview" />
              ) : (
                <i className="fa-regular fa-image text-3xl text-gray-500"></i>
              )}
            </div>

            <input
              type="file"
              accept="image/*"
              id="catImage"
              onChange={handleImageChange}
              className="hidden"
            />
            <label
              htmlFor="catImage"
              className="text-[#FF9500] text-sm cursor-pointer hover:underline"
            >
              Upload Icon
            </label>
          </div>

          {/* Icon Picker */}
          <div>
            <label className="text-gray-300 text-sm mb-2 block">Select Icon</label>
            <div className="flex flex-wrap gap-3">
              {availableIcons.map((icon, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setIconClass(icon.iconClass)}
                  className={`border border-gray-700 p-3 rounded-md text-white text-lg transition-all duration-200
                    ${
                      iconClass === icon.iconClass
                        ? "bg-[#FF9500] text-black scale-110 shadow-[0_0_10px_rgba(255,149,0,0.5)]"
                        : "bg-[#2a2a2a] hover:border-[#FF9500]"
                    }`}
                >
                  <i className={icon.iconClass}></i>
                </button>
              ))}
            </div>
          </div>

          {/* Category Name */}
          <div>
            <label className="text-gray-300 text-sm mb-2 block">Category Name</label>
            <input
              type="text"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="Enter Category name"
              className="w-full bg-[#2a2a2a] border border-gray-700 p-3 rounded-md text-sm text-white focus:outline-none focus:border-[#FF9500]"
              required
            />
          </div>

          {/* Items Count */}
          <div>
            <label className="text-gray-300 text-sm mb-2 block">Items</label>
            <input
              type="number"
              inputMode="numeric"
              min="0"
              value={items}
              onChange={(e) => setItems(e.target.value)}
              placeholder="Enter Number of Items"
              className="w-full bg-[#2a2a2a] border border-gray-700 p-3 rounded-md text-sm text-white focus:outline-none focus:border-[#FF9500]"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-6 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-[#FF9500] transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="bg-[#FF9500] hover:bg-[#e68806] text-black font-semibold px-6 py-2 rounded-md transition shadow-md"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
