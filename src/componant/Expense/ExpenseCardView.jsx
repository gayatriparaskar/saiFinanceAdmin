import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  formatCurrency, 
  formatDate, 
  getStatusColor, 
  EXPENSE_STATUSES
} from '../../services/expenseService';
import { FiEdit2, FiTrash2, FiCheck, FiX, FiDollarSign, FiEye, FiCalendar, FiUser, FiTag, FiMoreVertical } from 'react-icons/fi';

const ExpenseCardView = ({ 
  expenses, 
  loading, 
  onEdit, 
  onDelete, 
  onApprove, 
  onReject, 
  onMarkPaid,
  onView,
  userRole,
  currentUserId 
}) => {
  const [openDropdown, setOpenDropdown] = useState(null);

  const toggleDropdown = (expenseId) => {
    setOpenDropdown(openDropdown === expenseId ? null : expenseId);
  };

  const closeDropdown = () => {
    setOpenDropdown(null);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openDropdown && !event.target.closest('.dropdown-container')) {
        closeDropdown();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openDropdown]);

  // Permission functions based on user role
  const canEdit = (expense) => {
    return (userRole === 'manager') || 
           (userRole === 'admin') ||
           (userRole === 'manager' && 
            expense.created_by?._id === currentUserId &&
            (expense.status === 'paid' || expense.status === 'pending'));
  };

  const canDelete = (expense) => {
    return userRole === 'admin';
  };

  const canApprove = (expense) => {
    // Admin can approve any paid expense
    return userRole === 'admin' && expense.status === 'paid';
  };

  const canMarkPaid = (expense) => {
    return userRole === 'admin' && expense.status === 'approved';
  };

  const getStatusBadge = (status) => {
    const colorClasses = {
      approved: 'bg-green-100 text-green-800 border-green-200',
      paid: 'bg-blue-100 text-blue-800 border-blue-200'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${colorClasses[status]}`}>
        {EXPENSE_STATUSES[status]}
      </span>
    );
  };


  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="flex space-x-2">
                <div className="h-6 bg-gray-200 rounded w-16"></div>
                <div className="h-6 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {expenses.map((expense, index) => (
        <motion.div
          key={expense._id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-200"
        >
          {/* Card Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
                  {expense.title}
                </h3>
                {expense.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {expense.description}
                  </p>
                )}
              </div>
              <div className="ml-3">
                {getStatusBadge(expense.status)}
              </div>
            </div>
            
            {/* Amount */}
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(expense.amount)}
              </div>
            </div>
          </div>

          {/* Card Body */}
          <div className="p-6">
            {/* Expense Details */}
            <div className="space-y-3 mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <FiTag className="w-4 h-4 mr-2 text-gray-400" />
                <span className="capitalize">{expense.category.replace('_', ' ')}</span>
              </div>
              
              <div className="flex items-center text-sm text-gray-600">
                <FiCalendar className="w-4 h-4 mr-2 text-gray-400" />
                <span>{formatDate(expense.expense_date)}</span>
              </div>
              
              <div className="flex items-center text-sm text-gray-600">
                <FiUser className="w-4 h-4 mr-2 text-gray-400" />
                <span>{expense.created_by?.name || 'Unknown'}</span>
              </div>
            </div>

            {/* Action Dropdown */}
            <div className="relative dropdown-container">
              <button
                onClick={() => toggleDropdown(expense._id)}
                className="inline-flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors duration-200 border border-gray-200"
                title="Actions"
              >
                <FiMoreVertical className="w-4 h-4 mr-1" />
                Actions
              </button>
              
              {openDropdown === expense._id && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50 border border-gray-200">
                  <div className="py-1">
                    {/* View option - always visible */}
                    <button
                      onClick={() => {
                        onView && onView(expense);
                        closeDropdown();
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <FiEye className="w-4 h-4 mr-3" />
                      View
                    </button>
                    
                    {/* Edit option */}
                    {canEdit(expense) && (
                      <button
                        onClick={() => {
                          onEdit(expense);
                          closeDropdown();
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <FiEdit2 className="w-4 h-4 mr-3" />
                        Edit
                      </button>
                    )}
                    
                    {/* Approve option */}
                    {canApprove(expense) && (
                      <button
                        onClick={() => {
                          onApprove(expense);
                          closeDropdown();
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <FiCheck className="w-4 h-4 mr-3" />
                        Approve
                      </button>
                    )}
                    
                    
                    {/* Mark as Paid option */}
                    {canMarkPaid(expense) && (
                      <button
                        onClick={() => {
                          onMarkPaid(expense);
                          closeDropdown();
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <FiDollarSign className="w-4 h-4 mr-3" />
                        Mark as Paid
                      </button>
                    )}
                    
                    {/* Delete option */}
                    {canDelete(expense) && (
                      <button
                        onClick={() => {
                          onDelete(expense);
                          closeDropdown();
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <FiTrash2 className="w-4 h-4 mr-3" />
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default ExpenseCardView;
