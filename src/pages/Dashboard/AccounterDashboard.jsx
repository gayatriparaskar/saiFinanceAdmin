import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocalTranslation } from '../../hooks/useLocalTranslation';
import axios from '../../axios';
import OfficerNavbar from '../../components/OfficerNavbar';
import { 
  FaCalculator, 
  FaChartPie, 
  FaFileInvoiceDollar, 
  FaBalanceScale,
  FaChartBar,
  FaReceipt,
  FaMoneyBillWave,
  FaCalendarDay,
  FaCalendarWeek,
  FaCalendarAlt,
  FaCalendar,
  FaUsers,
  FaChartLine
} from 'react-icons/fa';

function AccounterDashboard() {
  const { t } = useLocalTranslation();
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
  const [loading, setLoading] = useState(true);
  const [officerName, setOfficerName] = useState('');
  
  // Officer table state variables
  const [officers, setOfficers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [assignFilter, setAssignFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [editingOfficer, setEditingOfficer] = useState(null);
  const [editingData, setEditingData] = useState({
    paidAmount: 0,
    remainingAmount: 0
  });
  const [selectedOfficer, setSelectedOfficer] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    // Get officer name from localStorage
    const storedOfficerName = localStorage.getItem('officerName') || 'Accounter';
    setOfficerName(storedOfficerName);
    
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching Accounter Dashboard data...');

      // Fetch all collection data using existing endpoints with local URL
      const [
        todayResponse,
        weeklyResponse,
        monthlyResponse,
        yearlyResponse,
        weeklyStatsResponse,
        monthlyStatsResponse,
        officerSummaryResponse,
        officersResponse
      ] = await Promise.allSettled([
        axios.get('http://localhost:3001/api/admins/totalCollectionsToday'),
        axios.get('http://localhost:3001/api/admins/totalCollectionsWeekly'),
        axios.get('http://localhost:3001/api/admins/totalCollectionsMonthly'),
        axios.get('http://localhost:3001/api/admins/totalCollectionsYearly'),
        axios.get('http://localhost:3001/api/admins/totalCollectionsWeeklyStats'),
        axios.get('http://localhost:3001/api/admins/totalCollectionsMonthlyStats'),
        axios.get('http://localhost:3001/api/admins/todayOfficerSummary'),
        axios.get('http://localhost:3001/api/officers')
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
             console.log('📊 Officers response structure:', officersResponse.value);
             console.log('📊 Officers data type:', typeof officersData);
             console.log('📊 Is array?', Array.isArray(officersData));
             console.log('🔄 This type of data is coming:', officersData);
             console.log('🔄 Data keys:', officersData ? Object.keys(officersData) : 'No data');
             console.log('🔄 Data values:', officersData ? Object.values(officersData) : 'No data');
             
             // If we have sample data, show the first item's structure
             if (officersData && typeof officersData === 'object' && !Array.isArray(officersData)) {
               const firstKey = Object.keys(officersData)[0];
               if (firstKey && officersData[firstKey] && Array.isArray(officersData[firstKey]) && officersData[firstKey].length > 0) {
                 console.log('🔍 Sample officer structure:', officersData[firstKey][0]);
                 console.log('🔍 Sample officer keys:', Object.keys(officersData[firstKey][0]));
               }
             } else if (Array.isArray(officersData) && officersData.length > 0) {
               console.log('🔍 Sample officer structure:', officersData[0]);
               console.log('🔍 Sample officer keys:', Object.keys(officersData[0]));
             }
            
                         // Handle different data structures
             let finalOfficersData = [];
             
             if (Array.isArray(officersData)) {
               // Data is already an array
               finalOfficersData = officersData;
             } else if (officersData && typeof officersData === 'object') {
               // Check for the actual API response structure
               if (officersData.result && Array.isArray(officersData.result)) {
                 // This is the correct structure from the API
                 finalOfficersData = officersData.result;
                 console.log('✅ Found officers in result field:', finalOfficersData.length);
               } else if (officersData.officers && Array.isArray(officersData.officers)) {
                 finalOfficersData = officersData.officers;
               } else if (officersData.data && Array.isArray(officersData.data)) {
                 finalOfficersData = officersData.data;
               } else if (officersData.results && Array.isArray(officersData.results)) {
                 finalOfficersData = officersData.results;
               } else {
                 // Try to convert object values to array
                 const values = Object.values(officersData);
                 if (values.length > 0 && Array.isArray(values[0])) {
                   finalOfficersData = values[0];
                 }
               }
             }
            
            console.log('🔄 Final officers data to process:', finalOfficersData);
            
                         if (Array.isArray(finalOfficersData) && finalOfficersData.length > 0) {
               // Transform data to match the expected structure and filter out accounter officers
               const transformedOfficers = finalOfficersData
                                   .filter(officer => {
                    // Filter out accounter and admin officers
                    const officerType = officer.officer_type || officer.type || officer.role || officer.designation;
                    const isAccounter = officerType && officerType.toLowerCase().includes('accounter');
                    const isAdmin = officerType && officerType.toLowerCase().includes('admin');
                    
                    if (isAccounter) {
                      console.log('🚫 Filtered out accounter officer:', officer.officer_name || officer.name);
                    }
                    
                    if (isAdmin) {
                      console.log('🚫 Filtered out admin officer:', officer.officer_name || officer.name);
                    }
                    
                    return !isAccounter && !isAdmin; // Only include non-accounter and non-admin officers
                  })
                 .map(officer => {
                   console.log('🔍 Processing officer:', officer);
                   
                   // Map all possible field names from the API response
                   const transformed = {
                     ...officer,
                     // ID mapping - try multiple possible field names
                     officer_id: officer.officer_id || officer._id || officer.id || officer.officerId || `officer_${Math.random()}`,
                     
                     // Name mapping - try multiple possible field names
                     officer_name: officer.officer_name || officer.name || officer.full_name || officer.officerName || 
                                  officer.first_name || officer.last_name || 'Unknown Officer',
                     
                     // Code mapping - try multiple possible field names
                     officer_code: officer.officer_code || officer.code || officer.employee_id || officer.employeeId || 
                                  officer.officerCode || officer.emp_code || 'N/A',
                     
                     // Today's collection mapping - try multiple possible field names
                     todayCollection: officer.todayCollection || officer.today_collection || officer.daily_collection || 
                                     officer.today_amount || officer.daily_amount || officer.collection_today || 0,
                     
                     // Total collection mapping - try multiple possible field names
                     totalCollection: officer.totalCollection || officer.total_collection || officer.monthly_collection || 
                                     officer.total_amount || officer.monthly_amount || officer.collection_total || 
                                     officer.grand_total || 0,
                     
                     // Paid amount mapping - try multiple possible field names
                     paidAmount: officer.paidAmount || officer.paid_amount || officer.amount_paid || 
                                officer.paid || officer.amountPaid || officer.paid_amount_total || 0,
                     
                     // Remaining amount mapping - try multiple possible field names
                     remainingAmount: officer.remainingAmount || officer.remaining_amount || officer.amount_remaining || 
                                     officer.remaining || officer.amountRemaining || officer.remaining_amount_total || 0,
                     
                     // Assign to mapping - try multiple possible field names
                     assignTo: officer.assignTo || officer.assign_to || officer.assigned_to || 
                               officer.assignment || officer.role || officer.designation || 'Not Assigned',
                     
                     // Status mapping - try multiple possible field names
                     status: officer.status || officer.current_status || officer.status_current || 
                             officer.approval_status || officer.verification_status || 'Pending'
                   };
                   
                   console.log('✅ Transformed officer:', transformed);
                   return transformed;
                 });
               
                               console.log('🔄 Final transformed officers (excluding accounter and admin):', transformedOfficers);
               setOfficers(transformedOfficers);
             } else {
               console.log('❌ No valid officers data found:', finalOfficersData);
               console.log('❌ Setting empty array for officers');
               setOfficers([]);
             }
          } else {
            console.log('❌ Officers response failed:', officersResponse);
            console.log('❌ Response status:', officersResponse.status);
            console.log('❌ Response reason:', officersResponse.reason);
          }

      // Calculate comprehensive stats
      const totalTransactions = (newCollectionData.today?.loan?.count || 0) + 
                              (newCollectionData.today?.saving?.count || 0);
      
      const monthlyRevenue = newCollectionData.monthly?.totalAmount || 0;
      const outstandingAmounts = (newCollectionData.yearly?.totalAmount || 0) - 
                                (newCollectionData.monthly?.totalAmount || 0);

      setStats({
        totalTransactions,
        pendingApprovals: officerCollections.length || 0,
        monthlyRevenue,
        outstandingAmounts
      });

      console.log('✅ Accounter Dashboard data fetched successfully');
    } catch (error) {
      console.error('❌ Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  const formatCurrency = (amount) => {
    return `₹${(amount || 0).toLocaleString()}`;
  };

  // Officer table functions
  const filteredOfficers = officers.filter(officer => {
    const matchesSearch = officer.officer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    officer.officer_code?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || officer.status === statusFilter;
    const matchesAssign = !assignFilter || officer.assignTo === assignFilter;
    return matchesSearch && matchesStatus && matchesAssign;
  });

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedOfficers = filteredOfficers.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredOfficers.length / itemsPerPage);

  const handleEditClick = (officer) => {
    setEditingOfficer(officer.officer_id);
    setEditingData({
      paidAmount: officer.paidAmount || 0,
      remainingAmount: officer.remainingAmount || 0
    });
  };

  const handleSaveEdit = async (officerId) => {
    try {
      console.log('🔄 Saving edit for officer:', officerId, editingData);
      
      // Call backend API to save the data
      const response = await axios.put(`http://localhost:3001/api/officers/${officerId}/collection-data`, {
        paidAmount: editingData.paidAmount,
        remainingAmount: editingData.remainingAmount
      });

      if (response.data.success) {
        console.log('✅ Edit saved successfully:', response.data);
        
        // Update local state
        setOfficers(prev => prev.map(officer => 
          officer.officer_id === officerId 
            ? { ...officer, ...editingData }
            : officer
        ));
        
        setEditingOfficer(null);
        setEditingData({ paidAmount: 0, remainingAmount: 0 });
      } else {
        console.error('❌ Failed to save edit:', response.data);
        alert('Failed to save changes. Please try again.');
      }
    } catch (error) {
      console.error('❌ Error saving edit:', error);
      alert('Error saving changes. Please try again.');
    }
  };

  const handleCancelEdit = () => {
    setEditingOfficer(null);
    setEditingData({ paidAmount: 0, remainingAmount: 0 });
  };

  const handleAssignToClick = (officer) => {
    setSelectedOfficer(officer);
    setShowAssignModal(true);
  };

  const handleStatusClick = (officer) => {
    setSelectedOfficer(officer);
    setShowStatusModal(true);
  };

  const handleViewDetails = (officer) => {
    setSelectedOfficer(officer);
    setShowDetailsModal(true);
  };

  const handleAssignTo = async (assignment) => {
    if (selectedOfficer) {
      try {
        console.log('🔄 Assigning officer to:', assignment);
        
        // Call backend API to save the assignment
        const response = await axios.put(`http://localhost:3001/api/officers/${selectedOfficer.officer_id}/collection-data`, {
          assignTo: assignment
        });

        if (response.data.success) {
          console.log('✅ Assignment saved successfully:', response.data);
          
          // Update local state
          setOfficers(prev => prev.map(officer => 
            officer.officer_id === selectedOfficer.officer_id 
              ? { ...officer, assignTo: assignment }
              : officer
          ));
          
          setShowAssignModal(false);
          setSelectedOfficer(null);
        } else {
          console.error('❌ Failed to save assignment:', response.data);
          alert('Failed to save assignment. Please try again.');
        }
      } catch (error) {
        console.error('❌ Error saving assignment:', error);
        alert('Error saving assignment. Please try again.');
      }
    }
  };

  const handleStatusUpdate = async (status) => {
    if (selectedOfficer) {
      try {
        console.log('🔄 Updating status to:', status);
        
        // Call backend API to save the status
        const response = await axios.put(`http://localhost:3001/api/officers/${selectedOfficer.officer_id}/collection-data`, {
          status: status
        });

        if (response.data.success) {
          console.log('✅ Status updated successfully:', response.data);
          
          // Update local state
          setOfficers(prev => prev.map(officer => 
            officer.officer_id === selectedOfficer.officer_id 
              ? { ...officer, status: status }
              : officer
          ));
          
          setShowStatusModal(false);
          setSelectedOfficer(null);
        } else {
          console.error('❌ Failed to update status:', response.data);
          alert('Failed to update status. Please try again.');
        }
      } catch (error) {
        console.error('❌ Error updating status:', error);
        alert('Error updating status. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-primaryBg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Accounter Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <OfficerNavbar officerType="accounter" officerName={officerName} pageName="Accounter Dashboard" />
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="min-h-screen bg-primaryBg pt-16"
      >
        {/* Welcome Header */}
        <motion.div 
          variants={itemVariants}
          className="bg-white shadow-sm border-b border-gray-200 px-6 py-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Welcome, {officerName}!</h1>
              <p className="text-gray-600">Accounter Dashboard - Comprehensive financial overview and collection management</p>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div 
          variants={itemVariants}
          className="px-6 py-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Transactions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Today's Transactions</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalTransactions}</p>
                  <p className="text-sm text-gray-500">
                    {collectionData.today?.loan?.count || 0} Loan + {collectionData.today?.saving?.count || 0} Saving
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <FaCalculator className="text-2xl text-blue-600" />
                </div>
              </div>
            </div>

            {/* Today's Collection */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Today's Collection</p>
                  <p className="text-3xl font-bold text-green-600">
                    {formatCurrency(collectionData.today?.grandTotal || 0)}
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatCurrency(collectionData.today?.loan?.amount || 0)} Loan + {formatCurrency(collectionData.today?.saving?.net || 0)} Saving
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <FaMoneyBillWave className="text-2xl text-green-600" />
                </div>
              </div>
            </div>

            {/* Monthly Revenue */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Monthly Collection</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {formatCurrency(collectionData.monthly?.totalAmount || 0)}
                  </p>
                  <p className="text-sm text-gray-500">
                    {collectionData.monthly?.totalCount || 0} transactions
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <FaCalendarAlt className="text-2xl text-purple-600" />
                </div>
              </div>
            </div>

            {/* Yearly Total */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Yearly Collection</p>
                  <p className="text-3xl font-bold text-orange-600">
                    {formatCurrency(collectionData.yearly?.totalAmount || 0)}
                  </p>
                  <p className="text-sm text-gray-500">
                    {collectionData.yearly?.totalCount || 0} transactions
                  </p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <FaCalendar className="text-2xl text-orange-600" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Collection Breakdown Section */}
        <motion.div 
          variants={itemVariants}
          className="px-6 py-6"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Today's Detailed Collection */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FaCalendarDay className="mr-2 text-blue-600" />
                Today's Collection Breakdown
              </h3>
              {collectionData.today ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="font-medium text-blue-800">Loan Collections</span>
                    <span className="text-lg font-bold text-blue-600">
                      {formatCurrency(collectionData.today.loan?.amount || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="font-medium text-green-800">Saving Deposits</span>
                    <span className="text-lg font-bold text-green-600">
                      {formatCurrency(collectionData.today.saving?.deposit || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                    <span className="font-medium text-red-800">Saving Withdrawals</span>
                    <span className="text-lg font-bold text-red-600">
                      {formatCurrency(collectionData.today.saving?.withdraw || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gray-100 rounded-lg border-2 border-gray-300">
                    <span className="font-bold text-gray-800">Net Total</span>
                    <span className="text-xl font-bold text-gray-800">
                      {formatCurrency(collectionData.today.grandTotal || 0)}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <FaChartBar className="text-4xl mx-auto mb-2" />
                  <p>No collection data available for today</p>
                </div>
              )}
            </div>

            {/* Weekly Collection Trend */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FaCalendarWeek className="mr-2 text-green-600" />
                Weekly Collection Summary
              </h3>
              {collectionData.weekly ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="font-medium text-green-800">Week Total</span>
                    <span className="text-lg font-bold text-green-600">
                      {formatCurrency(collectionData.weekly.totalAmount || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="font-medium text-blue-800">Transactions</span>
                    <span className="text-lg font-bold text-blue-600">
                      {collectionData.weekly.totalCount || 0}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 p-3 bg-gray-50 rounded-lg">
                    <p><strong>Period:</strong> {collectionData.weekly.startDate} to {collectionData.weekly.endDate}</p>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <FaChartLine className="text-4xl mx-auto mb-2" />
                  <p>No weekly data available</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>



        {/* Comprehensive Officer Table - Same as Manager Dashboard */}
        <motion.div 
          variants={itemVariants}
          className="px-6 py-6"
        >
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <FaUsers className="mr-2 text-purple-600" />
              Officer Collection Overview
            </h2>
            
                         {/* Search and Filter */}
             <div className="mb-6 space-y-4">
               {/* Search Input */}
               <div className="w-full">
                 <label className="block text-sm font-medium text-gray-700 mb-2">Search Officers</label>
                 <input
                   type="text"
                   placeholder="Search by name or code..."
                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                 />
               </div>
               
               {/* Filter Dropdowns */}
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
                   <select
                     value={statusFilter}
                     onChange={(e) => setStatusFilter(e.target.value)}
                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                   >
                     <option value="">All Status</option>
                     <option value="approved by manager">Approved by Manager</option>
                     <option value="approved by accounter">Approved by Accounter</option>
                     <option value="deposited to bank">Deposited to Bank</option>
                   </select>
                 </div>
                 
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Assignment</label>
                   <select
                     value={assignFilter}
                     onChange={(e) => setAssignFilter(e.target.value)}
                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                   >
                     <option value="">All Assignments</option>
                     <option value="officer">Officer</option>
                     <option value="accounter">Accounter</option>
                     <option value="manager">Manager</option>
                   </select>
                 </div>
               </div>
             </div>

                                                   {/* Officer Table */}
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                {console.log('🔍 Table Debug - officers:', officers)}
                {console.log('🔍 Table Debug - filteredOfficers:', filteredOfficers)}
                {console.log('🔍 Table Debug - paginatedOfficers:', paginatedOfficers)}
                {paginatedOfficers.length > 0 ? (
                 <table className="min-w-full divide-y divide-gray-200">
                                     <thead className="bg-gray-50">
                     <tr>
                       <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                         Officer Name
                       </th>
                       <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                         Officer Code
                       </th>
                       <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                         Today's Collection
                       </th>
                       <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                         Total Collection
                       </th>
                       <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                         Paid Amount
                       </th>
                       <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                         Remaining Amount
                       </th>
                       <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                         Assign To
                       </th>
                       <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                         Status
                       </th>
                       <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                         Actions
                       </th>
                     </tr>
                   </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                                         {paginatedOfficers.map((officer, index) => (
                       <tr key={index} className="hover:bg-gray-50">
                         <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                           {officer.officer_name}
                         </td>
                         <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                           {officer.officer_code}
                         </td>
                         <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-medium">
                           {formatCurrency(officer.todayCollection || 0)}
                         </td>
                         <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                           {formatCurrency(officer.totalCollection || 0)}
                         </td>
                         <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm">
                           {editingOfficer === officer.officer_id ? (
                             <input
                               type="number"
                               value={editingData.paidAmount}
                               onChange={(e) => setEditingData({...editingData, paidAmount: parseFloat(e.target.value) || 0})}
                               className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                             />
                           ) : (
                             <span className="text-purple-600 font-medium">
                               {formatCurrency(officer.paidAmount || 0)}
                             </span>
                           )}
                         </td>
                         <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm">
                           {editingOfficer === officer.officer_id ? (
                             <input
                               type="number"
                               value={editingData.remainingAmount}
                               onChange={(e) => setEditingData({...editingData, remainingAmount: parseFloat(e.target.value) || 0})}
                               className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                             />
                           ) : (
                             <span className="text-orange-600 font-medium">
                               {formatCurrency(officer.remainingAmount || 0)}
                             </span>
                           )}
                         </td>
                         <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm">
                           <button
                             onClick={() => handleAssignToClick(officer)}
                             className="px-3 py-1 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors text-xs font-medium"
                           >
                             {officer.assignTo || 'Assign'}
                           </button>
                         </td>
                         <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm">
                           <button
                             onClick={() => handleStatusClick(officer)}
                             className="px-3 py-1 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-colors text-xs font-medium"
                           >
                             {officer.status || 'Set Status'}
                           </button>
                         </td>
                         <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                           <div className="flex items-center space-x-2">
                             {editingOfficer === officer.officer_id ? (
                               <>
                                 <button
                                   onClick={() => handleSaveEdit(officer.officer_id)}
                                   className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors text-xs"
                                 >
                                   Save
                                 </button>
                                 <button
                                   onClick={() => handleCancelEdit()}
                                   className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors text-xs"
                                 >
                                   Cancel
                                 </button>
                               </>
                             ) : (
                               <>
                                 <button
                                   onClick={() => handleEditClick(officer)}
                                   className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-xs"
                                 >
                                   Edit
                                 </button>
                                 <button
                                   onClick={() => handleViewDetails(officer)}
                                   className="px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors text-xs"
                                 >
                                   View
                                 </button>
                               </>
                             )}
                           </div>
                         </td>
                       </tr>
                     ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-500">
                    <FaUsers className="text-4xl mx-auto mb-4" />
                    <p className="text-lg font-medium mb-2">No Officers Found</p>
                    <p className="text-sm">Officer data is being loaded or no officers are available.</p>
                    <div className="mt-4 text-xs text-gray-400">
                      <p>Debug Info:</p>
                      <p>Total Officers: {officers.length}</p>
                      <p>Filtered Officers: {filteredOfficers.length}</p>
                      <p>Search Term: "{searchTerm}"</p>
                      <p>Status Filter: "{statusFilter}"</p>
                      <p>Assign Filter: "{assignFilter}"</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredOfficers.length)} of {filteredOfficers.length} results
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 border rounded-md text-sm font-medium ${
                        currentPage === page
                          ? 'border-blue-500 bg-blue-500 text-white'
                          : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div 
          variants={itemVariants}
          className="px-6 py-6"
        >
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <button className="flex flex-col items-center justify-center space-y-2 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors">
                <FaCalculator className="text-2xl text-blue-600" />
                <span className="text-blue-800 font-medium text-sm">View Reports</span>
              </button>
              <button className="flex flex-col items-center justify-center space-y-2 p-4 bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition-colors">
                <FaReceipt className="text-2xl text-green-600" />
                <span className="text-green-800 font-medium text-sm">Generate Report</span>
              </button>
              <button className="flex flex-col items-center justify-center space-y-2 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 transition-colors">
                <FaBalanceScale className="text-2xl text-purple-600" />
                <span className="text-purple-800 font-medium text-sm">Financial Review</span>
              </button>
              <button className="flex flex-col items-center justify-center space-y-2 p-4 bg-orange-50 hover:bg-orange-100 rounded-lg border border-orange-200 transition-colors">
                <FaFileInvoiceDollar className="text-2xl text-orange-600" />
                <span className="text-orange-800 font-medium text-sm">Collection Analysis</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Modals */}
        {/* Assign To Modal */}
        {showAssignModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96">
              <h3 className="text-lg font-semibold mb-4">Assign Officer To</h3>
              <div className="space-y-3">
                <button
                  onClick={() => handleAssignTo('officer')}
                  className="w-full p-3 text-left bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200"
                >
                  Officer
                </button>
                <button
                  onClick={() => handleAssignTo('accounter')}
                  className="w-full p-3 text-left bg-green-50 hover:bg-green-100 rounded-lg border border-green-200"
                >
                  Accounter
                </button>
                <button
                  onClick={() => handleAssignTo('manager')}
                  className="w-full p-3 text-left bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200"
                >
                  Manager
                </button>
              </div>
              <button
                onClick={() => setShowAssignModal(false)}
                className="mt-4 w-full p-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Status Modal */}
        {showStatusModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96">
              <h3 className="text-lg font-semibold mb-4">Update Status</h3>
              <div className="space-y-3">
                <button
                  onClick={() => handleStatusUpdate('approved by manager')}
                  className="w-full p-3 text-left bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200"
                >
                  Approved by Manager
                </button>
                <button
                  onClick={() => handleStatusUpdate('approved by accounter')}
                  className="w-full p-3 text-left bg-green-50 hover:bg-green-100 rounded-lg border border-green-200"
                >
                  Approved by Accounter
                </button>
                <button
                  onClick={() => handleStatusUpdate('deposited to bank')}
                  className="w-full p-3 text-left bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200"
                >
                  Deposited to Bank
                </button>
              </div>
              <button
                onClick={() => setShowStatusModal(false)}
                className="mt-4 w-full p-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Officer Details Modal */}
        {showDetailsModal && selectedOfficer && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96 max-h-96 overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4">Officer Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="font-medium">Name:</span>
                  <span>{selectedOfficer.officer_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Code:</span>
                  <span>{selectedOfficer.officer_code}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Today's Collection:</span>
                  <span className="text-blue-600">{formatCurrency(selectedOfficer.todayCollection || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Total Collection:</span>
                  <span className="text-green-600">{formatCurrency(selectedOfficer.totalCollection || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Paid Amount:</span>
                  <span className="text-purple-600">{formatCurrency(selectedOfficer.paidAmount || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Remaining Amount:</span>
                  <span className="text-orange-600">{formatCurrency(selectedOfficer.remainingAmount || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Assigned To:</span>
                  <span>{selectedOfficer.assignTo || 'Not Assigned'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Status:</span>
                  <span>{selectedOfficer.status || 'Pending'}</span>
                </div>
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="mt-4 w-full p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </>
  );
}

export default AccounterDashboard;
