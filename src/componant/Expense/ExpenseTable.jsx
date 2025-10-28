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
        <table className="min-w-full border border-gray-200 rounded-lg text-sm">
          <thead className="bg-gray-100 text-gray-700 text-center">
            <tr>
              <th className="px-4 py-2 w-1/6 font-medium">Title</th>
              <th className="px-4 py-2 w-1/6 font-medium text-right">Amount</th>
              <th className="px-4 py-2 w-1/6 font-medium">Category</th>
              <th className="px-4 py-2 w-1/6 font-medium text-center">Status</th>
              <th className="px-4 py-2 w-1/6 font-medium text-center">Date</th>
              <th className="px-4 py-2 w-1/6 font-medium">Created By</th>
              <th className="px-4 py-2 w-1/12 font-medium text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {sortedExpenses.map((expense) => (
              <tr key={expense._id} className="border-t hover:bg-gray-50 transition">
                <td className="px-4 py-3 whitespace-nowrap max-w-xs truncate">{expense.title}</td>
                <td className="px-4 py-3 text-right">{formatCurrency(expense.amount)}</td>
                <td className="px-4 py-3 capitalize">{expense.category?.replace('_', ' ')}</td>
                <td className="px-4 py-3 text-center">{getStatusBadge(expense.status)}</td>
                <td className="px-4 py-3 text-center">{formatDate(expense.expense_date || expense.created_at || expense.createdAt)}</td>
                <td className="px-4 py-3">{expense.created_by?.name || expense.created_by?.fullName || expense.created_by?.email || '-'}</td>
                <td className="px-4 py-3 text-center relative dropdown-container">
                  <button
                    className="inline-flex items-center justify-center w-8 h-8 rounded hover:bg-gray-100 text-gray-600"
                    onClick={() => toggleDropdown(expense._id)}
                    aria-haspopup="menu"
                    aria-expanded={openDropdown === expense._id}
                  >
                    <FiMoreVertical />
                  </button>

                  {openDropdown === expense._id && (
                    <div
                      className="absolute right-10 -top-[30px] w-40 bg-white border border-gray-200 rounded-md shadow-lg z-20 text-left"
                      onMouseDown={(e) => e.stopPropagation()}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm"
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={() => { closeDropdown(); onView && onView(expense); }}
                      >
                        View
                      </button>

                      {canEdit(expense) && (
                        <button
                          type="button"
                          className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm"
                          onMouseDown={(e) => e.stopPropagation()}
                          onClick={() => { closeDropdown(); onEdit && onEdit(expense); }}
                        >
                          Edit
                        </button>
                      )}

                      {canApprove(expense) && (
                        <button
                          type="button"
                          className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm"
                          onMouseDown={(e) => e.stopPropagation()}
                          onClick={() => { closeDropdown(); onApprove && onApprove(expense); }}
                        >
                          Approve
                        </button>
                      )}

                      {canMarkPaid(expense) && (
                        <button
                          type="button"
                          className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm"
                          onMouseDown={(e) => e.stopPropagation()}
                          onClick={() => { closeDropdown(); onMarkPaid && onMarkPaid(expense); }}
                        >
                          Mark Paid
                        </button>
                      )}

                      {canDelete(expense) && (
                        <button
                          type="button"
                          className="w-full text-left px-3 py-2 hover:bg-red-50 text-sm text-red-600"
                          onMouseDown={(e) => e.stopPropagation()}
                          onClick={() => { closeDropdown(); onDelete && onDelete(expense); }}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  )}

                </td>
              </tr>
            ))}
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
