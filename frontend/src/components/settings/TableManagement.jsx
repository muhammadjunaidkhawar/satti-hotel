import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import {
  useTablesQuery,
  useAddTableMutation,
  useUpdateTableMutation,
  useDeleteTableMutation,
} from '../../api/table.api';
import DataTable from '../common/DataTable';
import Modal from '../common/Modal';

export default function TableManagement() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm();

  const { data: tablesData, isLoading: tablesLoading } = useTablesQuery();
  const tables = tablesData?.result || [];

  const addTableMutation = useAddTableMutation({
    onSuccess: () => {
      handleCloseModal();
    },
  });

  const updateTableMutation = useUpdateTableMutation({
    onSuccess: () => {
      handleCloseModal();
    },
  });

  const deleteTableMutation = useDeleteTableMutation();

  const onSubmit = async (data) => {
    try {
      // Convert string numbers to integers
      const payload = {
        ...data,
        number: parseInt(data.number),
        floor: parseInt(data.floor),
        capacity: parseInt(data.capacity),
      };

      if (editingTable) {
        await updateTableMutation.mutateAsync({
          id: editingTable._id,
          payload,
        });
      } else {
        await addTableMutation.mutateAsync(payload);
      }
    } catch (error) {
      // Error is handled by the mutation and toast is shown via interceptor
      console.error('Submit error:', error);
    }
  };

  const handleEdit = (table) => {
    setEditingTable(table);
    setValue('number', table.number);
    setValue('floor', table.floor);
    setValue('capacity', table.capacity);
    setValue('status', table.status);
    setIsModalOpen(true);
  };

  const handleDelete = async (table) => {
    if (!window.confirm(`Are you sure you want to delete Table ${table.number}?`)) {
      return;
    }

    try {
      await deleteTableMutation.mutateAsync(table._id);
    } catch (error) {
      // Error is handled by the mutation and toast is shown via interceptor
      console.error('Delete error:', error);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTable(null);
    reset();
  };

  const handleAddNew = () => {
    setEditingTable(null);
    reset();
    setIsModalOpen(true);
  };

  const columns = [
    {
      header: 'Table Number',
      accessor: 'number',
    },
    {
      header: 'Floor',
      accessor: 'floor',
    },
    {
      header: 'Capacity',
      accessor: 'capacity',
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (value) => (
        <span
          className={`px-2 py-1 rounded text-xs ${
            value === 'available'
              ? 'bg-green-500/20 text-green-400'
              : 'bg-red-500/20 text-red-400'
          }`}
        >
          {value}
        </span>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-white">Tables</h2>
        <button
          onClick={handleAddNew}
          className="px-4 py-2 bg-[#FF9500] hover:bg-[#e68806] text-black rounded-lg font-medium transition-colors"
        >
          <i className="fa-solid fa-plus mr-2"></i>Add Table
        </button>
      </div>

      <DataTable
        columns={columns}
        data={tables}
        onEdit={handleEdit}
        onDelete={handleDelete}
        loading={tablesLoading || deleteTableMutation.isPending}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingTable ? 'Edit Table' : 'Add Table'}
        size="md"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Table Number *</label>
            <input
              type="number"
              {...register('number', {
                required: 'Table number is required',
                min: { value: 1, message: 'Table number must be at least 1' },
              })}
              className="w-full px-4 py-2 bg-[#1a1a1a] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#FF9500]"
              placeholder="Enter table number"
            />
            {errors.number && (
              <p className="text-red-400 text-xs mt-1">{errors.number.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Floor *</label>
            <input
              type="number"
              {...register('floor', {
                required: 'Floor is required',
                min: { value: 0, message: 'Floor must be at least 0' },
              })}
              className="w-full px-4 py-2 bg-[#1a1a1a] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#FF9500]"
              placeholder="Enter floor number"
            />
            {errors.floor && <p className="text-red-400 text-xs mt-1">{errors.floor.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Capacity *</label>
            <input
              type="number"
              {...register('capacity', {
                required: 'Capacity is required',
                min: { value: 1, message: 'Capacity must be at least 1' },
              })}
              className="w-full px-4 py-2 bg-[#1a1a1a] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#FF9500]"
              placeholder="Enter capacity"
            />
            {errors.capacity && (
              <p className="text-red-400 text-xs mt-1">{errors.capacity.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Status *</label>
            <select
              {...register('status', { required: 'Status is required' })}
              className="w-full px-4 py-2 bg-[#1a1a1a] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#FF9500]"
            >
              <option value="available">Available</option>
              <option value="not available">Not Available</option>
            </select>
            {errors.status && <p className="text-red-400 text-xs mt-1">{errors.status.message}</p>}
          </div>

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
              disabled={isSubmitting || addTableMutation.isPending || updateTableMutation.isPending}
              className="flex-1 px-4 py-2 bg-[#FF9500] hover:bg-[#e68806] text-black rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {(isSubmitting || addTableMutation.isPending || updateTableMutation.isPending) ? (
                <span className="flex items-center justify-center">
                  <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                  {editingTable ? 'Updating...' : 'Creating...'}
                </span>
              ) : (
                editingTable ? 'Update' : 'Create'
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
