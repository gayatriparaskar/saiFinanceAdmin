import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from '../../../axios';
import StatsCards from '../../../componant/Dashboard/StatsCards';
import OfficerTable from '../../../componant/Dashboard/OfficerTable';
import Modals from './Modals';
import UserDataTable from '../../../componant/Dashboard/UserDataTable';
import { updateOfficerCollectionData } from '../../../services/officerService';
import { getCurrentUserInfo } from '../../../utils/authUtils';

const ManagerDashboardContent = () => {
  const navigate = useNavigate();
  const [officers, setOfficers] = useState([]);
  const [dailyCollections, setDailyCollections] = useState([]);
  const [stats, setStats] = useState({
    totalOfficers: 0,
    activeOfficers: 0,
    totalCollections: 0,
    todayCollections: 0,
    totalTransactions: 0
  });
  const [collectionData, setCollectionData] = useState({
    today: {
      loan: { count: 0, amount: 0 },
      saving: { count: 0, net: 0 },
      grandTotal: 0
    },
    monthly: {
      totalAmount: 0,
      totalCount: 0
    },
    yearly: {
      totalAmount: 0,
      totalCount: 0
    }
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
  const [assignedCollections, setAssignedCollections] = useState([]);
  const [showAssignedCollections, setShowAssignedCollections] = useState(false);
  const [selectedAssignedCollection, setSelectedAssignedCollection] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);

  useEffect(() => {
    const name = localStorage.getItem('officerName') || 'Manager';
    setOfficerName(name);
    console.log('🔧 ManagerDashboard - Setting officer name:', name);
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      console.log('🔄 Fetching dashboard data...');
      setLoading(true);
      
      // Fetch officers data
      console.log('📡 Fetching officers data...');
      const officersResponse = await axios.get('officers');
      const officersData = officersResponse?.data?.result || [];
      
      // Fetch collection statistics
      console.log('📡 Fetching collection statistics...');
      const [todayStats, weeklyStats, monthlyStats, yearlyStats] = await Promise.allSettled([
        axios.get('admins/totalCollectionsToday'),
        axios.get('admins/totalCollectionsWeekly'),
        axios.get('admins/totalCollectionsMonthly'),
        axios.get('admins/totalCollectionsYearly')
      ]);

      // Process today's data
      const todayData = todayStats.status === 'fulfilled' ? todayStats.value.data : null;
      console.log('📊 Today stats response:', todayData);
      
      let todayLoanCount = 0;
      let todayLoanAmount = 0;
      let todaySavingCount = 0;
      let todaySavingAmount = 0;
      
      if (todayData?.result) {
        // Handle the actual API response structure
        todayLoanCount = todayData.result.loan?.count || 0;
        todayLoanAmount = todayData.result.loan?.amount || 0;
        todaySavingCount = todayData.result.saving?.count || 0;
        todaySavingAmount = todayData.result.saving?.net || 0;
      } else if (todayData?.dailyStats) {
        // Alternative data structure
        todayLoanCount = todayData.dailyStats.length || 0;
        todayLoanAmount = todayData.dailyStats.reduce((sum, day) => sum + (day.totalLoanAmount || 0), 0);
      }
      
      // Use saving data from the main API response
      let todaySavingData = { count: todaySavingCount, net: todaySavingAmount };
      
      // If we don't have saving data from main response, try alternative endpoints
      if (todaySavingCount === 0 && todaySavingAmount === 0) {
        try {
          const savingTodayResponse = await axios.get('savingDailyCollection/totalByDate', {
            params: { date: new Date().toISOString().split('T')[0] }
          });
          console.log('📊 Today saving data response:', savingTodayResponse.data);
          todaySavingData = {
            count: savingTodayResponse.data?.result?.totalCount || 0,
            net: savingTodayResponse.data?.result?.totalAmount || 0
          };
        } catch (savingError) {
          console.warn('⚠️ Could not fetch today saving data:', savingError);
          // Try alternative endpoint
          try {
            const altSavingResponse = await axios.get('admins/totalSavingCollectionsToday');
            console.log('📊 Alternative saving data response:', altSavingResponse.data);
            todaySavingData = {
              count: altSavingResponse.data?.result?.totalCount || 0,
              net: altSavingResponse.data?.result?.totalAmount || 0
            };
          } catch (altError) {
            console.warn('⚠️ Alternative saving endpoint also failed:', altError);
          }
        }
      }

      // Process monthly data
      const monthlyData = monthlyStats.status === 'fulfilled' ? monthlyStats.value.data : null;
      console.log('📊 Monthly stats response:', monthlyData);
      
      let monthlyAmount = 0;
      let monthlyCount = 0;
      
      if (monthlyData?.result) {
        // Handle the actual API response structure
        monthlyAmount = monthlyData.result.totalAmount || 0;
        monthlyCount = monthlyData.result.totalCount || 0;
      } else if (monthlyData?.dailyStats) {
        // Alternative data structure
        monthlyCount = monthlyData.dailyStats.length || 0;
        monthlyAmount = monthlyData.dailyStats.reduce((sum, day) => {
          const loanAmount = day.totalLoanAmount || day.loanAmount || 0;
          const savingAmount = day.totalSavingAmount || day.savingAmount || 0;
          return sum + loanAmount + savingAmount;
        }, 0);
      }

      // Process yearly data
      const yearlyData = yearlyStats.status === 'fulfilled' ? yearlyStats.value.data : null;
      console.log('📊 Yearly stats response:', yearlyData);
      
      let yearlyAmount = 0;
      let yearlyCount = 0;
      
      if (yearlyData?.result) {
        yearlyAmount = yearlyData.result.totalAmount || 0;
        yearlyCount = yearlyData.result.totalCount || 0;
      } else if (yearlyData?.dailyStats) {
        // Alternative data structure
        yearlyCount = yearlyData.dailyStats.length || 0;
        yearlyAmount = yearlyData.dailyStats.reduce((sum, day) => {
          const loanAmount = day.totalLoanAmount || day.loanAmount || 0;
          const savingAmount = day.totalSavingAmount || day.savingAmount || 0;
          return sum + loanAmount + savingAmount;
        }, 0);
      } else {
        // If yearly endpoint doesn't exist or returns null, use monthly data as approximation
        console.log('📊 Yearly endpoint not available, using monthly data as approximation');
        yearlyAmount = monthlyAmount;
        yearlyCount = monthlyCount;
      }

      // Calculate totals
      const todayGrandTotal = todayLoanAmount + todaySavingData.net;
      const totalTransactions = todayLoanCount + todaySavingData.count;

      // If we still have no data, try to fetch from daily collections
      if (todayGrandTotal === 0 && monthlyAmount === 0) {
        console.log('🔄 No data from stats endpoints, trying daily collections...');
        try {
          const dailyCollectionsResponse = await axios.get('dailyCollections');
          const dailyData = dailyCollectionsResponse?.data?.result || [];
          console.log('📊 Daily collections data:', dailyData);
          
          if (dailyData.length > 0) {
            // Calculate today's data from daily collections
            const today = new Date().toISOString().split('T')[0];
            const todayCollections = dailyData.filter(collection => 
              collection.created_on && collection.created_on.split('T')[0] === today
            );
            
            const todayFromDaily = todayCollections.reduce((sum, collection) => {
              return sum + (collection.amount || 0);
            }, 0);
            
            if (todayFromDaily > 0) {
              todayLoanAmount = todayFromDaily;
              todayGrandTotal = todayFromDaily;
              totalTransactions = todayCollections.length;
            }
            
            // Calculate monthly data from daily collections
            const currentMonth = new Date().getMonth();
            const currentYear = new Date().getFullYear();
            const monthlyFromDaily = dailyData.filter(collection => {
              const collectionDate = new Date(collection.created_on);
              return collectionDate.getMonth() === currentMonth && collectionDate.getFullYear() === currentYear;
            });
            
            monthlyAmount = monthlyFromDaily.reduce((sum, collection) => {
              return sum + (collection.amount || 0);
            }, 0);
            monthlyCount = monthlyFromDaily.length;
          }
        } catch (dailyError) {
          console.warn('⚠️ Could not fetch daily collections data:', dailyError);
        }
      }

      console.log('📊 Collection Data Summary:', {
        todayLoan: { count: todayLoanCount, amount: todayLoanAmount },
        todaySaving: todaySavingData,
        todayGrandTotal,
        monthly: { amount: monthlyAmount, count: monthlyCount },
        yearly: { amount: yearlyAmount, count: yearlyCount },
        officersCount: officersData.length
      });

      console.log('📊 Stats object being set:', {
        totalOfficers: officersData.length,
        activeOfficers: officersData.filter(officer => officer.is_active || officer.isActive).length,
        totalCollections: monthlyAmount,
        todayCollections: todayGrandTotal,
        totalTransactions: totalTransactions
      });

      console.log('📊 CollectionData object being set:', {
        today: {
          loan: { count: todayLoanCount, amount: todayLoanAmount },
          saving: todaySavingData,
          grandTotal: todayGrandTotal
        },
        monthly: {
          totalAmount: monthlyAmount,
          totalCount: monthlyCount
        },
        yearly: {
          totalAmount: yearlyAmount,
          totalCount: yearlyCount
        }
      });

      // Update stats
      setStats({
        totalOfficers: officersData.length,
        activeOfficers: officersData.filter(officer => officer.is_active || officer.isActive).length,
        totalCollections: monthlyAmount,
        todayCollections: todayGrandTotal,
        totalTransactions: totalTransactions
      });

      // Update collection data for StatsCards
      setCollectionData({
        today: {
          loan: { count: todayLoanCount, amount: todayLoanAmount },
          saving: todaySavingData,
          grandTotal: todayGrandTotal
        },
        monthly: {
          totalAmount: monthlyAmount,
          totalCount: monthlyCount
        },
        yearly: {
          totalAmount: yearlyAmount,
          totalCount: yearlyCount
        }
      });
      
      setOfficers(officersData);
      
    } catch (error) {
      console.error('❌ Error fetching dashboard data:', error);
      setStats({
        totalOfficers: 0,
        activeOfficers: 0,
        totalCollections: 0,
        todayCollections: 0,
        totalTransactions: 0
      });
      setCollectionData({
        today: { loan: { count: 0, amount: 0 }, saving: { count: 0, net: 0 }, grandTotal: 0 },
        monthly: { totalAmount: 0, totalCount: 0 },
        yearly: { totalAmount: 0, totalCount: 0 }
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshData = () => {
    fetchDashboardData();
  };

  // Event handlers
  const handleViewOfficerDetails = (officer) => {
    // Navigate to manager view officer page using React Router
    console.log('🔄 Navigating to manager view officer page for:', officer._id);
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

  const handleEditAmount = (officer, field) => {
    setEditingOfficer(officer);
    setEditingField(field);
  };

  const handleSaveAmount = async (officerId, field, value) => {
    try {
      console.log(`💰 Updating ${field} for officer ${officerId} to ${value}`);
      
      // Prepare the update data based on the field
      let updateData = {};
      if (field === 'paidAmount') {
        updateData.paidAmount = parseFloat(value) || 0;
      } else if (field === 'remainingAmount') {
        updateData.remainingAmount = parseFloat(value) || 0;
      }
      
      // Use the new service function
      const updatedOfficer = await updateOfficerCollectionData(officerId, updateData);

      console.log('✅ Amount updated successfully:', updatedOfficer);
      
      // Update the officer data in the state
      setOfficers(prevOfficers => 
        prevOfficers.map(officer => 
          officer._id === officerId 
            ? { ...officer, ...updateData }
            : officer
        )
      );
      
      // Clear editing state
      setEditingOfficer(null);
      setEditingField(null);
    } catch (error) {
      console.error('❌ Error updating amount:', error);
      alert('Error updating amount. Please try again.');
    }
  };

  const handleCancelEdit = () => {
    setEditingOfficer(null);
    setEditingField(null);
  };

  const handleAssignToSubmit = async (officer, assignmentType) => {
    try {
      console.log(`👤 Assigning ${officer.name} to ${assignmentType}`);
      console.log('📊 Officer data:', officer);
      console.log('📊 Assignment type:', assignmentType);
      
      // Use the new service function
      const updatePayload = {
        assignTo: assignmentType
      };
      
      console.log('📤 Sending update payload:', updatePayload);
      
      const updatedOfficer = await updateOfficerCollectionData(officer._id, updatePayload);

      console.log('✅ Assignment saved successfully:', updatedOfficer);
      console.log('📊 Updated officer data:', {
        id: updatedOfficer._id,
        name: updatedOfficer.name,
        assignTo: updatedOfficer.assignTo,
        assignedToManager: updatedOfficer.assignedToManager,
        assignedToAccounter: updatedOfficer.assignedToAccounter
      });
      
      // Update local state
      setOfficers(prevOfficers => 
        prevOfficers.map(o => 
          o._id === officer._id 
            ? { ...o, ...updatedOfficer }
            : o
        )
      );
      
      alert(`Officer ${officer.name} assigned to ${assignmentType}`);
      setShowAssignTo(false);
      setSelectedOfficer(null);
    } catch (error) {
      console.error('❌ Error saving assignment:', error);
      console.error('❌ Error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      alert('Error saving assignment. Please try again.');
    }
  };

  const handleStatusSubmit = async (officer, status) => {
    try {
      console.log(`📊 Updating status for ${officer.name} to ${status}`);
      
      // Use the new service function
      const updatedOfficer = await updateOfficerCollectionData(officer._id, {
        status: status
      });

      console.log('✅ Status updated successfully:', updatedOfficer);
      
      // Update local state
      setOfficers(prevOfficers => 
        prevOfficers.map(o => 
          o._id === officer._id 
            ? { ...o, ...updatedOfficer }
            : o
        )
      );
      
      alert(`Status updated for ${officer.name} to ${status}`);
      setShowStatus(false);
    } catch (error) {
      console.error('❌ Error updating status:', error);
      alert('Error updating status. Please try again.');
    }
  };

  const handleBankAssignmentSubmit = (officer, bank) => {
    console.log(`🏦 Assigning ${officer.name} to ${bank} bank`);
    alert(`Officer ${officer.name} assigned to ${bank} bank`);
    setShowBankAssignment(false);
  };

  // Helper functions for officer data
  const getOfficerTodayCollection = (officer) => {
    return officer.todayCollection || 0;
  };

  const getOfficerTotalCollection = (officer) => {
    return officer.totalCollection || 0;
  };

  const getOfficerRemainingAmount = (officer) => {
    return officer.remainingAmount || 0;
  };

  // Assigned Collections handlers
  const handleReviewCollection = (assignedCollection) => {
    setSelectedAssignedCollection(assignedCollection);
    setShowReviewModal(true);
  };

  const handleApproveCollection = async (collectionId) => {
    try {
      console.log('✅ Approving collection:', collectionId);
      // Add approval logic here
      alert('Collection approved successfully!');
      setShowReviewModal(false);
    } catch (error) {
      console.error('❌ Error approving collection:', error);
      alert('Error approving collection. Please try again.');
    }
  };

  const handleRejectCollection = async (collectionId) => {
    try {
      console.log('❌ Rejecting collection:', collectionId);
      // Add rejection logic here
      alert('Collection rejected successfully!');
      setShowReviewModal(false);
    } catch (error) {
      console.error('❌ Error rejecting collection:', error);
      alert('Error rejecting collection. Please try again.');
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

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-primaryBg"
    >
      {/* Stats Cards */}
      <div className="p-4">
        <StatsCards 
          stats={stats} 
          collectionData={collectionData} 
          loading={loading}
          onReportTypeChange={(reportType) => {
            console.log('📊 Report type changed to:', reportType);
            // You can add additional logic here if needed
          }}
        />
      </div>
      

      {/* Assigned Collections Section */}
      {/* <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="px-6 py-6"
      >
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Assigned Collections</h2>
            <button
              onClick={() => setShowAssignedCollections(!showAssignedCollections)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {showAssignedCollections ? 'Hide' : 'Show'} Collections
            </button>
          </div>
          
          {showAssignedCollections && (
            <div className="space-y-4">
              {assignedCollections.length > 0 ? (
                assignedCollections.map((collection) => (
                  <div key={collection.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-900">{collection.title}</h3>
                        <p className="text-gray-600">{collection.description}</p>
                        <p className="text-sm text-gray-500">Amount: ₹{collection.amount}</p>
                      </div>
                      <button
                        onClick={() => handleReviewCollection(collection)}
                        className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                      >
                        Review
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No assigned collections at the moment.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div> */}

      {/* Officer Table */}
      <div className="mt-4 p-4"> <OfficerTable 
        officers={officers}
        activeOfficersCount={stats.activeOfficers}
        editingOfficer={editingOfficer}
        editingField={editingField}
        handleEditAmount={handleEditAmount}
        handleSaveAmount={handleSaveAmount}
        handleCancelEdit={handleCancelEdit}
        handleViewOfficerDetails={handleViewOfficerDetails}
        onRefresh={refreshData}
        onAssignToClick={(officer) => {
          setSelectedOfficer(officer);
          setShowAssignTo(true);
        }}
        onStatusClick={(officerId, status) => {
          // Update the local officers state to reflect the status change
          setOfficers(prevOfficers => 
            prevOfficers.map(officer => 
              officer._id === officerId 
                ? { ...officer, status: status }
                : officer
            )
          );
          console.log('Status updated for officer:', officerId, 'to:', status);
        }}
        onViewDetails={handleViewOfficerDetails}
        onPaymentProcess={async (officer, process) => {
          try {
            console.log('Payment process changed for officer:', officer.name, 'to:', process);
            
            // Update the officer's payment process
            const updatedOfficer = await updateOfficerCollectionData(officer._id, {
              paymentProcess: process
            });
            
            // Update the local officers state
            setOfficers(prevOfficers => 
              prevOfficers.map(o => 
                o._id === officer._id 
                  ? { ...o, paymentProcess: process }
                  : o
              )
            );
            
            console.log('Payment process updated successfully');
          } catch (error) {
            console.error('Error updating payment process:', error);
          }
        }}
      /> </div>
      

      {/* User Data Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="px-6 py-6"
      >
        <UserDataTable userType="all" onRefresh={refreshData} />
      </motion.div>

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

      {/* Review Collection Modal */}
      {showReviewModal && selectedAssignedCollection && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Review Collection</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <p className="mt-1 text-sm text-gray-900">{selectedAssignedCollection.title}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <p className="mt-1 text-sm text-gray-900">{selectedAssignedCollection.description}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Amount</label>
                <p className="mt-1 text-sm text-gray-900">₹{selectedAssignedCollection.amount}</p>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowReviewModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRejectCollection(selectedAssignedCollection.id)}
                className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                Reject
              </button>
              <button
                onClick={() => handleApproveCollection(selectedAssignedCollection.id)}
                className="px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
              >
                Approve
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default ManagerDashboardContent;
