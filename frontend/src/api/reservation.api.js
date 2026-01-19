import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from './client';

// Data helpers
export const getAllReservations = (params = {}) =>
  apiRequest({ method: 'GET', url: '/reservations', params });

export const addReservation = (payload) =>
  apiRequest({ method: 'POST', url: '/reservations', data: payload });

export const updateReservation = (id, payload) =>
  apiRequest({ method: 'PUT', url: `/reservations/${id}`, data: payload });

export const getReservationCount = () =>
  apiRequest({ method: 'GET', url: '/reservations/count' });

// React Query hooks
export const useReservationsQuery = (params = {}, options = {}) =>
  useQuery({
    queryKey: ['reservations', params],
    queryFn: () => getAllReservations(params),
    enabled: !!params.date, // Only fetch if date is provided
    ...options,
  });

export const useAddReservationMutation = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => addReservation(payload),
    onSuccess: async () => {
      await queryClient.refetchQueries({ queryKey: ['reservations'] });
      await queryClient.refetchQueries({ queryKey: ['reservations', 'count'] });
      if (options.onSuccess) options.onSuccess();
    },
    ...options,
  });
};

export const useUpdateReservationMutation = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => updateReservation(id, payload),
    onSuccess: async (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reservations', variables.id] });
      await queryClient.refetchQueries({ queryKey: ['reservations'] });
      if (options.onSuccess) options.onSuccess(data, variables);
    },
    ...options,
  });
};

export const useReservationCountQuery = (options = {}) =>
  useQuery({
    queryKey: ['reservations', 'count'],
    queryFn: () => getReservationCount(),
    ...options,
  });
