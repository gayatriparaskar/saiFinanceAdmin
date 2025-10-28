import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocalTranslation } from '../../../hooks/useLocalTranslation';
import { getCurrentUserInfo } from '../../../utils/authUtils';
import {
  // getAllExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  approveExpense,
  rejectExpense,
  markExpenseAsPaid,
  getExpenseStats,
  getExpensesWithCashData
} from '../../../services/expenseService';
import { getDailyCash } from '../../../services/cashManagementService';
import ExpenseForm from '../../../componant/Expense/ExpenseForm';
import ExpenseTable from '../../../componant/Expense/ExpenseTable';
import ExpenseStats from '../../../componant/Expense/ExpenseStats';
import LedgerView from '../../../componant/Expense/LedgerView';
import QuickExpenseEntry from '../../../componant/Expense/QuickExpenseEntry';
import OfficerNavbar from '../../../components/OfficerNavbar';

const AccountantExpensePage = () => {
  // const { t } = useLocalTranslation();
  const [expenses, setExpenses] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [officerName, setOfficerName] = useState('');
  
  // Form states
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  
  // Approval modal states
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  
  // Quick entry modal state
  const [showQuickEntry, setShowQuickEntry] = useState(false);
  
  // Currency notes tracker modal state
  const [showCurrencyTracker, setShowCurrencyTracker] = useState(false);
  
  // View expense modal state
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingExpense, setViewingExpense] = useState(null);
  
  // Cash management state
  const [dailyCash, setDailyCash] = useState(null);
  const [availableCash, setAvailableCash] = useState(0);
  
  // Insufficient balance popup state
  const [showInsufficientBalance, setShowInsufficientBalance] = useState(false);
  const [insufficientBalanceData, setInsufficientBalanceData] = useState(null);
  
  // View mode state
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'ledger'
  
  // Filter states
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    search: '',
    start_date: '',
    end_date: '',
    page: 1,
    limit: 10
  });
  
  // Time period filter
  const [timePeriod, setTimePeriod] = useState('today'); // 'today', 'weekly', 'monthly'
  
  // Daily summary state
  const [dailySummary, setDailySummary] = useState({
    totalExpenses: 0,
    totalAmount: 0,
    pendingAmount: 0,
    approvedAmount: 0,
    paidAmount: 0,
    rejectedAmount: 0,
    savingsAmount: 0,
    expenseCount: 0
  });
  
  // Pagination
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_pages: 1,
    total_count: 0,
    limit: 10
  });

  useEffect(() => {
    const currentUser = getCurrentUserInfo();
    console.log('🔍 AccountantExpensePage - Current user info:', currentUser);
    console.log('🔍 AccountantExpensePage - User ID for permissions:', currentUser.userId);
    console.log('🔍 AccountantExpensePage - Token:', localStorage.getItem('token'));
    console.log('🔍 AccountantExpensePage - Officer type:', localStorage.getItem('officerType'));
    console.log('🔍 AccountantExpensePage - User type:', localStorage.getItem('userType'));
    
    setUserInfo(currentUser);
    
    // Get officer name from localStorage
    const storedOfficerName = localStorage.getItem('officerName') || 'Accounter';
    setOfficerName(storedOfficerName);
    
    // Fetch daily cash (includes available cash)
    fetchDailyCash();
    
    // Check if user is accountant or admin
    if (currentUser.role !== 'accounter' && currentUser.role !== 'admin') {
      console.log('❌ Access denied - User role:', currentUser.role);
      setError('Access denied. Only accountants and admins can access this page.');
      return;
    }
    
    console.log('✅ Accounter access confirmed, fetching expenses...');
    fetchExpenses();
    fetchStats();
  }, []);

  // Debug expenses data
  useEffect(() => {
    console.log('🔍 AccountantExpensePage - Expenses state updated:', {
      expensesCount: expenses.length,
      expenses: expenses,
      userInfo: userInfo
    });
  }, [expenses, userInfo]);

  // Refetch when filters change
  useEffect(() => {
    if (userInfo) {
      fetchExpenses();
    }
  }, [filters]);

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
      console.log('📊 Accountant Daily summary recalculated:', dailySummaryData);
    }
  }, [availableCash, expenses]);

  // Recalculate summary when time period changes
  useEffect(() => {
    if (expenses.length > 0) {
      console.log('🔄 Accountant - Recalculating summary for period:', timePeriod);
      const dailySummaryData = calculateDailySummary(expenses, timePeriod);
      setDailySummary(dailySummaryData);
      console.log('📊 Accountant - Summary recalculated for period:', timePeriod, dailySummaryData);
    }
  }, [timePeriod, expenses]);

  const fetchDailyCash = async (forceRefresh = false) => {
    try {
      console.log('🔄 Accountant - Fetching daily cash...', forceRefresh ? '(Force Refresh)' : '');
      const response = await getDailyCash();
      console.log('💰 Accountant - Daily cash response:', response);
      console.log('💰 Accountant - Response success:', response.success);
      console.log('💰 Accountant - Response result:', response.result);
      
      if (response.success) {
        // Handle both response.result and response.message structures
        const cashData = response.result || response.message;
        console.log('✅ Accountant - Daily cash found:', cashData);
        console.log('💰 Accountant - Available amount:', cashData?.available_amount);
        console.log('💰 Accountant - Opening cash:', cashData?.opening_cash);
        setDailyCash(cashData);
        const newCashAmount = cashData?.available_amount || cashData?.opening_cash || 0;
        console.log('💰 Accountant - Setting available cash to:', newCashAmount);
        setAvailableCash(newCashAmount);
        console.log('💰 Accountant - Available cash after setting:', newCashAmount);
        
        // Immediately recalculate daily summary with new cash data
        console.log('🔄 Accountant - Recalculating summary with new cash data');
        const dailySummaryData = calculateDailySummary(expenses, timePeriod);
        setDailySummary(dailySummaryData);
        console.log('📊 Accountant - Summary recalculated:', dailySummaryData);
      } else {
        console.log('❌ Accountant - No daily cash setup found');
        setDailyCash(null);
        setAvailableCash(0);
      }
    } catch (error) {
      console.error('❌ Accountant - Error fetching daily cash:', error);
      setDailyCash(null);
      setAvailableCash(0);
    }
  };

  const fetchExpenses = async () => {
    try {
      console.log('🔄 AccountantExpensePage - Starting to fetch expenses...');
      setLoading(true);
      setError(null);
      
      const response = await getExpensesWithCashData(filters);
      console.log('📡 AccountantExpensePage - Combined API response:', response);
      
      if (response.success) {
        // Handle different response structures
        const expensesData = response.expenses.result?.expenses || 
                             response.expenses.data?.expenses || 
                             response.expenses.result || 
                             response.expenses.data ||
                             response.expenses.expenses ||
                             [];
        
        console.log('📊 AccountantExpensePage - Setting expenses:', expensesData);
        setExpenses(expensesData);
        setAvailableCash(response.availableCash || 0);
        
        const paginationData = response.expenses.result?.pagination || 
                               response.expenses.data?.pagination || 
                               response.expenses.pagination ||
                               pagination;
        setPagination(paginationData);
        
        console.log('💰 AccountantExpensePage - Available cash set to:', response.availableCash);
        
        // Calculate daily summary for real data
        const dailySummaryData = calculateDailySummary(expensesData, timePeriod);
        setDailySummary(dailySummaryData);
        
        console.log('✅ AccountantExpensePage - Expenses loaded successfully');
        console.log('📊 AccountantExpensePage - Daily summary calculated:', dailySummaryData);
      } else {
        console.log('❌ AccountantExpensePage - API returned error:', response.message);
        setError(response.message || 'Failed to fetch expenses');
      }
    } catch (err) {
      console.error('❌ AccountantExpensePage - Error fetching expenses:', err);
      console.error('❌ AccountantExpensePage - Error details:', {
        message: err.message,
        code: err.code,
        response: err.response?.data,
        status: err.response?.status
      });
      
      setError('Failed to fetch expenses. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      console.log('🔄 AccountantExpensePage - Fetching stats...');
      const response = await getExpenseStats();
      console.log('📊 AccountantExpensePage - Stats response:', response);
      if (response.success) {
        console.log('📊 AccountantExpensePage - Setting stats:', response.result || response.data);
        setStats(response.result || response.data);
      } else {
        console.log('❌ AccountantExpensePage - Stats API error:', response.message);
      }
    } catch (err) {
      console.error('❌ AccountantExpensePage - Error fetching stats:', err);
      
      // If API is unavailable, create mock stats for accountant review
      console.log('🔄 AccountantExpensePage - Creating mock stats for offline mode...');
      const mockStats = {
        total_expenses: expenses.length,
        approved_expenses: expenses.filter(exp => exp.status === 'approved').length,
        paid_expenses: expenses.filter(exp => exp.status === 'paid').length,
        total_amount: expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0),
        approved_amount: expenses.filter(exp => exp.status === 'approved').reduce((sum, exp) => sum + (exp.amount || 0), 0),
        paid_amount: expenses.filter(exp => exp.status === 'paid').reduce((sum, exp) => sum + (exp.amount || 0), 0),
        offline_mode: true
      };
      
      console.log('📊 AccountantExpensePage - Using mock stats:', mockStats);
      setStats(mockStats);
    }
  };

  const handleApprovalClick = (expense) => {
    setSelectedExpense(expense);
    setShowApprovalModal(true);
  };

  const handleApproveExpense = async (expense) => {
    try {
      // Optimistic UI: update local state immediately
      setExpenses(prev => prev.map(e => e._id === expense._id ? { ...e, status: 'approved' } : e));
      setStats(prev => prev ? {
        ...prev,
        counts: { ...(prev.counts || {}), approved: (prev.counts?.approved || 0) + (expense.status !== 'approved' ? 1 : 0) },
        amounts: { ...(prev.amounts || {}), approved: (prev.amounts?.approved || 0) + (expense.status !== 'approved' ? (expense.amount || 0) : 0) }
      } : prev);

      // API sync
      await approveExpense(expense._id);
      fetchStats();
    } catch (err) {
      console.error('Error approving expense (accountant):', err);
      // Revert by refetching
      fetchExpenses();
      alert('Failed to approve expense');
    }
  };

  const handleMarkPaidExpense = async (expense) => {
    try {
      // Optimistic UI
      setExpenses(prev => prev.map(e => e._id === expense._id ? { ...e, status: 'paid' } : e));
      setStats(prev => prev ? {
        ...prev,
        counts: { ...(prev.counts || {}), paid: (prev.counts?.paid || 0) + (expense.status !== 'paid' ? 1 : 0) },
        amounts: { ...(prev.amounts || {}), paid: (prev.amounts?.paid || 0) + (expense.status !== 'paid' ? (expense.amount || 0) : 0) }
      } : prev);

      // API sync
      await markExpenseAsPaid(expense._id);
      fetchStats();
    } catch (err) {
      console.error('Error marking paid (accountant):', err);
      fetchExpenses();
      alert('Failed to mark as paid');
    }
  };

  // const handleApprovalModalClose = () => {
  //   setShowApprovalModal(false);
  //   setSelectedExpense(null);
  // };

  const handleViewExpense = (expense) => {
    console.log('🔍 Viewing expense:', expense);
    setViewingExpense(expense);
    setShowViewModal(true);
  };

  const handleCloseViewModal = () => {
    setShowViewModal(false);
    setViewingExpense(null);
  };

  // Check for insufficient balance and show popup
  const checkInsufficientBalance = (newExpenseAmount) => {
    const currentTotal = dailySummary.totalAmount || 0;
    const newTotal = currentTotal + newExpenseAmount;
    const dailyBudget = dailySummary.dailyBudget || 10000;
    
    if (newTotal > dailyBudget) {
      const overAmount = newTotal - dailyBudget;
      setInsufficientBalanceData({
        currentSpent: currentTotal,
        newAmount: newExpenseAmount,
        newTotal: newTotal,
        dailyBudget: dailyBudget,
        overAmount: overAmount
      });
      setShowInsufficientBalance(true);
      return true;
    }
    return false;
  };

  // Handle insufficient balance popup close
  const handleInsufficientBalanceClose = () => {
    setShowInsufficientBalance(false);
    setInsufficientBalanceData(null);
  };

  // const handleApproveExpense = async (expenseId, data) => {
  //   try {
  //     setFormLoading(true);
  //     const response = await approveExpense(expenseId, data);
      
  //     if (response.success) {
  //       setShowApprovalModal(false);
  //       fetchExpenses();
  //       fetchStats();
  //       alert('Expense approved successfully!');
  //     } else {
  //       alert(response.message || 'Failed to approve expense');
  //     }
  //   } catch (err) {
  //     console.error('Error approving expense:', err);
  //     alert('Failed to approve expense. Please try again.');
  //   } finally {
  //     setFormLoading(false);
  //   }
  // };

  // const handleRejectExpense = async (expenseId, data) => {
  //   try {
  //     setFormLoading(true);
  //     const response = await rejectExpense(expenseId, data);
      
  //     if (response.success) {
  //       setShowApprovalModal(false);
  //       fetchExpenses();
  //       fetchStats();
  //       alert('Expense rejected successfully!');
  //     } else {
  //       alert(response.message || 'Failed to reject expense');
  //     }
  //   } catch (err) {
  //     console.error('Error rejecting expense:', err);
  //     alert('Failed to reject expense. Please try again.');
  //   } finally {
  //     setFormLoading(false);
  //   }
  // };

  // const handleMarkAsPaid = async (expenseId, data) => {
  //   try {
  //     setFormLoading(true);
  //     const response = await markExpenseAsPaid(expenseId, data);
      
  //     if (response.success) {
  //       setShowApprovalModal(false);
  //       fetchExpenses();
  //       fetchStats();
  //       alert('Expense marked as paid successfully!');
  //     } else {
  //       alert(response.message || 'Failed to mark expense as paid');
  //     }
  //   } catch (err) {
  //     console.error('Error marking expense as paid:', err);
  //     alert('Failed to mark expense as paid. Please try again.');
  //   } finally {
  //     setFormLoading(false);
  //   }
  // };

  const handleCreateExpense = async (expenseData) => {
    try {
      setFormLoading(true);
      
      // Check for insufficient balance before creating expense
      if (checkInsufficientBalance(expenseData.amount)) {
        setFormLoading(false);
        return; // Don't proceed if insufficient balance
      }
      
      const response = await createExpense(expenseData);
      
      if (response.success) {
        setShowForm(false);
        fetchExpenses();
        fetchStats();
        alert('Expense created successfully!');
      } else {
        alert(response.message || 'Failed to create expense');
      }
    } catch (err) {
      console.error('Error creating expense:', err);
      alert('Failed to create expense. Please try again.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditExpense = async (expenseData) => {
    try {
      setFormLoading(true);
      const response = await updateExpense(editingExpense._id, expenseData);
      
      if (response.success) {
        setShowForm(false);
        setEditingExpense(null);
        fetchExpenses();
        fetchStats();
        alert('Expense updated successfully!');
      } else {
        alert(response.message || 'Failed to update expense');
      }
    } catch (err) {
      console.error('Error updating expense:', err);
      alert('Failed to update expense. Please try again.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteExpense = async (expense) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) {
      return;
    }

    try {
      const response = await deleteExpense(expense._id);
      
      if (response.success) {
        fetchExpenses();
        fetchStats();
        alert('Expense deleted successfully!');
      } else {
        alert(response.message || 'Failed to delete expense');
      }
    } catch (err) {
      console.error('Error deleting expense:', err);
      alert('Failed to delete expense. Please try again.');
    }
  };

  const handleQuickExpenseSubmit = async (expenseData) => {
    try {
      setFormLoading(true);
      
      // Check for insufficient balance before creating expense
      if (checkInsufficientBalance(expenseData.amount)) {
        setFormLoading(false);
        return; // Don't proceed if insufficient balance
      }
      
      const response = await createExpense(expenseData);
      
      if (response.success) {
        setShowQuickEntry(false);
        fetchExpenses();
        fetchStats();
        alert('Expense added successfully!');
      } else {
        alert(response.message || 'Failed to create expense');
      }
    } catch (err) {
      console.error('Error creating expense:', err);
      alert('Failed to create expense. Please try again.');
    } finally {
      setFormLoading(false);
    }
  };

  // const handleCurrencyTrackerSubmit = async (withdrawalData) => {
  //   try {
  //     setFormLoading(true);
      
  //     const expenseData = {
  //       title: `Withdrawal - ${withdrawalData.withdrawal_reason}`,
  //       description: `Money withdrawal: ${withdrawalData.withdrawal_reason}`,
  //       amount: withdrawalData.total_notes_amount,
  //       category: 'personal',
  //       expense_type: 'debit',
  //       withdrawal_type: withdrawalData.withdrawal_type,
  //       withdrawal_reason: withdrawalData.withdrawal_reason,
  //       currency_notes: withdrawalData,
  //       expense_date: new Date().toISOString().split('T')[0],
  //       priority: 'high',
  //       status: 'pending'
  //     };
      
  //     const response = await createExpense(expenseData);
      
  //     if (response.success) {
  //       setShowCurrencyTracker(false);
  //       fetchExpenses();
  //       fetchStats();
  //       alert('Withdrawal recorded successfully!');
  //     } else {
  //       alert(response.message || 'Failed to record withdrawal');
  //     }
  //   } catch (err) {
  //     console.error('Error recording withdrawal:', err);
  //     alert('Failed to record withdrawal. Please try again.');
  //   } finally {
  //     setFormLoading(false);
  //   }
  // };

  const handleEditClick = (expense) => {
    setEditingExpense(expense);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingExpense(null);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleTimePeriodChange = (period) => {
    setTimePeriod(period);
    
    const today = new Date();
    let startDate = '';
    let endDate = '';
    
    switch (period) {
      case 'daily':
        startDate = today.toISOString().split('T')[0];
        endDate = today.toISOString().split('T')[0];
        break;
      case 'weekly':
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        startDate = startOfWeek.toISOString().split('T')[0];
        endDate = endOfWeek.toISOString().split('T')[0];
        break;
      case 'monthly':
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        startDate = startOfMonth.toISOString().split('T')[0];
        endDate = endOfMonth.toISOString().split('T')[0];
        break;
      default:
        startDate = '';
        endDate = '';
    }
    
    setFilters(prev => ({
      ...prev,
      start_date: startDate,
      end_date: endDate,
      page: 1
    }));
  };

  // Calculate daily summary with real data
  const calculateDailySummary = (expensesList, period = 'today') => {
    console.log('🔍 Accountant calculateDailySummary - Input expenses:', expensesList);
    console.log('🔍 Accountant calculateDailySummary - Expenses count:', expensesList.length);
    console.log('🔍 Accountant calculateDailySummary - Period:', period);
    
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
    
    console.log('🔍 Accountant calculateDailySummary - Filtered expenses count:', filteredExpenses.length);
    
    const totalAmount = filteredExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
    console.log('🔍 Accountant calculateDailySummary - Total amount calculated:', totalAmount);
    
    // Daily budget - can be made configurable later
    const dailyBudget = 10000;
    // Amount saved = Available cash - Expenses (use real available cash)
    console.log('💰 Accountant calculateDailySummary - Available cash:', availableCash);
    console.log('💰 Accountant calculateDailySummary - Total amount:', totalAmount);
    console.log('💰 Accountant calculateDailySummary - Available cash type:', typeof availableCash);
    console.log('💰 Accountant calculateDailySummary - Total amount type:', typeof totalAmount);
    console.log('💰 Accountant calculateDailySummary - Available cash is number:', !isNaN(availableCash));
    console.log('💰 Accountant calculateDailySummary - Total amount is number:', !isNaN(totalAmount));
    
    // Use availableCash directly from state, not calculated from expenses
    const savingsAmount = Math.max(0, availableCash);
    console.log('💰 Accountant calculateDailySummary - Savings amount (using availableCash directly):', savingsAmount);
    console.log('💰 Accountant calculateDailySummary - Final calculation:', `availableCash: ${availableCash}, savingsAmount: ${savingsAmount}`);
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
    
    console.log('📊 Accountant Daily Summary Calculation:', {
      totalExpenses: summary.totalExpenses,
      totalAmount: summary.totalAmount,
      approvedAmount: summary.approvedAmount,
      paidAmount: summary.paidAmount,
      savingsAmount: summary.savingsAmount,
      isOverBudget: summary.isOverBudget
    });
    
    return summary;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (loading && expenses.length === 0) {
    return (
      <>
        <OfficerNavbar officerType="accounter" officerName={officerName} pageName="Expense Review" />
        <div className="min-h-screen bg-primaryBg pt-16 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading expenses...</p>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <OfficerNavbar officerType="accounter" officerName={officerName} pageName="Expense Review" />
        <div className="min-h-screen bg-primaryBg pt-16 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-500 text-lg mb-4">{error}</div>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primaryDark"
            >
              Retry
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <OfficerNavbar officerType="accounter" officerName={officerName} pageName="Expense Review" />
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="min-h-screen bg-primaryBg pt-16"
      >
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header - Removed Accounter Expense Review Section */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center gap-6">
            {/* View Mode Toggle */}
            <div className="flex bg-white rounded-xl p-1 shadow-sm border border-gray-200 w-fit">
              <button
                onClick={() => setViewMode('table')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  viewMode === 'table' 
                    ? 'bg-blue-500 text-white shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                📊 Table View
              </button>
              <button
                onClick={() => setViewMode('ledger')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  viewMode === 'ledger' 
                    ? 'bg-blue-500 text-white shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                📋 Ledger View
              </button>
            </div>
            
            {/* Accounter Action Buttons - Review Only */}
            <div className="flex flex-wrap gap-3 justify-center">
              <button
                onClick={() => {
                  console.log('🔄 Manual refresh triggered');
                  fetchExpenses();
                  fetchStats();
                }}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center space-x-2 text-sm font-medium shadow-sm hover:shadow-md"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Refresh Data</span>
              </button>
            </div>
          </div>
        </motion.div>




        {/* Daily Summary */}
        <motion.div variants={itemVariants} className="mb-6 sm:mb-8">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <h3 className="text-lg font-semibold text-gray-900">📊 Expense Summary</h3>
              
              {/* Time Period Selector */}
              <div className="flex bg-white rounded-lg p-1 shadow-sm border">
                <button
                  onClick={() => setTimePeriod('today')}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                    timePeriod === 'today' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Today
                </button>
                <button
                  onClick={() => setTimePeriod('weekly')}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                    timePeriod === 'weekly' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Weekly
                </button>
                <button
                  onClick={() => setTimePeriod('monthly')}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                    timePeriod === 'monthly' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Monthly
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
                    <p className="text-xs text-gray-500 mt-1">From available cash</p>
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
        </motion.div>

        {/* Stats */}
        <motion.div variants={itemVariants} className="mb-6 sm:mb-8">
          <ExpenseStats stats={stats} loading={loading} />
        </motion.div>

        {/* Filters */}
        <motion.div variants={itemVariants} className="mb-6">
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Filters</h3>
            
            {/* Time Period Filter */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Time Period</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleTimePeriodChange('all')}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    timePeriod === 'all'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  📅 All Time
                </button>
                <button
                  onClick={() => handleTimePeriodChange('daily')}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    timePeriod === 'daily'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  📊 Today
                </button>
                <button
                  onClick={() => handleTimePeriodChange('weekly')}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    timePeriod === 'weekly'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  📈 This Week
                </button>
                <button
                  onClick={() => handleTimePeriodChange('monthly')}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    timePeriod === 'monthly'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  📉 This Month
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange({ status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="paid">Paid</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange({ category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                >
                  <option value="">All Categories</option>
                  <option value="office_supplies">Office Supplies</option>
                  <option value="travel">Travel</option>
                  <option value="personal">Personal</option>
                  <option value="marketing">Marketing</option>
                  <option value="training">Training</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                <input
                  type="date"
                  value={filters.start_date}
                  onChange={(e) => handleFilterChange({ start_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                <input
                  type="date"
                  value={filters.end_date}
                  onChange={(e) => handleFilterChange({ end_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                />
              </div>
            </div>
            
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange({ search: e.target.value })}
                placeholder="Search by title, description, or tags..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
            </div>
          </div>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div variants={itemVariants} className="mb-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          </motion.div>
        )}

        {/* Expense Display */}
        <motion.div variants={itemVariants}>
          {viewMode === 'table' ? (
            <ExpenseTable
              expenses={expenses}
              loading={loading}
              onEdit={handleEditClick}
              onDelete={handleDeleteExpense}
              onApprove={handleApproveExpense}
              onReject={handleApprovalClick}
              onMarkPaid={handleMarkPaidExpense}
              onView={handleViewExpense}
              userRole="admin"
              currentUserId={userInfo?.userId}
            />
          ) : (
            <LedgerView
              expenses={expenses}
              loading={loading}
            />
          )}
        </motion.div>

        {/* Pagination */}
        {pagination.total_pages > 1 && (
          <motion.div variants={itemVariants} className="mt-4 sm:mt-6">
            <div className="bg-white rounded-lg shadow p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                <div className="text-sm text-gray-700">
                  Showing {((pagination.current_page - 1) * pagination.limit) + 1} to {Math.min(pagination.current_page * pagination.limit, pagination.total_count)} of {pagination.total_count} expenses
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleFilterChange({ page: pagination.current_page - 1 })}
                    disabled={pagination.current_page <= 1}
                    className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-1 text-sm bg-primary text-white rounded">
                    {pagination.current_page} of {pagination.total_pages}
                  </span>
                  <button
                    onClick={() => handleFilterChange({ page: pagination.current_page + 1 })}
                    disabled={pagination.current_page >= pagination.total_pages}
                    className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Expense Form Modal */}
      <ExpenseForm
        isOpen={showForm}
        onClose={handleFormClose}
        onSubmit={editingExpense ? handleEditExpense : handleCreateExpense}
        initialData={editingExpense}
        isEditing={!!editingExpense}
        loading={formLoading}
      />

      {/* Quick Expense Entry Modal */}
      <QuickExpenseEntry
        isOpen={showQuickEntry}
        onClose={() => setShowQuickEntry(false)}
        onSubmit={handleQuickExpenseSubmit}
        loading={formLoading}
      />

      {/* View Expense Modal */}
      {showViewModal && viewingExpense && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Expense Details
                </h3>
                <button
                  onClick={handleCloseViewModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Content */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Title</label>
                    <p className="mt-1 text-sm text-gray-900">{viewingExpense.title}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Amount</label>
                    <p className="mt-1 text-sm text-gray-900 font-semibold">₹{viewingExpense.amount?.toLocaleString('en-IN')}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <div className="mt-1">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        viewingExpense.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        viewingExpense.status === 'approved' ? 'bg-green-100 text-green-800' :
                        viewingExpense.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        viewingExpense.status === 'paid' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {viewingExpense.status?.charAt(0).toUpperCase() + viewingExpense.status?.slice(1)}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Category</label>
                    <p className="mt-1 text-sm text-gray-900 capitalize">{viewingExpense.category?.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Priority</label>
                    <div className="mt-1">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        viewingExpense.priority === 'low' ? 'bg-green-100 text-green-800' :
                        viewingExpense.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        viewingExpense.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                        viewingExpense.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {viewingExpense.priority?.charAt(0).toUpperCase() + viewingExpense.priority?.slice(1)}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {viewingExpense.expense_date ? new Date(viewingExpense.expense_date).toLocaleDateString('en-IN') : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Created By</label>
                    <p className="mt-1 text-sm text-gray-900">{viewingExpense.created_by?.name || 'Unknown'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Officer Type</label>
                    <p className="mt-1 text-sm text-gray-900 capitalize">{viewingExpense.created_by?.officer_type || 'N/A'}</p>
                  </div>
                </div>

                {viewingExpense.description && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <p className="mt-1 text-sm text-gray-900">{viewingExpense.description}</p>
                  </div>
                )}

                {viewingExpense.tags && viewingExpense.tags.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tags</label>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {viewingExpense.tags.map((tag, index) => (
                        <span key={index} className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={handleCloseViewModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Insufficient Balance Popup */}
      {showInsufficientBalance && insufficientBalanceData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-red-100 rounded-full">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Insufficient Balance</h3>
                </div>
                <button
                  onClick={handleInsufficientBalanceClose}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="space-y-4">
                <p className="text-gray-600">
                  Adding this expense would exceed your daily budget limit.
                </p>
                
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Current Spent:</span>
                    <span className="text-sm font-medium">₹{insufficientBalanceData.currentSpent.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">New Expense:</span>
                    <span className="text-sm font-medium">₹{insufficientBalanceData.newAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Daily Budget:</span>
                    <span className="text-sm font-medium">₹{insufficientBalanceData.dailyBudget.toLocaleString('en-IN')}</span>
                  </div>
                  <hr className="my-2" />
                  <div className="flex justify-between">
                    <span className="text-sm font-semibold text-red-600">Over Budget By:</span>
                    <span className="text-sm font-semibold text-red-600">₹{insufficientBalanceData.overAmount.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={handleInsufficientBalanceClose}
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      // Allow user to proceed anyway
                      handleInsufficientBalanceClose();
                      // You can add logic here to proceed with the expense
                    }}
                    className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Proceed Anyway
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      </motion.div>
    </>
  );
};

export default AccountantExpensePage;

