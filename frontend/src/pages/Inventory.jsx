// src/pages/Inventory.jsx
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

export default function Inventory() {
  const navigate = useNavigate();
  const [showAddInventory, setShowAddInventory] = useState(false);
  const [editingItem, setEditingItem] = useState(null); // if set => edit mode
  const [selectedPreview, setSelectedPreview] = useState(null);
  const [filter, setFilter] = useState("All");

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const filteredProducts =
    filter === "All" ? products : products.filter((p) => p.status === filter);

  // form state
  const [form, setForm] = useState({
    name: "",
    category: "",
    unit: "Piece",
    stock: 0,
    status: "Active",
    price: 0,
    perishable: false,
    imageFile: null, // File
  });

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/inventory");
      setProducts(res.data);
    } catch (err) {
      console.error("fetch inventory error:", err);
    } finally {
      setLoading(false);
    }
  };

  // open Add panel (clear form)
  const openAdd = () => {
    setEditingItem(null);
    setForm({
      name: "",
      category: "",
      unit: "Piece",
      stock: "",
      status: "Active",
      price: "",
      perishable: false,
      imageFile: null,
    });
    setSelectedPreview(null);
    setShowAddInventory(true);
  };

  // open Edit panel
  const openEdit = (item) => {
    setEditingItem(item);
    setForm({
      name: item.name || "",
      category: item.category || "",
      unit: item.unit || "Piece",
      stock: item.stock || 0,
      status: item.status || "Active",
      price: item.price || 0,
      perishable: item.perishable || false,
      imageFile: null, // if user uploads new image, will replace
    });
    setSelectedPreview(
      item.image ? `http://localhost:5000/uploads/${item.image}` : null
    );
    setShowAddInventory(true);
  };

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (f) {
      setForm((p) => ({ ...p, imageFile: f }));
      setSelectedPreview(URL.createObjectURL(f));
    }
  };

  const handleFormChange = (key, value) => {
    setForm((p) => ({ ...p, [key]: value }));
  };

  // submit add or edit
  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("category", form.category);
      fd.append("unit", form.unit);
      fd.append("stock", form.stock);
      fd.append("status", form.status);
      fd.append("price", form.price);
      fd.append("perishable", form.perishable ? "true" : "false");
      if (form.imageFile) fd.append("image", form.imageFile);

      if (editingItem) {
        // PUT
        const res = await axios.put(
          `http://localhost:5000/api/inventory/${editingItem._id}`,
          fd,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        // update in state
        setProducts((prev) =>
          prev.map((p) => (p._id === res.data._id ? res.data : p))
        );
      } else {
        // POST
        const res = await axios.post(
          "http://localhost:5000/api/inventory",
          fd,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        setProducts((prev) => [res.data, ...prev]);
      }

      setShowAddInventory(false);
      setEditingItem(null);
      setSelectedPreview(null);
    } catch (err) {
      console.error("save inventory error:", err);
      alert(err?.response?.data?.message || "Save failed");
    }
  };

  // delete
  const handleDelete = async (id) => {
    if (!confirm("Delete this inventory item?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/inventory/${id}`);
      setProducts((p) => p.filter((x) => x._id !== id));
    } catch (err) {
      console.error("delete error:", err);
      alert("Delete failed");
    }
  };

  return (
    <>
      <div className="p-6">
        {/* Total Products */}
        <p className="text-lg mb-5">
          <span className="text-white">{products.length} total products</span>
          <button
            onClick={openAdd}
            className="bg-[#FF9500] ml-184 hover:bg-[#e68806] text-black px-4 py-2 text-sm rounded-md"
          >
            Add New Inventory
          </button>
        </p>
        <div className="flex gap-3 mb-5">
          {["All", "Active", "Inactive", "Draft"].map((item) => (
            <button
              key={item}
              onClick={() => setFilter(item)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
                filter === item
                  ? "bg-white text-black border-white"
                  : "bg-[#1e1e1e] text-gray-300 border-gray-700 hover:bg-[#2a2a2a]"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="flex gap-6">
          {/* Products List */}
          <div className="flex-1 space-y-3 ">
            {loading ? (
              <div className="text-center text-gray-400 py-10">Loading...</div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-gray-500 text-center py-10">
                No products found
              </div>
            ) : (
              <div className="space-y-3">
                {filteredProducts.map((product) => (
                  <div
                    key={product._id}
                    className="flex items-center justify-between bg-[#1e1e1e] border border-[#2a2a2a]
      px-5 py-3 rounded-xl shadow-sm transition-all duration-200 
      hover:bg-[#252525] hover:border-[#3a3a3a] max-w-4xl mx-auto"
                  >
                    {/* LEFT */}
                    <div className="flex items-center gap-4 w-[260px]">
                      <img
                        src={
                          product.image
                            ? `http://localhost:5000/uploads/${product.image}`
                            : product.img || "https://via.placeholder.com/60"
                        }
                        alt={product.name}
                        className="w-14 h-14 rounded-lg object-cover border border-[#333]"
                      />

                      <div className="min-w-0">
                        <h3 className="font-semibold text-base truncate">
                          {product.name}
                        </h3>
                        <p className="text-xs text-gray-400">
                          Stock:{" "}
                          <span className="text-gray-200">{product.stock}</span>
                        </p>
                      </div>
                    </div>

                    {/* MIDDLE (FIXED GRID FOR PERFECT ALIGNMENT) */}
                    <div className="grid grid-cols-3 gap-10 text-xs w-[380px]">
                      {/* STATUS */}
                      <div className="flex flex-col">
                        <p className="text-gray-400 text-[11px] mb-1">Status</p>
                        <span
                          className={`w-fit px-1 py-0.5 text-[11px] rounded-md font-medium ${
                            product.status === "Active"
                              ? "bg-green-600/20 text-green-400 border border-green-700/30"
                              : product.status === "Inactive"
                              ? "bg-red-600/20 text-red-400 border border-red-700/30"
                              : "bg-yellow-600/20 text-yellow-300 border border-yellow-700/40"
                          }`}
                        >
                          {product.status}
                        </span>
                      </div>

                      {/* CATEGORY */}
                      <div className="flex flex-col">
                        <p className="text-gray-400 text-[11px] mb-1">
                          Category
                        </p>
                        <p className="font-medium truncate">
                          {product.category}
                        </p>
                      </div>

                      {/* PRICE */}
                      <div className="flex flex-col">
                        <p className="text-gray-400 text-[11px] mb-1">Price</p>
                        <p className="font-semibold text-white">
                          ${(product.price || 0).toFixed(2)}
                        </p>
                      </div>
                    </div>

                    {/* ACTION BUTTONS */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => openEdit(product)}
                        className="p-2 bg-[#2d2d2d] hover:bg-[#3a3a3a] border border-[#444]
          rounded-md text-white transition-all"
                        title="Edit"
                      >
                        <i className="fa-solid fa-pen"></i>
                      </button>

                      <button
                        onClick={() => handleDelete(product._id)}
                        className="p-2 bg-[#2d2d2d] hover:bg-[#3a3a3a] border border-[#444]
          rounded-md text-red-400 transition-all"
                        title="Delete"
                      >
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Inventory Panel */}
      {showAddInventory && (
        <div
          className="fixed top-0 right-0 w-[35%] h-full bg-[#1a1a1a] shadow-xl border-l border-gray-800 p-8 overflow-y-auto transition-all duration-500 ease-in-out rounded-l-3xl z-50"
          onClick={(e) => e.stopPropagation()}
        >
                <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-3">
                  <h2 className="text-xl font-semibold text-[#FF9500]">
                    {editingItem ? "Edit Inventory" : "Add New Inventory"}
                  </h2>
                  <button
                    onClick={() => {
                      setShowAddInventory(false);
                      setEditingItem(null);
                      setSelectedPreview(null);
                    }}
                    className="text-[#FF9500] hover:text-white text-xl transition-all"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleSave} className="space-y-5">
                  {/* Image Upload */}
                  <div className="flex flex-col items-center">
                    <div className="w-44 h-36 bg-[#2a2a2a] flex items-center justify-center rounded-xl mb-3 overflow-hidden border border-gray-700 shadow-md">
                      {selectedPreview ? (
                        <img
                          src={selectedPreview}
                          alt="Selected"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <i className="fa-solid fa-image text-gray-500 text-3xl"></i>
                      )}
                    </div>

                    <input
                      type="file"
                      accept="image/*"
                      id="imageInput"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="imageInput"
                      className="bg-[#FF9500] hover:bg-[#e68806] px-4 py-1 rounded-full text-black text-sm font-medium cursor-pointer transition-all"
                    >
                      Upload Image
                    </label>
                  </div>

                  {/* Input Fields */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-white text-xs mb-2 block">
                        NAME
                      </label>
                      <input
                        type="text"
                        placeholder="Enter inventory name"
                        value={form.name}
                        onChange={(e) =>
                          handleFormChange("name", e.target.value)
                        }
                        className="bg-[#2a2a2a] p-2 rounded-md text-sm w-full focus:ring-2 focus:ring-[#FF9500] outline-none transition"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-white text-xs mb-2 block">
                        CATEGORY
                      </label>
                      <input
                        type="text"
                        placeholder="Category"
                        value={form.category}
                        onChange={(e) =>
                          handleFormChange("category", e.target.value)
                        }
                        className="bg-[#2a2a2a] p-2 rounded-md text-sm w-full focus:ring-2 focus:ring-[#FF9500] outline-none transition"
                      />
                    </div>

                    <div>
                      <label className="text-white text-xs mb-2 block">
                        QUANTITY
                      </label>
                      <input
                        type="number"
                        value={form.stock}
                        onChange={(e) =>
                          handleFormChange("stock", Number(e.target.value))
                        }
                        className="bg-[#2a2a2a] p-2 rounded-md text-sm w-full focus:ring-2 focus:ring-[#FF9500] outline-none transition"
                      />
                    </div>

                    <div>
                      <label className="text-white text-xs mb-2 block">
                        STOCK
                      </label>
                      <select
                        value={form.status}
                        onChange={(e) =>
                          handleFormChange("status", e.target.value)
                        }
                        className="bg-[#2a2a2a] p-2 rounded-md text-sm w-full focus:ring-2 focus:ring-[#FF9500] outline-none transition"
                      >
                        <option>InStock</option>
                        <option>Out Of Stock</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-white text-xs mb-2 block">
                      STATUS
                    </label>
                    <select
                      value={form.status}
                      onChange={(e) =>
                        handleFormChange("status", e.target.value)
                      }
                      className="bg-[#2a2a2a] p-2 rounded-md text-sm w-full focus:ring-2 focus:ring-[#FF9500] outline-none transition"
                    >
                      <option>Active</option>
                      <option>Inactive</option>
                      <option>Draft</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-white text-xs mb-2 block">
                      PRICE
                    </label>
                    <input
                      type="number"
                      placeholder="Enter price"
                      value={form.price}
                      onChange={(e) =>
                        handleFormChange("price", Number(e.target.value))
                      }
                      className="bg-[#2a2a2a] p-2 rounded-md text-sm w-full focus:ring-2 focus:ring-[#FF9500] outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block mb-2 text-white">Perishable</label>
                    <div className="flex gap-6">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="perishable"
                          checked={form.perishable === true}
                          onChange={() => handleFormChange("perishable", true)}
                          className="accent-[#FF9500]"
                        />
                        Yes
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="perishable"
                          checked={form.perishable === false}
                          onChange={() => handleFormChange("perishable", false)}
                          className="accent-[#FF9500]"
                        />
                        No
                      </label>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex justify-end gap-4 mt-6">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddInventory(false);
                        setEditingItem(null);
                        setSelectedPreview(null);
                      }}
                      className="text-gray-400 hover:text-white text-sm font-medium underline-offset-2 hover:underline transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-[#FF9500] hover:bg-[#e68806] text-black px-6 py-2 rounded-md text-sm font-semibold shadow-md transition-all"
                    >
                      {editingItem ? "Save Changes" : "Save"}
                    </button>
                  </div>
                </form>
        </div>
      )}
    </>
  );
}
