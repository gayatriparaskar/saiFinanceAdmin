import React from 'react';
import { motion } from 'framer-motion';
import { FaUserTie, FaEdit, FaEye, FaTimes } from 'react-icons/fa';
import { updateOfficerCollectionData } from '../../../services/officerService';

const OfficerTable = ({ 
  officers, 
  editingOfficer, 
  editingField, 
  handleEditAmount, 
  handleSaveAmount, 
  handleCancelEdit,
  handleViewOfficerDetails,
  onRefresh
}) => {

  // Handle payment process update
  const handlePaymentProcessUpdate = async (officerId, newPaymentProcess) => {
    try {
      console.log('🔄 Updating payment process for officer:', officerId, 'to:', newPaymentProcess);
      
      await updateOfficerCollectionData(officerId, {
        paymentProcess: newPaymentProcess
      });
      
      console.log('✅ Payment process updated successfully');
      
      // Refresh the data
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error('❌ Error updating payment process:', error);
      alert('Failed to update payment process. Please try again.');
    }
  };

  // Handle status update
  const handleStatusUpdate = async (officerId, newStatus) => {
    try {
      console.log('🔄 Updating status for officer:', officerId, 'to:', newStatus);
      
      await updateOfficerCollectionData(officerId, {
        status: newStatus
      });
      
      console.log('✅ Status updated successfully');
      
      // Refresh the data
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error('❌ Error updating status:', error);
      alert('Failed to update status. Please try again.');
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

  // Helper functions for calculating amounts
  const getOfficerTotalCollection = (officerId) => {
    const officer = officers.find(o => o._id === officerId);
    if (officer && officer.user_collections) {
      return officer.user_collections.reduce((sum, collection) => 
        sum + (collection.collected_amount || 0) + (collection.penalty || 0), 0);
    }
    return 0;
  };

  const getOfficerTodayCollection = (officerId) => {
    const officer = officers.find(o => o._id === officerId);
    if (officer && officer.user_collections) {
      const today = new Date();
      const startOfDay = new Date(today);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(today);
      endOfDay.setHours(23, 59, 59, 999);
      
      const todayCollections = officer.user_collections.filter(collection => {
        const collectionDate = new Date(collection.collected_on);
        return collectionDate >= startOfDay && collectionDate <= endOfDay;
      });
      
      return todayCollections
        .filter(collection => collection.account_type === 'loan account')
        .reduce((sum, collection) => sum + (collection.collected_amount || 0), 0);
    }
    return 0;
  };

  const getOfficerTodayPenalty = (officerId) => {
    const officer = officers.find(o => o._id === officerId);
    if (officer && officer.user_collections) {
      const today = new Date();
      const startOfDay = new Date(today);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(today);
      endOfDay.setHours(23, 59, 59, 999);
      
      const todayCollections = officer.user_collections.filter(collection => {
        const collectionDate = new Date(collection.collected_on);
        return collectionDate >= startOfDay && collectionDate <= endOfDay;
      });
      
      return todayCollections
        .filter(collection => collection.account_type === 'loan account')
        .reduce((sum, collection) => sum + (collection.penalty || 0), 0);
    }
    return 0;
  };

  const getOfficerTodaySavingCollection = (officerId) => {
    const officer = officers.find(o => o._id === officerId);
    if (officer && officer.user_collections) {
      const today = new Date();
      const startOfDay = new Date(today);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(today);
      endOfDay.setHours(23, 59, 59, 999);
      
      const todayCollections = officer.user_collections.filter(collection => {
        const collectionDate = new Date(collection.collected_on);
        return collectionDate >= startOfDay && collectionDate <= endOfDay;
      });
      
      return todayCollections
        .filter(collection => collection.account_type === 'saving account')
        .reduce((sum, collection) => sum + (collection.collected_amount || 0), 0);
    }
    return 0;
  };

  const getOfficerPaidAmount = (officerId) => {
    const officer = officers.find(o => o._id === officerId);
    return officer?.paidAmount || 0;
  };

  const getOfficerRemainingAmount = (officerId) => {
    const officer = officers.find(o => o._id === officerId);
    return officer?.remainingAmount || 0;
  };

  return (
    <motion.div 
      variants={itemVariants}
      className="px-6 py-6"
    >
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 overflow-visible">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Officer Daily Reports & Collections</h2>
          <button
            onClick={onRefresh}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
            title="Refresh Data"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Refresh</span>
          </button>
        </div>
        <div className="overflow-x-auto overflow-y-visible">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Officer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Today's Loan Collection</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Today's Penalty</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Today's Saving Collection</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Daily Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Collection (All Time)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paid Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remaining Amount by Officer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Process</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {officers.map((officer) => {
                console.log('🔄 Rendering officer:', officer);
                const todayLoanCollection = getOfficerTodayCollection(officer._id);
                const todayPenalty = getOfficerTodayPenalty(officer._id);
                const todaySavingCollection = getOfficerTodaySavingCollection(officer._id);
                const dailyTotal = todayLoanCollection + todayPenalty + todaySavingCollection;
                const totalCollection = getOfficerTotalCollection(officer._id);
                const paidAmount = getOfficerPaidAmount(officer._id);
                const remainingAmount = getOfficerRemainingAmount(officer._id);
                
                return (
                  <tr key={officer._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <FaUserTie className="text-blue-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{officer.name || officer.username}</div>
                          <div className="text-sm text-gray-500">{officer.email || officer.officer_code}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{todayLoanCollection.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                      ₹{todayPenalty.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{todaySavingCollection.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-600">
                      ₹{dailyTotal.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600">
                      ₹{totalCollection.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingOfficer?._id === officer._id && editingField === 'paidAmount' ? (
                        <div className="flex items-center space-x-2">
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">₹</span>
                            <input
                              type="number"
                              defaultValue={paidAmount}
                              className="w-24 pl-8 pr-3 py-2 border border-purple-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  handleSaveAmount(officer._id, 'paidAmount', e.target.value);
                                }
                              }}
                              onBlur={(e) => handleSaveAmount(officer._id, 'paidAmount', e.target.value)}
                              autoFocus
                            />
                          </div>
                          <button
                            onClick={() => handleCancelEdit()}
                            className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
                          >
                            <FaTimes className="text-xs" />
                          </button>
                        </div>
                      ) : (
                        <div 
                          className="cursor-pointer hover:bg-purple-50 px-3 py-2 rounded-lg border border-purple-200 flex items-center space-x-2 group transition-all duration-200"
                          onClick={() => handleEditAmount(officer, 'paidAmount')}
                          title="Click to edit paid amount"
                        >
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-purple-700">₹{paidAmount.toLocaleString()}</span>
                            <span className="text-xs text-purple-500">Paid Amount</span>
                          </div>
                          <FaEdit className="text-xs text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingOfficer?._id === officer._id && editingField === 'remainingAmount' ? (
                        <div className="flex items-center space-x-2">
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">₹</span>
                            <input
                              type="number"
                              defaultValue={remainingAmount}
                              className="w-24 pl-8 pr-3 py-2 border border-orange-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  handleSaveAmount(officer._id, 'remainingAmount', e.target.value);
                                }
                              }}
                              onBlur={(e) => handleSaveAmount(officer._id, 'remainingAmount', e.target.value)}
                              autoFocus
                            />
                          </div>
                          <button
                            onClick={() => handleCancelEdit()}
                            className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
                          >
                            <FaTimes className="text-xs" />
                          </button>
                        </div>
                      ) : (
                        <div 
                          className="cursor-pointer hover:bg-orange-50 px-3 py-2 rounded-lg border border-orange-200 flex items-center space-x-2 group transition-all duration-200"
                          onClick={() => handleEditAmount(officer, 'remainingAmount')}
                          title="Click to edit remaining amount"
                        >
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-orange-700">₹{remainingAmount.toLocaleString()}</span>
                            <span className="text-xs text-orange-500">Remaining Amount</span>
                          </div>
                          <FaEdit className="text-xs text-orange-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <select
                          value={officer.paymentProcess || 'officer'}
                          onChange={(e) => handlePaymentProcessUpdate(officer._id, e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                        >
                          <option value="officer">Officer</option>
                          <option value="manager">Manager</option>
                          <option value="deposite to bank">Deposit to Bank</option>
                          <option value="accounter">Accounter</option>
                          <option value="reassign to officer">Reassign to Officer</option>
                          <option value="process complete">Process Complete</option>
                        </select>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <select
                          value={officer.status || 'Pending'}
                          onChange={(e) => handleStatusUpdate(officer._id, e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                        >
                          <option value="Pending">Pending</option>
                          <option value="In Process">In Process</option>
                          <option value="Complete">Complete</option>
                        </select>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      <button
                        onClick={() => {
                          console.log('🔄 View Officer clicked for:', officer);
                          console.log('🔄 Officer ID:', officer._id);
                          console.log('🔄 Officer name:', officer.name);
                          handleViewOfficerDetails(officer);
                        }}
                        className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                        title="View Officer Details"
                      >
                        <FaEye className="mr-2" />
                        View Officer
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

export default OfficerTable;
