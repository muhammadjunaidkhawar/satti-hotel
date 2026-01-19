import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from './client';

// Data helpers
export const getAllCategories = (params = {}) => apiRequest({ method: 'GET', url: '/categories', params });

export const addCategory = (payload) => apiRequest({ method: 'POST', url: '/categories', data: payload });

export const updateCategory = (id, payload) => apiRequest({ method: 'PUT', url: `/categories/${id}`, data: payload });

export const deleteCategory = (id) => apiRequest({ method: 'PUT', url: `/categories/${id}`, data: { isDeleted: true } });

// React Query hooks
export const useCategoriesQuery = (params = {}, options = {}) =>
  useQuery({
    queryKey: ['categories', params],
    queryFn: () => getAllCategories(params),
    ...options,
  });

export const useAddCategoryMutation = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => addCategory(payload),
    onSuccess: async (data, variables, context) => {
      // Invalidate and refetch all category queries
      await queryClient.invalidateQueries({ queryKey: ['categories'] });
      await queryClient.refetchQueries({ queryKey: ['categories'] });
      if (options.onSuccess) options.onSuccess(data, variables, context);
    },
    ...options,
  });
};

export const useUpdateCategoryMutation = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => updateCategory(id, payload),
    onSuccess: async (data, variables, context) => {
      // Invalidate all category queries (including specific ones and list)
      await queryClient.invalidateQueries({ queryKey: ['categories'] });
      await queryClient.refetchQueries({ queryKey: ['categories'] });
      if (options.onSuccess) options.onSuccess(data, variables, context);
    },
    ...options,
  });
};

export const useDeleteCategoryMutation = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteCategory(id),
    onSuccess: async (data, variables, context) => {
      // Invalidate and refetch all category queries
      await queryClient.invalidateQueries({ queryKey: ['categories'] });
      await queryClient.refetchQueries({ queryKey: ['categories'] });
      if (options.onSuccess) options.onSuccess(data, variables, context);
    },
    ...options,
  });
};
