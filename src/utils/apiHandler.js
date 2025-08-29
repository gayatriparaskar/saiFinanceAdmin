import axios from '../axios';

// Fallback API endpoints to try when primary fails
const FALLBACK_ENDPOINTS = [
  'https://sai-finance.vercel.app/api/',
  'https://api.learn2ern.com/api/',
  'https://learn2earn-alpha.vercel.app/'
];

let currentEndpointIndex = 0;

export const makeApiRequest = async (endpoint, data, method = 'POST') => {
  let lastError = null;
  
  // Try current endpoint first
  try {
    const response = await axios[method.toLowerCase()](endpoint, data);
    return response;
  } catch (error) {
    lastError = error;
    console.log(`Primary endpoint failed: ${error.message}`);
  }
  
  // If primary fails, try fallback endpoints
  for (let i = 0; i < FALLBACK_ENDPOINTS.length; i++) {
    try {
      console.log(`Trying fallback endpoint ${i + 1}...`);
      
      // Create temporary axios instance with different base URL
      const fallbackAxios = axios.create({
        baseURL: FALLBACK_ENDPOINTS[i],
        timeout: 15000,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      // Add auth header if token exists
      const token = localStorage.getItem('token');
      if (token) {
        fallbackAxios.defaults.headers.Authorization = token;
      }
      
      const response = await fallbackAxios[method.toLowerCase()](endpoint, data);
      
      // If successful, update the main axios instance to use this endpoint
      axios.defaults.baseURL = FALLBACK_ENDPOINTS[i];
      currentEndpointIndex = i;
      
      console.log(`Successfully connected to fallback endpoint: ${FALLBACK_ENDPOINTS[i]}`);
      return response;
      
    } catch (fallbackError) {
      console.log(`Fallback endpoint ${i + 1} failed: ${fallbackError.message}`);
      lastError = fallbackError;
    }
  }
  
  // If all endpoints fail, throw the last error
  throw lastError;
};

export const testApiConnectivity = async () => {
  try {
    // Try a simple health check endpoint
    const response = await makeApiRequest('health', {}, 'GET');
    return { success: true, endpoint: axios.defaults.baseURL };
  } catch (error) {
    console.error('All API endpoints failed:', error.message);
    return { success: false, error: error.message };
  }
};

export const handleApiError = (error) => {
  if (error.isNetworkError || error.message === 'Network Error') {
    return "Network connection failed. Please check your internet connection and try again.";
  } else if (error.response?.status === 401) {
    return "Authentication failed. Please log in again.";
  } else if (error.response?.status === 403) {
    return "Access denied. You don't have permission to perform this action.";
  } else if (error.response?.status === 404) {
    return "Service not found. The requested endpoint may not be available.";
  } else if (error.response?.status >= 500) {
    return "Server error. Please try again later.";
  } else if (error.isTimeout) {
    return "Request timeout. The server is taking too long to respond.";
  } else {
    return error.response?.data?.message || "An unexpected error occurred. Please try again.";
  }
};
