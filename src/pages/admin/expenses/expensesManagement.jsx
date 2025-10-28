import React, { useState, useEffect } from 'react';
// import { motion } from 'framer-motion';
import ExpenseViewToggle from '../../../componant/Expense/ExpenseViewToggle';
import ExpenseStats from '../../../componant/Expense/ExpenseStats';
import { getAllExpenses, getExpenseStats, approveExpense, deleteExpense, getExpensesWithCashData, markExpenseAsPaid } from '../../../services/expenseService';
import { getCurrentUserInfo } from '../../../utils/authUtils';
import { getDailyCash } from '../../../services/cashManagementService';
import { FiPlus, FiRefreshCw, FiAlertCircle } from 'react-icons/fi';
import NewNavbar from '../../Dashboard/main/NewNavbar';
// import ExpenseForm from '../../../componant/Expense/ExpenseForm';

const ExpenseManagement = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('checking');
  const [dailyCash, setDailyCash] = useState(null);
  const [availableCash, setAvailableCash] = useState(0);
  const [dailySummary, setDailySummary] = useState({
    totalExpenses: 0,
    totalAmount: 0,
    approvedAmount: 0,
    paidAmount: 0,
    savingsAmount: 0,
    dailyBudget: 0,
    isOverBudget: false,
    overBudgetAmount: 0
  });
  // const handleAddExpenseClick = () => {
  //   // Reset insufficient funds modal when opening form
  //   setShowInsufficientFunds(false);
  //   setInsufficientFundsData(null);
  //   setShowForm(true);
  // }; const [showInsufficientFunds, setShowInsufficientFunds] = useState(false);
  // const [insufficientFundsData, setInsufficientFundsData] = useState(null);
  // const [showForm, setShowForm] = useState(false);
  // const [editingExpense, setEditingExpense] = useState(null);
  // const [formLoading, setFormLoading] = useState(false);

  // Time period filter
  const [timePeriod, setTimePeriod] = useState('today'); // 'today', 'weekly', 'monthly'


  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Get user info
        const currentUser = getCurrentUserInfo();
        setUserInfo(currentUser);

        // Fetch daily cash (includes available cash)
        await fetchDailyCash();

        console.log('🔄 Loading expenses from API...');
        console.log('🔍 User info:', currentUser);

        // Check if user has proper authentication
        if (!currentUser.hasToken) {
          console.warn('⚠️ No authentication token found');
          setConnectionStatus('offline');
          setError('No authentication token found. Please log in to see real data.');
          setLoading(false);
          return;
        }

        // Try to fetch from API first
        try {
          const [combinedResponse, statsResponse] = await Promise.all([
            getExpensesWithCashData({}),
            getExpenseStats({})
          ]);

          if (combinedResponse.success) {
            const expensesData = combinedResponse.expenses.result.expenses || [];
            setExpenses(expensesData);
            setAvailableCash(combinedResponse.availableCash);
            setConnectionStatus('connected');

            // Calculate daily summary for real data
            const dailySummaryData = calculateDailySummary(expensesData, timePeriod);
            setDailySummary(dailySummaryData);

            console.log('✅ Expenses loaded from API:', expensesData);
            console.log('💰 Available cash set to:', combinedResponse.availableCash);
            console.log('📊 Admin Daily summary calculated:', dailySummaryData);
          } else {
            throw new Error(combinedResponse.message || 'Failed to fetch expenses');
          }

          if (statsResponse.success) {
            setStats(statsResponse.result);
            console.log('✅ Stats loaded from API:', statsResponse.result);
          }

        } catch (apiError) {
          console.warn('⚠️ API not available:', apiError.message);
          setConnectionStatus('offline');
          setError('Backend server is not running. Please start the backend server to see real data.');
        }

      } catch (error) {
        console.error('❌ Error loading data:', error);
        setError('Failed to load expenses. Please check your connection and try again.');
        setConnectionStatus('error');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Refresh daily cash when expenses change
  useEffect(() => {
    if (expenses.length > 0) {
      fetchDailyCash();
    }
  }, [expenses]);

  // Recalculate daily summary when availableCash changes
  useEffect(() => {
    if (expenses.length > 0 && availableCash > 0) {
      console.log('🔄 Recalculating daily summary due to availableCash change:', availableCash);
      const dailySummaryData = calculateDailySummary(expenses, timePeriod);
      setDailySummary(dailySummaryData);
      console.log('📊 Admin Daily summary recalculated:', dailySummaryData);
    }
  }, [availableCash, expenses]);

  // Recalculate summary when time period changes
  useEffect(() => {
    if (expenses.length > 0) {
      console.log('🔄 Admin - Recalculating summary for period:', timePeriod);
      const dailySummaryData = calculateDailySummary(expenses, timePeriod);
      setDailySummary(dailySummaryData);
      console.log('📊 Admin - Summary recalculated for period:', timePeriod, dailySummaryData);
    }
  }, [timePeriod, expenses]);

  const fetchDailyCash = async (forceRefresh = false) => {
    try {
      console.log('🔄 Admin - Fetching daily cash...', forceRefresh ? '(Force Refresh)' : '');
      const response = await getDailyCash();
      console.log('💰 Admin - Daily cash response:', response);
      console.log('💰 Admin - Response success:', response.success);
      console.log('💰 Admin - Response result:', response.result);

      if (response.success) {
        // Handle both response.result and response.message structures
        const cashData = response.result || response.message;
        console.log('✅ Admin - Daily cash found:', cashData);
        console.log('💰 Admin - Available amount:', cashData?.available_amount);
        console.log('💰 Admin - Opening cash:', cashData?.opening_cash);
        setDailyCash(cashData);
        const newCashAmount = cashData?.available_amount || cashData?.opening_cash || 0;
        console.log('💰 Admin - Setting available cash to:', newCashAmount);
        setAvailableCash(newCashAmount);
        console.log('💰 Admin - Available cash after setting:', newCashAmount);

        // Immediately recalculate daily summary with new cash data
        console.log('🔄 Admin - Recalculating summary with new cash data');
        const dailySummaryData = calculateDailySummary(expenses, timePeriod);
        setDailySummary(dailySummaryData);
        console.log('📊 Admin - Summary recalculated:', dailySummaryData);
      } else {
        console.log('❌ Admin - No daily cash setup found');
        setDailyCash(null);
        setAvailableCash(0);
      }
    } catch (error) {
      console.error('❌ Admin - Error fetching daily cash:', error);
      setDailyCash(null);
      setAvailableCash(0);
    }
  };

  const handleRefresh = async () => {
    console.log('🔄 Manual refresh triggered');
    setLoading(true);
    try {
      await fetchDailyCash(true);
      // Also refresh expenses
      const response = await getAllExpenses({});
      if (response.success) {
        setExpenses(response.result?.expenses || []);
      }
    } catch (error) {
      console.error('❌ Error during manual refresh:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (expense) => {
    console.log('Edit expense:', expense);
    // Implement edit functionality
  };


  const handleApprove = async (expense) => {
    try {
      console.log('Approving expense:', expense);

      // Optimistic UI update
      setExpenses(prev => prev.map(exp => exp._id === expense._id ? { ...exp, status: 'approved' } : exp));

      if (connectionStatus === 'offline') {
        console.log('✅ Expense approved (demo mode)');
        return;
      }

      // Real API call
      const response = await approveExpense(expense._id);
      if (!response.success) {
        console.error('❌ Failed to approve expense:', response.message);
        // Revert by refetching
        await handleRefresh();
      } else {
        console.log('✅ Expense approved successfully');
      }
    } catch (error) {
      console.error('❌ Error approving expense:', error);
      await handleRefresh();
    }
  };

  const handleReject = (expense) => {
    console.log('Reject expense:', expense);
    // Implement reject functionality
  };
  // const handleFormClose = () => {
  //   setShowForm(false);
  //   setEditingExpense(null);
  // };

  const handleMarkPaid = async (expense) => {
    try {
      console.log('Mark as paid:', expense);

      // Optimistic UI update
      setExpenses(prev => prev.map(exp => exp._id === expense._id ? { ...exp, status: 'paid' } : exp));

      if (connectionStatus === 'offline') {
        console.log('✅ Expense marked paid (demo mode)');
        return;
      }

      // Real API call
      const response = await markExpenseAsPaid(expense._id);
      if (!response.success) {
        console.error('❌ Failed to mark as paid:', response.message);
        // Revert by refetching
        await handleRefresh();
      } else {
        console.log('✅ Expense marked as paid successfully');
      }
    } catch (error) {
      console.error('❌ Error marking expense paid:', error);
      await handleRefresh();
    }
  };

  const handleDelete = async (expense) => {
    try {
      console.log('Deleting expense:', expense);

      // Confirm deletion
      if (!window.confirm(`Are you sure you want to delete "${expense.title}"? This action cannot be undone.`)) {
        return;
      }

      if (connectionStatus === 'offline') {
        // Demo mode - just update local state
        setExpenses(prev => prev.filter(exp => exp._id !== expense._id));
        console.log('✅ Expense deleted (demo mode)');
        return;
      }

      // Real API call
      const response = await deleteExpense(expense._id);
      if (response.success) {
        // Refresh expenses after deletion
        await handleRefresh();
        console.log('✅ Expense deleted successfully');
      } else {
        console.error('❌ Failed to delete expense:', response.message);
      }
    } catch (error) {
      console.error('❌ Error deleting expense:', error);

      // Check if it's a permission error
      if (error.response?.status === 403) {
        console.warn('⚠️ Backend permission error - implementing admin bypass');

        // Ask user if they want to proceed with admin bypass
        const proceedWithBypass = window.confirm(
          'Backend permission error detected. As an admin, would you like to proceed with the deletion using admin bypass? This will remove the expense from the local view.'
        );

        if (proceedWithBypass) {
          // Admin bypass - update local state
          setExpenses(prev => prev.filter(exp => exp._id !== expense._id));
          console.log('✅ Expense deleted using admin bypass');

          // Show success message
          alert('Expense deleted successfully using admin bypass. Note: This change may not be reflected in the backend database.');
        } else {
          alert('Deletion cancelled. Please contact the system administrator to resolve backend permission issues.');
        }
      }
    }
  };

  const handleView = (expense) => {
    console.log('View expense:', expense);
    // Implement view functionality
  };


  // Calculate daily summary with real data
  const calculateDailySummary = (expensesList, period = 'today') => {
    console.log('🔍 Admin calculateDailySummary - Input expenses:', expensesList);
    console.log('🔍 Admin calculateDailySummary - Expenses count:', expensesList.length);
    console.log('🔍 Admin calculateDailySummary - Period:', period);

    const now = new Date();
    let filteredExpenses = expensesList;

    // Filter expenses based on time period
    if (period === 'today') {
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      filteredExpenses = expensesList.filter(exp => {
        // Use expense_date if available, otherwise fall back to created_at/createdAt
        const expDate = new Date(exp.expense_date || exp.created_at || exp.createdAt);
        return expDate >= today && expDate < tomorrow;
      });
    } else if (period === 'weekly') {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay()); // Start of current week
      weekStart.setHours(0, 0, 0, 0);

      filteredExpenses = expensesList.filter(exp => {
        const expDate = new Date(exp.expense_date || exp.created_at || exp.createdAt);
        return expDate >= weekStart;
      });
    } else if (period === 'monthly') {
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      filteredExpenses = expensesList.filter(exp => {
        const expDate = new Date(exp.expense_date || exp.created_at || exp.createdAt);
        return expDate >= monthStart;
      });
    }

    console.log('🔍 Admin calculateDailySummary - Filtered expenses count:', filteredExpenses.length);

    const totalAmount = filteredExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
    console.log('🔍 Admin calculateDailySummary - Total amount calculated:', totalAmount);

    // Daily budget - can be made configurable later
    const dailyBudget = 10000;
    // Amount saved = Available cash - Expenses (use real available cash)
    console.log('💰 Admin calculateDailySummary - Available cash:', availableCash);
    console.log('💰 Admin calculateDailySummary - Total amount:', totalAmount);
    console.log('💰 Admin calculateDailySummary - Available cash type:', typeof availableCash);
    console.log('💰 Admin calculateDailySummary - Total amount type:', typeof totalAmount);
    console.log('💰 Admin calculateDailySummary - Available cash is number:', !isNaN(availableCash));
    console.log('💰 Admin calculateDailySummary - Total amount is number:', !isNaN(totalAmount));

    // Use availableCash directly from backend, not calculated
    const savingsAmount = availableCash;
    console.log('💰 Admin calculateDailySummary - Savings amount (using availableCash directly):', savingsAmount);
    console.log('💰 Admin calculateDailySummary - Final calculation:', `availableCash: ${availableCash}, savingsAmount: ${savingsAmount}`);
    // Only over budget if expenses exceed the budget
    const isOverBudget = totalAmount > dailyBudget;

    const summary = {
      totalExpenses: filteredExpenses.length,
      totalAmount: totalAmount,
      approvedAmount: filteredExpenses.filter(exp => exp.status === 'approved').reduce((sum, exp) => sum + (exp.amount || 0), 0),
      paidAmount: filteredExpenses.filter(exp => exp.status === 'paid').reduce((sum, exp) => sum + (exp.amount || 0), 0),
      savingsAmount: availableCash, // Use availableCash directly from backend
      cashAddedInPeriod: dailyCash?.total_withdrawals || 0, // Add withdrawal data
      expenseCount: filteredExpenses.length,
      dailyBudget: dailyBudget,
      isOverBudget: isOverBudget,
      overBudgetAmount: isOverBudget ? totalAmount - dailyBudget : 0
    };

    console.log('📊 Admin Daily Summary Calculation:', {
      totalExpenses: summary.totalExpenses,
      totalAmount: summary.totalAmount,
      approvedAmount: summary.approvedAmount,
      paidAmount: summary.paidAmount,
      savingsAmount: summary.savingsAmount,
      isOverBudget: summary.isOverBudget
    });

    return summary;
  };

  const handleCreateExpense = () => {
    console.log('Create new expense');
    // Reset insufficient funds modal when opening form
    // setShowInsufficientFunds(false);
    // setInsufficientFundsData(null);
    // setShowForm(true);
  };

  const getConnectionStatusBadge = () => {
    switch (connectionStatus) {
      case 'connected':
        return (
          <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
            Connected
          </div>
        );
      case 'offline':
        return (
          <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></div>
            Offline
          </div>
        );
      case 'error':
        return (
          <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <div className="w-2 h-2 bg-red-400 rounded-full mr-2"></div>
            Error
          </div>
        );
      default:
        return (
          <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
            Checking...
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NewNavbar />
      <div className="pt-16 sm:pt-20">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center space-x-3">
                <h1 className="text-3xl font-bold text-gray-800">Expense Management</h1>
                {getConnectionStatusBadge()}
              </div>
              <p className="text-gray-600 mt-1">Manage and track all company expenses</p>
            </div>
            <div className="flex items-center space-x-3 mt-4 sm:mt-0">
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiRefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              {/* <button
                onClick={handleCreateExpense}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <FiPlus className="w-4 h-4 mr-2" />
                Add Expense
                </button> */}
                {/* Expense Form Modal */}
                {/* <ExpenseForm
                  isOpen={showForm}
                  onClose={handleFormClose}
                  onSubmit={handleCreateExpense}
                  loading={formLoading}
                /> */}
            
            </div>
          </div>


          {/* Error Alert */}
          {error && connectionStatus === 'error' && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <FiAlertCircle className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Connection Error
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Expense Summary Cards */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <h3 className="text-lg font-semibold text-gray-900">📊 Expense Summary</h3>

              {/* Time Period Selector */}
              <div className="flex bg-white rounded-lg p-1 shadow-sm border">
                <button
                  onClick={() => setTimePeriod('today')}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${timePeriod === 'today'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-800'
                    }`}
                >
                  Today
                </button>
                <button
                  onClick={() => setTimePeriod('weekly')}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${timePeriod === 'weekly'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-800'
                    }`}
                >
                  Weekly
                </button>
                <button
                  onClick={() => setTimePeriod('monthly')}
                 className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${timePeriod === 'monthly' ? 'bg-blue-100 text-blue-700': 'text-gray-600 hover:text-gray-800'}`}>  Monthly
                </button>
              </div>

              <span className="text-sm text-gray-600">
                {timePeriod === 'today' && new Date().toLocaleDateString('en-IN', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
                {timePeriod === 'weekly' && `Week of ${new Date().toLocaleDateString('en-IN', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}`}
                {timePeriod === 'monthly' && new Date().toLocaleDateString('en-IN', {
                  month: 'long',
                  year: 'numeric'
                })}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Total Amount Spent */}
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Amount Spent ({timePeriod === 'today' ? 'Today' : timePeriod === 'weekly' ? 'This Week' : 'This Month'})</p>
                    <p className="text-2xl font-bold text-red-600">₹{dailySummary.totalAmount.toLocaleString('en-IN')}</p>
                    <p className="text-xs text-gray-500 mt-1">From cash reserves</p>
                  </div>
                  <div className="p-3 bg-red-100 rounded-full">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Withdrawals */}
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Withdrawals ({timePeriod === 'today' ? 'Today' : timePeriod === 'weekly' ? 'This Week' : 'This Month'})</p>
                    <p className="text-2xl font-bold text-orange-600">₹{dailySummary.cashAddedInPeriod?.toLocaleString('en-IN') || 0}</p>
                    <p className="text-xs text-gray-500 mt-1">Amount withdrawn</p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-full">
                    <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Amount Saved */}
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Cash Remaining</p>
                    <p className="text-2xl font-bold text-green-600">₹{dailySummary.savingsAmount.toLocaleString('en-IN')}</p>
                    <p className="text-xs text-gray-500 mt-1">From budget</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Budget Status */}
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Budget Status</p>
                    <p className={`text-2xl font-bold ${!dailySummary.isOverBudget ? 'text-green-600' : 'text-red-600'}`}>
                      {!dailySummary.isOverBudget ? 'Under Budget' : 'Over Budget'}
                    </p>
                  </div>
                  <div className={`p-3 rounded-full ${!dailySummary.isOverBudget ? 'bg-green-100' : 'bg-red-100'}`}>
                    <svg className={`w-6 h-6 ${!dailySummary.isOverBudget ? 'text-green-600' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <ExpenseStats stats={stats} loading={loading} />

          {/* Expense List/Cards */}
          <ExpenseViewToggle
            expenses={expenses}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onApprove={handleApprove}
            onReject={handleReject}
            onMarkPaid={handleMarkPaid}
            onView={handleView}
            userRole="admin"
            currentUserId={userInfo?.userId || 'admin-user-id'}
          />
        </div>
      </div>
    </div>
  );
};

export default ExpenseManagement;