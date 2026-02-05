import React, { useState, useMemo, useRef } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useCategoriesQuery } from '../api/category.api';
import { useMenusQuery } from '../api/menu.api';
import {
  useProductsQuery,
  useAddProductMutation,
  useUpdateProductMutation,
  useDeleteProductsMutation,
} from '../api/product.api';
import { useAddOrderMutation } from '../api/order.api';
import { useTablesQuery } from '../api/table.api';
import { uploadFile } from '../api/file.api';
import Modal from '../components/common/Modal';
import ImageUpload from '../components/common/ImageUpload';

export default function Menu() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const imageUploadRef = useRef(null);
  const categoriesScrollRef = useRef(null);
  const menusScrollRef = useRef(null);

  // Order cart (products added from menu cards) and sidebar
  const [orderCart, setOrderCart] = useState([]); // [{ product: {...}, quantity: number }]
  const [orderSidebarCollapsed, setOrderSidebarCollapsed] = useState(false);
  const [orderTableId, setOrderTableId] = useState('');
  const [orderCustomerName, setOrderCustomerName] = useState('');

  const scrollAmount = 280;

  const scrollCategories = (direction) => {
    const el = categoriesScrollRef.current;
    if (el) el.scrollBy({ left: direction * scrollAmount, behavior: 'smooth' });
  };

  const scrollMenus = (direction) => {
    const el = menusScrollRef.current;
    if (el) el.scrollBy({ left: direction * scrollAmount, behavior: 'smooth' });
  };

  const methods = useForm();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = methods;

  // Fetch categories
  const { data: categoriesData, isLoading: categoriesLoading } = useCategoriesQuery();
  const categories = categoriesData?.result || [];

  // Fetch all menus
  const { data: menusData, isLoading: menusLoading } = useMenusQuery();
  const allMenus = menusData?.result || [];

  // Filter menus by selected category
  const menus = useMemo(() => {
    if (!selectedCategory) return allMenus;
    return allMenus.filter((menu) => {
      const menuCategory = typeof menu.category === 'object' ? menu.category._id : menu.category;
      return menuCategory === selectedCategory._id;
    });
  }, [allMenus, selectedCategory]);

  // Fetch all products
  const { data: productsData, isLoading: productsLoading } = useProductsQuery(
    { limit: 0, page: 1 },
    { staleTime: 30000 }
  );
  const allProducts = productsData?.result?.products || [];

  // Filter products by selected menu
  const products = useMemo(() => {
    if (!selectedMenu) return allProducts;
    return allProducts.filter((product) => {
      const productMenu = typeof product.menu === 'object' ? product.menu._id : product.menu;
      return productMenu === selectedMenu._id;
    });
  }, [allProducts, selectedMenu]);

  const { data: tablesData } = useTablesQuery();
  const tables = tablesData?.result || [];

  const addOrderMutation = useAddOrderMutation({
    onSuccess: () => {
      setOrderCart([]);
      setOrderSidebarCollapsed(true);
      toast.success('Order placed successfully');
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Failed to place order');
    },
  });

  const addProductMutation = useAddProductMutation({
    onSuccess: () => {
      handleCloseModal();
    },
  });

  const updateProductMutation = useUpdateProductMutation({
    onSuccess: () => {
      handleCloseModal();
    },
  });

  const deleteProductsMutation = useDeleteProductsMutation();

  // Handle product delete
  const handleDeleteProduct = async (product) => {
    if (!window.confirm(`Are you sure you want to delete "${product.name}"?`)) {
      return;
    }
    try {
      await deleteProductsMutation.mutateAsync([product._id]);
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  // Handle product edit
  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setValue('name', product.name);
    setValue('description', product.description);
    setValue('image', product.image);
    setValue('productNumber', product.productNumber);
    setValue('price', product.price);
    const productMenu = typeof product.menu === 'object' ? product.menu._id : product.menu;
    setValue('menu', productMenu);
    setIsModalOpen(true);
  };

  // Handle form submission
  const onSubmit = async (data) => {
    try {
      let imageUrl = data.image;

      // Check if a new file was selected
      const selectedFile = imageUploadRef.current?.getFile();

      if (selectedFile) {
        // Upload the file first
        setUploadingImage(true);
        try {
          const response = await uploadFile(selectedFile);
          imageUrl = response?.result?.fileUrl;

          if (!imageUrl) {
            throw new Error('No file URL returned from server');
          }

          // Update the form value with the uploaded URL to clear any validation errors
          setValue('image', imageUrl, { shouldValidate: true });
        } catch (error) {
          console.error('Upload error:', error);
          toast.error(error?.response?.data?.message || 'Failed to upload image');
          setUploadingImage(false);
          return;
        } finally {
          setUploadingImage(false);
        }
      } else {
        // No new file selected
        if (!imageUrl && !editingProduct) {
          // For new products, image is required
          toast.error('Please select an image');
          return;
        }
        // For edit mode, if no new file and no imageUrl, use the original image
        if (editingProduct && !imageUrl) {
          imageUrl = editingProduct.image;
        }
      }

      const payload = {
        ...data,
        price: parseFloat(data.price),
        image: imageUrl,
      };

      if (editingProduct) {
        await updateProductMutation.mutateAsync({
          id: editingProduct._id,
          payload,
        });
      } else {
        await addProductMutation.mutateAsync(payload);
      }
    } catch (error) {
      // Error is handled by the mutation and toast is shown via interceptor
      console.error('Submit error:', error);
    }
  };

  // Handle close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setUploadingImage(false);
    imageUploadRef.current?.clearFile();
    reset();
  };

  // Get current image value for preview in edit mode
  const currentImageUrl = watch('image');

  // Handle add new product
  const handleAddNew = () => {
    setEditingProduct(null);
    reset();
    setIsModalOpen(true);
  };

  // Reset menu selection when category changes
  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setSelectedMenu(null);
  };

  const getMenuName = (product) => {
    const value = product.menu;
    if (typeof value === 'object' && value?.name) return value.name;
    const menu = allMenus.find((m) => m._id === value);
    return menu?.name || 'N/A';
  };

  const addToOrder = (product) => {
    setOrderCart((prev) => {
      const existing = prev.find((item) => item.product._id === product._id);
      if (existing) {
        return prev.map((item) =>
          item.product._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    setOrderSidebarCollapsed(false);
  };

  const updateOrderQuantity = (productId, delta) => {
    setOrderCart((prev) => {
      const next = prev
        .map((item) => {
          if (item.product._id !== productId) return item;
          const q = item.quantity + delta;
          return q < 1 ? null : { ...item, quantity: q };
        })
        .filter(Boolean);
      return next;
    });
  };

  const removeFromOrder = (productId) => {
    setOrderCart((prev) => prev.filter((item) => item.product._id !== productId));
  };

  const orderSubtotal = useMemo(
    () => orderCart.reduce((sum, item) => sum + (item.product?.price ?? 0) * item.quantity, 0),
    [orderCart]
  );

  const handlePlaceOrder = async () => {
    if (!orderTableId?.trim()) {
      toast.error('Please select a table');
      return;
    }
    if (!orderCustomerName?.trim()) {
      toast.error('Please enter customer name');
      return;
    }
    if (orderCart.length === 0) {
      toast.error('Add at least one product to the order');
      return;
    }
    try {
      const payload = {
        table: orderTableId,
        customer: { name: orderCustomerName.trim() },
        products: orderCart.map((item) => ({
          product: item.product._id,
          quantity: item.quantity,
        })),
      };
      await addOrderMutation.mutateAsync(payload);
    } catch (e) {
      console.error('Place order error:', e);
    }
  };

  return (
    <div className="flex min-h-0 w-full">
      <div className="flex-1 min-w-0 px-6 pt-0 pb-6">
      {/* Categories Horizontal Scrollable List - commented out, only Menus shown
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-white mb-3">Categories</h2>
        <div className="relative flex items-center gap-2">
          <button
            type="button"
            onClick={() => scrollCategories(-1)}
            aria-label="Scroll categories left"
            className="flex-shrink-0 z-10 w-10 h-10 rounded-full bg-[#2a2a2a] hover:bg-[#FF9500] hover:text-black text-[#FF9500] flex items-center justify-center transition-colors"
          >
            <i className="fa-solid fa-chevron-left text-lg" />
          </button>
          <div
            ref={categoriesScrollRef}
            className="overflow-x-auto menu-horizontal-scroll flex-1 min-w-0"
          >
            <div className="flex gap-4 pb-2" style={{ minWidth: 'max-content' }}>
            <div
              onClick={() => handleCategorySelect(null)}
              className={`flex-shrink-0 relative py-4 px-6 min-w-[150px] rounded-xl cursor-pointer transition-colors duration-300 ${
                selectedCategory === null
                  ? 'bg-[#FF9500] text-black'
                  : 'bg-[#2a2a2a] text-white hover:bg-[#FF9500] hover:text-black'
              }`}
            >
              <i
                className={`fa-solid fa-list absolute top-3 right-3 text-xl ${
                  selectedCategory === null ? 'text-black' : 'text-[#FF9500]'
                }`}
              ></i>
              <div className="text-left">
                <h3 className="font-normal text-sm">All</h3>
                <p className="text-xs">{categories.length} categories</p>
              </div>
            </div>
            {categoriesLoading ? (
              <div className="flex items-center justify-center min-w-[150px]">
                <div className="text-gray-400">Loading...</div>
              </div>
            ) : (
              categories.map((category) => (
                <div
                  key={category._id}
                  onClick={() => handleCategorySelect(category)}
                  className={`flex-shrink-0 relative py-4 px-6 min-w-[150px] rounded-xl cursor-pointer transition-colors duration-300 ${
                    selectedCategory?._id === category._id
                      ? 'bg-[#FF9500] text-black'
                      : 'bg-[#2a2a2a] text-white hover:bg-[#FF9500] hover:text-black'
                  }`}
                >
                  <i
                    className={`${category.iconClass || 'fa-solid fa-list'} absolute top-3 right-3 text-xl ${
                      selectedCategory?._id === category._id ? 'text-black' : 'text-[#FF9500]'
                    }`}
                  ></i>
                  <div className="text-left">
                    <h3 className="font-normal text-sm">{category.name}</h3>
                    <p className="text-xs">
                      {allMenus.filter((m) => {
                        const menuCategory = typeof m.category === 'object' ? m.category._id : m.category;
                        return menuCategory === category._id;
                      }).length}{' '}
                      menus
                    </p>
                  </div>
                </div>
              ))
            )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => scrollCategories(1)}
            aria-label="Scroll categories right"
            className="flex-shrink-0 z-10 w-10 h-10 rounded-full bg-[#2a2a2a] hover:bg-[#FF9500] hover:text-black text-[#FF9500] flex items-center justify-center transition-colors"
          >
            <i className="fa-solid fa-chevron-right text-lg" />
          </button>
        </div>
      </div>
      */}

      {/* Menus Horizontal Scrollable List */}
      <div className="p-0 m-0">
        <div className="relative flex items-center gap-2">
          <button
            type="button"
            onClick={() => scrollMenus(-1)}
            aria-label="Scroll menus left"
            className="flex-shrink-0 z-10 w-10 h-10 rounded-full bg-[#2a2a2a] hover:bg-[#FF9500] hover:text-black text-[#FF9500] flex items-center justify-center transition-colors"
          >
            <i className="fa-solid fa-chevron-left text-lg" />
          </button>
          <div
            ref={menusScrollRef}
            className="overflow-x-auto menu-horizontal-scroll flex-1 min-w-0"
          >
            <div className="flex gap-4 pb-2" style={{ minWidth: 'max-content' }}>
              <div
                onClick={() => setSelectedMenu(null)}
                className={`flex-shrink-0 py-4 px-6 min-w-[150px] rounded-xl cursor-pointer transition-colors duration-300 ${selectedMenu === null
                    ? 'bg-[#FF9500] text-black'
                    : 'bg-[#2a2a2a] text-white hover:bg-[#FF9500] hover:text-black'
                  }`}
              >
                <div className="text-left">
                  <h3 className="font-normal text-sm">All</h3>
                  <p className="text-xs">{allProducts.length} products</p>
                </div>
              </div>
              {menusLoading ? (
                <div className="flex items-center justify-center min-w-[150px]">
                  <div className="text-gray-400">Loading...</div>
                </div>
              ) : (
                menus.map((menu) => (
                  <div
                    key={menu._id}
                    onClick={() => setSelectedMenu(menu)}
                    className={`flex-shrink-0 py-4 px-6 min-w-[150px] rounded-xl cursor-pointer transition-colors duration-300 ${selectedMenu?._id === menu._id
                        ? 'bg-[#FF9500] text-black'
                        : 'bg-[#2a2a2a] text-white hover:bg-[#FF9500] hover:text-black'
                      }`}
                  >
                    <div className="text-left">
                      <h3 className="font-normal text-sm">{menu.name}</h3>
                      <p className="text-xs">
                        {allProducts.filter((p) => {
                          const productMenu = typeof p.menu === 'object' ? p.menu._id : p.menu;
                          return productMenu === menu._id;
                        }).length}{' '}
                        products
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => scrollMenus(1)}
            aria-label="Scroll menus right"
            className="flex-shrink-0 z-10 w-10 h-10 rounded-full bg-[#2a2a2a] hover:bg-[#FF9500] hover:text-black text-[#FF9500] flex items-center justify-center transition-colors"
          >
            <i className="fa-solid fa-chevron-right text-lg" />
          </button>
        </div>
      </div>

      {/* Products Cards */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Products</h2>
          <div className="flex items-center gap-4">
            {products.length > 0 && (
              <span className="text-sm text-gray-400">
                {products.length} {products.length === 1 ? 'product' : 'products'}
              </span>
            )}
            <button
              onClick={handleAddNew}
              className="px-4 py-2 bg-[#FF9500] hover:bg-[#e68806] text-black rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <i className="fa-solid fa-plus"></i>
              Add Product
            </button>
          </div>
        </div>

        {productsLoading || deleteProductsMutation.isPending ? (
          <div className="flex items-center justify-center py-16">
            <i className="fa-solid fa-spinner fa-spin text-4xl text-[#FF9500]" />
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-xl bg-[#1a1a1a] border border-gray-700 py-16 text-center text-gray-400">
            No products to show. Add a product to get started.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-3">
            {products.map((product) => {
              const inCart = orderCart.find((item) => item.product._id === product._id);
              const qtyInCart = inCart?.quantity ?? 0;
              return (
              <div
                key={product._id}
                className={`rounded-lg bg-[#1a1a1a] overflow-hidden flex flex-col min-w-0 transition-colors ${
                  qtyInCart > 0 ? 'border-2 border-[#FF9500] ring-1 ring-[#FF9500]/50' : 'border border-gray-800'
                }`}
              >
                <div className="relative aspect-[2/1] w-full bg-[#222] overflow-hidden max-h-[96px]">
                  {qtyInCart > 0 && (
                    <span className="absolute bottom-1.5 right-1.5 z-10 min-w-[22px] h-6 px-1.5 rounded-full bg-[#FF9500] text-black text-xs font-bold flex items-center justify-center">
                      {qtyInCart}
                    </span>
                  )}
                  <img
                    src={product.image || 'https://via.placeholder.com/200'}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-1.5 left-1.5">
                    <button
                      type="button"
                      onClick={() => addToOrder(product)}
                      className="w-7 h-7 rounded-full bg-black/50 hover:bg-[#FF9500] hover:text-black text-white text-xs transition-colors flex items-center justify-center"
                      title="Add to order"
                    >
                      <i className="fa-solid fa-cart-plus" />
                    </button>
                  </div>
                  <div className="absolute top-1.5 right-1.5 flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleEditProduct(product)}
                      className="w-7 h-7 rounded-full bg-black/50 hover:bg-[#FF9500] hover:text-black text-white text-xs transition-colors flex items-center justify-center"
                      title="Edit"
                    >
                      <i className="fa-solid fa-pen" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteProduct(product)}
                      className="w-7 h-7 rounded-full bg-black/50 hover:bg-red-500/80 hover:text-white text-white text-xs transition-colors flex items-center justify-center"
                      title="Delete"
                    >
                      <i className="fa-solid fa-trash" />
                    </button>
                  </div>
                </div>
                <div className="p-2.5 flex flex-col flex-1 min-w-0">
                  <p className="text-white font-medium text-sm truncate" title={product.name}>
                    {product.name}
                  </p>
                  <p className="text-gray-500 text-xs truncate">
                    #{product.productNumber || '—'}
                  </p>
                  <p className="text-gray-400 text-xs line-clamp-2 mt-0.5 flex-1">
                    {product.description || '—'}
                  </p>
                  <div className="flex items-center justify-between gap-1 mt-1.5">
                    <span className="text-[#FF9500] font-semibold text-sm">
                      Rs{(product.price ?? 0).toFixed(2)}
                    </span>
                    <span className="text-gray-500 text-xs truncate max-w-[50%]" title={getMenuName(product)}>
                      {getMenuName(product)}
                    </span>
                  </div>
                </div>
              </div>
            );
            })}
          </div>
        )}
      </div>
      </div>

      {/* Order sidebar - fixed on screen, shown when cart has items */}
      {orderCart.length > 0 && (
        <aside
          className={`fixed top-0 right-0 bottom-0 z-40 flex flex-col border-l border-gray-800 bg-[#1a1a1a] transition-[width] duration-300 overflow-hidden ${
            orderSidebarCollapsed ? 'w-12' : 'w-80 min-w-[280px]'
          }`}
        >
          <div className="flex items-center justify-between p-2 border-b border-gray-800 shrink-0">
            {!orderSidebarCollapsed && (
              <span className="text-white font-semibold text-sm flex items-center gap-2">
                <i className="fa-solid fa-shopping-cart text-[#FF9500]" />
                Order ({orderCart.reduce((s, i) => s + i.quantity, 0)} items)
              </span>
            )}
            <button
              type="button"
              onClick={() => setOrderSidebarCollapsed((c) => !c)}
              className="w-8 h-8 rounded-lg bg-[#2a2a2a] hover:bg-[#FF9500] hover:text-black text-gray-400 flex items-center justify-center transition-colors"
              title={orderSidebarCollapsed ? 'Expand' : 'Collapse'}
            >
              <i className={`fa-solid fa-chevron-${orderSidebarCollapsed ? 'left' : 'right'}`} />
            </button>
          </div>
          {!orderSidebarCollapsed && (
            <>
              <div className="p-3 space-y-3 overflow-y-auto flex-1 min-h-0">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Table *</label>
                  <select
                    value={orderTableId}
                    onChange={(e) => setOrderTableId(e.target.value)}
                    className="w-full px-3 py-2 bg-[#2a2a2a] border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-[#FF9500]"
                  >
                    <option value="">Select table</option>
                    {tables.map((t) => (
                      <option key={t._id} value={t._id}>
                        Table {t.number}
                        {t.floor != null ? ` (Floor ${t.floor})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Customer name *</label>
                  <input
                    type="text"
                    value={orderCustomerName}
                    onChange={(e) => setOrderCustomerName(e.target.value)}
                    placeholder="Customer name"
                    className="w-full px-3 py-2 bg-[#2a2a2a] border border-gray-600 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#FF9500]"
                  />
                </div>
                <div>
                  <span className="block text-xs font-medium text-gray-400 mb-2">Items</span>
                  <ul className="space-y-2">
                    {orderCart.map((item) => (
                      <li
                        key={item.product._id}
                        className="flex items-center gap-2 text-sm bg-[#2a2a2a] rounded-lg p-2"
                      >
                        <span className="flex-1 text-white truncate">{item.product.name}</span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => updateOrderQuantity(item.product._id, -1)}
                            className="w-6 h-6 rounded bg-[#1a1a1a] text-gray-400 hover:text-white text-xs flex items-center justify-center"
                          >
                            −
                          </button>
                          <span className="w-6 text-center text-white text-xs">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateOrderQuantity(item.product._id, 1)}
                            className="w-6 h-6 rounded bg-[#1a1a1a] text-gray-400 hover:text-white text-xs flex items-center justify-center"
                          >
                            +
                          </button>
                        </div>
                        <span className="text-[#FF9500] text-xs w-12 text-right">
                          Rs{((item.product?.price ?? 0) * item.quantity).toFixed(2)}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeFromOrder(item.product._id)}
                          className="text-red-400 hover:text-red-300 text-xs"
                          title="Remove"
                        >
                          <i className="fa-solid fa-trash" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-gray-700">
                  <span className="text-gray-400">Subtotal</span>
                  <span className="text-white font-semibold">${orderSubtotal.toFixed(2)}</span>
                </div>
              </div>
              <div className="p-3 border-t border-gray-800 shrink-0 space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    setOrderCart([]);
                    setOrderSidebarCollapsed(true);
                  }}
                  className="w-full py-2 rounded-lg bg-[#2a2a2a] hover:bg-gray-600 text-gray-300 text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <i className="fa-solid fa-trash-can" />
                  Clear cart
                </button>
                <button
                  type="button"
                  onClick={handlePlaceOrder}
                  disabled={addOrderMutation.isPending}
                  className="w-full py-2.5 rounded-lg bg-[#FF9500] hover:bg-[#e68806] text-black font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {addOrderMutation.isPending ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin" />
                      Placing...
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-check" />
                      Place order
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </aside>
      )}

      {/* Add/Edit Product Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingProduct ? 'Edit Product' : 'Add Product'}
        size="lg"
      >
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  {...register('name', { required: 'Product name is required' })}
                  className="w-full px-4 py-2 bg-[#1a1a1a] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#FF9500]"
                  placeholder="Enter product name"
                />
                {errors.name && (
                  <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Product Number *
                </label>
                <input
                  type="text"
                  {...register('productNumber', { required: 'Product number is required' })}
                  className="w-full px-4 py-2 bg-[#1a1a1a] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#FF9500]"
                  placeholder="Enter product number"
                />
                {errors.productNumber && (
                  <p className="text-red-400 text-xs mt-1">{errors.productNumber.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description *
              </label>
              <textarea
                {...register('description', { required: 'Description is required' })}
                rows={3}
                className="w-full px-4 py-2 bg-[#1a1a1a] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#FF9500] resize-none"
                placeholder="Enter product description"
              />
              {errors.description && (
                <p className="text-red-400 text-xs mt-1">{errors.description.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Price *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  {...register('price', {
                    required: 'Price is required',
                    min: { value: 0, message: 'Price must be greater than or equal to 0' },
                  })}
                  className="w-full px-4 py-2 bg-[#1a1a1a] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#FF9500]"
                  placeholder="0.00"
                />
                {errors.price && (
                  <p className="text-red-400 text-xs mt-1">{errors.price.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Menu *
                </label>
                <select
                  {...register('menu', { required: 'Menu is required' })}
                  className="w-full px-4 py-2 bg-[#1a1a1a] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#FF9500]"
                >
                  <option value="">Select a menu</option>
                  {allMenus.map((menu) => (
                    <option key={menu._id} value={menu._id}>
                      {menu.name}
                    </option>
                  ))}
                </select>
                {errors.menu && (
                  <p className="text-red-400 text-xs mt-1">{errors.menu.message}</p>
                )}
              </div>
            </div>

            <ImageUpload
              ref={imageUploadRef}
              name="image"
              label="Image"
              required={!editingProduct}
              existingImageUrl={editingProduct ? (currentImageUrl || editingProduct.image) : null}
            />

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
                  addProductMutation.isPending ||
                  updateProductMutation.isPending ||
                  uploadingImage
                }
                className="flex-1 px-4 py-2 bg-[#FF9500] hover:bg-[#e68806] text-black rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ||
                  addProductMutation.isPending ||
                  updateProductMutation.isPending ||
                  uploadingImage ? (
                  <span className="flex items-center justify-center">
                    <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                    {uploadingImage ? 'Uploading image...' : editingProduct ? 'Updating...' : 'Creating...'}
                  </span>
                ) : (
                  editingProduct ? 'Update' : 'Create'
                )}
              </button>
            </div>
          </form>
        </FormProvider>
      </Modal>
    </div>
  );
}
