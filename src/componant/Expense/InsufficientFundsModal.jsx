import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiX, FiAlertTriangle, FiDollarSign, FiPlus, FiCreditCard, FiInfo } from 'react-icons/fi';
import { formatCurrency } from '../../services/cashManagementService';

// Utility to prevent body scroll
const preventBodyScroll = () => {
  document.body.style.overflow = 'hidden';
  document.body.style.paddingRight = '15px'; // Prevent layout shift
};

const restoreBodyScroll = () => {
  document.body.style.overflow = '';
  document.body.style.paddingRight = '';
};

const InsufficientFundsModal = ({ 
  isOpen, 
  onClose, 
  onWithdraw, 
  availableAmount, 
  requiredAmount, 
  shortfall 
}) => {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      preventBodyScroll();
    } else {
      restoreBodyScroll();
    }

    // Cleanup on unmount
    return () => {
      restoreBodyScroll();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="bg-white rounded-xl shadow-2xl max-w-lg w-full mx-auto border border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-red-50 to-orange-50">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-red-100 rounded-xl">
              <FiAlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Insufficient Funds</h3>
              <p className="text-sm text-gray-600 mt-1">Not enough cash available for this expense</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors group"
          >
            <FiX className="w-5 h-5 text-gray-500 group-hover:text-gray-700" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Cash Status Alert */}
          <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl p-5">
            <div className="flex items-start space-x-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <FiAlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div className="flex-1">
                <h4 className="text-base font-semibold text-red-800 mb-2">Cash Shortage Detected</h4>
                <p className="text-sm text-red-700 leading-relaxed">
                  You need <span className="font-bold text-red-800">{formatCurrency(shortfall)}</span> more to cover this expense.
                </p>
              </div>
            </div>
          </div>

          {/* Cash Details */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
              <FiDollarSign className="w-4 h-4 mr-2" />
              Cash Breakdown
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-3 px-3 bg-white rounded-lg border border-gray-200">
                <span className="text-sm font-medium text-gray-700">Available Cash:</span>
                <span className="text-sm font-bold text-gray-900">
                  {formatCurrency(availableAmount)}
                </span>
              </div>
              <div className="flex justify-between items-center py-3 px-3 bg-white rounded-lg border border-gray-200">
                <span className="text-sm font-medium text-gray-700">Required Amount:</span>
                <span className="text-sm font-bold text-gray-900">
                  {formatCurrency(requiredAmount)}
                </span>
              </div>
              <div className="flex justify-between items-center py-3 px-3 bg-red-50 rounded-lg border border-red-200">
                <span className="text-sm font-semibold text-red-700">Shortfall:</span>
                <span className="text-sm font-bold text-red-800">
                  {formatCurrency(shortfall)}
                </span>
              </div>
            </div>
          </div>

          {/* Action Options */}
          <div className="space-y-4">
            <h4 className="text-base font-semibold text-gray-900 flex items-center">
              <FiInfo className="w-4 h-4 mr-2 text-blue-600" />
              Choose Your Action
            </h4>
            
            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={onWithdraw}
                className="w-full flex items-center justify-center space-x-3 px-6 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl hover:from-yellow-600 hover:to-orange-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <FiPlus className="w-5 h-5" />
                <span className="font-semibold">Add More Cash</span>
              </button>
              
              <button
                onClick={onClose}
                className="w-full flex items-center justify-center space-x-3 px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
              >
                <FiCreditCard className="w-5 h-5" />
                <span className="font-semibold">Cancel Expense</span>
              </button>
            </div>
          </div>

          {/* Help Information */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5">
            <div className="flex items-start space-x-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FiInfo className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-blue-800 mb-2">Need Help?</h4>
                <p className="text-sm text-blue-700 leading-relaxed">
                  You can add more cash to cover this expense, or cancel the expense and try again later. 
                  Adding cash will update your available balance immediately.
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default InsufficientFundsModal;
