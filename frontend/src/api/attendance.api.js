import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from './client';

// Data helpers
export const getAllAttendance = (params = {}) =>
  apiRequest({ method: 'GET', url: '/attendance', params });

export const addAttendance = (payload) =>
  apiRequest({ method: 'POST', url: '/attendance', data: payload });

// React Query hooks
export const useAttendanceQuery = (params = {}, options = {}) =>
  useQuery({
    queryKey: ['attendance', params],
    queryFn: () => getAllAttendance(params),
    ...options,
  });

export const useAddAttendanceMutation = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => addAttendance(payload),
    onSuccess: async () => {
      await queryClient.refetchQueries({ queryKey: ['attendance'] });
      if (options.onSuccess) options.onSuccess();
    },
    ...options,
  });
};
