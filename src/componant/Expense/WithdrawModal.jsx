import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiX, FiDollarSign, FiAlertCircle } from 'react-icons/fi';

// Utility to prevent body scroll
const preventBodyScroll = () => {
  document.body.style.overflow = 'hidden';
  document.body.style.paddingRight = '15px'; // Prevent layout shift
};

const restoreBodyScroll = () => {
  document.body.style.overflow = '';
  document.body.style.paddingRight = '';
};

const WithdrawModal = ({ isOpen, onClose, onSubmit, loading = false }) => {
  const [formData, setFormData] = useState({
    amount: '',
    purpose: '',
    description: '',
    withdrawType: 'cash' // cash or bank_transfer
  });
  const [errors, setErrors] = useState({});

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    }
    
    if (!formData.purpose.trim()) {
      newErrors.purpose = 'Please enter the purpose of withdrawal';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleClose = () => {
    setFormData({
      amount: '',
      purpose: '',
      description: '',
      withdrawType: 'cash'
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-start justify-center z-[9999] p-4 pt-20"
      onClick={handleClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: -20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: -20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto mx-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <FiDollarSign className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Withdraw Funds</h3>
              <p className="text-sm text-gray-600">Request cash withdrawal for expenses</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiX className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Withdrawal Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Withdrawal Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                formData.withdrawType === 'cash' 
                  ? 'border-yellow-500 bg-yellow-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}>
                <input
                  type="radio"
                  name="withdrawType"
                  value="cash"
                  checked={formData.withdrawType === 'cash'}
                  onChange={handleInputChange}
                  className="sr-only"
                />
                <div className="flex items-center space-x-2">
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    formData.withdrawType === 'cash' 
                      ? 'border-yellow-500 bg-yellow-500' 
                      : 'border-gray-300'
                  }`}>
                    {formData.withdrawType === 'cash' && (
                      <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                    )}
                  </div>
                  <span className="text-sm font-medium">Cash</span>
                </div>
              </label>
              
              <label className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                formData.withdrawType === 'bank_transfer' 
                  ? 'border-yellow-500 bg-yellow-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}>
                <input
                  type="radio"
                  name="withdrawType"
                  value="bank_transfer"
                  checked={formData.withdrawType === 'bank_transfer'}
                  onChange={handleInputChange}
                  className="sr-only"
                />
                <div className="flex items-center space-x-2">
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    formData.withdrawType === 'bank_transfer' 
                      ? 'border-yellow-500 bg-yellow-500' 
                      : 'border-gray-300'
                  }`}>
                    {formData.withdrawType === 'bank_transfer' && (
                      <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                    )}
                  </div>
                  <span className="text-sm font-medium">Bank Transfer</span>
                </div>
              </label>
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount (₹)
            </label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              placeholder="Enter amount to withdraw"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 ${
                errors.amount ? 'border-red-500' : 'border-gray-300'
              }`}
              min="1"
              step="0.01"
            />
            {errors.amount && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <FiAlertCircle className="w-4 h-4 mr-1" />
                {errors.amount}
              </p>
            )}
          </div>

          {/* Purpose */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Purpose *
            </label>
            <input
              type="text"
              name="purpose"
              value={formData.purpose}
              onChange={handleInputChange}
              placeholder="e.g., Office supplies, Travel expenses"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 ${
                errors.purpose ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.purpose && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <FiAlertCircle className="w-4 h-4 mr-1" />
                {errors.purpose}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Additional details about the withdrawal"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
            />
          </div>

          {/* Info Banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <FiAlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-blue-800">Withdrawal Process</h4>
                <p className="text-sm text-blue-600 mt-1">
                  This withdrawal will be recorded in the system. You can use these funds to pay expenses directly.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <FiDollarSign className="w-4 h-4 mr-2" />
                  Withdraw Funds
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default WithdrawModal;
