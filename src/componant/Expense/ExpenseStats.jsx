import React from 'react';
import { motion } from 'framer-motion';
import { formatCurrency } from '../../services/expenseService';

const ExpenseStats = ({ stats, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Expenses',
      value: stats?.counts?.total || 0,
      amount: stats?.amounts?.total || 0,
      color: 'blue',
      icon: '💰'
    },
    {
      title: 'Approved',
      value: stats?.counts?.approved || 0,
      amount: stats?.amounts?.approved || 0,
      color: 'green',
      icon: '✅'
    },
    {
      title: 'Paid',
      value: stats?.counts?.paid || 0,
      amount: stats?.amounts?.paid || 0,
      color: 'purple',
      icon: '💳'
    }
  ];

  const getColorClasses = (color) => {
    const colorMap = {
      blue: 'bg-blue-50 text-blue-600',
      yellow: 'bg-yellow-50 text-yellow-600',
      green: 'bg-green-50 text-green-600',
      purple: 'bg-purple-50 text-purple-600'
    };
    return colorMap[color] || 'bg-gray-50 text-gray-600';
  };

  const getBorderColor = (color) => {
    const colorMap = {
      blue: 'border-blue-200',
      yellow: 'border-yellow-200',
      green: 'border-green-200',
      purple: 'border-purple-200'
    };
    return colorMap[color] || 'border-gray-200';
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`bg-white rounded-lg shadow p-4 sm:p-6 border-l-4 ${getBorderColor(stat.color)}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">
                  {stat.title}
                </p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  {stat.value}
                </p>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  {formatCurrency(stat.amount)}
                </p>
              </div>
              <div className={`p-2 sm:p-3 rounded-full ${getColorClasses(stat.color)}`}>
                <span className="text-lg sm:text-2xl">{stat.icon}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>


      {/* Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-r from-primary to-primaryDark rounded-lg shadow p-4 sm:p-6 text-white"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
            <div>
              <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2">Total Expense Summary</h3>
              <p className="text-xs sm:text-sm opacity-90">
                {stats?.counts?.total || 0} total expenses worth {formatCurrency(stats?.amounts?.total || 0)}
              </p>
            </div>
            <div className="text-left sm:text-right">
              <div className="text-xl sm:text-2xl font-bold">
                {formatCurrency(stats?.amounts?.total || 0)}
              </div>
              <div className="text-xs sm:text-sm opacity-90">
                Total Amount
              </div>
            </div>
          </div>
        </motion.div>
    </div>
  );
};

export default ExpenseStats;
