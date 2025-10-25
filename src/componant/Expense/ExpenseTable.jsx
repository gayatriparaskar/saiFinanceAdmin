import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  formatCurrency, 
  formatDate, 
  // getStatusColor, 
  EXPENSE_STATUSES
} from '../../services/expenseService';
import { FiEdit2, FiTrash2, FiCheck, FiDollarSign, FiEye, FiMoreVertical } from 'react-icons/fi';

const ExpenseTable = ({ 
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
  const [sortField, setSortField] = useState('created_on');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [openDropdown, setOpenDropdown] = useState(null);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

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

  const getSortIcon = (field) => {
    if (sortField !== field) return '↕️';
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  const filteredExpenses = expenses.filter(expense => {
    console.log('🔍 Filtering expense:', {
      id: expense._id,
      status: expense.status,
      category: expense.category,
      filterStatus,
      filterCategory,
      statusMatch: filterStatus === 'all' || expense.status === filterStatus,
      categoryMatch: filterCategory === 'all' || expense.category === filterCategory
    });
    
    if (filterStatus !== 'all' && expense.status !== filterStatus) return false;
    if (filterCategory !== 'all' && expense.category !== filterCategory) return false;
    return true;
  });
  
  console.log('🔍 Filtering results:', {
    totalExpenses: expenses.length,
    filteredExpenses: filteredExpenses.length,
    filterStatus,
    filterCategory
  });

  // Permission functions based on user role
  const canEdit = (expense) => {
    console.log('🔍 canEdit check:', {
      userRole,
      currentUserId,
      expenseCreatedBy: expense.created_by?._id,
      expenseStatus: expense.status,
      userIdMatch: expense.created_by?._id === currentUserId,
      expenseId: expense._id,
      expenseTitle: expense.title
    });
    
    // For managers: can edit their own expenses (both pending and paid)
    // For admin: can edit any expense
    // TEMPORARY: Allow all managers to edit any expense for testing
    const canEditResult = (userRole === 'manager') || 
                         (userRole === 'admin') ||
                         (userRole === 'manager' && 
                          expense.created_by?._id === currentUserId &&
                          (expense.status === 'paid' || expense.status === 'pending'));
    
    console.log('🔍 canEdit result:', canEditResult);
    return canEditResult;
  };

  const canDelete = (expense) => {
    console.log('🔍 canDelete check:', {
      userRole,
      expenseTitle: expense.title,
      isAdmin: userRole === 'admin'
    });
    
    const canDeleteResult = userRole === 'admin';
    console.log('🔍 canDelete result:', canDeleteResult);
    return canDeleteResult;
  };

  const canApprove = (expense) => {
    console.log('🔍 canApprove check:', {
      userRole,
      expenseStatus: expense.status,
      expenseTitle: expense.title,
      isAdmin: userRole === 'admin',
      isApproved: expense.status === 'approved'
    });
    
    const canApproveResult = userRole === 'admin' && expense.status === 'paid';
    console.log('🔍 canApprove result:', canApproveResult);
    return canApproveResult;
  };

  const canMarkPaid = (expense) => {
    // Admin can mark approved expenses as paid
    return userRole === 'admin' && expense.status === 'approved';
  };

  const sortedExpenses = [...filteredExpenses].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];

    if (sortField === 'amount') {
      aValue = parseFloat(aValue);
      bValue = parseFloat(bValue);
    } else if (sortField === 'created_on' || sortField === 'expense_date') {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const getStatusBadge = (status) => {
    const colorClasses = {
      approved: 'bg-green-100 text-green-800',
      paid: 'bg-blue-100 text-blue-800'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClasses[status]}`}>
        {EXPENSE_STATUSES[status]}
      </span>
    );
  };



  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Filters */}
      <div className="p-3 sm:p-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="flex-1">
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-2 sm:px-3 py-1 sm:py-2 border border-gray-300 rounded-md text-xs sm:text-sm"
            >
              <option value="all">All Status</option>
              {Object.entries(EXPENSE_STATUSES).map(([key, value]) => (
                <option key={key} value={key}>{value}</option>
              ))}
            </select>
          </div>
          
          <div className="flex-1">
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-2 sm:px-3 py-1 sm:py-2 border border-gray-300 rounded-md text-xs sm:text-sm"
            >
              <option value="all">All Categories</option>
              <option value="office_supplies">Office Supplies</option>
              <option value="travel">Travel</option>
              <option value="personal">Personal</option>
              <option value="marketing">Marketing</option>
              <option value="training">Training</option>
              <option value="maintenance">Maintenance</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('title')}
              >
                Title {getSortIcon('title')}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('amount')}
              >
                Amount {getSortIcon('amount')}
              </th>
              <th 
                className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('category')}
              >
                Category {getSortIcon('category')}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('status')}
              >
                Status {getSortIcon('status')}
              </th>
              <th 
                className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('expense_date')}
              >
                Date {getSortIcon('expense_date')}
              </th>
              <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created By
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedExpenses.map((expense) => {
              console.log('🔍 Expense data:', {
                id: expense._id,
                title: expense.title,
                created_by: expense.created_by,
                status: expense.status
              });
              return (
              <motion.tr
                key={expense._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="hover:bg-gray-50"
              >
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">
                    {expense.title}
                  </div>
                  {expense.description && (
                    <div className="text-xs text-gray-500 truncate max-w-xs">
                      {expense.description}
                    </div>
                  )}
                  <div className="sm:hidden mt-1">
                    <div className="text-xs text-gray-500">
                      {formatCurrency(expense.amount)} • {expense.category.replace('_', ' ')}
                    </div>
                  </div>
                </td>
                <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {formatCurrency(expense.amount)}
                  </div>
                </td>
                <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 capitalize">
                    {expense.category.replace('_', ' ')}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(expense.status)}
                </td>
                <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDate(expense.expense_date)}
                </td>
                <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {expense.created_by?.name || 'Unknown'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="relative dropdown-container">
                    <button
                      onClick={() => toggleDropdown(expense._id)}
                      className="inline-flex items-center px-2 py-1 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors duration-200"
                      title="Actions"
                    >
                      <FiMoreVertical className="w-4 h-4" />
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
                                console.log('🔍 Edit button clicked for expense:', expense);
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
                </td>
              </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {sortedExpenses.length === 0 && (
        <div className="text-center py-6 sm:py-8">
          <div className="text-gray-500 text-sm sm:text-lg">No expenses found</div>
          <div className="text-gray-400 text-xs sm:text-sm mt-2">
            Try adjusting your filters or create a new expense
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseTable;
