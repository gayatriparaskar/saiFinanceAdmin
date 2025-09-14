import axios from '../axios';

/**
 * Update officer collection data (paid amount, remaining amount, assign to, status, payment process)
 * @param {string} officerId - The ID of the officer to update
 * @param {Object} updateData - The data to update
 * @param {number} [updateData.paidAmount] - Paid amount
 * @param {number} [updateData.remainingAmount] - Remaining amount
 * @param {string} [updateData.assignTo] - Assign to field
 * @param {string} [updateData.status] - Status of the officer
 * @param {string} [updateData.paymentProcess] - Payment process stage
 * @returns {Promise<Object>} Updated officer data
 */
export const updateOfficerCollectionData = async (officerId, updateData) => {
  try {
    console.log('🔄 Updating officer collection data:', { officerId, updateData });
    
    const response = await axios.put(`officers/${officerId}/collection-data`, updateData);
    
    if (response.data && response.data.result) {
      console.log('✅ Officer collection data updated successfully:', response.data.result);
      return response.data.result;
    } else {
      throw new Error('Invalid response format');
    }
  } catch (error) {
    console.error('❌ Error updating officer collection data:', error);
    throw error;
  }
};

/**
 * Get all officers with collection data
 * @returns {Promise<Array>} Array of officers with their collection data
 */
export const getAllOfficers = async () => {
  try {
    const response = await axios.get('officers');
    
    if (response.data && response.data.result) {
      return response.data.result;
    } else {
      throw new Error('Invalid response format');
    }
  } catch (error) {
    console.error('❌ Error fetching officers:', error);
    throw error;
  }
};

/**
 * Get officer by ID
 * @param {string} officerId - The ID of the officer
 * @returns {Promise<Object>} Officer data
 */
export const getOfficerById = async (officerId) => {
  try {
    const response = await axios.get(`officers/${officerId}`);
    
    if (response.data && response.data.result) {
      return response.data.result;
    } else {
      throw new Error('Invalid response format');
    }
  } catch (error) {
    console.error('❌ Error fetching officer:', error);
    throw error;
  }
};

/**
 * Assign officer to manager or accounter
 * @param {string} officerId - The ID of the officer to assign
 * @param {Object} assignmentData - Assignment data
 * @param {string} [assignmentData.assignToManager] - Manager ID to assign to
 * @param {string} [assignmentData.assignToAccounter] - Accounter ID to assign to
 * @returns {Promise<Object>} Updated officer data
 */
export const assignOfficer = async (officerId, assignmentData) => {
  try {
    console.log('🔄 Assigning officer:', { officerId, assignmentData });
    
    const response = await axios.put(`officers/${officerId}/assign`, assignmentData);
    
    if (response.data && response.data.result) {
      console.log('✅ Officer assignment updated successfully:', response.data.result);
      return response.data.result;
    } else {
      throw new Error('Invalid response format');
    }
  } catch (error) {
    console.error('❌ Error assigning officer:', error);
    throw error;
  }
};
