// src/pages/Order.jsx
import React, { useState, useMemo } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import {
  useOrdersQuery,
  useAddOrderMutation,
  useUpdateOrderStatusMutation,
  usePayOrderMutation,
} from "../api/order.api";
import { useProductsQuery } from "../api/product.api";
import { useMenusQuery } from "../api/menu.api";
import { useTablesQuery } from "../api/table.api";
import Modal from "../components/common/Modal";
import { Trash2 } from "lucide-react";

export default function Order() {
  const [activeTab, setActiveTab] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invoiceOrder, setInvoiceOrder] = useState(null);
  const [received, setReceived] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("cash on delivery");
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [search, setSearch] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    control,
    setValue,
    watch,
  } = useForm({
    defaultValues: {
      table: "",
      customer_name: "",
      products: [{ menu: "", product: "", quantity: 1 }],
      status: "in process",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "products",
  });

  // Fetch all orders (backend doesn't filter by status in query)
  const { data: ordersData, isLoading: loadingOrders } = useOrdersQuery({});
  const allOrders = ordersData?.result?.orders || [];

  // Filter orders by active tab
  const orders = useMemo(() => {
    if (activeTab === "All") return allOrders;
    
    const statusMap = {
      "In Process": "in process",
      "Ready": "in process", // Backend doesn't have "ready", using "in process"
      "Completed": "completed",
      "Cancelled": "cancelled",
    };
    
    const targetStatus = statusMap[activeTab];
    if (!targetStatus) return allOrders;
    
    return allOrders.filter((order) => order.status === targetStatus);
  }, [allOrders, activeTab]);

  // Filter orders by search
  const filteredOrders = useMemo(() => {
    if (!search) return orders;
    const searchLower = search.toLowerCase();
    return orders.filter(
      (order) =>
        order.customer?.name?.toLowerCase().includes(searchLower) ||
        order.orderNumber?.toString().includes(searchLower) ||
        order.table?.number?.toString().includes(searchLower)
    );
  }, [orders, search]);

  // Fetch products and tables
  const { data: productsData } = useProductsQuery();
  const allProducts = productsData?.result?.products || [];

  // Fetch menus
  const { data: menusData } = useMenusQuery();
  const menus = menusData?.result || [];

  const { data: tablesData } = useTablesQuery();
  const tables = tablesData?.result || [];

  // Mutations
  const addOrderMutation = useAddOrderMutation({
    onSuccess: () => {
      handleCloseModal();
    },
  });

  const updateOrderStatusMutation = useUpdateOrderStatusMutation({
    onSuccess: () => {
      handleCloseModal();
    },
  });

  const payOrderMutation = usePayOrderMutation({
    onSuccess: () => {
      setShowInvoiceModal(false);
      setShowSuccessPopup(true);
      setTimeout(() => setShowSuccessPopup(false), 2000);
    },
  });

  // Handle add new order
  const handleAddNew = () => {
    setEditingOrder(null);
    reset({
      table: tables[0]?._id || "",
      customer_name: "",
      products: [{ menu: "", product: "", quantity: 1 }],
      status: "in process",
    });
    setIsModalOpen(true);
  };

  // Handle edit order
  const handleEdit = (order) => {
    setEditingOrder(order);
    reset({
      table: typeof order.table === "object" ? order.table._id : order.table || "",
      customer_name: order.customer?.name || "",
      products:
        order.products && order.products.length > 0
          ? order.products.map((p) => {
              const productId =
                typeof p.product === "object" ? p.product._id : p.product || "";
              const foundProduct = allProducts.find((prod) => prod._id === productId);
              const productMenuValue = foundProduct?.menu;
              const menuId =
                typeof productMenuValue === "object"
                  ? productMenuValue?._id
                  : productMenuValue || "";

              return {
                menu: menuId,
                product: productId,
                quantity: p.quantity || 1,
              };
            })
          : [{ menu: "", product: "", quantity: 1 }],
      status: order.status || "in process",
    });
    setIsModalOpen(true);
  };

  // Handle close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingOrder(null);
    reset();
  };

  // Handle form submit
  const onSubmit = async (data) => {
    try {
      const payload = {
        table: data.table,
        customer: {
          name: data.customer_name,
        },
        products: data.products
          .filter((p) => p.product)
          .map((p) => ({
            product: p.product,
            quantity: parseInt(p.quantity) || 1,
          })),
      };

      if (editingOrder) {
        // Update order status only (backend doesn't support full update)
        await updateOrderStatusMutation.mutateAsync({
          id: editingOrder._id,
          payload: { status: data.status },
        });
      } else {
        await addOrderMutation.mutateAsync(payload);
      }
    } catch (error) {
      console.error("Submit error:", error);
    }
  };

  // Handle delete order (if needed - backend might not have delete)
  const handleDeleteOrder = async (id) => {
    if (!window.confirm("Delete this order?")) return;
    // Note: Backend might not have delete endpoint
    console.log("Delete order:", id);
  };

  // Handle pay order
  const handlePayOrder = async () => {
    if (!invoiceOrder) return;

    const subtotal = calcSubtotal(invoiceOrder.products || []);
    const tax = subtotal * 0.1;
    const tip = invoiceOrder.tip || 0;
    const total = subtotal + tax + tip;

    try {
      await payOrderMutation.mutateAsync({
        id: invoiceOrder._id,
        payload: {
          price: subtotal,
          tax: tax,
          total_price: total,
          payment_method: paymentMethod,
          tip: tip,
          date: new Date(),
        },
      });

      // Also update status to completed
      await updateOrderStatusMutation.mutateAsync({
        id: invoiceOrder._id,
        payload: { status: "completed" },
      });
    } catch (error) {
      console.error("Pay order error:", error);
    }
  };

  // UI helpers
  const calcSubtotal = (products) => {
    if (!products || !Array.isArray(products)) return 0;
    return products.reduce((sum, item) => {
      const price = item.productSnapshot?.price || item.price || 0;
      const quantity = item.quantity || 0;
      return sum + price * quantity;
    }, 0);
  };

  const getProductName = (product) => {
    if (typeof product === "object") {
      return product.productSnapshot?.name || product.name || "Unknown";
    }
    const found = allProducts.find((p) => p._id === product);
    return found?.name || "Unknown";
  };

  const getProductPrice = (product) => {
    if (typeof product === "object") {
      return product.productSnapshot?.price || product.price || 0;
    }
    const found = allProducts.find((p) => p._id === product);
    return found?.price || 0;
  };

  const watchedProducts = watch("products") || [];

  return (
    <>
      <div className="p-6 relative overflow-hidden">
        {/* Orders Section */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-2">
            {["All", "In Process", "Ready", "Completed", "Cancelled"].map(
              (tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-md font-normal text-sm ${
                    activeTab === tab
                      ? "bg-[#FF9500] text-black"
                      : "bg-[#2a2a2a] text-white"
                  }`}
                >
                  {tab}
                </button>
              )
            )}
          </div>

          <div className="flex gap-4">
            <button
              className="px-4 py-2 bg-[#FF9500] text-sm text-black rounded-lg"
              onClick={handleAddNew}
            >
              Add New Order
            </button>
            <div className="relative">
              <input
                type="text"
                placeholder="Search a name, order or etc"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-[#2a2a2a] text-white px-4 py-2 text-sm rounded-lg w-64 pl-10"
              />
              <i className="fa-solid fa-search absolute left-3 top-3 text-gray-400"></i>
            </div>
          </div>
        </div>

        {/* Orders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loadingOrders ? (
            <div className="text-gray-400">Loading...</div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-gray-400">No orders found</div>
          ) : (
            filteredOrders.map((order) => (
              <div
                key={order._id}
                className="bg-[#2a2a2a] rounded-xl p-4 shadow flex flex-col hover:scale-[1.02] transition-transform"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-3">
                    <div className="bg-[#FF9500] text-black font-semibold text-xl w-10 h-10 flex items-center justify-center rounded-md">
                      {order.table?.number || "—"}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-base font-semibold">
                        {order.customer?.name || "Unknown"}
                      </span>
                      <span className="text-xs text-gray-400">
                        Order {order.orderNumber || order._id}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full whitespace-nowrap ${
                      order.status === "completed"
                        ? "bg-blue-500/20 text-blue-400"
                        : order.status === "in process"
                        ? "bg-yellow-500/20 text-yellow-400"
                        : order.status === "cancelled"
                        ? "bg-red-500/20 text-red-400"
                        : "bg-gray-500/20 text-gray-400"
                    }`}
                    style={{ fontSize: "0.65rem" }}
                  >
                    {order.status === "in process"
                      ? "In Process"
                      : order.status === "completed"
                      ? "Completed"
                      : order.status === "cancelled"
                      ? "Cancelled"
                      : order.status}
                  </span>
                </div>

                <div className="flex justify-between text-sm text-gray-400 border-b border-white/10 py-2">
                  <span>
                    {order.date
                      ? new Date(order.date).toLocaleDateString()
                      : order.createdAt
                      ? new Date(order.createdAt).toLocaleDateString()
                      : "—"}
                  </span>
                  <span>
                    {order.date
                      ? new Date(order.date).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : order.createdAt
                      ? new Date(order.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "—"}
                  </span>
                </div>

                <div className="mt-4 text-gray-300">
                  <div className="grid grid-cols-[50px_1fr_auto] mb-2 text-sm font-semibold text-white">
                    <span>Qty</span>
                    <span>Items</span>
                    <span className="text-right">Price</span>
                  </div>
                  {(order.products || []).map((item, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-[50px_1fr_auto] text-sm py-2 border-b border-white/10"
                    >
                      <span>{item.quantity || 0}</span>
                      <span className="truncate">
                        {getProductName(item)}
                      </span>
                      <span className="text-right">
                        Rs{getProductPrice(item).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex justify-between items-center">
                  <span className="text-white font-normal">Subtotal</span>
                  <span className="text-white font-normal">
                    Rs{(order.total_price || calcSubtotal(order.products)).toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between gap-2 mt-4">
                  <button
                    title="Edit"
                    onClick={() => handleEdit(order)}
                    className="flex-1 border border-[#FF9500] text-[#FF9500] rounded-lg py-2 hover:bg-[#FF9500] hover:text-black transition"
                  >
                    <i className="fa-solid fa-pen"></i>
                  </button>
                  <button
                    title="Delete"
                    onClick={() => handleDeleteOrder(order._id)}
                    className="flex-1 border border-[#FF9500] text-[#FF9500] rounded-lg py-2 hover:bg-[#FF9500] hover:text-black transition"
                  >
                    <i className="fa-solid fa-trash"></i>
                  </button>
                  <button
                    className="flex-[2] bg-[#FF9500] text-black rounded-lg py-2 font-medium hover:bg-[#ffb733] transition"
                    onClick={() => {
                      setInvoiceOrder(order);
                      const subtotal = calcSubtotal(order.products || []);
                      const tax = subtotal * 0.1;
                      const tip = order.tip || 0;
                      setReceived(subtotal + tax + tip);
                      setPaymentMethod(
                        order.payment_method?.toLowerCase() || "cash on delivery"
                      );
                      setShowInvoiceModal(true);
                    }}
                  >
                    Pay Bill
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add/Edit Order Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingOrder ? "Edit Order" : "Add New Order"}
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Table */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Table *
            </label>
            <select
              {...register("table", { required: "Table is required" })}
              className="w-full px-4 py-2 bg-[#1a1a1a] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#FF9500]"
            >
              <option value="">Select Table</option>
              {tables.map((table) => (
                <option key={table._id} value={table._id}>
                  Table {table.number} (Floor {table.floor}, Capacity: {table.capacity})
                </option>
              ))}
            </select>
            {errors.table && (
              <p className="text-red-400 text-xs mt-1">{errors.table.message}</p>
            )}
          </div>

          {/* Customer Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Customer Name *
            </label>
            <input
              type="text"
              {...register("customer_name", {
                required: "Customer name is required",
              })}
              placeholder="Enter Customer Name"
              className="w-full px-4 py-2 bg-[#1a1a1a] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#FF9500]"
            />
            {errors.customer_name && (
              <p className="text-red-400 text-xs mt-1">
                {errors.customer_name.message}
              </p>
            )}
          </div>

          {/* Products */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Products *
            </label>
            <div className="space-y-2">
              {fields.map((field, index) => (
                <div key={field.id} className="space-y-1">
                  <div className="flex gap-2 bg-[#2a2a2a] p-2 rounded-md shadow-sm border border-[#3a3a3a]">
                    <input
                      type="number"
                      {...register(`products.${index}.quantity`, {
                        required: "Quantity is required",
                        min: { value: 1, message: "Must be at least 1" },
                      })}
                      min="1"
                      className="w-20 bg-[#1a1a1a] px-2 py-2 rounded-md text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-[#FF9500]"
                      placeholder="Qty"
                    />

                    {/* Menu dropdown */}
                    {(() => {
                      const menuField = register(`products.${index}.menu`, {
                        required: "Menu is required",
                      });

                      return (
                        <select
                          {...menuField}
                          onChange={(e) => {
                            menuField.onChange(e);
                            const value = e.target.value;
                            // Reset product when menu changes
                            setValue(`products.${index}.product`, "", {
                              shouldValidate: true,
                            });
                          }}
                          className="flex-1 bg-[#1a1a1a] px-2 py-2 rounded-md text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-[#FF9500]"
                        >
                          <option value="">Select menu</option>
                          {menus.map((menu) => (
                            <option key={menu._id} value={menu._id}>
                              {menu.name}
                            </option>
                          ))}
                        </select>
                      );
                    })()}

                    {/* Product dropdown */}
                    {(() => {
                      const selectedMenuId = watchedProducts?.[index]?.menu;
                      const filteredProducts = selectedMenuId
                        ? allProducts.filter((product) => {
                            const productMenu =
                              typeof product.menu === "object"
                                ? product.menu._id
                                : product.menu;
                            return productMenu === selectedMenuId;
                          })
                        : [];

                      return (
                        <select
                          {...register(`products.${index}.product`, {
                            required: "Product is required",
                          })}
                          disabled={!selectedMenuId}
                          className={`flex-1 bg-[#1a1a1a] px-2 py-2 rounded-md text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-[#FF9500] ${
                            !selectedMenuId ? "opacity-50 cursor-not-allowed" : ""
                          }`}
                        >
                          <option value="">
                            {selectedMenuId ? "Select product" : "Select menu first"}
                          </option>
                          {filteredProducts.map((product) => (
                            <option key={product._id} value={product._id}>
                              {product.name} - Rs{product.price}
                            </option>
                          ))}
                        </select>
                      );
                    })()}

                    {fields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="text-red-400 hover:text-red-500 p-1 transition"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>

                  {/* Per-row validation messages */}
                  <div className="flex flex-col text-xs text-red-400 gap-0.5">
                    {errors.products?.[index]?.quantity && (
                      <p>{errors.products[index].quantity.message}</p>
                    )}
                    {errors.products?.[index]?.menu && (
                      <p>{errors.products[index].menu.message}</p>
                    )}
                    {errors.products?.[index]?.product && (
                      <p>{errors.products[index].product.message}</p>
                    )}
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() => append({ menu: "", product: "", quantity: 1 })}
                className="text-sm text-[#FF9500] hover:underline"
              >
                + Add Product
              </button>
            </div>
            {errors.products && (
              <p className="text-red-400 text-xs mt-1">
                {errors.products.message}
              </p>
            )}
          </div>

          {/* Status (only for editing) */}
          {editingOrder && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Status *
              </label>
              <select
                {...register("status", { required: "Status is required" })}
                className="w-full px-4 py-2 bg-[#1a1a1a] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#FF9500]"
              >
                <option value="in process">In Process</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              {errors.status && (
                <p className="text-red-400 text-xs mt-1">
                  {errors.status.message}
                </p>
              )}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleCloseModal}
              className="flex-1 px-4 py-2 bg-[#1a1a1a] hover:bg-[#2a2a2a] text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                isSubmitting ||
                addOrderMutation.isPending ||
                updateOrderStatusMutation.isPending
              }
              className="flex-1 px-4 py-2 bg-[#FF9500] hover:bg-[#e68806] text-black rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ||
              addOrderMutation.isPending ||
              updateOrderStatusMutation.isPending ? (
                <span className="flex items-center justify-center">
                  <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                  {editingOrder ? "Updating..." : "Creating..."}
                </span>
              ) : (
                editingOrder ? "Update" : "Create"
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="fixed inset-0 flex items-center justify-center z-[999]">
          <div className="bg-black/60 absolute inset-0"></div>
          <div className="relative bg-white text-black rounded-xl shadow-lg p-6 w-[280px] text-center animate-pop">
            <h3 className="text-lg font-bold mb-2">Order Completed!</h3>
            <p className="text-gray-600 text-sm">
              The order has been successfully updated.
            </p>
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      {showInvoiceModal && invoiceOrder && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
          onClick={() => setShowInvoiceModal(false)}
        >
          <div
            className="bg-[#FF9500] text-black rounded-lg p-6 w-[400px] animate-pop"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-4">Invoice</h2>

            {/* Order Items */}
            <div className="mb-4">
              <h3 className="font-semibold">Order Items:</h3>
              {(invoiceOrder.products || []).map((item, idx) => {
                const price = getProductPrice(item);
                const quantity = item.quantity || 0;
                return (
                  <div key={idx} className="flex justify-between">
                    <span>
                      {getProductName(item)} x {quantity}
                    </span>
                    <span>${(price * quantity).toFixed(2)}</span>
                  </div>
                );
              })}
            </div>

            {/* Summary */}
            {(() => {
              const subtotal = calcSubtotal(invoiceOrder.products || []);
              const tax = subtotal * 0.1;
              const tip = invoiceOrder.tip || 0;
              const total = subtotal + tax + tip;
              return (
                <>
                  <div className="mb-2 flex justify-between">
                    <span>Subtotal:</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="mb-2 flex justify-between">
                    <span>Tax:</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="mb-2 flex justify-between">
                    <span>Tip:</span>
                    <span>${tip.toFixed(2)}</span>
                  </div>
                  <div className="mb-2 flex justify-between font-bold">
                    <span>Total:</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </>
              );
            })()}

            {/* Received */}
            <div className="mb-4">
              <label className="block mb-1">Received:</label>
              <input
                type="number"
                value={received}
                onChange={(e) => setReceived(Number(e.target.value))}
                className="w-full p-2 rounded-lg border"
              />
            </div>
            {(() => {
              const subtotal = calcSubtotal(invoiceOrder.products || []);
              const tax = subtotal * 0.1;
              const tip = invoiceOrder.tip || 0;
              const total = subtotal + tax + tip;
              return (
                received < total && (
                  <p className="text-red-600 text-sm mt-1">
                    Received amount is less than total!
                  </p>
                )
              );
            })()}

            {/* Payment Method */}
            <div className="mb-4">
              <label className="block mb-1">Payment Method:</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full p-2 rounded-lg border"
              >
                <option value="cash on delivery">Cash on Delivery</option>
                <option value="online transfer">Online Transfer</option>
                <option value="card">Card</option>
              </select>
            </div>

            {/* Buttons */}
            <button
              className="w-full bg-black text-[#FF9500] py-2 rounded-lg font-bold hover:bg-gray-800 transition mb-2"
              onClick={handlePayOrder}
              disabled={payOrderMutation.isPending}
            >
              {payOrderMutation.isPending ? "Processing..." : "Complete Order"}
            </button>

            <button
              className="w-full py-2 border border-black rounded-lg hover:bg-black hover:text-[#FF9500] transition"
              onClick={() => setShowInvoiceModal(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}
