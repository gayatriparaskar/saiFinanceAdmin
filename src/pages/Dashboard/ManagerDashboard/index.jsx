import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from '../../../axios';
import OfficerNavbar from '../../../components/OfficerNavbar';
import StatsCards from './StatsCards';
import OfficerTable from './OfficerTable';
import Modals from './Modals';
import UserDataTable from '../../../componant/Dashboard/UserDataTable';
import { updateOfficerCollectionData } from '../../../services/officerService';
import { getCurrentUserInfo } from '../../../utils/authUtils';

const ManagerDashboard = () => {
  const navigate = useNavigate();
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
  const [assignedCollections, setAssignedCollections] = useState([]);
  const [showAssignedCollections, setShowAssignedCollections] = useState(false);
  const [selectedAssignedCollection, setSelectedAssignedCollection] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);

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
    fetchAssignedCollections();
  }, []);

  // Add a refresh function that can be called manually
  const refreshData = () => {
    console.log('🔄 Manual refresh triggered');
    fetchDashboardData();
    fetchAssignedCollections();
  };

  // Fetch assigned collections for review
  const fetchAssignedCollections = async () => {
    try {
      console.log('📡 Fetching assigned collections...');
      const response = await axios.get('/assignedCollections?status=pending');
      console.log('✅ Assigned collections response:', response);
      setAssignedCollections(response.data.result.assignedCollections || []);
    } catch (error) {
      console.error('❌ Error fetching assigned collections:', error);
      setAssignedCollections([]);
    }
  };

  const fetchDashboardData = async () => {
    try {
      console.log('🔄 Fetching dashboard data...');
      console.log('🔧 Axios baseURL:', axios.defaults.baseURL);
      
      // Get current user info with role-based filtering
      const userInfo = getCurrentUserInfo();
      console.log('👤 Current user info:', userInfo);
      
      // Only proceed if user is a manager or admin
      if (userInfo.role !== 'manager' && userInfo.role !== 'admin') {
        console.warn('⚠️ User is not authorized to access manager dashboard');
        setLoading(false);
        return;
      }

      // Set loading to true at the start
      setLoading(true);
      
      // Use the /officers endpoint for all users (role-based filtering handled by backend)
      console.log('📡 Fetching officers data using /officers endpoint...');
      const officersResponse = await axios.get('officers');
      console.log('✅ Officers response:', officersResponse);
      const officersData = officersResponse?.data?.result || [];
      
      // Fetch daily collections data for additional context (optional)
      let collectionsData = [];
      try {
        console.log('📡 Fetching daily collections data...');
        const collectionsResponse = await axios.get('dailyCollections');
        console.log('✅ Collections response:', collectionsResponse);
        collectionsData = collectionsResponse?.data?.result || [];
      } catch (collectionsError) {
        console.warn('⚠️ Could not fetch collections data:', collectionsError);
        // Continue without collections data - officers data is sufficient
      }
      
      console.log('📊 Setting officers data:', officersData.map(o => ({
        id: o._id,
        name: o.name,
        assignTo: o.assignTo,
        assignedToManager: o.assignedToManager,
        assignedToAccounter: o.assignedToAccounter,
        paidAmount: o.paidAmount,
        remainingAmount: o.remainingAmount,
        status: o.status,
        paymentProcess: o.paymentProcess
      })));
      
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
    // Navigate to officer info page using React Router
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
            ? { ...officer, [field]: parseFloat(value) || 0 }
            : officer
        )
      );
      
      // Clear editing state
      setEditingOfficer(null);
      setEditingField(null);
    } catch (error) {
      console.error('❌ Error updating amount:', error);
      alert('Error saving changes. Please try again.');
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
            ? { ...o, assignTo: assignmentType }
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
            ? { ...o, status: status }
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

  // Assigned Collections handlers
  const handleReviewCollection = (assignedCollection) => {
    console.log('🔄 Reviewing assigned collection:', assignedCollection);
    setSelectedAssignedCollection(assignedCollection);
    setShowReviewModal(true);
  };

  const handleApproveCollection = async (assignedCollectionId, managerNotes = '') => {
    try {
      console.log(`✅ Approving assigned collection ${assignedCollectionId}`);
      await axios.put(`/assignedCollections/${assignedCollectionId}/status`, {
        status: 'approved',
        manager_notes: managerNotes
      });
      
      alert('Collection approved successfully');
      setShowReviewModal(false);
      setSelectedAssignedCollection(null);
      fetchAssignedCollections(); // Refresh the list
    } catch (error) {
      console.error('❌ Error approving collection:', error);
      alert('Error approving collection. Please try again.');
    }
  };

  const handleRejectCollection = async (assignedCollectionId, managerNotes = '') => {
    try {
      console.log(`❌ Rejecting assigned collection ${assignedCollectionId}`);
      await axios.put(`/assignedCollections/${assignedCollectionId}/status`, {
        status: 'rejected',
        manager_notes: managerNotes
      });
      
      alert('Collection rejected');
      setShowReviewModal(false);
      setSelectedAssignedCollection(null);
      fetchAssignedCollections(); // Refresh the list
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


        {/* Assigned Collections Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="px-6 py-6"
        >
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                Collections for Review ({assignedCollections.length})
              </h2>
              <button
                onClick={() => setShowAssignedCollections(!showAssignedCollections)}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                {showAssignedCollections ? 'Hide' : 'Show'} Collections
              </button>
            </div>
            
            {showAssignedCollections && (
              <div className="space-y-4">
                {assignedCollections.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No collections pending review
                  </div>
                ) : (
                  assignedCollections.map((collection) => (
                    <div key={collection._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4 mb-2">
                            <h3 className="font-semibold text-lg text-gray-800">
                              {collection.officer_name}
                            </h3>
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                              Pending Review
                            </span>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                            <div>
                              <span className="font-medium">Collection Date:</span>
                              <p>{new Date(collection.collection_date).toLocaleDateString()}</p>
                            </div>
                            <div>
                              <span className="font-medium">Total Collections:</span>
                              <p>{collection.total_collections}</p>
                            </div>
                            <div>
                              <span className="font-medium">Total Amount:</span>
                              <p>₹{collection.total_amount.toLocaleString()}</p>
                            </div>
                            <div>
                              <span className="font-medium">Assigned On:</span>
                              <p>{new Date(collection.assigned_date).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="mt-2 text-sm text-gray-600">
                            <span className="font-medium">Loan Collections:</span> {collection.loan_collections.length} 
                            <span className="ml-4 font-medium">Saving Collections:</span> {collection.saving_collections.length}
                          </div>
                        </div>
                        <div className="ml-4">
                          <button
                            onClick={() => handleReviewCollection(collection)}
                            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors mr-2"
                          >
                            Review
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </motion.div>

        {/* Officer Table */}
        <OfficerTable 
          officers={officers}
          editingOfficer={editingOfficer}
          editingField={editingField}
          handleEditAmount={handleEditAmount}
          handleSaveAmount={handleSaveAmount}
          handleCancelEdit={handleCancelEdit}
          handleViewOfficerDetails={handleViewOfficerDetails}
          onRefresh={refreshData}
        />

        {/* User Data Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="px-6 py-6"
        >
          <UserDataTable userType="all" />
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
            <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-800">
                  Review Collection - {selectedAssignedCollection.officer_name}
                </h3>
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Collection Summary */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Collection Summary</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Collection Date:</span>
                      <p>{new Date(selectedAssignedCollection.collection_date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="font-medium">Total Collections:</span>
                      <p>{selectedAssignedCollection.total_collections}</p>
                    </div>
                    <div>
                      <span className="font-medium">Total Amount:</span>
                      <p>₹{selectedAssignedCollection.total_amount.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="font-medium">Assigned On:</span>
                      <p>{new Date(selectedAssignedCollection.assigned_date).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                {/* Loan Collections */}
                {selectedAssignedCollection.loan_collections.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Loan Collections ({selectedAssignedCollection.loan_collections.length})</h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-full table-auto">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="px-4 py-2 text-left">User Name</th>
                            <th className="px-4 py-2 text-left">Amount</th>
                            <th className="px-4 py-2 text-left">Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedAssignedCollection.loan_collections.map((collection, index) => (
                            <tr key={index} className="border-b">
                              <td className="px-4 py-2">{collection.user_name}</td>
                              <td className="px-4 py-2">₹{collection.amount.toLocaleString()}</td>
                              <td className="px-4 py-2">{new Date(collection.created_on).toLocaleDateString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Saving Collections */}
                {selectedAssignedCollection.saving_collections.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Saving Collections ({selectedAssignedCollection.saving_collections.length})</h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-full table-auto">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="px-4 py-2 text-left">User Name</th>
                            <th className="px-4 py-2 text-left">Amount</th>
                            <th className="px-4 py-2 text-left">Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedAssignedCollection.saving_collections.map((collection, index) => (
                            <tr key={index} className="border-b">
                              <td className="px-4 py-2">{collection.user_name}</td>
                              <td className="px-4 py-2">₹{collection.amount.toLocaleString()}</td>
                              <td className="px-4 py-2">{new Date(collection.created_on).toLocaleDateString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Manager Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Manager Notes (Optional)
                  </label>
                  <textarea
                    id="managerNotes"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Add any notes about this collection..."
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => setShowReviewModal(false)}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      const notes = document.getElementById('managerNotes').value;
                      handleRejectCollection(selectedAssignedCollection._id, notes);
                    }}
                    className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => {
                      const notes = document.getElementById('managerNotes').value;
                      handleApproveCollection(selectedAssignedCollection._id, notes);
                    }}
                    className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                  >
                    Approve
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </>
  );
};

export default ManagerDashboard;
