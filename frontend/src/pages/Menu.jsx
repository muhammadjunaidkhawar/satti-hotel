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
import { uploadFile } from '../api/file.api';
import DataTable from '../components/common/DataTable';
import Modal from '../components/common/Modal';
import ImageUpload from '../components/common/ImageUpload';
import { API_BASE_URL } from '../constants/env';

export default function Menu() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const imageUploadRef = useRef(null);

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
  const { data: productsData, isLoading: productsLoading } = useProductsQuery();
  const allProducts = productsData?.result?.products || [];

  // Filter products by selected menu
  const products = useMemo(() => {
    if (!selectedMenu) return allProducts;
    return allProducts.filter((product) => {
      const productMenu = typeof product.menu === 'object' ? product.menu._id : product.menu;
      return productMenu === selectedMenu._id;
    });
  }, [allProducts, selectedMenu]);

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

  // Define columns for products table
  const productColumns = [
    {
      header: 'Product',
      accessor: 'image',
      render: (value, row) => (
        <div className="flex items-center gap-2">
          <img
            src={value ? `${API_BASE_URL}/uploads/${value}` : 'https://via.placeholder.com/60'}
            alt={row.name}
            className="w-12 h-12 rounded-md object-cover"
          />
        </div>
      ),
    },
    {
      header: 'Product Name',
      accessor: 'name',
    },
    {
      header: 'Product Number',
      accessor: 'productNumber',
    },
    {
      header: 'Description',
      accessor: 'description',
      render: (value) => (
        <span className="text-gray-400 text-xs line-clamp-2">{value || 'N/A'}</span>
      ),
    },
    {
      header: 'Price',
      accessor: 'price',
      render: (value) => <span className="font-semibold">${(value || 0).toFixed(2)}</span>,
    },
    {
      header: 'Menu',
      accessor: 'menu',
      render: (value) => {
        if (typeof value === 'object' && value?.name) {
          return value.name;
        }
        const menu = allMenus.find((m) => m._id === value);
        return menu?.name || 'N/A';
      },
    },
  ];

  return (
    <div className="px-6 pt-4 pb-6">
      {/* Categories Horizontal Scrollable List */}
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-white mb-3">Categories</h2>
        <div className="overflow-x-auto">
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
      </div>

      {/* Menus Horizontal Scrollable List */}
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-white mb-3">Menus</h2>
        <div className="overflow-x-auto">
          <div className="flex gap-4 pb-2" style={{ minWidth: 'max-content' }}>
            <div
              onClick={() => setSelectedMenu(null)}
              className={`flex-shrink-0 relative py-4 px-6 min-w-[150px] rounded-xl cursor-pointer transition-colors duration-300 ${
                selectedMenu === null
                  ? 'bg-[#FF9500] text-black'
                  : 'bg-[#2a2a2a] text-white hover:bg-[#FF9500] hover:text-black'
              }`}
            >
              <i
                className={`fa-solid fa-utensils absolute top-3 right-3 text-xl ${
                  selectedMenu === null ? 'text-black' : 'text-[#FF9500]'
                }`}
              ></i>
              <div className="text-left">
                <h3 className="font-normal text-sm">All</h3>
                <p className="text-xs">{menus.length} menus</p>
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
                  className={`flex-shrink-0 relative py-4 px-6 min-w-[150px] rounded-xl cursor-pointer transition-colors duration-300 ${
                    selectedMenu?._id === menu._id
                      ? 'bg-[#FF9500] text-black'
                      : 'bg-[#2a2a2a] text-white hover:bg-[#FF9500] hover:text-black'
                  }`}
                >
                  <i
                    className={`fa-solid fa-utensils absolute top-3 right-3 text-xl ${
                      selectedMenu?._id === menu._id ? 'text-black' : 'text-[#FF9500]'
                    }`}
                  ></i>
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
      </div>

      {/* Products DataTable */}
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
        <DataTable
          columns={productColumns}
          data={products}
          onEdit={handleEditProduct}
          onDelete={handleDeleteProduct}
          loading={productsLoading || deleteProductsMutation.isPending}
        />
      </div>

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
