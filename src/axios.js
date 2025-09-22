import axios from "axios";

// Primary API endpoint - Using localhost for development
const API_BASE_URL = "https://saifinancebackend.onrender.com/api/";
// const API_BASE_URL = "http://localhost:3001/api/";

// Fallback endpoints in order of preference
const FALLBACK_ENDPOINTS = [
  "https://saifinancebackend.onrender.com/api/",
  // "http://localhost:3001/api/",
  // "https://api.learn2ern.com/api/",
  // "https://learn2earn-alpha.vercel.app/"
];

const instance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000, // 20 seconds timeout
  headers: {
    "Content-Type": "application/json",
  },
  // Add retry configuration
  validateStatus: function (status) {
    return status >= 200 && status < 300; // default
  },
});

instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    // console.log(token)
    // console.log("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (err) => {
    return Promise.reject(err);
  }
);

// Response interceptor for better error handling
instance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle authentication errors first
    if (error.response?.status === 401) {
      console.warn('Authentication failed - redirecting to login');
      localStorage.removeItem('token');
      // Only redirect if not already on login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
      error.isAuthError = true;
    } else if (error.response?.status === 403) {
      console.warn('Access forbidden - insufficient permissions');
      error.isAuthError = true;
    }

    // Handle different types of network errors
    else if (error.code === 'ECONNABORTED') {
      console.warn('Request timeout - API might be slow or down. Consider retrying.');
      error.isTimeout = true;
    } else if (error.message === 'Network Error' || error.code === 'NETWORK_ERROR') {
      console.warn('Network Error - API server might be unavailable');
      error.isNetworkError = true;

      // Auto-retry with fallback endpoint for critical requests
      if (error.config && !error.config._retried) {
        console.log('Attempting automatic retry with fallback endpoint...');
        return retryWithFallback(error.config);
      }
    } else if (error.response) {
      // Server responded with error status
      console.warn(`API Error ${error.response.status}: ${error.response.statusText}`);
      if (error.response.status >= 500) {
        error.isServerError = true;
      }
    } else {
      // Something else happened
      console.warn('Unexpected error:', error.message);
    }

    // Add timestamp for debugging
    error.timestamp = new Date().toISOString();

    return Promise.reject(error);
  }
);

// Retry function with fallback endpoints
const retryWithFallback = async (originalConfig) => {
  for (const fallbackUrl of FALLBACK_ENDPOINTS) {
    try {
      console.log(`Trying fallback endpoint: ${fallbackUrl}`);

      const fallbackConfig = {
        ...originalConfig,
        baseURL: fallbackUrl,
        _retried: true
      };

      // Add auth header if exists
      const token = localStorage.getItem('token');
      if (token) {
        fallbackConfig.headers = {
          ...fallbackConfig.headers,
          Authorization: `Bearer ${token}`
        };
      }

      const response = await axios(fallbackConfig);

      // If successful, update the instance base URL
      instance.defaults.baseURL = fallbackUrl;
      console.log(`Successfully switched to fallback endpoint: ${fallbackUrl}`);

      return response;
    } catch (fallbackError) {
      console.log(`Fallback endpoint ${fallbackUrl} also failed:`, fallbackError.message);
    }
  }

  // If all fallbacks fail, throw the original error
  throw originalConfig.originalError || new Error('All API endpoints are unavailable');
};

// Add method to test connectivity
instance.testConnectivity = async () => {
  try {
    await instance.get('health');
    return { success: true, endpoint: instance.defaults.baseURL };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export default instance;
