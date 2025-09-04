import React from 'react';
import { motion } from 'framer-motion';

const AssignModal = ({ 
  isOpen, 
  onClose, 
  selectedOfficer, 
  onAssignTo 
}) => {
  if (!isOpen) return null;

  const assignments = [
    { id: 'officer', label: 'Officer', color: 'blue' },
    { id: 'accounter', label: 'Accounter', color: 'green' },
    { id: 'manager', label: 'Manager', color: 'purple' }
  ];

  const getColorClasses = (color) => {
    const colorMap = {
      blue: {
        bg: 'bg-blue-50',
        hover: 'hover:bg-blue-100',
        border: 'border-blue-200',
        text: 'text-blue-800'
      },
      green: {
        bg: 'bg-green-50',
        hover: 'hover:bg-green-100',
        border: 'border-green-200',
        text: 'text-green-800'
      },
      purple: {
        bg: 'bg-purple-50',
        hover: 'hover:bg-purple-100',
        border: 'border-purple-200',
        text: 'text-purple-800'
      }
    };
    return colorMap[color] || colorMap.blue;
  };

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
        className="bg-white rounded-lg p-6 w-96 max-w-md mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold mb-4 text-gray-900">
          Assign Officer To
        </h3>
        
        {selectedOfficer && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>Officer:</strong> {selectedOfficer.officer_name}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Code:</strong> {selectedOfficer.officer_code}
            </p>
          </div>
        )}
        
        <div className="space-y-3">
          {assignments.map((assignment) => {
            const colors = getColorClasses(assignment.color);
            return (
              <motion.button
                key={assignment.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onAssignTo(assignment.id)}
                className={`w-full p-3 text-left ${colors.bg} ${colors.hover} rounded-lg border ${colors.border} transition-colors`}
              >
                <span className={`${colors.text} font-medium`}>
                  {assignment.label}
                </span>
              </motion.button>
            );
          })}
        </div>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onClose}
          className="mt-4 w-full p-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
        >
          Cancel
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

export default AssignModal;
