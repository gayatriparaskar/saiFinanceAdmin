import React from 'react';
import { motion } from 'framer-motion';

const DetailsModal = ({ 
  isOpen, 
  onClose, 
  selectedOfficer 
}) => {
  if (!isOpen || !selectedOfficer) return null;

  const formatCurrency = (amount) => {
    return `₹${(amount || 0).toLocaleString()}`;
  };

  const details = [
    {
      label: 'Name',
      value: selectedOfficer.officer_name,
      type: 'text'
    },
    {
      label: 'Code',
      value: selectedOfficer.officer_code,
      type: 'text'
    },
    {
      label: "Today's Collection",
      value: formatCurrency(selectedOfficer.todayCollection || 0),
      type: 'currency',
      color: 'text-blue-600'
    },
    {
      label: 'Total Collection',
      value: formatCurrency(selectedOfficer.totalCollection || 0),
      type: 'currency',
      color: 'text-green-600'
    },
    {
      label: 'Paid Amount',
      value: formatCurrency(selectedOfficer.paidAmount || 0),
      type: 'currency',
      color: 'text-purple-600'
    },
    {
      label: 'Remaining Amount',
      value: formatCurrency(selectedOfficer.remainingAmount || 0),
      type: 'currency',
      color: 'text-orange-600'
    },
    {
      label: 'Assigned To',
      value: selectedOfficer.assignTo || 'Not Assigned',
      type: 'text'
    },
    {
      label: 'Status',
      value: selectedOfficer.status || 'Pending',
      type: 'text'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-lg p-6 w-96 max-h-96 overflow-y-auto mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold mb-4 text-gray-900">
          Officer Details
        </h3>
        
        <div className="space-y-3">
          {details.map((detail, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex justify-between items-center p-2 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <span className="font-medium text-gray-700">
                {detail.label}:
              </span>
              <span className={`${detail.color || 'text-gray-900'} font-medium`}>
                {detail.value}
              </span>
            </motion.div>
          ))}
        </div>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onClose}
          className="mt-6 w-full p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Close
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

export default DetailsModal;
