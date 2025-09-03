import React from 'react';
import { motion } from 'framer-motion';
import { FaUserTie, FaEdit } from 'react-icons/fa';

const OfficerTable = ({ 
  officers, 
  editingOfficer, 
  editingField, 
  handleEditAmount, 
  handleSaveAmount, 
  handleCancelEdit,
  handleViewOfficerDetails,
  handleAssignTo,
  handleStatus,
  handleBankAssignment
}) => {
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
    if (officer && officer.comprehensive_collections) {
      const total = officer.comprehensive_collections.all_time.total || 0;
      return total;
    }
    if (officer && officer.collections) {
      const total = officer.collections.today_total || 0;
      return total;
    }
    return 0;
  };

  const getOfficerTodayCollection = (officerId) => {
    const officer = officers.find(o => o._id === officerId);
    if (officer && officer.comprehensive_collections) {
      const amount = officer.comprehensive_collections.today.loan_amount || 0;
      return amount;
    }
    if (officer && officer.collections) {
      const amount = officer.collections.today_loan || 0;
      return amount;
    }
    return 0;
  };

  const getOfficerTodayPenalty = (officerId) => {
    const officer = officers.find(o => o._id === officerId);
    if (officer && officer.comprehensive_collections) {
      const amount = officer.comprehensive_collections.today.penalty_amount || 0;
      return amount;
    }
    if (officer && officer.collections) {
      const amount = officer.collections.today_penalty || 0;
      return amount;
    }
    return 0;
  };

  const getOfficerTodaySavingCollection = (officerId) => {
    const officer = officers.find(o => o._id === officerId);
    if (officer && officer.comprehensive_collections) {
      const amount = officer.comprehensive_collections.today.saving_amount || 0;
      return amount;
    }
    if (officer && officer.collections) {
      const amount = officer.collections.today_saving || 0;
      return amount;
    }
    return 0;
  };

  const getOfficerPaidAmount = (officerId) => {
    // This would need to be calculated based on your business logic
    // For now, returning 0 as placeholder
    return 0;
  };

  return (
    <motion.div 
      variants={itemVariants}
      className="px-6 py-6"
    >
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Officer Daily Reports & Collections</h2>
        </div>
        <div className="overflow-x-auto">
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {officers.map((officer) => {
                const todayLoanCollection = getOfficerTodayCollection(officer._id);
                const todayPenalty = getOfficerTodayPenalty(officer._id);
                const todaySavingCollection = getOfficerTodaySavingCollection(officer._id);
                const dailyTotal = todayLoanCollection + todayPenalty + todaySavingCollection;
                const totalCollection = getOfficerTotalCollection(officer._id);
                const paidAmount = getOfficerPaidAmount(officer._id);
                const remainingAmount = totalCollection - paidAmount;
                
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-purple-600">
                      {editingOfficer?._id === officer._id && editingField === 'paidAmount' ? (
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            defaultValue={paidAmount}
                            className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                handleSaveAmount(officer._id, 'paidAmount', e.target.value);
                              }
                            }}
                            onBlur={(e) => handleSaveAmount(officer._id, 'paidAmount', e.target.value)}
                            autoFocus
                          />
                          <button
                            onClick={() => handleCancelEdit()}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <div 
                          className="cursor-pointer hover:bg-purple-50 px-2 py-1 rounded flex items-center space-x-1"
                          onClick={() => handleEditAmount(officer, 'paidAmount')}
                          title="Click to edit"
                        >
                          <span>₹{paidAmount.toLocaleString()}</span>
                          <FaEdit className="text-xs text-purple-400 ml-1" />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-orange-600">
                      {editingOfficer?._id === officer._id && editingField === 'remainingAmount' ? (
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            defaultValue={remainingAmount}
                            className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                handleSaveAmount(officer._id, 'remainingAmount', e.target.value);
                              }
                            }}
                            onBlur={(e) => handleSaveAmount(officer._id, 'remainingAmount', e.target.value)}
                            autoFocus
                          />
                          <button
                            onClick={() => handleCancelEdit()}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <div 
                          className="cursor-pointer hover:bg-orange-50 px-2 py-1 rounded flex items-center space-x-1"
                          onClick={() => handleEditAmount(officer, 'remainingAmount')}
                          title="Click to edit"
                        >
                          <span>₹{remainingAmount}</span>
                          <FaEdit className="text-xs text-orange-400 ml-1" />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => handleViewOfficerDetails(officer)}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors text-xs font-medium"
                          title="View Details"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleAssignTo(officer)}
                          className="px-3 py-1 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition-colors text-xs font-medium"
                          title="Assign To"
                        >
                          Assign To
                        </button>
                        <button
                          onClick={() => handleStatus(officer)}
                          className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 transition-colors text-xs font-medium"
                          title="Status"
                        >
                          Status
                        </button>
                        <button
                          onClick={() => handleBankAssignment(officer)}
                          className="px-3 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors text-xs font-medium"
                          title="Assign Bank Deposit"
                        >
                          Bank
                        </button>
                      </div>
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
