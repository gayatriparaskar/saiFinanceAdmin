import React from 'react';
import { motion } from 'framer-motion';
import { 
  FaCalendarDay, 
  FaCalendarWeek, 
  FaChartBar, 
  FaChartLine 
} from 'react-icons/fa';

const CollectionBreakdown = ({ collectionData, loading = false }) => {
  const formatCurrency = (amount) => {
    return `₹${(amount || 0).toLocaleString()}`;
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(2)].map((_, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Today's Detailed Collection */}
      <motion.div 
        variants={itemVariants}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <FaCalendarDay className="mr-2 text-blue-600" />
          Today's Collection Breakdown
        </h3>
        {collectionData.today ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <span className="font-medium text-blue-800">Loan Collections</span>
              <span className="text-lg font-bold text-blue-600">
                {formatCurrency(collectionData.today.loan?.amount || 0)}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <span className="font-medium text-green-800">Saving Deposits</span>
              <span className="text-lg font-bold text-green-600">
                {formatCurrency(collectionData.today.saving?.deposit || 0)}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
              <span className="font-medium text-red-800">Saving Withdrawals</span>
              <span className="text-lg font-bold text-red-600">
                {formatCurrency(collectionData.today.saving?.withdraw || 0)}
              </span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gray-100 rounded-lg border-2 border-gray-300">
              <span className="font-bold text-gray-800">Net Total</span>
              <span className="text-xl font-bold text-gray-800">
                {formatCurrency(collectionData.today.grandTotal || 0)}
              </span>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">
            <FaChartBar className="text-4xl mx-auto mb-2" />
            <p>No collection data available for today</p>
          </div>
        )}
      </motion.div>

      {/* Weekly Collection Trend */}
      <motion.div 
        variants={itemVariants}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <FaCalendarWeek className="mr-2 text-green-600" />
          Weekly Collection Summary
        </h3>
        {collectionData.weekly ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <span className="font-medium text-green-800">Week Total</span>
              <span className="text-lg font-bold text-green-600">
                {formatCurrency(collectionData.weekly.totalAmount || 0)}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <span className="font-medium text-blue-800">Transactions</span>
              <span className="text-lg font-bold text-blue-600">
                {collectionData.weekly.totalCount || 0}
              </span>
            </div>
            <div className="text-sm text-gray-600 p-3 bg-gray-50 rounded-lg">
              <p><strong>Period:</strong> {collectionData.weekly.startDate} to {collectionData.weekly.endDate}</p>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">
            <FaChartLine className="text-4xl mx-auto mb-2" />
            <p>No weekly data available</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default CollectionBreakdown;
