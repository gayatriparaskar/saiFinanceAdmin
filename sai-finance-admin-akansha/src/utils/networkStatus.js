// Network status utility to check API connectivity

export const checkAPIStatus = async () => {
  try {
    // Simple health check - can be modified based on your API
    const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://sai-finance.vercel.app/api'}/health`, {
      method: 'GET',
      timeout: 5000
    });
    
    if (response.ok) {
      console.log('✅ API Server is reachable');
      return { status: 'online', message: 'API Server is online' };
    } else {
      console.warn('⚠️ API Server responded with error:', response.status);
      return { status: 'error', message: `API Server error: ${response.status}` };
    }
  } catch (error) {
    console.warn('❌ API Server is not reachable:', error.message);
    return { status: 'offline', message: 'API Server is offline or unreachable' };
  }
};

export const showNetworkStatus = () => {
  console.log('🔍 Checking network and API status...');
  
  // Check internet connectivity
  if (!navigator.onLine) {
    console.warn('❌ No internet connection detected');
    return { network: 'offline', api: 'unknown' };
  }
  
  console.log('✅ Internet connection is available');
  
  // Check API status
  checkAPIStatus().then(apiStatus => {
    console.log(`🌐 API Status: ${apiStatus.status} - ${apiStatus.message}`);
  });
  
  return { network: 'online', api: 'checking' };
};

// Display helpful debug information
export const debugNetworkIssues = () => {
  console.group('🔧 Network Debug Information');
  console.log('Current API Base URL:', process.env.REACT_APP_API_URL || 'https://sai-finance.vercel.app/api/');
  console.log('Browser Online Status:', navigator.onLine ? '✅ Online' : '❌ Offline');
  console.log('User Agent:', navigator.userAgent);
  console.log('Current Time:', new Date().toLocaleString('hi-IN'));
  
  // Check if we're in development mode
  if (process.env.NODE_ENV === 'development') {
    console.log('🚧 Running in Development Mode');
  } else {
    console.log('🚀 Running in Production Mode');
  }
  
  console.groupEnd();
};
