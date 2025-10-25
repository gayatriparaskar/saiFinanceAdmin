import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useLocalTranslation } from '../../hooks/useLocalTranslation';
import axios from '../../axios';
// import WeeklyChart from '../../componant/Charts/WeeklyChart';
import { Card, CardBody } from '@chakra-ui/react';
import { Text, Stat, StatLabel, StatNumber, StatHelpText, StatArrow } from '@chakra-ui/react';
// import { FaEye, FaUser, FaRupeeSign } from 'react-icons/fa';
import SimpleChart from "../../componant/Charts/SimpleChart";

const WeeklyReport = () => {
  const { t } = useLocalTranslation();
  const navigate = useNavigate();
  const [weeklyData, setWeeklyData] = useState([]);
  const [userWiseData, setUserWiseData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalWeeklyCollection, setTotalWeeklyCollection] = useState(0);
  const [averageDailyCollection, setAverageDailyCollection] = useState(0);
  const [officerName, setOfficerName] = useState('');
  
  // Monthly data states
  const [monthlyData, setMonthlyData] = useState([]);
  const [monthlyUserWiseData, setMonthlyUserWiseData] = useState([]);
  const [totalMonthlyCollection, setTotalMonthlyCollection] = useState(0);
  const [averageDailyMonthlyCollection, setAverageDailyMonthlyCollection] = useState(0);
  const [isMonthlyView, setIsMonthlyView] = useState(false);

  // Fetch user-wise weekly collections
  const fetchUserWiseData = async () => {
    try {
      console.log('📈 Fetching user-wise weekly data');
      const response = await axios.get(`admins/userWiseWeeklyCollections`);
      
      if (response?.data?.result) {
        console.log('📈 User-wise weekly data response:', response.data.result);
        setUserWiseData(response.data.result);
      } else {
        console.log('📈 No user-wise weekly data received');
        setUserWiseData([]);
      }
    } catch (error) {
      console.error('Error fetching user-wise weekly data:', error);
      setUserWiseData([]);
    }
  };

  console.log('📈 WeeklyReport component rendered');

  useEffect(() => {
    const name = localStorage.getItem('officerName') || 'Manager';
    setOfficerName(name);
    fetchWeeklyData();
    fetchUserWiseData();
    fetchMonthlyData();
    fetchMonthlyUserWiseData();
  }, []);

  const fetchWeeklyData = async () => {
    try {
      setLoading(true);
      setError(null); // Clear any previous errors
      const response = await axios.get('admins/totalCollectionsWeeklyStats');
      
      if (response?.data?.result?.dailyStats && Array.isArray(response.data.result.dailyStats)) {
        const dailyStats = response.data.result.dailyStats;
        
        // Calculate total weekly collection
        const totalCollection = dailyStats.reduce((sum, day) => {
          return sum + (day.totalLoanAmount || 0) + (day.totalSavingAmount || 0);
        }, 0);
        
        // Calculate average daily collection
        const averageDaily = totalCollection / dailyStats.length;
        
        // Prepare chart data
        const chartData = dailyStats.map(day => 
          (day.totalLoanAmount || 0) + (day.totalSavingAmount || 0)
        );
        
        setWeeklyData(chartData);
        setTotalWeeklyCollection(totalCollection);
        setAverageDailyCollection(averageDaily);
      } else {
        // No data available from API
        setError('No weekly data available from server');
        setWeeklyData([]);
        setTotalWeeklyCollection(0);
        setAverageDailyCollection(0);
      }
    } catch (error) {
      console.error('Error fetching weekly data:', error);
      
      // Set appropriate error message based on error type
      if (error.response?.status >= 500) {
        setError('Server error: Unable to fetch weekly data. Please try again later.');
      } else if (error.response?.status === 404) {
        setError('Weekly data endpoint not found. Please contact administrator.');
      } else if (error.response?.status === 401 || error.response?.status === 403) {
        setError('Access denied: You do not have permission to view weekly data.');
      } else if (error.code === 'NETWORK_ERROR' || !navigator.onLine) {
        setError('Network error: Please check your internet connection.');
      } else {
        setError('Failed to load weekly data. Please try again.');
      }
      
      // Clear data instead of using fallback
      setWeeklyData([]);
      setTotalWeeklyCollection(0);
      setAverageDailyCollection(0);
    } finally {
      setLoading(false);
    }
  };

  // Fetch user-wise monthly collections
  const fetchMonthlyUserWiseData = async () => {
    try {
      console.log('📈 Fetching user-wise monthly data');
      const response = await axios.get(`admins/userWiseMonthlyCollections`);
      
      if (response?.data?.result) {
        console.log('📈 User-wise monthly data response:', response.data.result);
        setMonthlyUserWiseData(response.data.result);
      } else {
        console.log('📈 No user-wise monthly data received');
        setMonthlyUserWiseData([]);
      }
    } catch (error) {
      console.error('Error fetching user-wise monthly data:', error);
      setMonthlyUserWiseData([]);
    }
  };

   const fetchMonthlyData = async () => {
     try {
       console.log('🔄 Fetching monthly data...');
       setError(null);
       
       // Try the monthly stats endpoint first
       let response;
       try {
         response = await axios.get('admins/totalCollectionsMonthlyStats');
         console.log('📊 Monthly stats API response:', response.data);
       } catch (apiError) {
         console.warn('⚠️ Monthly stats API failed, trying weekly stats as fallback:', apiError.message);
         // Fallback to weekly stats if monthly endpoint doesn't exist
         response = await axios.get('admins/totalCollectionsWeeklyStats');
         console.log('📊 Weekly stats API response (fallback):', response.data);
       }
       
       if (response?.data?.result) {
         const result = response.data.result;
         console.log('📈 Monthly data result structure:', result);
         
         // Check for different possible data structures
         let dailyStats = null;
         
         if (result.dailyStats && Array.isArray(result.dailyStats)) {
           dailyStats = result.dailyStats;
           console.log('✅ Found dailyStats array with', dailyStats.length, 'entries');
         } else if (result.monthlyStats && Array.isArray(result.monthlyStats)) {
           dailyStats = result.monthlyStats;
           console.log('✅ Found monthlyStats array with', dailyStats.length, 'entries');
         } else if (Array.isArray(result)) {
           dailyStats = result;
           console.log('✅ Found direct array with', dailyStats.length, 'entries');
         } else {
           console.warn('⚠️ Unexpected data structure:', result);
         }
         
         if (dailyStats && dailyStats.length > 0) {
           // Calculate total monthly collection
           const totalCollection = dailyStats.reduce((sum, day) => {
             const loanAmount = day.totalLoanAmount || day.loanAmount || day.total_amount || 0;
             const savingAmount = day.totalSavingAmount || day.savingAmount || day.saving_amount || 0;
             return sum + loanAmount + savingAmount;
           }, 0);
           
           // Calculate average daily collection for the month
           const averageDaily = totalCollection / dailyStats.length;
           
           // Prepare chart data
           const chartData = dailyStats.map(day => {
             const loanAmount = day.totalLoanAmount || day.loanAmount || day.total_amount || 0;
             const savingAmount = day.totalSavingAmount || day.savingAmount || day.saving_amount || 0;
             return loanAmount + savingAmount;
           });
           
           console.log('📊 Monthly data processed:', {
             totalCollection,
             averageDaily,
             chartDataLength: chartData.length
           });
           
           setMonthlyData(chartData);
           setTotalMonthlyCollection(totalCollection);
           setAverageDailyMonthlyCollection(averageDaily);
         } else {
           console.warn('⚠️ No valid daily stats found in response');
           setError('No monthly data available from server');
           setMonthlyData([]);
           setTotalMonthlyCollection(0);
           setAverageDailyMonthlyCollection(0);
         }
       } else {
         console.warn('⚠️ No result data in API response');
         setError('No monthly data available from server');
         setMonthlyData([]);
         setTotalMonthlyCollection(0);
         setAverageDailyMonthlyCollection(0);
       }
     } catch (error) {
       console.error('❌ Error fetching monthly data:', error);
       console.error('❌ Error details:', {
         message: error.message,
         status: error.response?.status,
         data: error.response?.data
       });
       setError(`Failed to fetch monthly data: ${error.message}`);
       setMonthlyData([]);
       setTotalMonthlyCollection(0);
       setAverageDailyMonthlyCollection(0);
     }
   };

  //  const fetchMonthlyOfficersData = async () => {
  //    try {
  //      console.log('🔄 Fetching monthly officers data...');
       
  //      let response;
  //      try {
  //        response = await axios.get('admins/monthlyOfficerCollections');
  //        console.log('📊 Monthly officers API response:', response.data);
  //      } catch (apiError) {
  //        console.warn('⚠️ Monthly officers API failed, trying weekly officers as fallback:', apiError.message);
  //        // Fallback to weekly officers if monthly endpoint doesn't exist
  //        response = await axios.get('admins/officerCollections');
  //        console.log('📊 Weekly officers API response (fallback):', response.data);
  //      }
       
  //      if (response?.data?.result) {
  //        const result = response.data.result;
  //        console.log('📈 Monthly officers data result structure:', result);
         
  //        if (Array.isArray(result) && result.length > 0) {
  //          console.log('✅ Monthly officer collections data loaded:', result.length, 'officers');
  //          setMonthlyUserWiseData(result);
  //        } else {
  //          console.warn('⚠️ No officer data found in response');
  //          setMonthlyUserWiseData([]);
  //        }
  //      } else {
  //        console.warn('⚠️ No result data in monthly officers API response');
  //        setMonthlyUserWiseData([]);
  //      }
  //    } catch (error) {
  //      console.error('❌ Error fetching monthly officer collections data:', error);
  //      console.error('❌ Error details:', {
  //        message: error.message,
  //        status: error.response?.status,
  //        data: error.response?.data
  //      });
  //      setMonthlyUserWiseData([]);
  //    }
  //  };

   // Handle view officer details
  //  const handleViewOfficerDetails = (officer) => {
  //    console.log('🔄 Navigating to officer info page for:', officer._id);
  //    console.log('🔄 Officer name:', officer.name);
  //    console.log('🔄 Target path:', `/manager-dashboard/view-officer/${officer._id}`);
     
  //    try {
  //      // Use React Router navigation for smoother experience
  //      navigate(`/manager-dashboard/view-officer/${officer._id}`);
  //    } catch (error) {
  //      console.error('❌ Error with React Router navigation:', error);
  //      // Fallback to window.location for compatibility
  //      window.location.href = `/manager-dashboard/view-officer/${officer._id}`;
  //    }
  //  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show UI with zero values when there's an error, but display a subtle error message
  const showErrorBanner = error && (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
      <div className="flex items-center">
        <div className="text-red-500 text-xl mr-3">⚠️</div>
        <div>
          <h3 className="text-red-800 font-medium">Unable to load data</h3>
          <p className="text-red-600 text-sm">{error}</p>
        </div>
        <button
          onClick={() => {
            setError(null);
            fetchWeeklyData();
            fetchUserWiseData();
          }}
          className="ml-auto px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors text-sm"
        >
          Retry
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-primaryBg via-white to-secondaryBg  sm:p-6 ">
        <div className="max-w-7xl mx-auto ">
          {showErrorBanner}
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            {/* <p className="text-3xl sm:text-3xl font-bold text-gray-800 mb-2 ">
              {isMonthlyView ? t('Monthly collection statistics and analytics') : t('Weekly collection statistics and analytics')}
            </p> */}
            {/* <div className="flex gap-2 mt-14">
              <button
                onClick={() => setIsMonthlyView(false)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  !isMonthlyView 
                    ? 'bg-blue-500 text-white shadow-lg' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {t('Weekly')}
              </button>
              <button
                onClick={() => setIsMonthlyView(true)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  isMonthlyView 
                    ? 'bg-blue-500 text-white shadow-lg' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {t('Monthly')}
              </button>
            </div> */}
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
        >
          <Card className="bg-white shadow-lg border-l-4 border-blue-500">
            <CardBody>
              <Stat>
                <StatLabel className="text-gray-600">
                  {isMonthlyView ? t('Total Monthly Collection') : t('Total Weekly Collection')}
                </StatLabel>
                <StatNumber className="text-2xl font-bold text-blue-600">
                  ₹{(isMonthlyView ? totalMonthlyCollection : totalWeeklyCollection).toLocaleString()}
                </StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  {isMonthlyView ? t('This month') : t('This week')}
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card className="bg-white shadow-lg border-l-4 border-green-500">
            <CardBody>
              <Stat>
                <StatLabel className="text-gray-600">{t('Average Daily Collection')}</StatLabel>
                <StatNumber className="text-2xl font-bold text-green-600">
                  ₹{(isMonthlyView ? averageDailyMonthlyCollection : averageDailyCollection).toLocaleString()}
                </StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  {t('Per day')}
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card className="bg-white shadow-lg border-l-4 border-purple-500">
            <CardBody>
              <Stat>
                <StatLabel className="text-gray-600">{t('Best Day')}</StatLabel>
                <StatNumber className="text-2xl font-bold text-purple-600">
                  ₹{Math.max(...(isMonthlyView ? monthlyData : weeklyData)).toLocaleString()}
                </StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  {t('Highest collection')}
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </motion.div>

        {/* Chart Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="p-6"
        >
         
          {/* <WeeklyChart 
            title={t('Weekly Statistics')} 
            data={weeklyData} 
          /> */}
          <SimpleChart 
            title={isMonthlyView ? t('Monthly Statistics') : t('Weekly Statistics')} 
            data={isMonthlyView ? monthlyData : weeklyData} 
            showWeekdays={!isMonthlyView}
          />
        </motion.div>

         {/* Officer Collection Summary */}
         <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.6, delay: 0.7 }}
           className=" p-6 mb-8 mt-8"
         >
           <h2 className="text-2xl font-bold text-gray-800 mb-6">
             {isMonthlyView ? t('Officer Monthly Collections') : t('Officer Weekly Collections')} - {isMonthlyView ? t('This Month') : t('This Week')}
           </h2>
           
           {(isMonthlyView ? monthlyUserWiseData : userWiseData).length > 0 ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
               {(isMonthlyView ? monthlyUserWiseData : userWiseData).map((user) => {
                 // Calculate totals for this user from the collections API
                 const loanAmount = user.loanAmount || 0;
                 const penaltyAmount = user.penaltyAmount || 0;
                 const savingAmount = user.savingAmount || 0;
                 const totalAmount = loanAmount + penaltyAmount + savingAmount;
                 
                 return (
                   <div key={user._id || user.id} className="bg-gradient-to-br from-white to-gray-50 rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                     <div className="flex items-center justify-between mb-4">
                       <div>
                         <h3 className="text-lg font-semibold text-gray-800">{user.name || user.username}</h3>
                         <p className="text-sm text-blue-600 font-medium">{user.phone}</p>
                       </div>
                       <div className="flex items-center space-x-2">
                         <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                           user.status === 'active' 
                             ? 'bg-green-100 text-green-800' 
                             : 'bg-red-100 text-red-800'
                         }`}>
                           {user.status === 'active' ? 'Active' : 'Inactive'}
                         </span>
                       </div>
                     </div>
                     
                     <div className="space-y-3">
                       <div className="bg-green-50 p-3 rounded-lg">
                         <div className="flex justify-between items-center">
                           <span className="text-sm text-gray-600">{t('Loan Collection')}</span>
                           <span className="text-lg font-bold text-green-600">₹{loanAmount.toLocaleString()}</span>
                         </div>
                       </div>
                       
                       <div className="bg-red-50 p-3 rounded-lg">
                         <div className="flex justify-between items-center">
                           <span className="text-sm text-gray-600">{t('Penalty')}</span>
                           <span className="text-lg font-bold text-red-600">₹{penaltyAmount.toLocaleString()}</span>
                         </div>
                       </div>
                       
                       <div className="bg-blue-50 p-3 rounded-lg">
                         <div className="flex justify-between items-center">
                           <span className="text-sm text-gray-600">{t('Saving Collection')}</span>
                           <span className="text-lg font-bold text-blue-600">₹{savingAmount.toLocaleString()}</span>
                         </div>
                       </div>
                       
                       <div className="border-t p-3 bg-purple-50 rounded-lg">
                         <div className="flex justify-between items-center">
                           <span className="text-sm font-bold text-purple-700">{t('Total')}</span>
                           <span className="text-xl font-bold text-purple-600">₹{totalAmount.toLocaleString()}</span>
                         </div>
        {/* <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-200">
          <span className="text-xs font-medium text-orange-600">{t('Payment Process')}</span>
          <select
            value={officer.paymentProcess || 'officer'}
            onChange={(e) => handlePaymentProcessUpdate(officer._id, e.target.value)}
            className="px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-transparent bg-white"
          >
            <option value="officer">Officer</option>
            <option value="manager">Manager</option>
            <option value="deposite to bank">Deposit to Bank</option>
            <option value="accounter">Accounter</option>
            <option value="reassign to officer">Reassign to Officer</option>
            <option value="process complete">Process Complete</option>
          </select>
        </div> */}
                       </div>
                     </div>
                   </div>
                 );
               })}
             </div>
           ) : (
             <div className="text-center py-12">
               <Text className="text-gray-500 text-lg">
                 {t('No officers data available')}
               </Text>
             </div>
           )}
         </motion.div>

        {/* Collection Summary Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="p-6 mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            {isMonthlyView ? t('Monthly Collection Summary') : t('Weekly Collection Summary')} - {isMonthlyView ? t('This Month') : t('This Week')}
          </h2>
          
          {(isMonthlyView ? monthlyUserWiseData : userWiseData).length > 0 ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
               {(() => {
                 // Use collections data from the API based on view
                 const currentData = isMonthlyView ? monthlyUserWiseData : userWiseData;
                 const totalLoan = currentData.reduce((sum, user) => {
                   return sum + (user.loanAmount || 0);
                 }, 0);
                 const totalPenalty = currentData.reduce((sum, user) => {
                   return sum + (user.penaltyAmount || 0);
                 }, 0);
                 const totalSaving = currentData.reduce((sum, user) => {
                   return sum + (user.savingAmount || 0);
                 }, 0);
                 const totalAllTimeLoan = currentData.reduce((sum, user) => sum + (user.totalLoanAmount || 0), 0);
                 const totalAllTimeSaving = currentData.reduce((sum, user) => sum + (user.totalSavingAmount || 0), 0);
                 
                 const totalAll = totalLoan + totalPenalty + totalSaving;
                 const totalAllTimeAll = totalAllTimeLoan + totalAllTimeSaving;
                
                return (
                  <>
                    <div className="bg-green-50 p-2 rounded-lg border border-green-200">
                      <h3 className="text-sm font-medium text-green-800 ">
                        {isMonthlyView ? t('Monthly Loan Collection') : t('Weekly Loan Collection')} : ₹{totalLoan.toLocaleString()}
                      </h3>
                    </div>
                    <div className="bg-red-50 p-2 rounded-lg border border-red-200">
                      <h3 className="text-sm font-medium text-red-800 ">
                        {isMonthlyView ? t('Monthly Penalty Collection') : t('Weekly Penalty Collection')} : ₹{totalPenalty.toLocaleString()}
                      </h3>
                    </div>
                    <div className="bg-blue-50 p-2 rounded-lg border border-blue-200">
                      <h3 className="text-sm font-medium text-blue-800 ">
                        {isMonthlyView ? t('Monthly Saving Collection') : t('Weekly Saving Collection')} : ₹{totalSaving.toLocaleString()}
                      </h3>
                    </div>
                    <div className="bg-purple-50 p-2 rounded-lg border border-purple-200">
                      <h3 className="text-sm font-medium text-purple-800 ">
                        {isMonthlyView ? t('Monthly Grand Total') : t('Weekly Grand Total')} : ₹{totalAll.toLocaleString()}
                      </h3>
                    </div>
                    <div className="bg-indigo-50 p-2 rounded-lg border border-indigo-200">
                      <h3 className="text-sm font-medium text-indigo-800 ">{t('All Time Loan Total')} : ₹{totalAllTimeLoan.toLocaleString()}</h3>
                      {/* <p className="text-2xl font-bold text-indigo-600">₹{totalAllTimeLoan.toLocaleString()}</p> */}
                    </div>
                    <div className="bg-cyan-50 p-2 rounded-lg border border-cyan-200">
                      <h3 className="text-sm font-medium text-cyan-800 ">{t('All Time Saving Total')} : ₹{totalAllTimeSaving.toLocaleString()}</h3>
                      {/* <p className="text-2xl font-bold text-cyan-600">₹{totalAllTimeSaving.toLocaleString()}</p> */}
                    </div>
                    <div className="bg-orange-50 p-2 rounded-lg border border-orange-200">
                      <h3 className="text-sm font-medium text-orange-800 ">{t('All Time Grand Total')} : ₹{totalAllTimeAll.toLocaleString()}</h3>
                      {/* <p className="text-2xl font-bold text-orange-600">₹{totalAllTimeAll.toLocaleString()}</p> */}
                    </div>
                    <div className="bg-gray-50 p-2 rounded-lg border border-gray-200">
                      <h3 className="text-sm font-medium text-gray-800 ">{t('Active Users')} : {userWiseData.filter(user => user.status === 'active').length}</h3>
                    </div>
                  </>
                );
              })()}
            </div>
          ) : (
            <div className="text-center py-8">
              <Text className="text-gray-500 text-lg">
                {t('No officers data available for summary')}
              </Text>
            </div>
          )}
        </motion.div>

        </div>
      </div>
  );
};

export default WeeklyReport;
