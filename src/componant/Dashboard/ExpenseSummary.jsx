import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from '../../axios';
import { FiDollarSign, FiTrendingUp, FiAlertCircle } from 'react-icons/fi';

const ExpenseSummary = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalAmount: 0,
    totalCount: 0,
    approvedAmount: 0,
    paidAmount: 0
  });

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/expenses');
      
      console.log('ExpenseSummary - API Response:', response.data);
      
      if (response.data && response.data.success) {
        const expensesData = response.data.result?.expenses || response.data.result || [];
        console.log('ExpenseSummary - Expenses data:', expensesData);
        setExpenses(expensesData);
        
        // Calculate stats
        const totalAmount = expensesData.reduce((sum, exp) => sum + (exp.amount || 0), 0);
        const approvedAmount = expensesData
          .filter(exp => exp.status === 'approved')
          .reduce((sum, exp) => sum + (exp.amount || 0), 0);
        const paidAmount = expensesData
          .filter(exp => exp.status === 'paid')
          .reduce((sum, exp) => sum + (exp.amount || 0), 0);
        
        setStats({
          totalAmount,
          totalCount: expensesData.length,
          approvedAmount,
          paidAmount
        });
        
        console.log('ExpenseSummary - Stats calculated:', {
          totalAmount,
          totalCount: expensesData.length,
          approvedAmount,
          paidAmount
        });
      } else {
        console.warn('ExpenseSummary - No success response:', response.data);
        setExpenses([]);
        setStats({
          totalAmount: 0,
          totalCount: 0,
          approvedAmount: 0,
          paidAmount: 0
        });
      }
    } catch (error) {
      console.error('ExpenseSummary - Error fetching expenses:', error);
      console.error('ExpenseSummary - Error details:', error.response?.data);
      setExpenses([]);
      setStats({
        totalAmount: 0,
        totalCount: 0,
        approvedAmount: 0,
        paidAmount: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-lg shadow-sm p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <FiDollarSign className="text-primary" />
          Expense Summary
        </h2>
        <button
          onClick={fetchExpenses}
          className="text-sm text-primary hover:text-primaryDark transition-colors"
        >
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Expenses */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Expenses</p>
              <p className="text-2xl font-bold text-blue-700">{stats.totalCount}</p>
              <p className="text-xs text-gray-600 mt-1">{formatCurrency(stats.totalAmount)}</p>
            </div>
            <div className="bg-blue-200 p-3 rounded-full">
              <FiDollarSign className="text-blue-700 text-xl" />
            </div>
          </div>
        </div>

        {/* Approved Expenses */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Approved</p>
              <p className="text-2xl font-bold text-green-700">
                {formatCurrency(stats.approvedAmount)}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                {expenses.filter(exp => exp.status === 'approved').length} expenses
              </p>
            </div>
            <div className="bg-green-200 p-3 rounded-full">
              <FiTrendingUp className="text-green-700 text-xl" />
            </div>
          </div>
        </div>

        {/* Paid Expenses */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Paid</p>
              <p className="text-2xl font-bold text-purple-700">
                {formatCurrency(stats.paidAmount)}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                {expenses.filter(exp => exp.status === 'paid').length} expenses
              </p>
            </div>
            <div className="bg-purple-200 p-3 rounded-full">
              <FiDollarSign className="text-purple-700 text-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Expenses List */}
      {expenses.length > 0 ? (
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Recent Expenses</h3>
          <div className="space-y-2">
            {expenses.slice(0, 5).map((expense) => (
              <div
                key={expense._id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">{expense.title}</p>
                  <p className="text-xs text-gray-500">{expense.category}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-800">
                    {formatCurrency(expense.amount)}
                  </p>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    expense.status === 'approved' ? 'bg-green-100 text-green-700' :
                    expense.status === 'paid' ? 'bg-blue-100 text-blue-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {expense.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-6 text-center py-4">
          <p className="text-sm text-gray-500">No expenses found</p>
        </div>
      )}
    </motion.div>
  );
};

export default ExpenseSummary;

