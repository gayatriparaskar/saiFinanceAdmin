import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiX, FiDollarSign, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import { getTodayDate } from '../../services/cashManagementService';

// Utility to prevent body scroll
const preventBodyScroll = () => {
  document.body.style.overflow = 'hidden';
  document.body.style.paddingRight = '15px'; // Prevent layout shift
};

const restoreBodyScroll = () => {
  document.body.style.overflow = '';
  document.body.style.paddingRight = '';
};

const MorningCashSetup = ({ isOpen, onClose, onSubmit, loading = false, existingCash = null }) => {
  const [formData, setFormData] = useState({
    opening_cash: '',
    notes: '',
    date: getTodayDate()
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (existingCash) {
      setFormData({
        opening_cash: existingCash.opening_cash || '',
        notes: existingCash.notes || '',
        date: existingCash.date || getTodayDate()
      });
    } else {
      setFormData({
        opening_cash: '',
        notes: '',
        date: getTodayDate()
      });
    }
  }, [existingCash, isOpen]);

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
    
    if (!formData.opening_cash || formData.opening_cash <= 0) {
      newErrors.opening_cash = 'Please enter a valid opening cash amount';
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
      opening_cash: '',
      notes: '',
      date: getTodayDate()
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
            <div className="p-2 bg-green-100 rounded-lg">
              <FiDollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {existingCash ? 'Update Daily Cash' : 'Morning Cash Setup'}
              </h3>
              <p className="text-sm text-gray-600">
                {existingCash ? 'Update the cash amount for today' : 'Set the opening cash amount for today'}
              </p>
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
          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              disabled={existingCash} // Don't allow changing date for existing cash
            />
          </div>

          {/* Opening Cash Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Opening Cash Amount (₹) *
            </label>
            <input
              type="number"
              name="opening_cash"
              value={formData.opening_cash}
              onChange={handleInputChange}
              placeholder="Enter opening cash amount"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                errors.opening_cash ? 'border-red-500' : 'border-gray-300'
              }`}
              min="0"
              step="0.01"
            />
            {errors.opening_cash && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <FiAlertCircle className="w-4 h-4 mr-1" />
                {errors.opening_cash}
              </p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Any notes about the opening cash..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          {/* Info Banner */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <FiCheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-green-800">Daily Cash Management</h4>
                <p className="text-sm text-green-600 mt-1">
                  {existingCash 
                    ? 'This will update the cash amount for today. All expenses will be tracked against this amount.'
                    : 'Set the cash amount available in office today. This will be used to track expenses and show insufficient funds warnings.'
                  }
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
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {existingCash ? 'Updating...' : 'Setting up...'}
                </>
              ) : (
                <>
                  <FiDollarSign className="w-4 h-4 mr-2" />
                  {existingCash ? 'Update Cash' : 'Set Opening Cash'}
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default MorningCashSetup;
