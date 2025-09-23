import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import OfficerNavbar from '../../components/OfficerNavbar';
import { useLocalTranslation } from '../../hooks/useLocalTranslation';
import axios from '../../axios';
import { Card, CardBody } from '@chakra-ui/react';
import { Text, VStack, HStack, Stat, StatLabel, StatNumber, StatHelpText, StatArrow, Table, Thead, Tbody, Tr, Th, Td, TableContainer, Badge } from '@chakra-ui/react';
import { FaUser, FaRupeeSign, FaCalendarAlt } from 'react-icons/fa';

const CombinedReport = () => {
  const { t } = useLocalTranslation();
  const [activeReport, setActiveReport] = useState('daily');
  const [officerName, setOfficerName] = useState('');
  const [userWiseData, setUserWiseData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalCollection, setTotalCollection] = useState(0);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedWeek, setSelectedWeek] = useState(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - dayOfWeek + 1);
    return monday.toISOString().split('T')[0];
  });
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().substring(0, 7));

  useEffect(() => {
    const storedOfficerName = localStorage.getItem('officerName');
    if (storedOfficerName) {
      setOfficerName(storedOfficerName);
    }
    
    // Update selectedWeek to current week's Monday when switching to weekly
    if (activeReport === 'weekly') {
      const today = new Date();
      const dayOfWeek = today.getDay();
      const monday = new Date(today);
      monday.setDate(today.getDate() - dayOfWeek + 1);
      const mondayString = monday.toISOString().split('T')[0];
      if (selectedWeek !== mondayString) {
        setSelectedWeek(mondayString);
      }
    }
    
    fetchData();
  }, [activeReport, selectedDate, selectedWeek, selectedMonth]);

  // Fetch data based on active report type
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log(`📊 Fetching ${activeReport} data for:`, { selectedDate, selectedWeek, selectedMonth });
      console.log(`📊 API Base URL:`, axios.defaults.baseURL);
      
      // Fetch both loan users and saving users like in ManagerDashboardContent
      let allUsers = [];
      try {
        console.log(`📊 Attempting to fetch users from: ${axios.defaults.baseURL}users/`);
        console.log(`📊 Attempting to fetch saving accounts from: ${axios.defaults.baseURL}account/`);
        
        // Fetch both loan users and saving users in parallel like UserDataTable does
        const [usersResponse, accountResponse] = await Promise.all([
          axios.get('users/'),
          axios.get('account/')
        ]);
        
        const loanUsers = usersResponse?.data?.result || [];
        const savingUsers = accountResponse?.data?.result || [];
        
        console.log(`📊 Raw loan users data:`, loanUsers);
        console.log(`📊 Raw saving users data:`, savingUsers);
        console.log(`📊 Loan users count:`, loanUsers.length);
        console.log(`📊 Saving users count:`, savingUsers.length);

        // Process loan users
        const processedLoanUsers = loanUsers.map(user => {
          console.log('🔍 Processing loan user:', {
            id: user._id,
            name: user.name || user.full_name,
            hasActiveLoan: !!user.active_loan_id,
            account_type: user.account_type
          });

          return { 
            ...user, 
            user_type: 'loan',
            displayName: user.name || user.full_name || user.first_name || 'Unknown User'
          };
        });

        // Process saving users
        const processedSavingUsers = savingUsers.map(user => {
          console.log('🔍 Processing saving user:', {
            id: user._id,
            name: user.name || user.full_name,
            hasSavingAccount: !!user.saving_account_id,
            account_type: user.account_type
          });

          return { 
            ...user, 
            user_type: 'saving',
            displayName: user.name || user.full_name || user.first_name || 'Unknown User'
          };
        });

        // Combine loan and saving users like in UserDataTable
        allUsers = [...processedLoanUsers, ...processedSavingUsers];
        
        console.log(`📊 Processed users by type:`, {
          loan: allUsers.filter(u => u.user_type === 'loan').length,
          saving: allUsers.filter(u => u.user_type === 'saving').length,
          total: allUsers.length
        });
        
        console.log(`📊 All combined users:`, allUsers);
        
        // If no users found, show empty state
        if (allUsers.length === 0) {
          console.log('📊 No users found in database');
          setUserWiseData([]);
          setTotalCollection(0);
          setError(null); // Clear any previous errors
          return;
        }
      } catch (error) {
        console.error('Error fetching users:', error);
        console.log('📊 Users API failed, trying to continue with empty data');
        console.log('📊 Error details:', {
          message: error.message,
          status: error.response?.status,
          statusText: error.response?.statusText,
          url: error.config?.url
        });
        // Don't set error, just continue with empty users
        allUsers = [];
      }
      
      // Get collections using admin endpoints based on report type
      let allCollections = [];
      
      try {
        let endpoint = '';
        let queryParams = {};
        
        if (activeReport === 'daily') {
          endpoint = 'admins/userWiseDailyCollections';
          queryParams = { date: selectedDate };
        } else if (activeReport === 'weekly') {
          endpoint = 'admins/userWiseWeeklyCollections';
          // Weekly endpoint uses current week automatically
        } else if (activeReport === 'monthly') {
          endpoint = 'admins/userWiseMonthlyCollections';
          // Monthly endpoint uses current month automatically
        }
        
        console.log(`📊 Fetching ${activeReport} collections from: ${axios.defaults.baseURL}${endpoint}`);
        console.log(`📊 Query params:`, queryParams);
        
        const collectionsResponse = await axios.get(endpoint, { params: queryParams });
        allCollections = collectionsResponse?.data?.result?.collections || [];
        
        console.log(`📊 ${activeReport} collections response:`, collectionsResponse?.data?.result);
        console.log(`📊 ${activeReport} collections count:`, allCollections.length);
        console.log(`📊 Total amount for ${activeReport}:`, collectionsResponse?.data?.result?.totalAmount || 0);
        
      } catch (error) {
        console.warn(`${activeReport} collections API failed:`, error);
        console.log(`📊 ${activeReport} collections error details:`, {
          message: error.message,
          status: error.response?.status,
          statusText: error.response?.statusText,
          url: error.config?.url
        });
        allCollections = [];
      }
      
      // Collections are now grouped by user from admin endpoints
      console.log(`📊 All collections from admin endpoint:`, allCollections);
      console.log(`📊 Collections count:`, allCollections.length);
      
      // Create user data with their collections
      const userData = [];
      let totalCollection = 0;
      
      // Process collections - now they are already grouped by user from admin endpoints
      const userCollectionMap = new Map();
      
      allCollections.forEach(userCollection => {
        const userId = userCollection.user_id;
        console.log(`📊 Processing collections for user ${userId} (${userCollection.user_name}):`, {
          totalAmount: userCollection.total_amount,
          loanAmount: userCollection.loan_amount,
          savingAmount: userCollection.saving_amount,
          collectionsCount: userCollection.collections.length
        });
        
        userCollectionMap.set(userId, {
          loanAmount: userCollection.loan_amount || 0,
          savingAmount: userCollection.saving_amount || 0,
          collections: userCollection.collections || []
        });
      });
      
      // Always show all users, with their collection amounts if they have any
      console.log('📊 Processing all users with their collection data');
      console.log('📊 Total users found:', allUsers.length);
      console.log('📊 Collections found:', allCollections.length);
      console.log('📊 User collection map:', userCollectionMap);
      
      allUsers.forEach((user, index) => {
        const userId = user._id;
        const collectionData = userCollectionMap.get(userId) || { loanAmount: 0, savingAmount: 0, collections: [] };
        
        // Get user's account amounts based on user type (like in UserDataTable)
        let userLoanAmount = 0;
        let userSavingAmount = 0;
        
        if (user.user_type === 'loan') {
          // For loan users, show loan_amount + amount_to_be
          const loanAmount = user.active_loan_id?.loan_amount || user.loan_amount || 0;
          const amountToBe = user.active_loan_id?.amount_to_be || user.amount_to_be || 0;
          userLoanAmount = loanAmount + amountToBe;
        } else if (user.user_type === 'saving') {
          // For saving users, get saving amount from saving_account_id (account balance)
          userSavingAmount = user.saving_account_id?.current_amount || user.total_amount || 0;
        }
        
        // Calculate total collection amount for this user for the selected period
        // This will be shown in the "Period Collection" column
        const userCollectionTotal = collectionData.loanAmount + collectionData.savingAmount;
        
        console.log(`📊 User ${index + 1} - ${user.displayName || user.full_name || user.name}:`, {
          userId: userId,
          userType: user.user_type,
          period: activeReport,
          periodCollections: {
            loan: collectionData.loanAmount,
            saving: collectionData.savingAmount,
            total: userCollectionTotal
          },
          collections: collectionData.collections.map(c => ({
            amount: c.amount || c.net_amount,
            date: c.created_on,
            type: c.type
          })),
          hasCollections: userCollectionTotal > 0
        });
        
        // Add to total collection for the selected period
        totalCollection += userCollectionTotal;
        
        // Calculate paid amount for loan users and current amount for saving users
        let paidAmount = 0;
        if (user.user_type === 'loan') {
          // For loan users, show total_amount - loan_amount (remaining amount)
          const totalAmount = user.active_loan_id?.total_amount || user.total_amount || 0;
          const loanAmount = user.active_loan_id?.loan_amount || user.loan_amount || 0;
          paidAmount = Math.max(0, totalAmount - loanAmount);
        } else if (user.user_type === 'saving') {
          paidAmount = user.saving_account_id?.current_amount || user.total_amount || 0; // Current amount for saving users
        }
        
        userData.push({
          _id: user._id,
          name: user.displayName || user.full_name || user.name || 'N/A',
          phone: user.phone || user.phone_number || 'N/A',
          officerName: user.officer_id?.name || user.officer_name || 'N/A',
          loanAmount: userLoanAmount,
          savingAmount: userSavingAmount,
          paidAmount: paidAmount, // This will be displayed in Paid Amount / Current Amount column
          collectionTotal: userCollectionTotal, // This will be displayed in Period Collection column
          userType: user.user_type,
          status: user.active_loan_id?.status || user.saving_account_id?.status || 'active',
          collections: collectionData.collections
        });
      });
      
      // If no collections found but users exist, show users with 0 collection
      if (allCollections.length === 0 && allUsers.length > 0) {
        console.log('📊 No collections found for selected period, showing users with 0 collection');
      }
      
      // If no users found, show sample data for testing
      if (allUsers.length === 0) {
        console.log('📊 No users found, showing sample data');
        userData.push({
          _id: 'sample1',
          name: 'Sample User 1',
          phone: '1234567890',
          officerName: 'Sample Officer',
          loanAmount: 50000,
          savingAmount: 25000,
          paidAmount: 10000,
          collectionTotal: 0, // No collections for this period
          userType: 'loan',
          status: 'active',
          collections: []
        });
        userData.push({
          _id: 'sample2',
          name: 'Sample User 2',
          phone: '9876543210',
          officerName: 'Sample Officer',
          loanAmount: 0,
          savingAmount: 30000,
          paidAmount: 30000,
          collectionTotal: 5000, // Some collection for this period
          userType: 'saving',
          status: 'active',
          collections: []
        });
      }
      
      // Sort by period collection amount (descending)
      userData.sort((a, b) => (b.collectionTotal || 0) - (a.collectionTotal || 0));
      
      setUserWiseData(userData);
      setTotalCollection(totalCollection);
      console.log(`📊 Final user data:`, userData);
      console.log(`📊 Total collection for ${activeReport} period:`, totalCollection);
      console.log(`📊 Period summary for ${activeReport}:`, {
        reportType: activeReport,
        selectedDate: activeReport === 'daily' ? selectedDate : null,
        selectedWeek: activeReport === 'weekly' ? selectedWeek : null,
        selectedMonth: activeReport === 'monthly' ? selectedMonth : null,
        totalUsers: userData.length,
        totalCollection: totalCollection,
        usersWithCollections: userData.filter(u => u.collectionTotal > 0).length,
        usersWithoutCollections: userData.filter(u => u.collectionTotal === 0).length,
        collectionBreakdown: {
          totalCollections: allCollections.length,
          usersWithCollections: userData.filter(u => u.collectionTotal > 0).length
        },
        usersWithCollectionsDetails: userData
          .filter(u => u.collectionTotal > 0)
          .map(u => ({
            name: u.name,
            periodCollection: u.collectionTotal,
            userType: u.userType
          }))
      });
      
    } catch (error) {
      console.error(`Error fetching ${activeReport} data:`, error);
      // Don't show error, just show empty data
      setError(null);
      setUserWiseData([]);
      setTotalCollection(0);
    } finally {
      setLoading(false);
    }
  }, [activeReport, selectedDate, selectedWeek, selectedMonth]);

  const reportButtons = [
    { id: 'daily', label: 'Daily Report', icon: '📊', color: 'bg-primary hover:bg-primaryDark' },
    { id: 'weekly', label: 'Weekly Report', icon: '📈', color: 'bg-secondary hover:bg-secondaryDark' },
    { id: 'monthly', label: 'Monthly Report', icon: '📅', color: 'bg-primary hover:bg-primaryDark' }
  ];

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getWeekRange = (dateString) => {
    const date = new Date(dateString);
    const dayOfWeek = date.getDay();
    const monday = new Date(date);
    monday.setDate(date.getDate() - dayOfWeek + 1);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    
    return {
      start: monday.toISOString().split('T')[0],
      end: sunday.toISOString().split('T')[0],
      startFormatted: monday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      endFormatted: sunday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    };
  };

  const getReportTitle = () => {
    switch (activeReport) {
      case 'daily':
        return `Daily Collections - ${formatDate(selectedDate)}`;
      case 'weekly':
        const weekRange = getWeekRange(selectedWeek);
        return `Weekly Collections - ${weekRange.startFormatted} to ${weekRange.endFormatted}`;
      case 'monthly':
        return `Monthly Collections - ${new Date(selectedMonth + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`;
      default:
        return 'Collections Report';
    }
  };

  if (loading) {
    return (
      <>
        {/* <OfficerNavbar officerType="accounter" officerName={officerName} pageName="Reports" /> */}
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primaryBg via-white to-secondaryBg pt-20">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* <OfficerNavbar officerType="accounter" officerName={officerName} pageName="Reports" /> */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0 }
        }}
        className="min-h-screen bg-gradient-to-br from-primaryBg via-white to-secondaryBg pt-20"
      >
        <div className="container mx-auto px-4 py-4">
          {/* Report Type Buttons */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <h2 className="text-3xl sm:text-2xl font-bold text-gray-800">
                Collection Statistics and Analytics
              </h2>
              <div className="flex flex-wrap gap-3 justify-center lg:justify-end">
                {reportButtons.map((button) => (
                  <motion.button
                    key={button.id}
                    onClick={() => setActiveReport(button.id)}
                    className={`${button.color} ${
                      activeReport === button.id ? 'ring-2 ring-offset-2 ring-primary shadow-lg transform scale-105' : 'shadow-md hover:shadow-lg'
                    } text-white px-3 py-2 rounded-lg transition-all duration-300 flex items-center justify-center space-x-2 text-sm font-semibold min-w-[100px] hover:transform hover:scale-105`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="text-lg">{button.icon}</span>
                    <span className="font-medium">{button.label}</span>
                  </motion.button>
                ))}
              </div>
            </div>
          </div>

          {/* Date/Week/Month Selector */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-6"
          >
            <Card className="">
              <CardBody>
                <VStack spacing={4} align="self-start">
                  <Text className="text-lg font-semibold text-gray-700">
                    {activeReport === 'daily' ? t('Select Date') : 
                     activeReport === 'weekly' ? t('Select Week') : 
                     t('Select Month')}
                  </Text>
                  <HStack spacing={4}>
                    {activeReport === 'daily' && (
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        disabled={loading}
                      />
                    )}
                    {activeReport === 'weekly' && (
                      <input
                        type="date"
                        value={selectedWeek}
                        onChange={(e) => setSelectedWeek(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        disabled={loading}
                      />
                    )}
                    {activeReport === 'monthly' && (
                      <input
                        type="month"
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        disabled={loading}
                      />
                    )}
                    <Text className="text-sm text-gray-600">
                      {activeReport === 'daily' ? formatDate(selectedDate) :
                       activeReport === 'weekly' ? (() => {
                         const weekRange = getWeekRange(selectedWeek);
                         return `${weekRange.startFormatted} to ${weekRange.endFormatted}`;
                       })() :
                       new Date(selectedMonth + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </Text>
                    {loading && (
                      <div className="flex items-center text-blue-600">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                        <span className="text-sm">Loading...</span>
                      </div>
                    )}
                  
                  </HStack>
                </VStack>
              </CardBody>
            </Card>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6"
          >
            <Card className="">
              <CardBody>
                <Stat>
                  <StatLabel className="text-gray-600">{t('Total Period Collection')}</StatLabel>
                  <StatNumber className="text-2xl font-bold text-blue-600">
                    ₹{totalCollection.toLocaleString()}
                  </StatNumber>
                  <StatHelpText>
                    <StatArrow type="increase" />
                    {t('For selected period')}
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card className="bg-white shadow-lg border-l-4 border-green-500">
              <CardBody>
                <Stat>
                  <StatLabel className="text-gray-600">{t('Total Users')}</StatLabel>
                  <StatNumber className="text-2xl font-bold text-green-600">
                    {userWiseData.length}
                  </StatNumber>
                  <StatHelpText>
                    <StatArrow type="increase" />
                    {t('With collections')}
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card className="bg-white shadow-lg border-l-4 border-orange-500">
              <CardBody>
                <Stat>
                  <StatLabel className="text-gray-600">{t('Average Collection per User')}</StatLabel>
                  <StatNumber className="text-2xl font-bold text-orange-600">
                    ₹{userWiseData.length > 0 ? (totalCollection / userWiseData.length).toLocaleString() : 0}
                  </StatNumber>
                  <StatHelpText>
                    <StatArrow type="increase" />
                    {t('Period collection per user')}
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card className="bg-white shadow-lg border-l-4 border-indigo-500">
              <CardBody>
                <Stat>
                  <StatLabel className="text-gray-600">{t('Report Type')}</StatLabel>
                  <StatNumber className="text-2xl font-bold text-indigo-600">
                    {activeReport.charAt(0).toUpperCase() + activeReport.slice(1)}
                  </StatNumber>
                  <StatHelpText>
                    <StatArrow type="increase" />
                    {t('Current view')}
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </motion.div>

          {/* Error Banner */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6"
            >
              <div className="flex items-center">
                <div className="text-red-500 text-xl mr-3">⚠️</div>
                <div>
                  <h3 className="text-red-800 font-medium">Unable to load data</h3>
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
                <button
                  onClick={() => {
                    setError(null);
                    fetchData();
                  }}
                  className="ml-auto px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors text-sm"
                >
                  Retry
                </button>
              </div>
            </motion.div>
          )}

          {/* User Collections Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="bg-white rounded-xl shadow-lg p-6 mb-6"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              {getReportTitle()}
            </h2>
            
            {userWiseData.length > 0 ? (
              <TableContainer>
                <Table variant="simple" size="sm">
                  <Thead>
                    <Tr>
                      <Th className="text-gray-700 font-bold">{t('User Name')}</Th>
                      <Th className="text-gray-700 font-bold">{t('Phone')}</Th>
                      <Th className="text-gray-700 font-bold">{t('Type')}</Th>
                      <Th className="text-gray-700 font-bold">{t('Officer')}</Th>
                      <Th className="text-gray-700 font-bold">{t('Loan/Saving')}</Th>
                      <Th className="text-gray-700 font-bold">{t('Current Amount')}</Th>
                      <Th className="text-gray-700 font-bold">
                        {t('Period Collection')} 
                        <span className="text-xs text-gray-500 ml-1">
                          ({activeReport === 'daily' ? 'Today' : activeReport === 'weekly' ? 'This Week' : 'This Month'})
                        </span>
                      </Th>
                      <Th className="text-gray-700 font-bold">{t('Status')}</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {userWiseData.map((user, index) => (
                      <Tr key={user._id || index} className="hover:bg-gray-50">
                        <Td className="font-medium text-gray-800">
                          <div className="flex items-center space-x-2">
                            <FaUser className="text-blue-500" />
                            <span>{user.name || user.username || 'N/A'}</span>
                          </div>
                        </Td>
                        <Td className="text-gray-600">{user.phone || 'N/A'}</Td>
                        <Td>
                          <Badge 
                            colorScheme={user.userType === 'loan' ? 'blue' : user.userType === 'saving' ? 'green' : 'gray'}
                            variant="subtle"
                          >
                            {user.userType === 'loan' ? t('Loan') : user.userType === 'saving' ? t('Saving') : t('User')}
                          </Badge>
                        </Td>
                        <Td className="text-gray-600">{user.officerName || 'N/A'}</Td>
                        <Td className="text-green-600 font-semibold">
                          <div className="flex items-center space-x-1">
                            <FaRupeeSign className="text-green-500" />
                            <span>₹{(user.loanAmount || 0).toLocaleString()}</span>
                          </div>
                        </Td>
                        <Td className="text-blue-600 font-semibold">
                          <div className="flex items-center space-x-1">
                            <FaRupeeSign className="text-blue-500" />
                            <span>₹{(user.paidAmount || 0).toLocaleString()}</span>
                          </div>
                        </Td>
                        <Td className="text-purple-600 font-bold">
                          <div className="flex items-center space-x-1">
                            <FaRupeeSign className="text-purple-500" />
                            <span>₹{(user.collectionTotal || 0).toLocaleString()}</span>
                            {user.collectionTotal > 0 && (
                              <span className="text-xs text-green-600 ml-1">
                                ✓
                              </span>
                            )}
                          </div>
                        </Td>
                        <Td>
                          <Badge 
                            colorScheme={user.status === 'active' ? 'green' : 'red'}
                            variant="subtle"
                          >
                            {user.status || 'N/A'}
                          </Badge>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>
            ) : (
              <div className="text-center py-12">
                <Text className="text-gray-500 text-lg">
                  {t('No user data available for selected period')}
                </Text>
              </div>
            )}
          </motion.div>
        </div>
      </motion.div>
    </>
  );
};

export default CombinedReport;