# SAI Finance Admin - API Documentation

## 📋 Table of Contents
1. [Base Configuration](#base-configuration)
2. [Authentication APIs](#authentication-apis)
3. [User Management APIs](#user-management-apis)
4. [Officer Management APIs](#officer-management-apis)
5. [Collection APIs](#collection-apis)
6. [Dashboard APIs](#dashboard-apis)
7. [Error Handling](#error-handling)
8. [API Integration Patterns](#api-integration-patterns)

---

## 🔧 Base Configuration

### Axios Instance Setup
```javascript
// src/axios.js
import axios from 'axios';

const instance = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

export default instance;
```

### Request Interceptor
```javascript
// Authentication token injection
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
```

### Response Interceptor
```javascript
// Global error handling
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

---

## 🔐 Authentication APIs

### Admin Login
**Endpoint**: `POST /admins/login`

**Request Body**:
```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Login successful",
  "result": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "admin": {
      "id": "admin_id",
      "email": "admin@example.com",
      "name": "Admin Name"
    }
  }
}
```

**Usage**:
```javascript
const handleLogin = async (credentials) => {
  try {
    const response = await axios.post('/admins/login', credentials);
    localStorage.setItem('token', response.data.result.token);
    return response.data;
  } catch (error) {
    throw error;
  }
};
```

### Admin Logout
**Endpoint**: `POST /admins/logout`

**Request Headers**:
```
Authorization: Bearer <token>
```

**Response**:
```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

## 👥 User Management APIs

### Get All Users
**Endpoint**: `GET /users/`

**Request Headers**:
```
Authorization: Bearer <token>
```

**Response**:
```json
{
  "success": true,
  "result": [
    {
      "_id": "user_id",
      "full_name": "John Doe",
      "phone_number": "9876543210",
      "active_loan_id": {
        "_id": "loan_id",
        "total_amount": 50000,
        "status": "active"
      },
      "saving_account_id": {
        "_id": "saving_id",
        "current_amount": 25000,
        "status": "active"
      }
    }
  ]
}
```

**Usage**:
```javascript
const fetchUsers = async () => {
  try {
    const response = await axios.get('/users/');
    return response.data.result;
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
};
```

### Create Loan User
**Endpoint**: `POST /admins/createUser`

**Request Body**:
```json
{
  "full_name": "John Doe",
  "phone_number": "9876543210",
  "email": "john@example.com",
  "address": "123 Main St",
  "loan_amount": 50000,
  "loan_duration": 12
}
```

**Response**:
```json
{
  "success": true,
  "message": "Loan user created successfully",
  "result": {
    "_id": "user_id",
    "full_name": "John Doe",
    "phone_number": "9876543210"
  }
}
```

**Usage**:
```javascript
const createLoanUser = async (userData) => {
  try {
    const response = await axios.post('/admins/createUser', userData);
    return response.data;
  } catch (error) {
    throw error;
  }
};
```

### Update User
**Endpoint**: `PUT /users/:id`

**Request Body**:
```json
{
  "full_name": "John Doe Updated",
  "phone_number": "9876543210",
  "email": "john.updated@example.com"
}
```

**Response**:
```json
{
  "success": true,
  "message": "User updated successfully",
  "result": {
    "_id": "user_id",
    "full_name": "John Doe Updated"
  }
}
```

### Delete User
**Endpoint**: `DELETE /users/:id`

**Response**:
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

---

## 👮 Officer Management APIs

### Get All Officers
**Endpoint**: `GET /officers/`

**Response**:
```json
{
  "success": true,
  "result": [
    {
      "_id": "officer_id",
      "full_name": "Officer Name",
      "officer_code": "OFF001",
      "phone_number": "9876543210",
      "email": "officer@example.com",
      "join_date": "2024-01-01T00:00:00.000Z",
      "user_collections": [
        {
          "_id": "collection_id",
          "user_id": "user_id",
          "collected_amount": 1000,
          "collected_on": "2024-12-25T05:45:39.901Z",
          "penalty": 0,
          "account_type": "saving account"
        }
      ]
    }
  ]
}
```

### Create Officer
**Endpoint**: `POST /officers`

**Request Body**:
```json
{
  "full_name": "New Officer",
  "phone_number": "9876543210",
  "email": "officer@example.com",
  "address": "Officer Address",
  "join_date": "2024-01-01"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Officer created successfully",
  "result": {
    "_id": "officer_id",
    "officer_code": "OFF002",
    "full_name": "New Officer"
  }
}
```

### Get Officer Details
**Endpoint**: `GET /officers/:id`

**Response**:
```json
{
  "success": true,
  "result": {
    "_id": "officer_id",
    "full_name": "Officer Name",
    "officer_code": "OFF001",
    "phone_number": "9876543210",
    "email": "officer@example.com",
    "join_date": "2024-01-01T00:00:00.000Z",
    "user_collections": [
      {
        "_id": "collection_id",
        "user_id": "user_id",
        "name": "User Name",
        "phone_number": "9876543210",
        "account_type": "saving account",
        "collected_amount": 1000,
        "collected_on": "2024-12-25T05:45:39.901Z",
        "penalty": 0
      }
    ]
  }
}
```

### Update Officer
**Endpoint**: `PUT /officers/:id`

**Request Body**:
```json
{
  "full_name": "Updated Officer Name",
  "phone_number": "9876543210",
  "email": "updated@example.com"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Officer updated successfully",
  "result": {
    "_id": "officer_id",
    "full_name": "Updated Officer Name"
  }
}
```

---

## 💰 Collection APIs

### Get Total Collections
**Endpoint**: `GET /admins/totalCollections`

**Response**:
```json
{
  "success": true,
  "result": {
    "totalAmount": 89500,
    "totalCount": 150
  }
}
```

### Get Daily Collections
**Endpoint**: `GET /admins/totalCollectionsToday`

**Response**:
```json
{
  "success": true,
  "result": {
    "totalAmount": 15750,
    "totalCount": 25
  }
}
```

### Add Saving Collection (Deposit)
**Endpoint**: `POST /savingDailyCollections/byAdmin/:userId`

**Request Body**:
```json
{
  "collected_officer_code": "OFF001",
  "deposit_amount": 1000,
  "addPenaltyFlag": false
}
```

**Response**:
```json
{
  "success": true,
  "message": "Saving collection added successfully",
  "result": {
    "_id": "collection_id",
    "deposit_amount": 1000,
    "collected_on": "2024-12-25T05:45:39.901Z"
  }
}
```

### Add Saving Collection (Withdrawal)
**Endpoint**: `POST /savingDailyCollections/withdrawByAdmin/:userId`

**Request Body**:
```json
{
  "collected_officer_code": "OFF001",
  "withdraw_amount": 500,
  "total_deduction": 515
}
```

**Response**:
```json
{
  "success": true,
  "message": "Withdrawal successful",
  "result": {
    "_id": "collection_id",
    "withdraw_amount": 500,
    "total_deduction": 515,
    "collected_on": "2024-12-25T05:45:39.901Z"
  }
}
```

### Get Total Saving Collections Today
**Endpoint**: `GET /savingDailyCollections/totalSavingCollectionsToday`

**Response**:
```json
{
  "success": true,
  "result": {
    "totalAmount": 12500,
    "totalCount": 20
  }
}
```

---

## 📊 Dashboard APIs

### Get Monthly Statistics
**Endpoint**: `GET /admins/totalCollectionsMonthlyStats`

**Response**:
```json
{
  "success": true,
  "result": [
    {
      "month": "January",
      "totalAmount": 12000
    },
    {
      "month": "February",
      "totalAmount": 15000
    }
  ]
}
```

### Get Weekly Statistics
**Endpoint**: `GET /admins/totalCollectionsWeeklyStats`

**Response**:
```json
{
  "success": true,
  "result": {
    "dailyStats": [
      {
        "day": "Monday",
        "totalAmount": 2500
      },
      {
        "day": "Tuesday",
        "totalAmount": 3200
      }
    ]
  }
}
```

### Get Account Information
**Endpoint**: `GET /account/`

**Response**:
```json
{
  "success": true,
  "result": [
    {
      "_id": "account_id",
      "saving_account_id": {
        "_id": "saving_id",
        "current_amount": 25000,
        "status": "active"
      }
    }
  ]
}
```

---

## 🚨 Error Handling

### Common Error Responses

#### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "phone_number",
      "message": "Phone number must be 10 digits"
    }
  ]
}
```

#### 401 Unauthorized
```json
{
  "success": false,
  "message": "Authentication failed",
  "error": "Invalid token"
}
```

#### 404 Not Found
```json
{
  "success": false,
  "message": "Resource not found",
  "error": "User not found"
}
```

#### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error",
  "error": "Database connection failed"
}
```

### Error Handling Utility
```javascript
// src/utils/errorHandler.js
export const handleApiError = (error, context = 'API call') => {
  console.error(`Error in ${context}:`, error);
  
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        return {
          type: 'validation',
          message: data.message || 'Validation failed',
          errors: data.errors || []
        };
      case 401:
        return {
          type: 'auth',
          message: 'Authentication failed'
        };
      case 404:
        return {
          type: 'notFound',
          message: 'Resource not found'
        };
      case 500:
        return {
          type: 'server',
          message: 'Server error occurred'
        };
      default:
        return {
          type: 'unknown',
          message: 'An unexpected error occurred'
        };
    }
  } else if (error.request) {
    // Network error
    return {
      type: 'network',
      message: 'Network error - please check your connection'
    };
  } else {
    // Other error
    return {
      type: 'unknown',
      message: error.message || 'An unexpected error occurred'
    };
  }
};
```

---

## 🔄 API Integration Patterns

### 1. Data Fetching Pattern
```javascript
const useApiData = (endpoint, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(endpoint);
        setData(response.data.result);
      } catch (err) {
        setError(handleApiError(err, `Fetching ${endpoint}`));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, dependencies);

  return { data, loading, error };
};
```

### 2. Form Submission Pattern
```javascript
const useFormSubmission = (endpoint, method = 'POST') => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const submitForm = async (formData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios[method.toLowerCase()](endpoint, formData);
      
      toast({
        title: 'Success!',
        description: response.data.message,
        status: 'success',
        duration: 4000,
        isClosable: true,
      });
      
      return response.data;
    } catch (err) {
      const errorInfo = handleApiError(err, 'Form submission');
      setError(errorInfo);
      
      toast({
        title: 'Error!',
        description: errorInfo.message,
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
      
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { submitForm, loading, error };
};
```

### 3. Optimistic Updates Pattern
```javascript
const useOptimisticUpdate = (endpoint, updateData) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const updateOptimistically = async (newData) => {
    // Optimistically update UI
    setData(prevData => ({ ...prevData, ...newData }));
    
    try {
      setLoading(true);
      const response = await axios.put(endpoint, newData);
      
      // Update with actual server response
      setData(response.data.result);
      
      toast({
        title: 'Success!',
        description: response.data.message,
        status: 'success',
      });
    } catch (err) {
      // Revert optimistic update on error
      setData(prevData => ({ ...prevData, ...updateData }));
      
      toast({
        title: 'Error!',
        description: 'Update failed',
        status: 'error',
      });
      
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { data, updateOptimistically, loading };
};
```

### 4. Retry Pattern
```javascript
const useRetryApi = (maxRetries = 3, delay = 1000) => {
  const executeWithRetry = async (apiCall) => {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await apiCall();
      } catch (error) {
        lastError = error;
        
        if (attempt === maxRetries) {
          throw lastError;
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
    }
  };

  return { executeWithRetry };
};
```

---

## 📝 API Testing

### Postman Collection
```json
{
  "info": {
    "name": "SAI Finance Admin API",
    "description": "API collection for SAI Finance Admin application"
  },
  "item": [
    {
      "name": "Authentication",
      "item": [
        {
          "name": "Admin Login",
          "request": {
            "method": "POST",
            "url": "{{baseUrl}}/admins/login",
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"admin@example.com\",\n  \"password\": \"password123\"\n}",
              "options": {
                "raw": {
                  "language": "json"
                }
              }
            }
          }
        }
      ]
    }
  ]
}
```

### Jest API Testing
```javascript
// __tests__/api.test.js
import axios from 'axios';
import { handleApiError } from '../src/utils/errorHandler';

describe('API Integration Tests', () => {
  test('should fetch users successfully', async () => {
    const response = await axios.get('/users/');
    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
    expect(Array.isArray(response.data.result)).toBe(true);
  });

  test('should handle authentication error', async () => {
    try {
      await axios.get('/users/', {
        headers: { Authorization: 'Bearer invalid-token' }
      });
    } catch (error) {
      const errorInfo = handleApiError(error);
      expect(errorInfo.type).toBe('auth');
    }
  });
});
```

---

## 🔒 Security Considerations

### 1. Token Management
```javascript
// Token refresh mechanism
const refreshToken = async () => {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    const response = await axios.post('/auth/refresh', { refreshToken });
    
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('refreshToken', response.data.refreshToken);
    
    return response.data.token;
  } catch (error) {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    window.location.href = '/login';
  }
};
```

### 2. Request Validation
```javascript
// Input sanitization
const sanitizeInput = (input) => {
  if (typeof input === 'string') {
    return input.trim().replace(/[<>]/g, '');
  }
  return input;
};

// Request interceptor for input sanitization
instance.interceptors.request.use(
  (config) => {
    if (config.data) {
      config.data = sanitizeInput(config.data);
    }
    return config;
  },
  (error) => Promise.reject(error)
);
```

### 3. Rate Limiting
```javascript
// Rate limiting utility
class RateLimiter {
  constructor(maxRequests = 100, timeWindow = 60000) {
    this.maxRequests = maxRequests;
    this.timeWindow = timeWindow;
    this.requests = [];
  }

  canMakeRequest() {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < this.timeWindow);
    
    if (this.requests.length < this.maxRequests) {
      this.requests.push(now);
      return true;
    }
    
    return false;
  }
}
```

---

## 📊 API Performance Monitoring

### 1. Response Time Tracking
```javascript
// Performance monitoring interceptor
instance.interceptors.request.use(
  (config) => {
    config.metadata = { startTime: new Date() };
    return config;
  },
  (error) => Promise.reject(error)
);

instance.interceptors.response.use(
  (response) => {
    const endTime = new Date();
    const duration = endTime - response.config.metadata.startTime;
    
    console.log(`API Call: ${response.config.url} - ${duration}ms`);
    
    return response;
  },
  (error) => Promise.reject(error)
);
```

### 2. Error Tracking
```javascript
// Error tracking utility
const trackApiError = (error, context) => {
  const errorInfo = {
    timestamp: new Date().toISOString(),
    context,
    url: error.config?.url,
    method: error.config?.method,
    status: error.response?.status,
    message: error.message,
    stack: error.stack
  };
  
  // Send to error tracking service
  console.error('API Error:', errorInfo);
};
```

---

*This API documentation should be updated whenever new endpoints are added or existing ones are modified.*
