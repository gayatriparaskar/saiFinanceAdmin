import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Routes, Route, useLocation } from 'react-router-dom';
import { useLocalTranslation } from '../../hooks/useLocalTranslation';
import OfficerNavbar from '../../components/OfficerNavbar';
import { useDashboardData } from '../../hooks/useDashboardData';
import { useOfficerManagement } from '../../hooks/useOfficerManagement';
import { useOverdueCollections } from '../../hooks/useOverdueCollections';
import { updateOfficerCollectionData } from '../../services/officerService';
import { getCurrentUserInfo } from '../../utils/authUtils';
import DashRoute from './route/DashRoute';

// Import new components
import StatsCards from '../../componant/Dashboard/StatsCards';
import CollectionBreakdown from '../../componant/Dashboard/CollectionBreakdown';
import OfficerTable from '../../componant/Dashboard/OfficerTable';
import UserDataTable from '../../componant/Dashboard/UserDataTable';
import QuickActions from '../../componant/Dashboard/QuickActions';
import OverdueCollections from '../../componant/Dashboard/OverdueCollections';
import AssignModal from '../../componant/Dashboard/AssignModal';
import StatusModal from '../../componant/Dashboard/StatusModal';
import DetailsModal from '../../componant/Dashboard/DetailsModal';

function AccounterDashboard() {
  const { t } = useLocalTranslation();
  const location = useLocation();
  const [officerName, setOfficerName] = useState('');
  const [userInfo, setUserInfo] = useState(null);
  
  // Use custom hooks for data and state management
  const { 
    loading, 
    stats, 
    collectionData, 
    officerCollections, 
    officers, 
    error, 
    refetch 
  } = useDashboardData();
  
  const {
    editingOfficer,
    editingData,
    selectedOfficer,
    showAssignModal,
    showStatusModal,
    showDetailsModal,
    setEditingData,
    setShowAssignModal,
    setShowStatusModal,
    setShowDetailsModal,
    handleEditClick,
    handleSaveEdit,
    handleCancelEdit,
    handleAssignToClick,
    handleStatusClick,
    handleViewDetails,
    handleAssignTo,
    handleStatusUpdate,
    closeModals
  } = useOfficerManagement();

  // Use overdue collections hook
  const {
    overdueLoans,
    loading: overdueLoading,
    error: overdueError,
    refetch: refetchOverdue,
    getDaysOverdueColor,
    getPenaltyAmount,
    totalOverdueAmount,
    totalPenalties
  } = useOverdueCollections();

  useEffect(() => {
    // Get current user info and check role
    const currentUserInfo = getCurrentUserInfo();
    setUserInfo(currentUserInfo);
    
    // Get officer name from localStorage
    const storedOfficerName = localStorage.getItem('officerName') || 'Accounter';
    setOfficerName(storedOfficerName);
    
    // Check if user is accounter
    if (currentUserInfo.role !== 'accounter') {
      console.warn('⚠️ User is not an accounter, cannot access accounter dashboard');
    }
  }, []);

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

  // Handler for quick actions
  const handleQuickAction = (actionId) => {
    console.log('Quick action clicked:', actionId);
    
    switch (actionId) {
      case 'export-data':
        // Export current dashboard data to CSV
        console.log('Exporting data...');
        exportDashboardData();
        break;
        
      case 'monthly-report':
        // Generate and download monthly report
        console.log('Generating monthly report...');
        generateMonthlyReport();
        break;
        
      case 'overdue-collections':
        // Navigate to overdue loans page
        console.log('Opening overdue collections...');
        window.location.href = '/dash/overdue-loans';
        break;
        
      case 'officer-performance':
        // Navigate to officer performance analysis
        console.log('Opening officer performance...');
        // Navigate to officer performance page or show detailed analysis
        window.location.href = '/dash/officer-performance';
        break;
        
      default:
        console.log('Unknown action:', actionId);
    }
  };

  // Export dashboard data function
  const exportDashboardData = () => {
    try {
      // Create CSV data from current dashboard data
      const csvData = [
        ['Date', 'Total Collection', 'Loan Collections', 'Saving Collections', 'Officers Count'],
        [
          new Date().toLocaleDateString(),
          collectionData.today?.grandTotal || 0,
          collectionData.today?.loan?.amount || 0,
          collectionData.today?.saving?.net || 0,
          officers.length
        ]
      ];
      
      // Convert to CSV string
      const csvString = csvData.map(row => row.join(',')).join('\n');
      
      // Create and download file
      const blob = new Blob([csvString], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `accounter-dashboard-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      console.log('Dashboard data exported successfully');
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  // Generate monthly report function
  const generateMonthlyReport = () => {
    try {
      // Create a comprehensive monthly report
      const reportData = {
        month: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        totalCollections: collectionData.monthly?.totalAmount || 0,
        totalTransactions: collectionData.monthly?.totalCount || 0,
        officersCount: officers.length,
        averageCollectionPerOfficer: officers.length > 0 ? (collectionData.monthly?.totalAmount || 0) / officers.length : 0,
        topPerformingOfficer: officers.length > 0 ? officers.reduce((prev, current) => 
          (prev.totalCollection || 0) > (current.totalCollection || 0) ? prev : current
        ) : null
      };
      
      // Create report content
      const reportContent = `
MONTHLY COLLECTION REPORT
========================
Month: ${reportData.month}
Total Collections: ₹${reportData.totalCollections.toLocaleString()}
Total Transactions: ${reportData.totalTransactions}
Active Officers: ${reportData.officersCount}
Average Collection per Officer: ₹${reportData.averageCollectionPerOfficer.toLocaleString()}
${reportData.topPerformingOfficer ? `Top Performing Officer: ${reportData.topPerformingOfficer.officer_name}` : ''}

Generated on: ${new Date().toLocaleString()}
      `;
      
      // Create and download report
      const blob = new Blob([reportContent], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `monthly-report-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      console.log('Monthly report generated successfully');
    } catch (error) {
      console.error('Error generating monthly report:', error);
    }
  };

  // Enhanced handlers that work with the custom hook
  const handleSaveEditWithFeedback = async (officerId) => {
    const result = await handleSaveEdit(officerId, officers, () => {});
    if (!result.success) {
      alert(result.error);
    }
  };

  const handleAssignToWithFeedback = async (assignment) => {
    const result = await handleAssignTo(assignment, officers, () => {});
    if (!result.success) {
      alert(result.error);
    }
  };

  const handleStatusUpdateWithFeedback = async (status) => {
    const result = await handleStatusUpdate(status, officers, () => {});
    if (!result.success) {
      alert(result.error);
    }
  };

  // Custom view details handler for accounter dashboard
  const handleAccounterViewDetails = (officer) => {
    console.log('🔄 AccounterDashboard - View Details clicked for officer:', officer);
    // Redirect to officer info page within accounter dashboard
    window.location.href = `/accounter-dashboard/view-officer/${officer._id}`;
  };

  const handlePaymentProcess = async (officer, paymentProcess) => {
    try {
      console.log(`🔄 Updating payment process for ${officer.officer_name} to ${paymentProcess}`);
      
      // Use the new service function
      const updatedOfficer = await updateOfficerCollectionData(officer._id, {
        paymentProcess: paymentProcess
      });

      console.log('✅ Payment process updated successfully:', updatedOfficer);
      
      // Update local state
      // Note: This would need to be handled by the parent component's state management
      alert(`Payment process updated for ${officer.name} to ${paymentProcess}`);
    } catch (error) {
      console.error('❌ Error updating payment process:', error);
      alert('Error updating payment process. Please try again.');
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

  if (error) {
    return (
      <div className="min-h-screen bg-primaryBg flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={refetch}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primaryDark transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const currentPath = location.pathname;

  // If we're on a specific route (like daily-report or weekly-report), show the routed content
  if (currentPath.includes('/daily-report') || currentPath.includes('/weekly-report') || 
      currentPath.includes('/loan-account') || currentPath.includes('/saving-account') || 
      currentPath.includes('/overdue-loans') || currentPath.includes('/view-officer/')) {
    return (
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="min-h-screen bg-primaryBg"
      >
        <DashRoute />
      </motion.div>
    );
  }

  // Default dashboard view
  return (
    <>
      <OfficerNavbar officerType="accounter" officerName={officerName} pageName="Accounter Dashboard" />
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="min-h-screen bg-primaryBg pt-16"
      >

        {/* Stats Cards */}
        <motion.div 
          variants={itemVariants}
          className="px-6 py-6"
        >
          <StatsCards 
            stats={stats} 
            collectionData={collectionData} 
            loading={loading} 
          />
        </motion.div>


        {/* Collection Breakdown Section */}
        <motion.div 
          variants={itemVariants}
          className="px-6 py-6"
        >
          <CollectionBreakdown 
            collectionData={collectionData} 
            loading={loading} 
          />
        </motion.div>

        {/* Overdue Collections Section - Only show if there are overdue loans */}
        {overdueLoans.length > 0 && (
          <motion.div 
            variants={itemVariants}
            className="px-6 py-6"
          >
            <OverdueCollections 
              overdueLoans={overdueLoans}
              loading={overdueLoading}
              error={overdueError}
              getDaysOverdueColor={getDaysOverdueColor}
              getPenaltyAmount={getPenaltyAmount}
              totalOverdueAmount={totalOverdueAmount}
              totalPenalties={totalPenalties}
            />
          </motion.div>
        )}



        {/* Officer Table */}
        <motion.div 
          variants={itemVariants}
          className="px-6 py-6"
        >
          <OfficerTable 
            officers={officers}
            loading={loading}
            onAssignToClick={handleAssignToClick}
            onStatusClick={handleStatusClick}
            onViewDetails={handleAccounterViewDetails}
            onPaymentProcess={handlePaymentProcess}
            // onRefresh={refreshData}
          />
        </motion.div>

        {/* User Data Table */}
        <motion.div 
          variants={itemVariants}
          className="px-6 py-6"
        >
          <UserDataTable userType="all"  />
        </motion.div>

        {/* Quick Actions */}
        <motion.div 
          variants={itemVariants}
          className="px-6 py-6"
        >
          <QuickActions onActionClick={handleQuickAction} />
        </motion.div>

        {/* Modals */}
        <AssignModal 
          isOpen={showAssignModal}
          onClose={() => setShowAssignModal(false)}
          selectedOfficer={selectedOfficer}
          onAssignTo={handleAssignToWithFeedback}
        />

        <StatusModal 
          isOpen={showStatusModal}
          onClose={() => setShowStatusModal(false)}
          selectedOfficer={selectedOfficer}
          onStatusUpdate={handleStatusUpdateWithFeedback}
        />

        <DetailsModal 
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          selectedOfficer={selectedOfficer}
        />
      </motion.div>
    </>
  );
}

export default AccounterDashboard;
