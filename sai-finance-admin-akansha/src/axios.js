import axios from "axios";
//  const API_BASE_URL = "https://api.learn2ern.com/api/";
//////////////////////
//  const API_BASE_URL = "https://learn2earn-alpha.vercel.app/";
//////////////////////
 const API_BASE_URL = "https://sai-finance.vercel.app/api/";

const instance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds timeout (increased from 10s)
  headers: {
    "Content-Type": "application/json",
  },
});

instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    // console.log(token)
    // console.log("token")
    if (token) {
      config.headers.Authorization = `${token}`;
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
    // Handle different types of network errors
    if (error.code === 'ECONNABORTED') {
      console.warn('Request timeout - API might be slow or down. Consider retrying.');
      error.isTimeout = true;
    } else if (error.message === 'Network Error') {
      console.warn('Network Error - API server might be unavailable');
      error.isNetworkError = true;
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

export default instance;
