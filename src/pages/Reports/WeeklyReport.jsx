import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useLocalTranslation } from '../../hooks/useLocalTranslation';
import { updateOfficerCollectionData } from '../../services/officerService';
import axios from '../../axios';
import WeeklyChart from '../../componant/Charts/WeeklyChart';
import { Card, CardBody } from '@chakra-ui/react';
import { Text, Stat, StatLabel, StatNumber, StatHelpText, StatArrow } from '@chakra-ui/react';
import OfficerNavbar from '../../components/OfficerNavbar';
import { FaEye } from 'react-icons/fa';

const WeeklyReport = () => {
  const { t } = useLocalTranslation();
  const navigate = useNavigate();
  const [weeklyData, setWeeklyData] = useState([]);
  const [officersData, setOfficersData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalWeeklyCollection, setTotalWeeklyCollection] = useState(0);
  const [averageDailyCollection, setAverageDailyCollection] = useState(0);
  const [officerName, setOfficerName] = useState('');

  // Handle payment process update
  const handlePaymentProcessUpdate = async (officerId, newPaymentProcess) => {
    try {
      console.log('🔄 Updating payment process for officer:', officerId, 'to:', newPaymentProcess);
      
      await updateOfficerCollectionData(officerId, {
        paymentProcess: newPaymentProcess
      });
      
      console.log('✅ Payment process updated successfully');
      
      // Refresh the data
      fetchWeeklyData();
    } catch (error) {
      console.error('❌ Error updating payment process:', error);
      alert('Failed to update payment process. Please try again.');
    }
  };

  console.log('📈 WeeklyReport component rendered');

  useEffect(() => {
    const name = localStorage.getItem('officerName') || 'Manager';
    setOfficerName(name);
    fetchWeeklyData();
    fetchOfficersData();
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

   const fetchOfficersData = async () => {
     try {
       const response = await axios.get('officers');
       if (response?.data?.result) {
         console.log('📈 Officers data loaded:', response.data.result.length, 'officers');
         setOfficersData(response.data.result);
       } else {
         console.warn('No officers data received from API');
         setOfficersData([]);
       }
     } catch (error) {
       console.error('Error fetching officers data:', error);
       setOfficersData([]);
       // Don't set error state here as it's not critical for the main functionality
     }
   };

   // Handle view officer details
   const handleViewOfficerDetails = (officer) => {
     console.log('🔄 Navigating to officer info page for:', officer._id);
     console.log('🔄 Officer name:', officer.name);
     console.log('🔄 Target path:', `/view-officer/${officer._id}`);
     
     try {
       // Use React Router navigation for smoother experience
       navigate(`/view-officer/${officer._id}`);
     } catch (error) {
       console.error('❌ Error with React Router navigation:', error);
       // Fallback to window.location for compatibility
       window.location.href = `/view-officer/${officer._id}`;
     }
   };

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
            fetchOfficersData();
          }}
          className="ml-auto px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors text-sm"
        >
          Retry
        </button>
      </div>
    </div>
  );

  return (
    <>
      <OfficerNavbar officerType="manager" officerName={officerName} pageName="Weekly Report" />
      <div className="min-h-screen bg-gradient-to-br from-primaryBg via-white to-secondaryBg p-4 sm:p-6 pt-20">
        <div className="max-w-7xl mx-auto">
          {showErrorBanner}
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">
            {t('Weekly Report')}
          </h1>
          <p className="text-gray-600 text-lg">
            {t('Weekly collection statistics and analytics')}
          </p>
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
                <StatLabel className="text-gray-600">{t('Total Weekly Collection')}</StatLabel>
                <StatNumber className="text-2xl font-bold text-blue-600">
                  ₹{totalWeeklyCollection.toLocaleString()}
                </StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  {t('This week')}
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card className="bg-white shadow-lg border-l-4 border-green-500">
            <CardBody>
              <Stat>
                <StatLabel className="text-gray-600">{t('Average Daily Collection')}</StatLabel>
                <StatNumber className="text-2xl font-bold text-green-600">
                  ₹{averageDailyCollection.toLocaleString()}
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
                  ₹{Math.max(...weeklyData).toLocaleString()}
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
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            {t('Weekly Collection Trend')}
          </h2>
          <WeeklyChart 
            title={t('Weekly Statistics')} 
            data={weeklyData} 
          />
        </motion.div>

         {/* Officer Weekly Collection Summary */}
         <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.6, delay: 0.7 }}
           className="bg-white rounded-xl shadow-lg p-6 mb-8"
         >
           <h2 className="text-2xl font-bold text-gray-800 mb-6">
             {t('Officer Weekly Collections')} - This Week
           </h2>
           
           {officersData.length > 0 ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
               {officersData.map((officer) => {
                 // Use officer's aggregated data instead of individual user collections
                 const todayLoan = officer.todayLoanAmount || 0;
                 const todayPenalty = officer.todayPenalty || 0;
                 const todaySaving = officer.todaySavingAmount || 0;
                 const todayTotal = todayLoan + todayPenalty + todaySaving;
                 
                 // Use officer's total amounts
                 const totalLoan = officer.totalLoanAmount || 0;
                 const totalSaving = officer.totalSavingAmount || 0;
                 const grandTotal = totalLoan + totalSaving;
                 
                 return (
                   <div key={officer._id} className="bg-gradient-to-br from-white to-gray-50 rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                     <div className="flex items-center justify-between mb-4">
                       <div>
                         <h3 className="text-lg font-semibold text-gray-800">{officer.name || officer.username}</h3>
                         <p className="text-sm text-blue-600 font-medium">{officer.officer_code || 'N/A'}</p>
                       </div>
                       <div className="flex items-center space-x-2">
                         <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                           officer.is_active || officer.isActive 
                             ? 'bg-green-100 text-green-800' 
                             : 'bg-red-100 text-red-800'
                         }`}>
                           {officer.is_active || officer.isActive ? 'Active' : 'Inactive'}
                         </span>
                         <button
                           onClick={() => handleViewOfficerDetails(officer)}
                           className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-1 text-xs font-medium"
                           title="View Officer Details"
                         >
                           <FaEye className="w-3 h-3" />
                           <span>View Details</span>
                         </button>
                       </div>
                     </div>
                     
                     <div className="space-y-3">
                       <div className="bg-green-50 p-3 rounded-lg">
                         <div className="flex justify-between items-center">
                           <span className="text-sm text-gray-600">{t('Today Loan')}</span>
                           <span className="text-lg font-bold text-green-600">₹{todayLoan.toLocaleString()}</span>
                         </div>
                         <div className="flex justify-between items-center mt-1">
                           <span className="text-xs text-gray-500">{t('All Time Loan')}</span>
                           <span className="text-sm font-semibold text-green-700">₹{totalLoan.toLocaleString()}</span>
                         </div>
                       </div>
                       
                       <div className="bg-red-50 p-3 rounded-lg">
                         <div className="flex justify-between items-center">
                           <span className="text-sm text-gray-600">{t('Today Penalty')}</span>
                           <span className="text-lg font-bold text-red-600">₹{todayPenalty.toLocaleString()}</span>
                         </div>
                       </div>
                       
                       <div className="bg-blue-50 p-3 rounded-lg">
                         <div className="flex justify-between items-center">
                           <span className="text-sm text-gray-600">{t('Today Saving')}</span>
                           <span className="text-lg font-bold text-blue-600">₹{todaySaving.toLocaleString()}</span>
                         </div>
                         <div className="flex justify-between items-center mt-1">
                           <span className="text-xs text-gray-500">{t('All Time Saving')}</span>
                           <span className="text-sm font-semibold text-blue-700">₹{totalSaving.toLocaleString()}</span>
                         </div>
                       </div>
                       
                       <div className="border-t pt-3">
                         <div className="flex justify-between items-center">
                           <span className="text-sm font-medium text-gray-700">{t('Today Total')}</span>
                           <span className="text-xl font-bold text-purple-600">₹{todayTotal.toLocaleString()}</span>
                         </div>
                         <div className="flex justify-between items-center mt-1">
                           <span className="text-xs text-gray-500">{t('All Time Total')}</span>
                           <span className="text-sm font-semibold text-indigo-600">₹{grandTotal.toLocaleString()}</span>
                         </div>
        <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-200">
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
        </div>
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

        {/* Officer Summary Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            {t('Weekly Collection Summary')} - This Week
          </h2>
          
          {officersData.length > 0 ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
               {(() => {
                 // Use officer's aggregated data instead of calculating from user collections
                 const totalTodayLoan = officersData.reduce((sum, officer) => sum + (officer.todayLoanAmount || 0), 0);
                 const totalTodayPenalty = officersData.reduce((sum, officer) => sum + (officer.todayPenalty || 0), 0);
                 const totalTodaySaving = officersData.reduce((sum, officer) => sum + (officer.todaySavingAmount || 0), 0);
                 const totalAllTimeLoan = officersData.reduce((sum, officer) => sum + (officer.totalLoanAmount || 0), 0);
                 const totalAllTimeSaving = officersData.reduce((sum, officer) => sum + (officer.totalSavingAmount || 0), 0);
                 
                 const totalTodayAll = totalTodayLoan + totalTodayPenalty + totalTodaySaving;
                 const totalAllTimeAll = totalAllTimeLoan + totalAllTimeSaving;
                
                return (
                  <>
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <h3 className="text-sm font-medium text-green-800 mb-2">{t('Today Loan Collection')}</h3>
                      <p className="text-2xl font-bold text-green-600">₹{totalTodayLoan.toLocaleString()}</p>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                      <h3 className="text-sm font-medium text-red-800 mb-2">{t('Today Penalty Collection')}</h3>
                      <p className="text-2xl font-bold text-red-600">₹{totalTodayPenalty.toLocaleString()}</p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <h3 className="text-sm font-medium text-blue-800 mb-2">{t('Today Saving Collection')}</h3>
                      <p className="text-2xl font-bold text-blue-600">₹{totalTodaySaving.toLocaleString()}</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                      <h3 className="text-sm font-medium text-purple-800 mb-2">{t('Today Grand Total')}</h3>
                      <p className="text-2xl font-bold text-purple-600">₹{totalTodayAll.toLocaleString()}</p>
                    </div>
                    <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                      <h3 className="text-sm font-medium text-indigo-800 mb-2">{t('All Time Loan Total')}</h3>
                      <p className="text-2xl font-bold text-indigo-600">₹{totalAllTimeLoan.toLocaleString()}</p>
                    </div>
                    <div className="bg-cyan-50 p-4 rounded-lg border border-cyan-200">
                      <h3 className="text-sm font-medium text-cyan-800 mb-2">{t('All Time Saving Total')}</h3>
                      <p className="text-2xl font-bold text-cyan-600">₹{totalAllTimeSaving.toLocaleString()}</p>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                      <h3 className="text-sm font-medium text-orange-800 mb-2">{t('All Time Grand Total')}</h3>
                      <p className="text-2xl font-bold text-orange-600">₹{totalAllTimeAll.toLocaleString()}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <h3 className="text-sm font-medium text-gray-800 mb-2">{t('Active Officers')}</h3>
                      <p className="text-2xl font-bold text-gray-600">
                        {officersData.filter(officer => officer.is_active || officer.isActive).length}
                      </p>
                      <p className="text-sm text-gray-500">out of {officersData.length} total</p>
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

        {/* Daily Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-8"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            {t('Daily Breakdown')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-4">
            {weeklyData.map((amount, index) => {
              const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
              const percentage = (amount / Math.max(...weeklyData)) * 100;
              
              return (
                <Card key={index} className="bg-white shadow-lg hover:shadow-xl transition-shadow">
                  <CardBody className="text-center">
                    <Text className="text-sm font-medium text-gray-600 mb-2">
                      {t(days[index])}
                    </Text>
                    <Text className="text-xl font-bold text-gray-800 mb-2">
                      ₹{amount.toLocaleString()}
                    </Text>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </CardBody>
                </Card>
              );
            })}
          </div>
        </motion.div>
        </div>
      </div>
    </>
  );
};

export default WeeklyReport;
