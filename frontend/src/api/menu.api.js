import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from './client';

// Data helpers
export const getAllMenus = (params = {}) =>
  apiRequest({ method: 'GET', url: '/menus', params });

export const addMenu = (payload) =>
  apiRequest({ method: 'POST', url: '/menus', data: payload });

export const updateMenu = (id, payload) =>
  apiRequest({ method: 'PUT', url: `/menus/${id}`, data: payload });

export const deleteMenu = (id) =>
  apiRequest({ method: 'PUT', url: `/menus/${id}`, data: { isDeleted: true } });

// React Query hooks
export const useMenusQuery = (params = {}, options = {}) =>
  useQuery({
    queryKey: ['menus', params],
    queryFn: () => getAllMenus(params),
    ...options,
  });

export const useAddMenuMutation = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => addMenu(payload),
    onSuccess: async (data, variables, context) => {
      // Invalidate and refetch all menu queries
      await queryClient.invalidateQueries({ queryKey: ['menus'] });
      await queryClient.refetchQueries({ queryKey: ['menus'] });
      if (options.onSuccess) options.onSuccess(data, variables, context);
    },
    ...options,
  });
};

export const useUpdateMenuMutation = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => updateMenu(id, payload),
    onSuccess: async (data, variables, context) => {
      // Invalidate all menu queries (including specific ones and list)
      await queryClient.invalidateQueries({ queryKey: ['menus'] });
      await queryClient.refetchQueries({ queryKey: ['menus'] });
      if (options.onSuccess) options.onSuccess(data, variables, context);
    },
    ...options,
  });
};

export const useDeleteMenuMutation = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteMenu(id),
    onSuccess: async (data, variables, context) => {
      // Invalidate and refetch all menu queries
      await queryClient.invalidateQueries({ queryKey: ['menus'] });
      await queryClient.refetchQueries({ queryKey: ['menus'] });
      if (options.onSuccess) options.onSuccess(data, variables, context);
    },
    ...options,
  });
};
