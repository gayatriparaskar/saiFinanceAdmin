import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FaUsers, 
  FaMoneyBillWave, 
  FaPiggyBank, 
  FaChartLine,
  FaUserTie,
  FaChevronDown,
  FaHandHoldingUsd
} from 'react-icons/fa';
import axios from '../../axios';

const StatsCards = ({ stats = {}, collectionData = {}, loading = false, onReportTypeChange }) => {
  const [reportType, setReportType] = useState('daily');
  const [activeUsers, setActiveUsers] = useState({
    loanUsers: 0,
    savingUsers: 0,
    totalActiveUsers: 0
  });
  const [activeOfficers, setActiveOfficers] = useState(0);
  const [collections, setCollections] = useState({
    loanCollection: 0,
    savingCollection: 0,
    totalCollection: 0
  });
  const [loanOutgoing, setLoanOutgoing] = useState(0);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Debug logging
  console.log('🔍 StatsCards - Received collectionData:', collectionData);
  console.log('🔍 StatsCards - Received stats:', stats);

  const formatCurrency = (amount) => {
    return `₹${(amount || 0).toLocaleString()}`;
  };

  // Process data from parent component
  useEffect(() => {
    if (collectionData && Object.keys(collectionData).length > 0) {
      console.log('🔍 StatsCards - Processing collectionData from parent:', collectionData);
      
      // Process collection data based on report type
      let currentCollectionData = null;
      
      switch (reportType) {
        case 'daily':
          currentCollectionData = collectionData.today;
          break;
        case 'weekly':
          currentCollectionData = collectionData.weekly;
          break;
        case 'monthly':
          currentCollectionData = collectionData.monthly;
          break;
        default:
          currentCollectionData = collectionData.today;
      }

      if (currentCollectionData) {
        const processedCollections = {
          loanCollection: currentCollectionData.loan?.amount || 0,
          savingCollection: currentCollectionData.saving?.net || 0,
          totalCollection: currentCollectionData.grandTotal || 0
        };
        
        console.log('🔍 StatsCards - Processed collections:', processedCollections);
        setCollections(processedCollections);
      }
    }
  }, [collectionData, reportType]);

  // Process stats data for active users and loan outgoing
  useEffect(() => {
    if (stats && Object.keys(stats).length > 0) {
      console.log('🔍 StatsCards - Processing stats from parent:', stats);
      
      // Process active users data
      const processedActiveUsers = {
        loanUsers: stats.loanUsers || 0,
        savingUsers: stats.savingUsers || 0,
        totalActiveUsers: (stats.loanUsers || 0) + (stats.savingUsers || 0)
      };
      
      // Process loan outgoing
      const processedLoanOutgoing = stats.loanOutgoing || 0;
      
      console.log('🔍 StatsCards - Processed active users:', processedActiveUsers);
      console.log('🔍 StatsCards - Processed loan outgoing:', processedLoanOutgoing);
      
      setActiveUsers(processedActiveUsers);
      setLoanOutgoing(processedLoanOutgoing);
    }
  }, [stats]);

  // Fetch data based on report type
  const fetchReportData = async (type) => {
    try {
      setIsLoadingData(true);
      console.log(`📊 Fetching ${type} report data...`);

      // Fetch users data - get both loan users and saving users separately
      const [usersResponse, savingUsersResponse, officersResponse] = await Promise.all([
        axios.get('users/'),           // Gets loan users
        axios.get('account/'),         // Gets saving users
        axios.get('officers/')
      ]);

      const allLoanUsers = usersResponse?.data?.result || [];
      const allSavingUsers = savingUsersResponse?.data?.result || [];
      const allOfficers = officersResponse?.data?.result || [];

      console.log('📊 User data fetched:', {
        loanUsers: allLoanUsers.length,
        savingUsers: allSavingUsers.length,
        officers: allOfficers.length
      });

      // Count active users by type
      const loanUsers = allLoanUsers.filter(user => 
        user.active_loan_id || user.user_type === 'loan' || user.account_type === 'loan account'
      ).length;
      
      const savingUsers = allSavingUsers.filter(user => 
        user.saving_account_id || user.user_type === 'saving' || user.account_type === 'saving account'
      ).length;
      
      const totalActiveUsers = loanUsers + savingUsers;

      // Count active officers
      // const activeOfficersCount = allOfficers.filter(officer => officer.is_active || officer.isActive).length;

      // setActiveUsers({
      //   loanUsers,
      //   savingUsers,
      //   totalActiveUsers
      // });
      // setActiveOfficers(activeOfficersCount);

      // Fetch collection data based on report type
      let collectionData = { loanCollection: 0, savingCollection: 0, totalCollection: 0 };

      try {
        let endpoint;
        switch (type) {
          case 'daily':
            endpoint = 'admins/totalCollectionsToday';
            break;
          case 'weekly':
            endpoint = 'admins/totalCollectionsWeekly';
            break;
          case 'monthly':
            endpoint = 'admins/totalCollectionsMonthly';
            break;
          default:
            endpoint = 'admins/totalCollectionsToday';
        }

        const collectionResponse = await axios.get(endpoint);
        const data = collectionResponse?.data?.result;

        if (data) {
          // All APIs (daily, weekly, monthly) now return the same structure with loan/saving breakdown
          collectionData = {
            loanCollection: data.loan?.amount || data.totalLoanAmount || 0,
            savingCollection: data.saving?.net || data.totalSavingAmount || 0,
            totalCollection: data.grandTotal || (data.loan?.amount || 0) + (data.saving?.net || 0)
          };
          
          console.log(`📊 ${type} collection data from API:`, {
            rawData: data,
            processedData: collectionData,
            note: 'All APIs now include both loan and saving collections'
          });
        }
      } catch (collectionError) {
        console.warn('⚠️ Could not fetch collection data:', collectionError);
        // Try alternative endpoints
        try {
          const dailyCollectionsResponse = await axios.get('dailyCollections');
          const dailyData = dailyCollectionsResponse?.data?.result || [];
          
          if (type === 'daily') {
            const today = new Date().toISOString().split('T')[0];
            const todayCollections = dailyData.filter(collection => 
              collection.created_on && collection.created_on.split('T')[0] === today
            );
            collectionData.loanCollection = todayCollections.reduce((sum, collection) => sum + (collection.amount || 0), 0);
          } else {
            // For weekly/monthly, calculate from daily collections
            const currentDate = new Date();
            let filteredCollections = [];

            if (type === 'weekly') {
              const weekStart = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay()));
              filteredCollections = dailyData.filter(collection => 
                new Date(collection.created_on) >= weekStart
              );
            } else if (type === 'monthly') {
              const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
              filteredCollections = dailyData.filter(collection => 
                new Date(collection.created_on) >= monthStart
              );
            }

            collectionData.loanCollection = filteredCollections.reduce((sum, collection) => sum + (collection.amount || 0), 0);
          }

          collectionData.totalCollection = collectionData.loanCollection + collectionData.savingCollection;
        } catch (altError) {
          console.warn('⚠️ Alternative collection data fetch also failed:', altError);
        }
      }

      setCollections(collectionData);

      // Fetch loan outgoing data
      try {
        const loanStatsResponse = await axios.get('admins/totalLoanDetails');
        const loanStats = loanStatsResponse?.data?.result;
        
        if (loanStats) {
          // For daily/weekly/monthly, we'll use the total loan amount as the outgoing amount
          // This represents the total amount of loans given out
          setLoanOutgoing(loanStats.loan_amount || 0);
          
          console.log('📊 Loan outgoing data loaded:', {
            loanAmount: loanStats.loan_amount,
            totalAmount: loanStats.total_amount,
            totalDueAmount: loanStats.total_due_amount
          });
        }
      } catch (loanError) {
        console.warn('⚠️ Could not fetch loan outgoing data:', loanError);
        setLoanOutgoing(0);
      }

      console.log(`📊 ${type} report data loaded:`, {
        activeUsers: {
          loanUsers,
          savingUsers,
          totalActiveUsers
        },
        // activeOfficers: activeOfficersCount,
        collections: collectionData,
        loanOutgoing: loanOutgoing,
        rawUserData: {
          allLoanUsers: allLoanUsers.length,
          allSavingUsers: allSavingUsers.length,
          sampleLoanUser: allLoanUsers[0],
          sampleSavingUser: allSavingUsers[0]
        }
      });

    } catch (error) {
      console.error(`❌ Error fetching ${type} report data:`, error);
    } finally {
      setIsLoadingData(false);
    }
  };

  // Handle report type change
  const handleReportTypeChange = (newType) => {
    setReportType(newType);
    fetchReportData(newType);
    if (onReportTypeChange) {
      onReportTypeChange(newType);
    }
  };

  // Fetch initial data
  useEffect(() => {
    fetchReportData(reportType);
  }, []);

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  if (loading || isLoadingData) {
    return (
      <div className="space-y-6">
        {/* Report Type Dropdown */}
        <div className="flex justify-end">
          <div className="relative">
            <select 
              className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={reportType}
              onChange={(e) => handleReportTypeChange(e.target.value)}
            >
              <option value="daily">Daily Report</option>
              <option value="weekly">Weekly Report</option>
              <option value="monthly">Monthly Report</option>
            </select>
            <FaChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs" />
          </div>
        </div>

        {/* Loading Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
                  <div className="h-3 bg-gray-200 rounded w-20"></div>
                </div>
                <div className="p-3 bg-gray-200 rounded-full w-12 h-12"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Report Type Dropdown */}
      <div className="flex justify-end">
        <div className="relative">
          <select 
            className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
            value={reportType}
            onChange={(e) => handleReportTypeChange(e.target.value)}
          >
            <option value="daily">Daily Report</option>
            <option value="weekly">Weekly Report</option>
            <option value="monthly">Monthly Report</option>
          </select>
          <FaChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs" />
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Active Users */}
        <motion.div 
          variants={itemVariants}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Active Users</p>
              <p className="text-3xl font-bold text-blue-600">{activeUsers.totalActiveUsers}</p>
              <p className="text-sm text-gray-500">
                {activeUsers.loanUsers} Loan + {activeUsers.savingUsers} Saving
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <FaUsers className="text-2xl text-blue-600" />
            </div>
          </div>
        </motion.div>

        {/* Loan Collection */}
        <motion.div 
          variants={itemVariants}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Loan Collection</p>
              <p className="text-3xl font-bold text-green-600">
                {formatCurrency(collections.loanCollection)}
              </p>
              <p className="text-sm text-gray-500 capitalize">
                {reportType} collection
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <FaMoneyBillWave className="text-2xl text-green-600" />
            </div>
          </div>
        </motion.div>

        {/* Saving Collection */}
        <motion.div 
          variants={itemVariants}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Saving Collection</p>
              <p className="text-3xl font-bold text-purple-600">
                {formatCurrency(collections.savingCollection)}
              </p>
              <p className="text-sm text-gray-500 capitalize">
                {reportType} collection
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <FaPiggyBank className="text-2xl text-purple-600" />
            </div>
          </div>
        </motion.div>

        {/* Total Collection */}
        <motion.div 
          variants={itemVariants}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Collection</p>
              <p className="text-3xl font-bold text-orange-600">
                {formatCurrency(collections.totalCollection)}
              </p>
              <p className="text-sm text-gray-500 capitalize">
                {reportType} total
              </p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <FaChartLine className="text-2xl text-orange-600" />
            </div>
          </div>
        </motion.div>

        {/* Loan Outgoing */}
        <motion.div 
          variants={itemVariants}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Loan Outgoing</p>
              <p className="text-3xl font-bold text-red-600">
                {formatCurrency(loanOutgoing)}
              </p>
              <p className="text-sm text-gray-500">
                Total loans disbursed
              </p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <FaHandHoldingUsd className="text-2xl text-red-600" />
            </div>
          </div>
        </motion.div>

        {/* Active Officers */}
        {/* <motion.div 
          variants={itemVariants}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Officers</p>
              <p className="text-3xl font-bold text-indigo-600">{activeOfficers}</p>
              <p className="text-sm text-gray-500">
                Collection officers
              </p>
            </div>
            <div className="p-3 bg-indigo-100 rounded-full">
              <FaUserTie className="text-2xl text-indigo-600" />
            </div>
          </div>
        </motion.div> */}
      </div>
    </div>
  );
};

export default StatsCards;
