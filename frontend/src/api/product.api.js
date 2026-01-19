import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from './client';

// Data helpers
export const getAllProducts = (params = {}) =>
  apiRequest({ method: 'GET', url: '/products', params });

export const addProduct = (payload) =>
  apiRequest({ method: 'POST', url: '/products', data: payload });

export const updateProduct = (id, payload) =>
  apiRequest({ method: 'PUT', url: `/products/${id}`, data: payload });

export const deleteProducts = (ids) =>
  apiRequest({ method: 'DELETE', url: '/products', data: { ids } });

export const getRandomProducts = () =>
  apiRequest({ method: 'GET', url: '/products/random' });

// React Query hooks
export const useProductsQuery = (params = {}, options = {}) =>
  useQuery({
    queryKey: ['products', params],
    queryFn: () => getAllProducts(params),
    ...options,
  });

export const useAddProductMutation = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => addProduct(payload),
    onSuccess: async () => {
      await queryClient.refetchQueries({ queryKey: ['products'] });
      if (options.onSuccess) options.onSuccess();
    },
    ...options,
  });
};

export const useUpdateProductMutation = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => updateProduct(id, payload),
    onSuccess: async (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['products', variables.id] });
      await queryClient.refetchQueries({ queryKey: ['products'] });
      if (options.onSuccess) options.onSuccess(data, variables);
    },
    ...options,
  });
};

export const useDeleteProductsMutation = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids) => deleteProducts(ids),
    onSuccess: async () => {
      await queryClient.refetchQueries({ queryKey: ['products'] });
      if (options.onSuccess) options.onSuccess();
    },
    ...options,
  });
};

export const useRandomProductsQuery = (options = {}) =>
  useQuery({
    queryKey: ['products', 'random'],
    queryFn: () => getRandomProducts(),
    ...options,
  });
