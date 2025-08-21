import React from 'react';
import { motion } from 'framer-motion';
import { FiAlertCircle, FiRefreshCw } from 'react-icons/fi';

const AuthMessage = ({ 
  message = "Authentication required. Please log in to continue.", 
  type = "warning",
  showRetry = false,
  onRetry = null 
}) => {
  const handleLogin = () => {
    window.location.href = '/login';
  };

  const getTypeStyles = () => {
    switch (type) {
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`max-w-md mx-auto p-6 border rounded-xl ${getTypeStyles()}`}
    >
      <div className="flex items-start space-x-3">
        <FiAlertCircle className="mt-1 flex-shrink-0" size={20} />
        <div className="flex-1">
          <p className="text-sm font-medium mb-3">{message}</p>
          <div className="flex gap-2">
            <button
              onClick={handleLogin}
              className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
            >
              Go to Login
            </button>
            {showRetry && onRetry && (
              <button
                onClick={onRetry}
                className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-1"
              >
                <FiRefreshCw size={14} />
                Retry
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AuthMessage;
