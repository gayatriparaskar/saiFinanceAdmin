import axios from '../axios';

/**
 * Get user by ID with complete details including all collections and account information
 * @param {string} userId - The ID of the user
 * @returns {Promise<Object>} User data with complete details, collections, and account info
 */
export const getUserById = async (userId) => {
  try {
    console.log('🔄 Fetching complete user details for ID:', userId);
    
    const response = await axios.get(`users/${userId}`);
    
    if (response.data && response.data.result) {
      console.log('✅ Complete user details fetched successfully:', response.data.result);
      return response.data.result;
    } else {
      throw new Error('Invalid response format');
    }
  } catch (error) {
    console.error('❌ Error fetching user details:', error);
    throw error;
  }
};

/**
 * Get all users with their complete details
 * @returns {Promise<Array>} Array of all users with complete details
 */
export const getAllUsers = async () => {
  try {
    console.log('🔄 Fetching all users with complete details');
    
    const response = await axios.get('users/');
    
    if (response.data && response.data.result) {
      console.log('✅ All users fetched successfully:', response.data.result.length, 'users');
      return response.data.result;
    } else {
      throw new Error('Invalid response format');
    }
  } catch (error) {
    console.error('❌ Error fetching all users:', error);
    throw error;
  }
};

/**
 * Get user's active loan details by loan ID
 * @param {string} loanId - The ID of the active loan
 * @returns {Promise<Object>} Loan details
 */
export const getActiveLoanDetails = async (loanId) => {
  try {
    console.log('🔄 Fetching active loan details for ID:', loanId);
    
    const response = await axios.get(`loanDetails/${loanId}`);
    
    if (response.data && response.data.result) {
      console.log('✅ Active loan details fetched successfully:', response.data.result);
      return response.data.result;
    } else {
      throw new Error('Invalid response format');
    }
  } catch (error) {
    console.error('❌ Error fetching active loan details:', error);
    throw error;
  }
};

/**
 * Get user's active saving account details by saving ID
 * @param {string} savingId - The ID of the saving account
 * @returns {Promise<Object>} Saving account details
 */
export const getActiveSavingDetails = async (savingId) => {
  try {
    console.log('🔄 Fetching active saving account details for ID:', savingId);
    
    const response = await axios.get(`account/${savingId}`);
    
    if (response.data && response.data.result) {
      console.log('✅ Active saving account details fetched successfully:', response.data.result);
      return response.data.result;
    } else {
      throw new Error('Invalid response format');
    }
  } catch (error) {
    console.error('❌ Error fetching active saving account details:', error);
    throw error;
  }
};

/**
 * Change admin password
 * @param {Object} passwordData - Password change data
 * @param {string} passwordData.currentPassword - Current password
 * @param {string} passwordData.newPassword - New password
 * @returns {Promise<Object>} Success response
 */
export const changeAdminPassword = async (passwordData) => {
  try {
    console.log('🔄 Changing admin password...');
    
    const response = await axios.put('admins/change-password', passwordData);
    
    if (response.data && response.data.message) {
      console.log('✅ Admin password changed successfully');
      return response.data;
    } else {
      throw new Error('Invalid response format');
    }
  } catch (error) {
    console.error('❌ Error changing admin password:', error);
    throw error;
  }
};

/**
 * Change officer password
 * @param {Object} passwordData - Password change data
 * @param {string} passwordData.currentPassword - Current password
 * @param {string} passwordData.newPassword - New password
 * @returns {Promise<Object>} Success response
 */
export const changeOfficerPassword = async (passwordData) => {
  try {
    console.log('🔄 Changing officer password...');
    
    const response = await axios.put('officers/change-password', passwordData);
    
    if (response.data && response.data.message) {
      console.log('✅ Officer password changed successfully');
      return response.data;
    } else {
      throw new Error('Invalid response format');
    }
  } catch (error) {
    console.error('❌ Error changing officer password:', error);
    throw error;
  }
};