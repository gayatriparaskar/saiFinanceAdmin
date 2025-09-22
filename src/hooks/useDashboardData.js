import { useState, useEffect } from 'react';
import axios from '../axios';

export const useDashboardData = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTransactions: 0,
    pendingApprovals: 0,
    monthlyRevenue: 0,
    outstandingAmounts: 0
  });
  const [collectionData, setCollectionData] = useState({
    today: null,
    weekly: null,
    monthly: null,
    yearly: null,
    weeklyStats: null,
    monthlyStats: null
  });
  const [officerCollections, setOfficerCollections] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Fetching Dashboard data...');

      // Fetch all collection data using existing endpoints
      const [
        todayResponse,
        weeklyResponse,
        monthlyResponse,
        yearlyResponse,
        weeklyStatsResponse,
        monthlyStatsResponse,
        officerSummaryResponse,
        officersResponse,
        usersResponse,
        savingUsersResponse
      ] = await Promise.allSettled([
        axios.get('admins/totalCollectionsToday'),
        axios.get('admins/totalCollectionsWeekly'),
        axios.get('admins/totalCollectionsMonthly'),
        axios.get('admins/totalCollectionsYearly'),
        axios.get('admins/totalCollectionsWeeklyStats'),
        axios.get('admins/totalCollectionsMonthlyStats'),
        axios.get('admins/todayOfficerSummary'),
        axios.get('officers'),
        axios.get('users/'),
        axios.get('account/')
      ]);

      // Process responses
      const newCollectionData = {
        today: todayResponse.status === 'fulfilled' ? todayResponse.value?.data?.result : null,
        weekly: weeklyResponse.status === 'fulfilled' ? weeklyResponse.value?.data?.result : null,
        monthly: monthlyResponse.status === 'fulfilled' ? monthlyResponse.value?.data?.result : null,
        yearly: yearlyResponse.status === 'fulfilled' ? yearlyResponse.value?.data?.result : null,
        weeklyStats: weeklyStatsResponse.status === 'fulfilled' ? weeklyStatsResponse.value?.data?.result : null,
        monthlyStats: monthlyStatsResponse.status === 'fulfilled' ? monthlyStatsResponse.value?.data?.result : null
      };

      // Debug logging for collection data
      console.log('🔍 useDashboardData - Today response:', todayResponse);
      console.log('🔍 useDashboardData - Today data:', todayResponse.status === 'fulfilled' ? todayResponse.value?.data : null);
      console.log('🔍 useDashboardData - Today result:', newCollectionData.today);

      setCollectionData(newCollectionData);

      // Process officer summary data
      if (officerSummaryResponse.status === 'fulfilled') {
        const officerData = officerSummaryResponse.value?.data?.data || [];
        setOfficerCollections(officerData);
      }

      // Process officers data for the comprehensive table
      if (officersResponse.status === 'fulfilled') {
        const officersData = officersResponse.value?.data || [];
        console.log('📊 Raw officers data:', officersData);
        
        // Handle different data structures
        let finalOfficersData = [];
        
        if (Array.isArray(officersData)) {
          finalOfficersData = officersData;
        } else if (officersData && typeof officersData === 'object') {
          if (officersData.result && Array.isArray(officersData.result)) {
            finalOfficersData = officersData.result;
          } else if (officersData.officers && Array.isArray(officersData.officers)) {
            finalOfficersData = officersData.officers;
          } else if (officersData.data && Array.isArray(officersData.data)) {
            finalOfficersData = officersData.data;
          } else if (officersData.results && Array.isArray(officersData.results)) {
            finalOfficersData = officersData.results;
          } else {
            const values = Object.values(officersData);
            if (values.length > 0 && Array.isArray(values[0])) {
              finalOfficersData = values[0];
            }
          }
        }
        
        if (Array.isArray(finalOfficersData) && finalOfficersData.length > 0) {
          // Transform data to match the expected structure and filter out accounter officers
          const transformedOfficers = finalOfficersData
            .filter(officer => {
              const officerType = officer.officer_type || officer.type || officer.role || officer.designation;
              const isAccounter = officerType && officerType.toLowerCase().includes('accounter');
              const isAdmin = officerType && officerType.toLowerCase().includes('admin');
              return !isAccounter && !isAdmin;
            })
            .map(officer => ({
              ...officer,
              officer_id: officer.officer_id || officer._id || officer.id || officer.officerId || `officer_${Math.random()}`,
              officer_name: officer.officer_name || officer.name || officer.full_name || officer.officerName || 
                           officer.first_name || officer.last_name || 'Unknown Officer',
              officer_code: officer.officer_code || officer.code || officer.employee_id || officer.employeeId || 
                           officer.officerCode || officer.emp_code || '-',
              todayCollection: officer.todayCollection || officer.today_collection || officer.daily_collection || 
                              officer.today_amount || officer.daily_amount || officer.collection_today || 0,
              totalCollection: officer.totalCollection || officer.total_collection || officer.monthly_collection || 
                              officer.total_amount || officer.monthly_amount || officer.collection_total || 
                              officer.grand_total || 0,
              paidAmount: officer.paidAmount || officer.paid_amount || officer.amount_paid || 
                         officer.paid || officer.amountPaid || officer.paid_amount_total || 0,
              remainingAmount: officer.remainingAmount || officer.remaining_amount || officer.amount_remaining || 
                              officer.remaining || officer.amountRemaining || officer.remaining_amount_total || 0,
              assignTo: officer.assignTo || officer.assign_to || officer.assigned_to || 
                       officer.assignment || officer.role || officer.designation || 'Not Assigned',
              status: officer.status || officer.current_status || officer.status_current || 
                     officer.approval_status || officer.verification_status || 'Pending'
            }));
          
          setOfficers(transformedOfficers);
        } else {
          setOfficers([]);
        }
      }

      // Calculate comprehensive stats
      const totalTransactions = (newCollectionData.today?.loan?.count || 0) + 
                              (newCollectionData.today?.saving?.count || 0);
      
      const monthlyRevenue = newCollectionData.monthly?.totalAmount || 0;
      const outstandingAmounts = (newCollectionData.yearly?.totalAmount || 0) - 
                                (newCollectionData.monthly?.totalAmount || 0);

      // Calculate active users
      const allLoanUsers = usersResponse.status === 'fulfilled' ? usersResponse.value?.data?.result || [] : [];
      const allSavingUsers = savingUsersResponse.status === 'fulfilled' ? savingUsersResponse.value?.data?.result || [] : [];
      
      const loanUsers = allLoanUsers.filter(user => 
        user.active_loan_id || user.user_type === 'loan' || user.account_type === 'loan account'
      ).length;
      
      const savingUsers = allSavingUsers.filter(user => 
        user.saving_account_id || user.user_type === 'saving' || user.account_type === 'saving account'
      ).length;

      // Calculate loan outgoing
      let loanOutgoing = 0;
      try {
        const loanStatsResponse = await axios.get('admins/totalLoanDetails');
        if (loanStatsResponse?.data?.result) {
          loanOutgoing = loanStatsResponse.data.result.loan_amount || 0;
        }
      } catch (loanError) {
        console.warn('⚠️ Could not fetch loan outgoing data:', loanError);
      }

      setStats({
        totalTransactions,
        pendingApprovals: officerCollections.length || 0,
        monthlyRevenue,
        outstandingAmounts,
        loanUsers,
        savingUsers,
        totalActiveUsers: loanUsers + savingUsers,
        loanOutgoing
      });

      console.log('✅ Dashboard data fetched successfully');
    } catch (error) {
      console.error('❌ Error fetching dashboard data:', error);
      setError(error.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return {
    loading,
    stats,
    collectionData,
    officerCollections,
    officers,
    error,
    refetch: fetchDashboardData
  };
};
