import { useState } from 'react';
import axios from '../axios';
import { updateOfficerCollectionData } from '../services/officerService';

export const useOfficerManagement = () => {
  const [editingOfficer, setEditingOfficer] = useState(null);
  const [editingData, setEditingData] = useState({
    paidAmount: 0,
    remainingAmount: 0
  });
  const [selectedOfficer, setSelectedOfficer] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const handleEditClick = (officer) => {
    setEditingOfficer(officer._id);
    setEditingData({
      paidAmount: officer.paidAmount || 0,
      remainingAmount: officer.remainingAmount || 0
    });
  };

  const handleSaveEdit = async (officerId, officers, setOfficers) => {
    try {
      console.log('🔄 Saving edit for officer:', officerId, editingData);
      
      // Use the new service function
      const updatedOfficer = await updateOfficerCollectionData(officerId, {
        paidAmount: editingData.paidAmount,
        remainingAmount: editingData.remainingAmount
      });

      console.log('✅ Edit saved successfully:', updatedOfficer);
      
      // Update local state
      setOfficers(prev => prev.map(officer => 
        officer._id === officerId 
          ? { ...officer, ...editingData }
          : officer
      ));
      
      setEditingOfficer(null);
      setEditingData({ paidAmount: 0, remainingAmount: 0 });
      return { success: true };
    } catch (error) {
      console.error('❌ Error saving edit:', error);
      return { success: false, error: 'Error saving changes. Please try again.' };
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
    console.log('🔄 AccounterDashboard - View Details clicked for officer:', officer);
    // Redirect to officer info page
    window.location.href = `/manager-dashboard/view-officer/${officer._id}`;
  };

  const handleAssignTo = async (assignment, officers, setOfficers) => {
    if (selectedOfficer) {
      try {
        console.log('🔄 Assigning officer to:', assignment);
        
        // Use the new service function
        const updatedOfficer = await updateOfficerCollectionData(selectedOfficer._id, {
          assignTo: assignment
        });

        console.log('✅ Assignment saved successfully:', updatedOfficer);
        
        // Update local state
        setOfficers(prev => prev.map(officer => 
          officer._id === selectedOfficer._id 
            ? { ...officer, assignTo: assignment }
            : officer
        ));
        
        setShowAssignModal(false);
        setSelectedOfficer(null);
        return { success: true };
      } catch (error) {
        console.error('❌ Error saving assignment:', error);
        return { success: false, error: 'Error saving assignment. Please try again.' };
      }
    }
  };

  const handleStatusUpdate = async (status, officers, setOfficers) => {
    if (selectedOfficer) {
      try {
        console.log('🔄 Updating status to:', status);
        
        // Use the new service function
        const updatedOfficer = await updateOfficerCollectionData(selectedOfficer._id, {
          status: status
        });

        console.log('✅ Status updated successfully:', updatedOfficer);
        
        // Update local state
        setOfficers(prev => prev.map(officer => 
          officer._id === selectedOfficer._id 
            ? { ...officer, status: status }
            : officer
        ));
        
        setShowStatusModal(false);
        setSelectedOfficer(null);
        return { success: true };
      } catch (error) {
        console.error('❌ Error updating status:', error);
        return { success: false, error: 'Error updating status. Please try again.' };
      }
    }
  };

  const closeModals = () => {
    setShowAssignModal(false);
    setShowStatusModal(false);
    setShowDetailsModal(false);
    setSelectedOfficer(null);
  };

  return {
    // State
    editingOfficer,
    editingData,
    selectedOfficer,
    showAssignModal,
    showStatusModal,
    showDetailsModal,
    
    // Setters
    setEditingData,
    setShowAssignModal,
    setShowStatusModal,
    setShowDetailsModal,
    
    // Handlers
    handleEditClick,
    handleSaveEdit,
    handleCancelEdit,
    handleAssignToClick,
    handleStatusClick,
    handleViewDetails,
    handleAssignTo,
    handleStatusUpdate,
    closeModals
  };
};
