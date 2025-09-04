import React from 'react';
import { motion } from 'framer-motion';
import { 
  FaCalculator, 
  FaMoneyBillWave, 
  FaCalendarAlt, 
  FaCalendar 
} from 'react-icons/fa';

const StatsCards = ({ stats, collectionData, loading = false }) => {
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-8 bg-gray-200 rounded w-16"></div>
                <div className="h-3 bg-gray-200 rounded w-20"></div>
              </div>
              <div className="p-3 bg-gray-200 rounded-full w-12 h-12"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total Transactions */}
      <motion.div 
        variants={itemVariants}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Today's Transactions</p>
            <p className="text-3xl font-bold text-gray-900">{stats.totalTransactions}</p>
            <p className="text-sm text-gray-500">
              {collectionData.today?.loan?.count || 0} Loan + {collectionData.today?.saving?.count || 0} Saving
            </p>
          </div>
          <div className="p-3 bg-blue-100 rounded-full">
            <FaCalculator className="text-2xl text-blue-600" />
          </div>
        </div>
      </motion.div>

      {/* Today's Collection */}
      <motion.div 
        variants={itemVariants}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Today's Collection</p>
            <p className="text-3xl font-bold text-green-600">
              {formatCurrency(collectionData.today?.grandTotal || 0)}
            </p>
            <p className="text-sm text-gray-500">
              {formatCurrency(collectionData.today?.loan?.amount || 0)} Loan + {formatCurrency(collectionData.today?.saving?.net || 0)} Saving
            </p>
          </div>
          <div className="p-3 bg-green-100 rounded-full">
            <FaMoneyBillWave className="text-2xl text-green-600" />
          </div>
        </div>
      </motion.div>

      {/* Monthly Revenue */}
      <motion.div 
        variants={itemVariants}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Monthly Collection</p>
            <p className="text-3xl font-bold text-purple-600">
              {formatCurrency(collectionData.monthly?.totalAmount || 0)}
            </p>
            <p className="text-sm text-gray-500">
              {collectionData.monthly?.totalCount || 0} transactions
            </p>
          </div>
          <div className="p-3 bg-purple-100 rounded-full">
            <FaCalendarAlt className="text-2xl text-purple-600" />
          </div>
        </div>
      </motion.div>

      {/* Yearly Total */}
      <motion.div 
        variants={itemVariants}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Yearly Collection</p>
            <p className="text-3xl font-bold text-orange-600">
              {formatCurrency(collectionData.yearly?.totalAmount || 0)}
            </p>
            <p className="text-sm text-gray-500">
              {collectionData.yearly?.totalCount || 0} transactions
            </p>
          </div>
          <div className="p-3 bg-orange-100 rounded-full">
            <FaCalendar className="text-2xl text-orange-600" />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default StatsCards;
