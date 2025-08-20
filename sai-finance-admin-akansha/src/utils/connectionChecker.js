import axios from '../axios';

/**
 * Check if the API server is reachable
 */
export const checkAPIConnection = async () => {
  try {
    // Use a lightweight endpoint to check connectivity
    const response = await axios.get('/', { timeout: 5000 });
    return {
      isConnected: true,
      status: response.status,
      message: 'API server is reachable'
    };
  } catch (error) {
    return {
      isConnected: false,
      error: error.code || error.message,
      message: getConnectionErrorMessage(error)
    };
  }
};

/**
 * Get user-friendly error message based on error type
 */
export const getConnectionErrorMessage = (error) => {
  if (error.code === 'ECONNABORTED') {
    return 'Request timed out. The server might be busy.';
  } else if (error.message === 'Network Error') {
    return 'Cannot reach the server. Please check your internet connection.';
  } else if (error.response?.status >= 500) {
    return 'Server error. Please try again later.';
  } else if (error.response?.status === 404) {
    return 'API endpoint not found.';
  } else {
    return 'Connection failed. Please try again.';
  }
};

/**
 * Show connection status in console for debugging
 */
export const logConnectionStatus = async () => {
  const status = await checkAPIConnection();
  if (status.isConnected) {
    console.log('✅ API Connection:', status.message);
  } else {
    console.error('❌ API Connection Failed:', status.message);
  }
  return status;
};

/**
 * Retry mechanism with exponential backoff
 */
export const retryWithBackoff = async (fn, maxRetries = 3, baseDelay = 1000) => {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Don't retry on certain errors
      if (error.response?.status === 401 || error.response?.status === 403) {
        throw error;
      }
      
      if (i < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, i);
        console.log(`Retrying in ${delay}ms... (attempt ${i + 2}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
};
