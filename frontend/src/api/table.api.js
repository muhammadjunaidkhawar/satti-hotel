import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from './client';

// Data helpers
export const getAllTables = (params = {}) =>
  apiRequest({ method: 'GET', url: '/tables', params });

export const addTable = (payload) =>
  apiRequest({ method: 'POST', url: '/tables', data: payload });

export const updateTable = (id, payload) =>
  apiRequest({ method: 'PUT', url: `/tables/${id}`, data: payload });

export const deleteTable = (id) =>
  apiRequest({ method: 'PUT', url: `/tables/${id}`, data: { isDeleted: true } });

// React Query hooks
export const useTablesQuery = (params = {}, options = {}) =>
  useQuery({
    queryKey: ['tables', params],
    queryFn: () => getAllTables(params),
    ...options,
  });

export const useAddTableMutation = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => addTable(payload),
    onSuccess: async (data, variables, context) => {
      // Invalidate and refetch all table queries
      await queryClient.invalidateQueries({ queryKey: ['tables'] });
      await queryClient.refetchQueries({ queryKey: ['tables'] });
      if (options.onSuccess) options.onSuccess(data, variables, context);
    },
    ...options,
  });
};

export const useUpdateTableMutation = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => updateTable(id, payload),
    onSuccess: async (data, variables, context) => {
      // Invalidate all table queries (including specific ones and list)
      await queryClient.invalidateQueries({ queryKey: ['tables'] });
      await queryClient.refetchQueries({ queryKey: ['tables'] });
      if (options.onSuccess) options.onSuccess(data, variables, context);
    },
    ...options,
  });
};

export const useDeleteTableMutation = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteTable(id),
    onSuccess: async (data, variables, context) => {
      // Invalidate and refetch all table queries
      await queryClient.invalidateQueries({ queryKey: ['tables'] });
      await queryClient.refetchQueries({ queryKey: ['tables'] });
      if (options.onSuccess) options.onSuccess(data, variables, context);
    },
    ...options,
  });
};
