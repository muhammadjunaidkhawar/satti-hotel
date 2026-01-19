import axios from 'axios';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '../constants/env';

export const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Authorization helper
export const authorize = (configOverrides = {}) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return configOverrides;

    return {
      ...configOverrides,
      headers: {
        ...(configOverrides.headers || {}),
        Authorization: `Bearer ${token}`,
      },
    };
  } catch (err) {
    console.error('Error in authorize helper:', err);
    return configOverrides;
  }
};

// Attach Authorization header when available
apiClient.interceptors.request.use((config) => authorize(config));

// Response interceptor for success and error handling
apiClient.interceptors.response.use(
  (response) => {
    // Show success toast for POST, PUT, PATCH, DELETE requests
    const method = response.config.method?.toUpperCase();
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      const message = response.data?.message || 'Operation completed successfully!';
      toast.success(message);
    }
    return response;
  },
  (error) => {
    // Handle error responses
    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.message || error.response.data?.error || 'An error occurred';
      toast.error(message);
    } else if (error.request) {
      // Request was made but no response received
      toast.error('Network error. Please check your connection.');
    } else {
      // Something else happened
      toast.error(error.message || 'An unexpected error occurred');
    }
    return Promise.reject(error);
  }
);

// Helper to unwrap response data
export const apiRequest = async (config) => {
  const response = await apiClient(config);
  return response.data;
};
