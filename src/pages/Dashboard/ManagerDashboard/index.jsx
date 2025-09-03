import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from '../../../axios';
import OfficerNavbar from '../../../components/OfficerNavbar';
import StatsCards from './StatsCards';
import OfficerTable from './OfficerTable';
import Modals from './Modals';

const ManagerDashboard = () => {
  const [officers, setOfficers] = useState([]);
  const [dailyCollections, setDailyCollections] = useState([]);
  const [stats, setStats] = useState({
    totalOfficers: 0,
    activeOfficers: 0,
    totalCollections: 0,
    todayCollections: 0
  });
  const [selectedOfficer, setSelectedOfficer] = useState(null);
  const [showOfficerDetails, setShowOfficerDetails] = useState(false);
  const [showAssignTo, setShowAssignTo] = useState(false);
  const [showStatus, setShowStatus] = useState(false);
  const [showBankAssignment, setShowBankAssignment] = useState(false);
  const [editingOfficer, setEditingOfficer] = useState(null);
  const [editingField, setEditingField] = useState(null);
  const [loading, setLoading] = useState(true);
  const [officerName, setOfficerName] = useState('');

  useEffect(() => {
    const name = localStorage.getItem('officerName') || 'Manager';
    setOfficerName(name);
    console.log('🔧 ManagerDashboard - Setting officer name:', name);
    console.log('🔧 ManagerDashboard - Current localStorage:', {
      officerName: localStorage.getItem('officerName'),
      officerType: localStorage.getItem('officerType'),
      userType: localStorage.getItem('userType'),
      token: localStorage.getItem('token')
    });
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      console.log('🔄 Fetching dashboard data...');
      console.log('🔧 Axios baseURL:', axios.defaults.baseURL);
      
      // Debug current user info
      const userType = localStorage.getItem('userType');
      const officerType = localStorage.getItem('officerType');
      const token = localStorage.getItem('token');
      console.log('👤 Current user info:', { userType, officerType, hasToken: !!token });
      
      // Try to fetch data using different approaches based on user role
      let officersData = [];
      let collectionsData = [];
      
      if (userType === 'admin') {
        // Admin can access all endpoints
        console.log('👑 Admin user - fetching full data...');
        
        // Fetch officers data
        console.log('📡 Fetching officers...');
        const officersResponse = await axios.get('officers');
        console.log('✅ Officers response:', officersResponse);
        officersData = officersResponse?.data?.result || [];
        
        // Fetch daily collections data
        console.log('📡 Fetching collections...');
        const collectionsResponse = await axios.get('dailyCollections');
        console.log('✅ Collections response:', collectionsResponse);
        collectionsData = collectionsResponse?.data?.result || [];
        
      } else if (officerType === 'manager') {
        // Manager - try to use the new comprehensive endpoint
        console.log('👔 Manager user - fetching comprehensive collection data...');
        
        try {
          // Use the new comprehensive endpoint for managers
          console.log('📡 Fetching comprehensive officer collections...');
          const comprehensiveResponse = await axios.get('admins/managerOfficerCollections');
          console.log('✅ Comprehensive officer collections response:', comprehensiveResponse);
          
          // Extract officer data from comprehensive response
          const comprehensiveData = comprehensiveResponse?.data?.data || [];
          officersData = comprehensiveData.map(item => ({
            _id: item.officer_id,
            name: item.officer_name,
            officer_code: item.officer_code,
            phone_number: item.officer_phone,
            email: item.officer_email,
            is_active: item.is_active,
            // Store the comprehensive collection data
            comprehensive_collections: {
              today: item.today,
              all_time: item.all_time
            }
          }));
          
          // For comprehensive data, we don't need separate collections
          collectionsData = [];
          
          console.log('📊 Comprehensive data processed:', officersData.length, 'officers');
          if (officersData.length > 0) {
            console.log('👤 Sample comprehensive officer data:', officersData[0]);
          }
          
        } catch (comprehensiveError) {
          console.error('❌ Failed to fetch comprehensive data:', comprehensiveError);
          
          // Fallback: try to get today's officer summary
          try {
            console.log('📡 Falling back to today\'s officer summary...');
            const summaryResponse = await axios.get('admins/todayOfficerSummary');
            console.log('✅ Officer summary response:', summaryResponse);
            
            // Extract officer data from summary
            const summaryData = summaryResponse?.data?.data || [];
            officersData = summaryData.map(item => ({
              _id: item.officer_id,
              name: item.officer_name,
              officer_code: item.officer_code,
              is_active: true,
              collections: {
                today_loan: item.total_loan_amount || 0,
                today_penalty: item.total_penalty || 0,
                today_saving: item.total_saving_deposit || 0,
                today_total: item.total_collection || 0
              }
            }));
            
            collectionsData = [];
            
          } catch (summaryError) {
            console.error('❌ Failed to fetch officer summary:', summaryError);
            
            // Fallback: get basic officer list AND daily collections separately
            try {
              console.log('📡 Trying to fetch basic officer list and collections...');
              
              // Fetch officers
              const basicOfficersResponse = await axios.get('officers');
              officersData = basicOfficersResponse?.data?.result || [];
              
              // Fetch daily collections
              const basicCollectionsResponse = await axios.get('dailyCollections');
              collectionsData = basicCollectionsResponse?.data?.result || [];
              
            } catch (basicError) {
              console.error('❌ Failed to fetch basic data:', basicError);
              throw basicError;
            }
          }
        }
      } else {
        throw new Error('User type not supported');
      }
      
      setOfficers(officersData);
      setDailyCollections(collectionsData);
      
      const today = new Date().toDateString();
      const todayCollections = collectionsData.filter(collection => 
        new Date(collection.collected_on).toDateString() === today
      );

      // Calculate total amounts
      let totalCollectionAmount = 0;
      let todayCollectionAmount = 0;
      
      if (collectionsData.length > 0) {
        // Use regular collections data
        totalCollectionAmount = collectionsData.reduce((sum, collection) => 
          sum + (collection.amount || 0), 0
        );
        
        todayCollectionAmount = todayCollections.reduce((sum, collection) => 
          sum + (collection.amount || 0), 0
        );
      } else if (officersData.length > 0) {
        // Use comprehensive data from officers when collectionsData is empty
        officersData.forEach(officer => {
          if (officer.comprehensive_collections) {
            // Comprehensive data structure
            totalCollectionAmount += (officer.comprehensive_collections.all_time?.total || 0);
            todayCollectionAmount += (officer.comprehensive_collections.today?.total || 0);
          } else if (officer.collections) {
            // Manager summary data structure
            totalCollectionAmount += (officer.collections.today_total || 0);
            todayCollectionAmount += (officer.collections.today_total || 0);
          }
        });
      }

      console.log('📊 Collection Data Summary:', {
        totalCollections: collectionsData.length,
        totalAmount: totalCollectionAmount,
        todayCollections: todayCollectionAmount,
        todayAmount: todayCollectionAmount,
        officersCount: officersData.length
      });

      setStats({
        totalOfficers: officersData.length,
        activeOfficers: officersData.filter(officer => officer.is_active || officer.isActive).length,
        totalCollections: totalCollectionAmount || 0,
        todayCollections: todayCollectionAmount || 0
      });
      
      console.log('✅ Dashboard data fetched successfully');
    } catch (error) {
      console.error('❌ Error fetching dashboard data:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        url: error.config?.url,
        method: error.config?.method
      });
      
      // Show user-friendly error message
      if (error.response?.status === 404 && error.response?.data?.message?.includes('admin access')) {
        console.error('🚫 Access denied: User needs admin privileges to view officers and collections data');
        // Set empty data to prevent crashes
        setOfficers([]);
        setDailyCollections([]);
        setStats({
          totalOfficers: 0,
          activeOfficers: 0,
          totalCollections: 0,
          todayCollections: 0
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Helper functions
  const getOfficerCollections = (officerId) => {
    return dailyCollections.filter(collection => collection.officer_id === officerId);
  };

  const getOfficerTotalCollection = (officerId) => {
    // Check if we have comprehensive collection data
    const officer = officers.find(o => o._id === officerId);
    if (officer && officer.comprehensive_collections) {
      // Comprehensive data structure - use all-time total
      const total = officer.comprehensive_collections.all_time.total || 0;
      console.log(`💰 Officer ${officer.name} all-time total: ₹${total.toLocaleString()}`);
      return total;
    }
    
    // Check if we have manager summary data
    if (officer && officer.collections) {
      // Manager summary data structure
      const total = officer.collections.today_total || 0;
      console.log(`💰 Officer ${officer.name} today total: ₹${total.toLocaleString()}`);
      return total;
    }
    
    // Original data structure - calculate from daily collections
    const officerCollections = getOfficerCollections(officerId);
    const total = officerCollections.reduce((sum, collection) => sum + (collection.amount || 0), 0);
    console.log(`💰 Officer ${officerId} calculated total: ₹${total.toLocaleString()} from ${officerCollections.length} collections`);
    return total;
  };

  const getOfficerTodayCollection = (officerId) => {
    // Check if we have comprehensive collection data
    const officer = officers.find(o => o._id === officerId);
    if (officer && officer.comprehensive_collections) {
      // Comprehensive data structure - use today's loan amount
      const amount = officer.comprehensive_collections.today.loan_amount || 0;
      console.log(`📅 Officer ${officer.name} today loan: ₹${amount.toLocaleString()}`);
      return amount;
    }
    
    // Check if we have manager summary data
    if (officer && officer.collections) {
      // Manager summary data structure
      const amount = officer.collections.today_loan || 0;
      console.log(`📅 Officer ${officer.name} today loan: ₹${amount.toLocaleString()}`);
      return amount;
    }
    
    // Original data structure - calculate from daily collections
    const today = new Date().toDateString();
    const officerCollections = dailyCollections.filter(collection => 
      collection.officer_id === officerId && 
      new Date(collection.collected_on).toDateString() === today
    );
    const amount = officerCollections.reduce((sum, collection) => sum + (collection.amount || 0), 0);
    console.log(`📅 Officer ${officerId} today calculated: ₹${amount.toLocaleString()} from ${officerCollections.length} collections`);
    return amount;
  };

  const getOfficerTodayPenalty = (officerId) => {
    // Check if we have comprehensive collection data
    const officer = officers.find(o => o._id === officerId);
    if (officer && officer.comprehensive_collections) {
      // Comprehensive data structure - use today's penalty amount
      const amount = officer.comprehensive_collections.today.penalty_amount || 0;
      console.log(`📅 Officer ${officer.name} today penalty: ₹${amount.toLocaleString()}`);
      return amount;
    }
    
    // Check if we have manager summary data
    if (officer && officer.collections) {
      // Manager summary data structure
      const amount = officer.collections.today_penalty || 0;
      console.log(`📅 Officer ${officer.name} today penalty: ₹${amount.toLocaleString()}`);
      return amount;
    }
    
    // Original data structure - calculate from daily collections
    const today = new Date().toDateString();
    const officerCollections = dailyCollections.filter(collection => 
      collection.officer_id === officerId && 
      new Date(collection.collected_on).toDateString() === today &&
      collection.type === 'penalty'
    );
    const amount = officerCollections.reduce((sum, collection) => sum + (collection.amount || 0), 0);
    console.log(`📅 Officer ${officerId} today penalty calculated: ₹${amount.toLocaleString()} from ${officerCollections.length} collections`);
    return amount;
  };

  const getOfficerTodaySavingCollection = (officerId) => {
    // Check if we have comprehensive collection data
    const officer = officers.find(o => o._id === officerId);
    if (officer && officer.comprehensive_collections) {
      // Comprehensive data structure - use today's saving amount
      const amount = officer.comprehensive_collections.today.saving_amount || 0;
      console.log(`📅 Officer ${officer.name} today saving: ₹${amount.toLocaleString()}`);
      return amount;
    }
    
    // Check if we have manager summary data
    if (officer && officer.collections) {
      // Manager summary data structure
      const amount = officer.collections.today_saving || 0;
      console.log(`📅 Officer ${officer.name} today saving: ₹${amount.toLocaleString()}`);
      return amount;
    }
    
    // Original data structure - calculate from daily collections
    const today = new Date().toDateString();
    const officerCollections = dailyCollections.filter(collection => 
      collection.officer_id === officerId && 
      new Date(collection.collected_on).toDateString() === today &&
      collection.type === 'saving'
    );
    const amount = officerCollections.reduce((sum, collection) => sum + (collection.amount || 0), 0);
    console.log(`📅 Officer ${officerId} today saving calculated: ₹${amount.toLocaleString()} from ${officerCollections.length} collections`);
    return amount;
  };

  const getOfficerRemainingAmount = (officerId) => {
    const totalCollection = getOfficerTotalCollection(officerId);
    const paidAmount = getOfficerPaidAmount(officerId);
    return totalCollection - paidAmount;
  };

  const getOfficerPaidAmount = (officerId) => {
    // This would need to be calculated based on your business logic
    // For now, returning 0 as placeholder
    return 0;
  };

  // Event handlers
  const handleViewOfficerDetails = (officer) => {
    setSelectedOfficer(officer);
    setShowOfficerDetails(true);
  };

  const handleAssignTo = (officer) => {
    setSelectedOfficer(officer);
    setShowAssignTo(true);
  };

  const handleStatus = (officer) => {
    setSelectedOfficer(officer);
    setShowStatus(true);
  };

  const handleBankAssignment = (officer) => {
    setSelectedOfficer(officer);
    setShowBankAssignment(true);
  };

  const handleEditAmount = (officer, field) => {
    setEditingOfficer(officer);
    setEditingField(field);
  };

  const handleSaveAmount = (officerId, field, value) => {
    // Update the officer data in the state
    setOfficers(prevOfficers => 
      prevOfficers.map(officer => 
        officer._id === officerId 
          ? { ...officer, [field]: parseFloat(value) || 0 }
          : officer
      )
    );
    
    // Here you would typically make an API call to save the changes
    console.log(`💰 Updated ${field} for officer ${officerId} to ${value}`);
    
    // Clear editing state
    setEditingOfficer(null);
    setEditingField(null);
  };

  const handleCancelEdit = () => {
    setEditingOfficer(null);
    setEditingField(null);
  };

  const handleAssignToSubmit = (officer, assignmentType) => {
    console.log(`👤 Assigning ${officer.name} to ${assignmentType}`);
    alert(`Officer ${officer.name} assigned to ${assignmentType}`);
    setShowAssignTo(false);
  };

  const handleStatusSubmit = (officer, status) => {
    console.log(`📊 Updating status for ${officer.name} to ${status}`);
    alert(`Status updated for ${officer.name} to ${status}`);
    setShowStatus(false);
  };

  const handleBankAssignmentSubmit = (officer, bank) => {
    console.log(`🏦 Assigning ${officer.name} to ${bank} bank`);
    alert(`Officer ${officer.name} assigned to ${bank} bank`);
    setShowBankAssignment(false);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-primaryBg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Manager Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <OfficerNavbar officerType="manager" officerName={officerName} pageName="Manager Dashboard" />
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="min-h-screen bg-primaryBg pt-16"
      >
        {/* Stats Cards */}
        <StatsCards stats={stats} />

        

        {/* Officer Table */}
        <OfficerTable 
          officers={officers}
          editingOfficer={editingOfficer}
          editingField={editingField}
          handleEditAmount={handleEditAmount}
          handleSaveAmount={handleSaveAmount}
          handleCancelEdit={handleCancelEdit}
          handleViewOfficerDetails={handleViewOfficerDetails}
          handleAssignTo={handleAssignTo}
          handleStatus={handleStatus}
          handleBankAssignment={handleBankAssignment}
        />

        {/* Modals */}
        <Modals 
          showOfficerDetails={showOfficerDetails}
          selectedOfficer={selectedOfficer}
          setShowOfficerDetails={setShowOfficerDetails}
          showAssignTo={showAssignTo}
          setShowAssignTo={setShowAssignTo}
          showStatus={showStatus}
          setShowStatus={setShowStatus}
          showBankAssignment={showBankAssignment}
          setShowBankAssignment={setShowBankAssignment}
          handleAssignToSubmit={handleAssignToSubmit}
          handleStatusSubmit={handleStatusSubmit}
          handleBankAssignmentSubmit={handleBankAssignmentSubmit}
          getOfficerTodayCollection={getOfficerTodayCollection}
          getOfficerTotalCollection={getOfficerTotalCollection}
          getOfficerRemainingAmount={getOfficerRemainingAmount}
        />
      </motion.div>
    </>
  );
};

export default ManagerDashboard;
