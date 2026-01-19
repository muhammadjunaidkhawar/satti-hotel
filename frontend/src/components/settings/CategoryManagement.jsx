import React, { useState, useRef } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useCategoriesQuery, useAddCategoryMutation, useUpdateCategoryMutation, useDeleteCategoryMutation } from '../../api/category.api';
import { uploadFile } from '../../api/file.api';
import DataTable from '../common/DataTable';
import Modal from '../common/Modal';
import ImageUpload from '../common/ImageUpload';

export default function CategoryManagement() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
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

  const { data: categoriesData, isLoading: loading } = useCategoriesQuery();
  const categories = categoriesData?.result || [];

  const addCategoryMutation = useAddCategoryMutation({
    onSuccess: () => {
      handleCloseModal();
    },
  });

  const updateCategoryMutation = useUpdateCategoryMutation({
    onSuccess: () => {
      handleCloseModal();
    },
  });

  const deleteCategoryMutation = useDeleteCategoryMutation();

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
        if (!imageUrl && !editingCategory) {
          // For new categories, image is required
          toast.error('Please select an image');
          return;
        }
        // For edit mode, if no new file and no imageUrl, use the original image
        if (editingCategory && !imageUrl) {
          imageUrl = editingCategory.image;
        }
      }

      // Prepare payload with the image URL
      const payload = {
        ...data,
        image: imageUrl,
      };

      if (editingCategory) {
        await updateCategoryMutation.mutateAsync({
          id: editingCategory._id,
          payload,
        });
      } else {
        await addCategoryMutation.mutateAsync(payload);
      }
    } catch (error) {
      // Error is handled by the mutation and toast is shown via interceptor
      console.error('Submit error:', error);
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setValue('name', category.name);
    setValue('description', category.description || '');
    setValue('type', category.type);
    setValue('image', category.image || '');
    setValue('status', category.status);
    setIsModalOpen(true);
  };

  // Get current image value for preview in edit mode
  const currentImageUrl = watch('image');

  const handleDelete = async (category) => {
    if (!window.confirm(`Are you sure you want to delete "${category.name}"?`)) {
      return;
    }

    try {
      await deleteCategoryMutation.mutateAsync(category._id);
    } catch (error) {
      // Error is handled by the mutation and toast is shown via interceptor
      console.error('Delete error:', error);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    setUploadingImage(false);
    imageUploadRef.current?.clearFile();
    reset();
  };

  const handleAddNew = () => {
    setEditingCategory(null);
    reset();
    setIsModalOpen(true);
  };

  const columns = [
    {
      header: 'Name',
      accessor: 'name',
    },
    {
      header: 'Type',
      accessor: 'type',
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (value) => <span className={`px-2 py-1 rounded text-xs ${value === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>{value}</span>,
    },
    {
      header: 'Image',
      accessor: 'image',
      render: (value) => <span className="text-xs text-gray-400 truncate max-w-[200px] block">{value || 'N/A'}</span>,
    },
    {
      header: 'Description',
      accessor: 'description',
      render: (value) => <span className="text-xs text-gray-400 truncate max-w-[200px] block">{value || 'N/A'}</span>,
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-white">Categories</h2>
        <button onClick={handleAddNew} className="px-4 py-2 bg-[#FF9500] hover:bg-[#e68806] text-black rounded-lg font-medium transition-colors">
          <i className="fa-solid fa-plus mr-2"></i>Add Category
        </button>
      </div>

      <DataTable columns={columns} data={categories} onEdit={handleEdit} onDelete={handleDelete} loading={loading || deleteCategoryMutation.isPending} />

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingCategory ? 'Edit Category' : 'Add Category'} size="md">
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Name *</label>
              <input
                type="text"
                {...register('name', { required: 'Name is required' })}
                className="w-full px-4 py-2 bg-[#1a1a1a] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#FF9500]"
                placeholder="Enter category name"
              />
              {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Type *</label>
              <input
                type="text"
                {...register('type', { required: 'Type is required' })}
                className="w-full px-4 py-2 bg-[#1a1a1a] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#FF9500]"
                placeholder="Enter category type"
              />
              {errors.type && <p className="text-red-400 text-xs mt-1">{errors.type.message}</p>}
            </div>

            <ImageUpload
              ref={imageUploadRef}
              name="image"
              label="Image"
              required={!editingCategory}
              existingImageUrl={editingCategory ? (currentImageUrl || editingCategory.image) : null}
            />

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Status *</label>
              <select
                {...register('status', { required: 'Status is required' })}
                className="w-full px-4 py-2 bg-[#1a1a1a] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#FF9500]"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              {errors.status && <p className="text-red-400 text-xs mt-1">{errors.status.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
              <textarea
                {...register('description')}
                rows="3"
                className="w-full px-4 py-2 bg-[#1a1a1a] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#FF9500]"
                placeholder="Enter description (optional)"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button type="button" onClick={handleCloseModal} className="flex-1 px-4 py-2 bg-[#1a1a1a] hover:bg-[#2a2a2a] text-white rounded-lg transition-colors">
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || addCategoryMutation.isPending || updateCategoryMutation.isPending || uploadingImage}
                className="flex-1 px-4 py-2 bg-[#FF9500] hover:bg-[#e68806] text-black rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting || addCategoryMutation.isPending || updateCategoryMutation.isPending || uploadingImage ? (
                  <span className="flex items-center justify-center">
                    <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                    {uploadingImage ? 'Uploading image...' : editingCategory ? 'Updating...' : 'Creating...'}
                  </span>
                ) : editingCategory ? (
                  'Update'
                ) : (
                  'Create'
                )}
              </button>
            </div>
          </form>
        </FormProvider>
      </Modal>
    </div>
  );
}
