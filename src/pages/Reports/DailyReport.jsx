import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useLocalTranslation } from '../../hooks/useLocalTranslation';
import { updateOfficerCollectionData } from '../../services/officerService';
import axios from '../../axios';
import { Card, CardBody } from '@chakra-ui/react';
import { Text, VStack, HStack, Stat, StatLabel, StatNumber, StatHelpText, StatArrow } from '@chakra-ui/react';
import OfficerNavbar from '../../components/OfficerNavbar';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FaEye } from 'react-icons/fa';

const DailyReport = () => {
  const { t } = useLocalTranslation();
  const navigate = useNavigate();
  const [dailyData, setDailyData] = useState([]);
  const [officersData, setOfficersData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalDailyCollection, setTotalDailyCollection] = useState(0);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [officerName, setOfficerName] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  console.log('📊 DailyReport component rendered');

  // Handle payment process update
  const handlePaymentProcessUpdate = async (officerId, newPaymentProcess) => {
    try {
      console.log('🔄 Updating payment process for officer:', officerId, 'to:', newPaymentProcess);
      
      await updateOfficerCollectionData(officerId, {
        paymentProcess: newPaymentProcess
      });
      
      console.log('✅ Payment process updated successfully');
      
      // Refresh the data
      fetchDailyData();
    } catch (error) {
      console.error('❌ Error updating payment process:', error);
      alert('Failed to update payment process. Please try again.');
    }
  };

  const fetchDailyData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null); // Clear any previous errors
      
      console.log('📊 Fetching daily data for date:', selectedDate);
      const response = await axios.get(`admins/totalByDate?date=${selectedDate}`);
      
      console.log('📊 Daily data response:', response.data);
      
      if (response?.data?.result) {
        const result = response.data.result;
        console.log('📊 Daily data result:', result);
        
        setTotalDailyCollection(result.totalAmount || 0);
        
        // Store detailed data for display
        setDailyData([{
          date: selectedDate,
          totalAmount: result.totalAmount || 0,
          totalCount: result.totalCount || 0,
          loanAmount: result.loan?.amount || 0,
          loanCount: result.loan?.count || 0,
          savingDeposit: result.saving?.deposit || 0,
          savingWithdraw: result.saving?.withdraw || 0,
          savingNet: result.saving?.net || 0,
          savingCount: result.saving?.count || 0
        }]);
        
        console.log('📊 Updated daily collection total:', result.totalAmount || 0);
        console.log('📊 Loan collections:', result.loan);
        console.log('📊 Saving collections:', result.saving);
      } else {
        console.log('📊 No data received from API, full response:', response.data);
        setError(`No daily data available for ${selectedDate}. Response: ${JSON.stringify(response.data)}`);
        setTotalDailyCollection(0);
        setDailyData([]);
      }
    } catch (error) {
      console.error('Error fetching daily data:', error);
      
      // Set appropriate error message based on error type
      if (error.response?.status >= 500) {
        setError('Server error: Unable to fetch daily data. Please try again later.');
      } else if (error.response?.status === 404) {
        setError('Daily data endpoint not found. Please contact administrator.');
      } else if (error.response?.status === 401 || error.response?.status === 403) {
        setError('Access denied: You do not have permission to view daily data.');
      } else if (error.code === 'NETWORK_ERROR' || !navigator.onLine) {
        setError('Network error: Please check your internet connection.');
      } else {
        setError('Failed to load daily data. Please try again.');
      }
      
      setTotalDailyCollection(0);
      setDailyData([]);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    const name = localStorage.getItem('officerName') || 'Manager';
    setOfficerName(name);
    console.log('📊 useEffect triggered for date:', selectedDate);
    fetchDailyData();
    fetchOfficersData();
  }, [selectedDate, fetchDailyData]);

   const fetchOfficersData = async () => {
     try {
       const response = await axios.get('officers');
       if (response?.data?.result) {
         console.log('📊 Officers data loaded:', response.data.result.length, 'officers');
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Handle view officer details
  const handleViewOfficerDetails = (officer) => {
    console.log('🔄 Navigating to officer info page for:', officer._id);
    console.log('🔄 Officer name:', officer.name);
    console.log('🔄 Target path:', `/manager-dashboard/view-officer/${officer._id}`);
    
    try {
      // Use React Router navigation for smoother experience
      navigate(`/manager-dashboard/view-officer/${officer._id}`);
    } catch (error) {
      console.error('❌ Error with React Router navigation:', error);
      // Fallback to window.location for compatibility
      window.location.href = `/manager-dashboard/view-officer/${officer._id}`;
    }
  };

  const exportToPDF = async () => {
    try {
      setIsExporting(true);
      
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      
      // Header
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('Daily Collection Report', pageWidth / 2, 20, { align: 'center' });
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Date: ${formatDate(selectedDate)}`, pageWidth / 2, 30, { align: 'center' });
      doc.text(`Generated by: ${officerName}`, pageWidth / 2, 35, { align: 'center' });
      doc.text(`Generated on: ${new Date().toLocaleString()}`, pageWidth / 2, 40, { align: 'center' });
      
      // Summary Section
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Collection Summary', 20, 55);
      
      if (dailyData.length > 0) {
        const data = dailyData[0];
        
        // Summary table
        const summaryData = [
          ['Total Daily Collection', `₹${totalDailyCollection.toFixed(2)}`],
          ['Loan Collections', `₹${(data.loanAmount || 0).toFixed(2)}`],
          ['Loan Count', `${data.loanCount || 0}`],
          ['Saving Deposits', `₹${(data.savingDeposit || 0).toFixed(2)}`],
          ['Saving Withdrawals', `₹${(data.savingWithdraw || 0).toFixed(2)}`],
          ['Saving Net', `₹${(data.savingNet || 0).toFixed(2)}`],
          ['Saving Count', `${data.savingCount || 0}`]
        ];
        
        autoTable(doc, {
          startY: 60,
          head: [['Metric', 'Value']],
          body: summaryData,
          theme: 'grid',
          headStyles: { fillColor: [128, 0, 128] },
          styles: { fontSize: 10 }
        });
      }
      
      // Officers Section
      if (officersData.length > 0) {
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('Officer Collections', 20, doc.lastAutoTable.finalY + 20);
        
        const officerData = officersData.map(officer => {
          const todayLoan = officer.todayLoanAmount || 0;
          const todayPenalty = officer.todayPenalty || 0;
          const todaySaving = officer.todaySavingAmount || 0;
          const dailyTotal = todayLoan + todayPenalty + todaySaving;
          
          return [
            officer.name || officer.username || 'N/A',
            officer.officer_code || 'N/A',
            `₹${todayLoan.toFixed(2)}`,
            `₹${todayPenalty.toFixed(2)}`,
            `₹${todaySaving.toFixed(2)}`,
            `₹${dailyTotal.toFixed(2)}`
          ];
        });
        
        autoTable(doc, {
          startY: doc.lastAutoTable.finalY + 25,
          head: [['Officer Name', 'Code', 'Today Loan', 'Today Penalty', 'Today Saving', 'Daily Total']],
          body: officerData,
          theme: 'grid',
          headStyles: { fillColor: [128, 0, 128] },
          styles: { fontSize: 9 }
        });
      }
      
      // Footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(`Page ${i} of ${pageCount}`, pageWidth - 20, doc.internal.pageSize.getHeight() - 10);
      }
      
      // Save the PDF
      const fileName = `Daily_Report_${selectedDate}_${new Date().getTime()}.pdf`;
      doc.save(fileName);
      
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      setIsExporting(false);
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
            fetchDailyData();
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
      <OfficerNavbar officerType="accounter" officerName={officerName} pageName="Daily Report" />
      <div className="min-h-screen bg-gradient-to-br from-primaryBg via-white to-secondaryBg p-4 sm:p-6 pb-12 overflow-x-hidden">
      <div className="max-w-7xl mx-auto">
          {showErrorBanner}
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 mt-2"
        >
         
          <p className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2 mt-14">
            {t('Daily collection statistics and analytics')}
          </p>
        </motion.div>

        {/* Date Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <Card className="">
            <CardBody>
              <VStack spacing={4} align="self-start">
                <Text className="text-lg font-semibold text-gray-700">
                  {t('Select Date')}
                </Text>
                <HStack spacing={4}>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => {
                      console.log('📅 Date changed to:', e.target.value);
                      setSelectedDate(e.target.value);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    disabled={loading}
                  />
                  <Text className="text-sm text-gray-600">
                    {formatDate(selectedDate)}
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
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <Card className="">
            <CardBody>
              <Stat>
                <StatLabel className="text-gray-600">{t('Total Daily Collection')}</StatLabel>
                <StatNumber className="text-2xl font-bold text-blue-600">
                  ₹{totalDailyCollection.toLocaleString()}
                </StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  {t('On selected date')}
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card className="bg-white shadow-lg border-l-4 border-green-500">
            <CardBody>
              <Stat>
                <StatLabel className="text-gray-600">{t('Total Transactions')}</StatLabel>
                <StatNumber className="text-2xl font-bold text-green-600">
                  {dailyData.length > 0 ? dailyData[0].totalCount : 0}
                </StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  {t('Transactions processed')}
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card className="bg-white shadow-lg border-l-4 border-purple-500">
            <CardBody>
              <Stat>
                <StatLabel className="text-gray-600">{t('Average per Transaction')}</StatLabel>
                <StatNumber className="text-2xl font-bold text-purple-600">
                  ₹{dailyData.length > 0 && dailyData[0].totalCount > 0 
                    ? (totalDailyCollection / dailyData[0].totalCount).toLocaleString() 
                    : '0'}
                </StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  {t('Per transaction')}
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card className="bg-white shadow-lg border-l-4 border-indigo-500">
            <CardBody>
              <Stat>
                <StatLabel className="text-gray-600">{t('Active Officers')}</StatLabel>
                <StatNumber className="text-2xl font-bold text-indigo-600">
                  {officersData.filter(officer => officer.is_active || officer.isActive).length}
                </StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  {t('Out of')} {officersData.length} {t('total')}
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </motion.div>

         {/* Officer Daily Collection Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.6, delay: 0.5 }}
           className="bg-white rounded-xl shadow-lg p-6 mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
             {t('Officer Daily Collections')} - {formatDate(selectedDate)}
          </h2>
          
           {officersData.length > 0 ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
               {officersData.map((officer) => {
                 // Use officer's aggregated data instead of individual user collections
                 const todayLoan = officer.todayLoanAmount || 0;
                 const todayPenalty = officer.todayPenalty || 0;
                 const todaySaving = officer.todaySavingAmount || 0;
                 const dailyTotal = todayLoan + todayPenalty + todaySaving;
                 
                 // Use officer's total amounts
                 const totalLoan = officer.totalLoanAmount || 0;
                 const totalSaving = officer.totalSavingAmount || 0;
                 const totalCollection = totalLoan + totalSaving;
                 
                 return (
                   <div key={officer._id} className="bg-gradient-to-br from-white to-blue-50 rounded-xl border-2 border-blue-100 p-6 hover:shadow-xl hover:border-blue-300 transition-all duration-300">
                     <div className="flex items-center justify-between mb-4">
                       <div>
                         <h3 className="text-lg font-bold text-gray-800">{officer.name || officer.username}</h3>
                         <p className="text-sm text-blue-600 font-semibold">{officer.officer_code}</p>
                       </div>
                       <div className="flex items-center space-x-2">
                         <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                           officer.is_active || officer.isActive 
                             ? 'bg-green-200 text-green-800 border border-green-300' 
                             : 'bg-red-200 text-red-800 border border-red-300'
                         }`}>
                           {officer.is_active || officer.isActive ? 'Active' : 'Inactive'}
                         </span>
                         <br></br>
                         <button
                           onClick={() => handleViewOfficerDetails(officer)}
                           className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-1 text-xs font-medium"
                           title="View Officer Details"
                         >
                           <FaEye className="w-3 h-3" />
                           <span>View </span>
                         </button>
                       </div>
                     </div>
                     
                     <div className="space-y-3">
                       {/* <div className="flex justify-between items-center py-2 px-3 bg-green-50 rounded-lg border border-green-200">
                         <span className="text-sm font-semibold text-green-700">{t('Today Loan')}</span>
                         <span className="text-lg font-bold text-green-800">₹{todayLoan.toLocaleString()}</span>
                       </div>
                       <div className="flex justify-between items-center py-2 px-3 bg-red-50 rounded-lg border border-red-200">
                         <span className="text-sm font-semibold text-red-700">{t('Today Penalty')}</span>
                         <span className="text-lg font-bold text-red-800">₹{todayPenalty.toLocaleString()}</span>
                       </div>
                       <div className="flex justify-between items-center py-2 px-3 bg-blue-50 rounded-lg border border-blue-200">
                         <span className="text-sm font-semibold text-blue-700">{t('Today Saving')}</span>
                         <span className="text-lg font-bold text-blue-800">₹{todaySaving.toLocaleString()}</span>
                       </div> */}
                       <div className="border-t-2 border-gray-200 pt-3 space-y-2">
                         <div className="flex justify-between items-center py-2 px-3 bg-purple-50 rounded-lg border border-purple-200">
                           <span className="text-sm font-bold text-purple-700">{t('Daily Total')}</span>
                           <span className="text-xl font-bold text-purple-800">₹{dailyTotal.toLocaleString()}</span>
                         </div>
                         <div className="flex justify-between items-center py-2 px-3 bg-indigo-50 rounded-lg border border-indigo-200">
                           <span className="text-xs font-semibold text-indigo-600">{t('All Time Total')}</span>
                           <span className="text-sm font-bold text-indigo-800">₹{totalCollection.toLocaleString()}</span>
                         </div>
        <div className="flex justify-between items-center py-2 px-3 bg-orange-50 rounded-lg border border-orange-200">
          <span className="text-xs font-semibold text-orange-600">{t('Payment Process')}</span>
          <select
            value={officer.paymentProces}
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
          transition={{ duration: 0.6, delay: 0.6 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            {t('Daily Collection Summary')} - {formatDate(selectedDate)}
          </h2>
          
          {dailyData.length > 0 ? (
            <div className="space-y-6">
              {/* Summary Cards - Side by Side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Total Collection Card */}
                <div className="bg-gradient-to-r from-purple-200 to-purple-300 rounded-lg p-6 text-black shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-800 text-sm font-medium mb-2">
                        {t('Total Daily Collection')} :  ₹{totalDailyCollection.toLocaleString()}
                      </p>
                     
                    </div>
                    <div className="text-purple-700">
                      <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Officers Summary Card */}
                {officersData.length > 0 && (
                  <div className="bg-gradient-to-r from-purple-500 to-purple-700 rounded-lg p-6 text-white shadow-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-50 text-sm font-medium mb-2">
                          {t('Total Officers')} : {officersData.length}
                        </p>
                       
                      </div>
                      <div className="text-purple-100">
                        <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Detailed Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Loan Collections */}
                <div className="bg-gradient-to-r from-purple-200 to-purple-300 rounded-lg p-4 text-black shadow-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-bold text-black">Loan Collections</h3>
                    <div className="text-purple-700">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" />
                      </svg>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center py-2 px-3 bg-purple-100 rounded-lg border border-purple-200">
                      <span className="text-purple-800 font-medium text-sm">Amount:</span>
                      <span className="text-xl font-bold text-black">₹{dailyData[0]?.loanAmount?.toLocaleString() || 0}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 px-3 bg-purple-100 rounded-lg border border-purple-200">
                      <span className="text-purple-800 font-medium text-sm">Count:</span>
                      <span className="text-lg font-bold text-black">{dailyData[0]?.loanCount || 0}</span>
                    </div>
                  </div>
                </div>

                {/* Saving Collections */}
                <div className="bg-gradient-to-r from-purple-200 to-purple-300 rounded-lg p-4 text-black shadow-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-bold text-black">Saving Collections</h3>
                    <div className="text-purple-700">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center py-2 px-3 bg-purple-100 rounded-lg border border-purple-200">
                      <span className="text-purple-800 font-medium text-sm">Deposits:</span>
                      <span className="text-lg font-bold text-black">₹{dailyData[0]?.savingDeposit?.toLocaleString() || 0}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 px-3 bg-purple-100 rounded-lg border border-purple-200">
                      <span className="text-purple-800 font-medium text-sm">Withdrawals:</span>
                      <span className="text-lg font-bold text-black">₹{dailyData[0]?.savingWithdraw?.toLocaleString() || 0}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 px-3 bg-purple-200 rounded-lg border-2 border-purple-300">
                      <span className="text-purple-900 font-bold text-sm">Net:</span>
                      <span className="text-xl font-bold text-black">₹{dailyData[0]?.savingNet?.toLocaleString() || 0}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 px-3 bg-purple-100 rounded-lg border border-purple-200">
                      <span className="text-purple-800 font-medium text-sm">Count:</span>
                      <span className="text-lg font-bold text-black">{dailyData[0]?.savingCount || 0}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Officers Summary */}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-400 text-6xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                {t('No Data Available')}
              </h3>
              <p className="text-gray-500">
                {t('No collection data found for the selected date')}
              </p>
            </div>
          )}
        </motion.div>


        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
            <CardBody>
              <VStack spacing={4}>
                <Text className="text-lg font-semibold text-gray-700">
                  {t('Today\'s Report')}
                </Text>
                <Text className="text-gray-600 text-center">
                  {t('View today\'s collection statistics')}
                </Text>
                <button
                  onClick={() => {
                    const today = new Date().toISOString().split('T')[0];
                    console.log('📅 Switching to today:', today);
                    setSelectedDate(today);
                  }}
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primaryDark transition-colors disabled:opacity-50"
                  disabled={selectedDate === new Date().toISOString().split('T')[0]}
                >
                  {selectedDate === new Date().toISOString().split('T')[0] ? t('Current Date') : t('View Today')}
                </button>
              </VStack>
            </CardBody>
          </Card>

          <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
            <CardBody>
              <VStack spacing={4}>
                <Text className="text-lg font-semibold text-gray-700">
                  {t('Export Report')}
                </Text>
                <Text className="text-gray-600 text-center">
                  {t('Download daily report as PDF')}
                </Text>
                <button
                  onClick={exportToPDF}
                  className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isExporting || dailyData.length === 0}
                >
                  {isExporting ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {t('Generating...')}
                    </div>
                  ) : (
                    t('Export PDF')
                  )}
                </button>
              </VStack>
            </CardBody>
          </Card>
        </motion.div>
        </div>
    </div>
    </>
  );
};

export default DailyReport;
