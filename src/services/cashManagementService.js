import axios from '../axios';

// Cash Management API endpoints
const CASH_ENDPOINTS = {
  DAILY_CASH: '/cash/daily',
  SET_DAILY_CASH: '/cash/daily',
  GET_AVAILABLE_CASH: '/cash/available',
  ADD_CASH: '/cash/add',
  WITHDRAW_CASH: '/cash/withdraw',
  GET_CASH_HISTORY: '/cash/history'
};

// Get today's cash information
export const getDailyCash = async (date = null) => {
  try {
    const params = date ? { date } : {};
    // Add cache-busting parameter to force fresh API call
    params._t = Date.now();
    const response = await axios.get(CASH_ENDPOINTS.DAILY_CASH, { 
      params,
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    return response.data;
    console.log('Daily cash response:', response.data);
  } catch (error) {
    console.error('Error fetching daily cash:', error);
    throw error;
  }
};

// Set initial cash for the day
export const setDailyCash = async (cashData) => {
  try {
    const response = await axios.post(CASH_ENDPOINTS.SET_DAILY_CASH, cashData);
    return response.data;
  } catch (error) {
    console.error('Error setting daily cash:', error);
    throw error;
  }
};

// Get available cash amount
export const getAvailableCash = async () => {
  try {
    const response = await axios.get(CASH_ENDPOINTS.GET_AVAILABLE_CASH, {
      params: { _t: Date.now() },
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching available cash:', error);
    throw error;
  }
};

// Add cash to office
export const addCash = async (cashData) => {
  try {
    const response = await axios.post(CASH_ENDPOINTS.ADD_CASH, cashData);
    return response.data;
  } catch (error) {
    console.error('Error adding cash:', error);
    throw error;
  }
};

// Withdraw cash from office
export const withdrawCash = async (withdrawData) => {
  try {
    const response = await axios.post(CASH_ENDPOINTS.WITHDRAW_CASH, withdrawData);
    return response.data;
  } catch (error) {
    console.error('Error withdrawing cash:', error);
    throw error;
  }
};

// Get cash transaction history
export const getCashHistory = async (params = {}) => {
  try {
    const response = await axios.get(CASH_ENDPOINTS.GET_CASH_HISTORY, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching cash history:', error);
    throw error;
  }
};

// Get cash data for specific period
export const getCashDataForPeriod = async (period) => {
  try {
    const now = new Date();
    let startDate, endDate;
    
    if (period === 'today') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    } else if (period === 'weekly') {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay());
      weekStart.setHours(0, 0, 0, 0);
      startDate = weekStart;
      endDate = new Date(now);
    } else if (period === 'monthly') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now);
    }
    
    const params = {
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0]
    };
    
    const response = await axios.get(CASH_ENDPOINTS.GET_CASH_HISTORY, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching cash data for period:', error);
    throw error;
  }
};

// Calculate withdrawals in period from daily cash data
export const calculateCashAddedInPeriod = async (period) => {
  try {
    console.log('🔄 Cash Service - Fetching withdrawals for period:', period);
    
    // For now, get today's cash data to get withdrawal amount
    const dailyCashResponse = await getDailyCash();
    
    if (!dailyCashResponse.success) {
      console.log('❌ Cash Service - Daily cash API failed:', dailyCashResponse);
      return 0;
    }
    
    const cashData = dailyCashResponse.result || dailyCashResponse.message;
    const withdrawals = cashData?.total_withdrawals || 0;
    
    console.log('💰 Cash Service - Daily cash data:', cashData);
    console.log('💰 Cash Service - Total withdrawals found:', withdrawals);
    
    return withdrawals;
  } catch (error) {
    console.error('❌ Cash Service - Error calculating withdrawals:', error);
    return 0;
  }
};

// Check if sufficient cash is available for expense
export const checkSufficientCash = async (expenseAmount) => {
  try {
    const response = await axios.post('/cash/check', { amount: expenseAmount });
    return response.data;
  } catch (error) {
    console.error('Error checking cash availability:', error);
    throw error;
  }
};

// Utility functions
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(amount);
};

export const getTodayDate = () => {
  return new Date().toISOString().split('T')[0];
};

export const isToday = (date) => {
  const today = getTodayDate();
  return date === today;
};
