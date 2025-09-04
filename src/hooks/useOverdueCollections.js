import { useState, useEffect } from 'react';
import axios from '../axios';

export const useOverdueCollections = () => {
  const [overdueLoans, setOverdueLoans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchOverdueLoans = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('dailyCollections/overdue-loans');
      
      if (response?.data?.result?.overdueLoans) {
        setOverdueLoans(response.data.result.overdueLoans);
      } else {
        setOverdueLoans([]);
      }
    } catch (error) {
      console.error('Error fetching overdue loans:', error);
      setError('Failed to fetch overdue loans');
      setOverdueLoans([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverdueLoans();
  }, []);

  const getDaysOverdueColor = (days) => {
    if (days <= 7) return 'yellow';
    if (days <= 30) return 'orange';
    return 'red';
  };

  const getPenaltyAmount = (emiAmount) => {
    return Math.round(emiAmount * 0.05);
  };

  const totalOverdueAmount = overdueLoans.reduce((sum, loan) => sum + (loan.totalDueAmount || 0), 0);
  const totalPenalties = overdueLoans.reduce((sum, loan) => sum + getPenaltyAmount(loan.emiAmount || 0), 0);

  return {
    overdueLoans,
    loading,
    error,
    refetch: fetchOverdueLoans,
    getDaysOverdueColor,
    getPenaltyAmount,
    totalOverdueAmount,
    totalPenalties
  };
};
