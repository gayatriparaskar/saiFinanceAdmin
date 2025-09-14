/**
 * Utility functions for authentication and user management
 */

/**
 * Decode JWT token to get payload
 * @param {string} token - JWT token
 * @returns {Object|null} Decoded token payload or null if invalid
 */
export const decodeJWT = (token) => {
  try {
    if (!token) return null;
    
    // JWT tokens have 3 parts separated by dots: header.payload.signature
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    // Decode the payload (second part)
    const payload = parts[1];
    
    // Add padding if needed for base64 decoding
    const paddedPayload = payload + '='.repeat((4 - payload.length % 4) % 4);
    
    // Decode base64
    const decodedPayload = atob(paddedPayload);
    
    // Parse JSON
    return JSON.parse(decodedPayload);
  } catch (error) {
    console.error('Error decoding JWT token:', error);
    return null;
  }
};

/**
 * Get current user's officer ID from token
 * @returns {string|null} Officer ID or null if not found
 */
export const getCurrentOfficerId = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;
  
  const payload = decodeJWT(token);
  return payload?.officerId || null;
};

/**
 * Get current user's role from token
 * @returns {string|null} User role or null if not found
 */
export const getCurrentUserRole = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;
  
  const payload = decodeJWT(token);
  return payload?.role || payload?.officerType || null;
};

/**
 * Check if current user has specific role
 * @param {string} role - Role to check
 * @returns {boolean} True if user has the role
 */
export const hasRole = (role) => {
  const userRole = getCurrentUserRole();
  return userRole === role;
};

/**
 * Get current user's information from localStorage and token
 * @returns {Object} User information object
 */
export const getCurrentUserInfo = () => {
  const token = localStorage.getItem('token');
  const payload = decodeJWT(token);
  
  return {
    officerId: payload?.officerId || null,
    role: payload?.role || payload?.officerType || null,
    phoneNumber: payload?.phone_number || null,
    officerName: localStorage.getItem('officerName') || null,
    officerType: localStorage.getItem('officerType') || null,
    userType: localStorage.getItem('userType') || null,
    hasToken: !!token
  };
};
