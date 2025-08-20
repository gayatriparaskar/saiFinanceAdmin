/**
 * Retry helper for API calls that might timeout
 */
export const retryApiCall = async (apiCall, maxRetries = 3, delay = 1000) => {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      const result = await apiCall();
      return result;
    } catch (error) {
      lastError = error;
      
      // Don't retry if it's not a timeout or network error
      if (error.code !== 'ECONNABORTED' && error.message !== 'Network Error') {
        throw error;
      }
      
      console.warn(`API call failed (attempt ${i + 1}/${maxRetries}):`, error.message);
      
      // Wait before retrying (exponential backoff)
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
      }
    }
  }
  
  throw lastError;
};

/**
 * Creates a timeout-aware API call with user feedback
 */
export const createTimeoutAwareCall = (apiCall, options = {}) => {
  const {
    maxRetries = 2,
    showToast = null,
    fallbackData = null,
    errorMessage = "Request failed. Please try again."
  } = options;
  
  return async () => {
    try {
      return await retryApiCall(apiCall, maxRetries);
    } catch (error) {
      console.error("API call failed after retries:", error);
      
      if (showToast) {
        showToast({
          title: "Connection Error",
          description: error.code === 'ECONNABORTED' 
            ? "Request timed out. The server might be busy. Please try again." 
            : errorMessage,
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "top"
        });
      }
      
      if (fallbackData !== null) {
        return { data: fallbackData };
      }
      
      throw error;
    }
  };
};
