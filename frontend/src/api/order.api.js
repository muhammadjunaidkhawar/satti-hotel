import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from './client';

// Data helpers
export const getAllOrders = (params = {}) =>
  apiRequest({ method: 'GET', url: '/orders', params });

export const addOrder = (payload) => apiRequest({ method: 'POST', url: '/orders', data: payload });

export const updateOrderStatus = (id, payload) =>
  apiRequest({ method: 'PUT', url: `/orders/${id}/status`, data: payload });

export const payOrder = (id, payload) =>
  apiRequest({ method: 'PUT', url: `/orders/${id}/pay`, data: payload });

export const getOrderStats = () => apiRequest({ method: 'GET', url: '/orders/stats' });

export const getDashboardStats = () => apiRequest({ method: 'GET', url: '/orders/dashboard' });

export const getSalesChartData = (period = 'monthly') =>
  apiRequest({ method: 'GET', url: '/orders/chart', params: { period } });

// React Query hooks
export const useOrdersQuery = (params = {}, options = {}) =>
  useQuery({
    queryKey: ['orders', params],
    queryFn: () => getAllOrders(params),
    ...options,
  });

export const useAddOrderMutation = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => addOrder(payload),
    onSuccess: async () => {
      await queryClient.refetchQueries({ queryKey: ['orders'] });
      if (options.onSuccess) options.onSuccess();
    },
    ...options,
  });
};

export const useUpdateOrderStatusMutation = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => updateOrderStatus(id, payload),
    onSuccess: async (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders', variables.id] });
      await queryClient.refetchQueries({ queryKey: ['orders'] });
      if (options.onSuccess) options.onSuccess(data, variables);
    },
    ...options,
  });
};

export const usePayOrderMutation = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => payOrder(id, payload),
    onSuccess: async (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders', variables.id] });
      await queryClient.refetchQueries({ queryKey: ['orders'] });
      await queryClient.refetchQueries({ queryKey: ['orders', 'stats'] });
      if (options.onSuccess) options.onSuccess(data, variables);
    },
    ...options,
  });
};

export const useUpdateOrderMutation = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => updateOrderStatus(id, payload),
    onSuccess: async (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders', variables.id] });
      await queryClient.refetchQueries({ queryKey: ['orders'] });
      if (options.onSuccess) options.onSuccess(data, variables);
    },
    ...options,
  });
};

export const useOrderStatsQuery = (options = {}) =>
  useQuery({
    queryKey: ['orders', 'stats'],
    queryFn: () => getOrderStats(),
    ...options,
  });

export const useDashboardStatsQuery = (options = {}) =>
  useQuery({
    queryKey: ['orders', 'dashboard'],
    queryFn: () => getDashboardStats(),
    ...options,
  });

export const useSalesChartDataQuery = (period = 'monthly', options = {}) =>
  useQuery({
    queryKey: ['orders', 'chart', period],
    queryFn: () => getSalesChartData(period),
    ...options,
  });
