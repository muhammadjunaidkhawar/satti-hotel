import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest, apiClient } from './client';

// Data helpers
export const getAllStaff = (params = {}) =>
  apiRequest({ method: 'GET', url: '/staff', params });

export const addStaff = (payload) => {
  // If payload is FormData, use apiClient directly
  if (payload instanceof FormData) {
    return apiClient.post('/staff', payload, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((res) => res.data);
  }
  return apiRequest({ method: 'POST', url: '/staff', data: payload });
};

export const updateStaff = (id, payload) => {
  // If payload is FormData, use apiClient directly
  if (payload instanceof FormData) {
    return apiClient.put(`/staff/${id}`, payload, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((res) => res.data);
  }
  return apiRequest({ method: 'PUT', url: `/staff/${id}`, data: payload });
};

export const deleteStaff = (ids) =>
  apiRequest({ method: 'DELETE', url: '/staff', data: { ids } });

// React Query hooks
export const useStaffQuery = (params = {}, options = {}) =>
  useQuery({
    queryKey: ['staff', params],
    queryFn: () => getAllStaff(params),
    ...options,
  });

export const useAddStaffMutation = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => addStaff(payload),
    onSuccess: async () => {
      await queryClient.refetchQueries({ queryKey: ['staff'] });
      if (options.onSuccess) options.onSuccess();
    },
    ...options,
  });
};

export const useUpdateStaffMutation = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => updateStaff(id, payload),
    onSuccess: async (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['staff', variables.id] });
      await queryClient.refetchQueries({ queryKey: ['staff'] });
      if (options.onSuccess) options.onSuccess(data, variables);
    },
    ...options,
  });
};

export const useDeleteStaffMutation = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids) => deleteStaff(ids),
    onSuccess: async () => {
      await queryClient.refetchQueries({ queryKey: ['staff'] });
      if (options.onSuccess) options.onSuccess();
    },
    ...options,
  });
};
