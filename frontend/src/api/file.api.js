import axios from 'axios';
import { API_BASE_URL } from '../constants/env';
import { authorize } from './client';

// Create a separate axios instance for file uploads (multipart/form-data)
const fileUploadClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 60000, // Longer timeout for file uploads
});

// Attach Authorization header when available
fileUploadClient.interceptors.request.use((config) => {
  const authorizedConfig = authorize(config);
  // Ensure Content-Type is not set for multipart/form-data (browser will set it with boundary)
  if (authorizedConfig.headers) {
    delete authorizedConfig.headers['Content-Type'];
  }
  return authorizedConfig;
});

/**
 * Upload a file to S3
 * @param {File} file - The file to upload
 * @returns {Promise} Promise that resolves with the file URL
 */
export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fileUploadClient.post('/files', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};
