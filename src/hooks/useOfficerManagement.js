import { useState } from 'react';
import axios from '../axios';

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
    setEditingOfficer(officer.officer_id);
    setEditingData({
      paidAmount: officer.paidAmount || 0,
      remainingAmount: officer.remainingAmount || 0
    });
  };

  const handleSaveEdit = async (officerId, officers, setOfficers) => {
    try {
      console.log('🔄 Saving edit for officer:', officerId, editingData);
      
      // Call backend API to save the data
      const response = await axios.put(`officers/${officerId}/collection-data`, {
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
        return { success: true };
      } else {
        console.error('❌ Failed to save edit:', response.data);
        return { success: false, error: 'Failed to save changes. Please try again.' };
      }
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
    setSelectedOfficer(officer);
    setShowDetailsModal(true);
  };

  const handleAssignTo = async (assignment, officers, setOfficers) => {
    if (selectedOfficer) {
      try {
        console.log('🔄 Assigning officer to:', assignment);
        
        // Call backend API to save the assignment
        const response = await axios.put(`officers/${selectedOfficer.officer_id}/collection-data`, {
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
          return { success: true };
        } else {
          console.error('❌ Failed to save assignment:', response.data);
          return { success: false, error: 'Failed to save assignment. Please try again.' };
        }
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
        
        // Call backend API to save the status
        const response = await axios.put(`officers/${selectedOfficer.officer_id}/collection-data`, {
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
          return { success: true };
        } else {
          console.error('❌ Failed to update status:', response.data);
          return { success: false, error: 'Failed to update status. Please try again.' };
        }
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
