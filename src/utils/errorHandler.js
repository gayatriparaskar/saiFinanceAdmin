// Error handling utility for better user experience

export const handleNetworkError = (error, fallbackMessage = "डेटा लोड करने में समस्या हुई") => {
  let userMessage = fallbackMessage;
  
  if (error.code === 'ECONNABORTED') {
    userMessage = "सर्वर का प्रतिउत्तर धीमा है। कृपया प्रतीक्षा करें।";
  } else if (error.message === 'Network Error') {
    userMessage = "इंटरनेट कनेक्शन या सर्वर की समस्या। कृपया बाद में पुनः प्रयास करें।";
  } else if (error.response?.status === 404) {
    userMessage = "अनुरोधित डेटा उपलब्ध नहीं है।";
  } else if (error.response?.status === 500) {
    userMessage = "सर्वर में तकनीकी समस्या है। कृपया बाद में पुनः प्रयास करें।";
  } else if (error.response?.status >= 400 && error.response?.status < 500) {
    userMessage = "डेटा प्राप्त करने में समस्या है।";
  }
  
  return {
    userMessage,
    technicalMessage: error.message,
    shouldShowFallback: true
  };
};

export const isNetworkError = (error) => {
  return error.message === 'Network Error' || 
         error.code === 'ECONNABORTED' ||
         !error.response;
};

export const showErrorToast = (toast, error, fallbackMessage) => {
  const { userMessage } = handleNetworkError(error, fallbackMessage);
  
  toast({
    title: "सूचना",
    description: userMessage,
    status: "warning",
    duration: 4000,
    isClosable: true,
    position: "top"
  });
};
