import React, { useState, useRef } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import {
  useMenusQuery,
  useAddMenuMutation,
  useUpdateMenuMutation,
  useDeleteMenuMutation,
} from '../../api/menu.api';
import { useCategoriesQuery } from '../../api/category.api';
import { uploadFile } from '../../api/file.api';
import DataTable from '../common/DataTable';
import Modal from '../common/Modal';
import ImageUpload from '../common/ImageUpload';

export default function MenuManagement() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState(null);
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

  const { data: menusData, isLoading: menusLoading } = useMenusQuery();
  const menus = menusData?.result || [];

  const { data: categoriesData } = useCategoriesQuery();
  const categories = categoriesData?.result || [];

  const addMenuMutation = useAddMenuMutation({
    onSuccess: () => {
      handleCloseModal();
    },
  });

  const updateMenuMutation = useUpdateMenuMutation({
    onSuccess: () => {
      handleCloseModal();
    },
  });

  const deleteMenuMutation = useDeleteMenuMutation();

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
        if (!imageUrl && !editingMenu) {
          // For new menus, image is required
          toast.error('Please select an image');
          return;
        }
        // For edit mode, if no new file and no imageUrl, use the original image
        if (editingMenu && !imageUrl) {
          imageUrl = editingMenu.image;
        }
      }

      // Prepare payload with the image URL
      const payload = {
        ...data,
        image: imageUrl,
      };

      if (editingMenu) {
        await updateMenuMutation.mutateAsync({
          id: editingMenu._id,
          payload,
        });
      } else {
        await addMenuMutation.mutateAsync(payload);
      }
    } catch (error) {
      // Error is handled by the mutation and toast is shown via interceptor
      console.error('Submit error:', error);
    }
  };

  const handleEdit = (menu) => {
    setEditingMenu(menu);
    setValue('name', menu.name);
    setValue('category', menu.category?._id || menu.category);
    setValue('image', menu.image || '');
    setIsModalOpen(true);
  };

  // Get current image value for preview in edit mode
  const currentImageUrl = watch('image');

  const handleDelete = async (menu) => {
    if (!window.confirm(`Are you sure you want to delete "${menu.name}"?`)) {
      return;
    }

    try {
      await deleteMenuMutation.mutateAsync(menu._id);
    } catch (error) {
      // Error is handled by the mutation and toast is shown via interceptor
      console.error('Delete error:', error);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingMenu(null);
    setUploadingImage(false);
    imageUploadRef.current?.clearFile();
    reset();
  };

  const handleAddNew = () => {
    setEditingMenu(null);
    reset();
    setIsModalOpen(true);
  };

  const columns = [
    {
      header: 'Name',
      accessor: 'name',
    },
    {
      header: 'Category',
      accessor: 'category',
      render: (value) => {
        if (typeof value === 'object' && value?.name) {
          return value.name;
        }
        const category = categories.find((cat) => cat._id === value);
        return category?.name || 'N/A';
      },
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-white">Menus</h2>
        <button
          onClick={handleAddNew}
          className="px-4 py-2 bg-[#FF9500] hover:bg-[#e68806] text-black rounded-lg font-medium transition-colors"
        >
          <i className="fa-solid fa-plus mr-2"></i>Add Menu
        </button>
      </div>

      <DataTable
        columns={columns}
        data={menus}
        onEdit={handleEdit}
        onDelete={handleDelete}
        loading={menusLoading || deleteMenuMutation.isPending}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingMenu ? 'Edit Menu' : 'Add Menu'}
        size="md"
      >
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Name *</label>
              <input
                type="text"
                {...register('name', { required: 'Name is required' })}
                className="w-full px-4 py-2 bg-[#1a1a1a] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#FF9500]"
                placeholder="Enter menu name"
              />
              {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Category *</label>
              <select
                {...register('category', { required: 'Category is required' })}
                className="w-full px-4 py-2 bg-[#1a1a1a] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#FF9500]"
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="text-red-400 text-xs mt-1">{errors.category.message}</p>
              )}
            </div>

            <ImageUpload
              ref={imageUploadRef}
              name="image"
              label="Image"
              required={!editingMenu}
              existingImageUrl={editingMenu ? (currentImageUrl || editingMenu.image) : null}
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
                disabled={isSubmitting || addMenuMutation.isPending || updateMenuMutation.isPending || uploadingImage}
                className="flex-1 px-4 py-2 bg-[#FF9500] hover:bg-[#e68806] text-black rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {(isSubmitting || addMenuMutation.isPending || updateMenuMutation.isPending || uploadingImage) ? (
                  <span className="flex items-center justify-center">
                    <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                    {uploadingImage ? 'Uploading image...' : editingMenu ? 'Updating...' : 'Creating...'}
                  </span>
                ) : (
                  editingMenu ? 'Update' : 'Create'
                )}
              </button>
            </div>
          </form>
        </FormProvider>
      </Modal>
    </div>
  );
}
