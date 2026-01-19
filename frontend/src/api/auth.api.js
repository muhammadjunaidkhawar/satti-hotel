import { useMutation } from '@tanstack/react-query';
import { apiRequest } from './client';
import { navigateTo } from '../utils/navigation';
import { setToken } from '../utils/auth';

// Data helpers
export const loginRequest = (credentials) => apiRequest({ method: 'POST', url: '/auth/login', data: credentials });

// React Query hooks
export const useLoginMutation = (options = {}) => {
  // Merge default onSuccess with user-provided options
  const mergedOptions = {
    ...options,
    onSuccess: (data, variables, context) => {
      // Store token first (this happens synchronously)
      const token = data?.result?.token || data?.token || data?.data?.token || data?.accessToken;
      if (token) {
        setToken(token);
      }

      // Call user-provided onSuccess first to update auth state
      if (options.onSuccess) {
        options.onSuccess(data, variables, context);
      }

      // Then navigate to dashboard after state is updated
      if (token) {
        // Use setTimeout to ensure state updates are processed before navigation
        setTimeout(() => {
          navigateTo('/dashboard');
        }, 0);
      } else {
        console.error('No token found in login response:', data);
      }
    },
  };

  return useMutation({
    mutationFn: ({ email, password }) => loginRequest({ email, password }),
    ...mergedOptions,
  });
};
