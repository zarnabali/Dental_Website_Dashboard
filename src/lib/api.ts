import axios from 'axios';

// API Base URL - read from environment variable
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Log API URL for debugging
console.log('API Base URL:', API_BASE_URL);
console.log('Environment API URL:', process.env.NEXT_PUBLIC_API_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const fullUrl = `${config.baseURL || ''}${config.url || ''}`;
  console.log('Making API request to:', fullUrl);
  console.log('Request method:', config.method);
  console.log('Request headers:', config.headers);
  
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Added auth token to request');
    } else {
      console.log('No auth token found');
    }
  }
  return config;
});

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    console.log('API Response received:', response.status, response.config?.url);
    return response;
  },
  (error) => {
    const fullUrl = `${error.config?.baseURL || ''}${error.config?.url || ''}`;
    
    // More robust error logging
    const errorDetails = {
      message: error.message || 'Unknown error',
      code: error.code || 'UNKNOWN',
      status: error.response?.status || 'No status',
      statusText: error.response?.statusText || 'No status text',
      url: error.config?.url || 'No URL',
      baseURL: error.config?.baseURL || 'No base URL',
      fullURL: fullUrl,
      responseData: error.response?.data || 'No response data',
      requestData: error.config?.data || 'No request data'
    };
    
    console.error('API Error Details:', errorDetails);
    console.error('Full error object:', error);
    
    if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error' || error.message === 'Failed to fetch') {
      console.error('Network Error: Backend server is not running or not accessible');
      console.error('Attempted URL:', fullUrl);
      // Don't redirect on network errors, just show error message
      return Promise.reject({
        ...error,
        message: 'Unable to connect to server. Please make sure the backend is running on port 5000.',
        isNetworkError: true
      });
    }
    
    if (error.response?.status === 401) {
      // Token expired or invalid
      console.log('401 Unauthorized - Token expired or invalid, redirecting to login');
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        // Use router.push instead of window.location.href for better Next.js integration
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;

