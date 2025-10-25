import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocalTranslation } from '../../../hooks/useLocalTranslation';
import { getCurrentUserInfo } from '../../../utils/authUtils';
import {
  getAllExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  getExpenseStats
} from '../../../services/expenseService';
import ExpenseForm from '../../../componant/Expense/ExpenseForm';
import ExpenseTable from '../../../componant/Expense/ExpenseTable';
import ExpenseStats from '../../../componant/Expense/ExpenseStats';
import LedgerView from '../../../componant/Expense/LedgerView';
import QuickExpenseEntry from '../../../componant/Expense/QuickExpenseEntry';
import WithdrawModal from '../../../componant/Expense/WithdrawModal';
import MorningCashSetup from '../../../componant/Expense/MorningCashSetup';
import InsufficientFundsModal from '../../../componant/Expense/InsufficientFundsModal';
import { 
  getDailyCash, 
  setDailyCash, 
  // getAvailableCash, 
  checkSufficientCash,
  withdrawCash,
  // getTodayDate,
  calculateCashAddedInPeriod
} from '../../../services/cashManagementService';

const ManagerExpensePage = () => {
  // const { t } = useLocalTranslation();
  const [expenses, setExpenses] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  
  // Form states
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  
  // View mode state
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'ledger'
  
  // Time period state
  const [timePeriod, setTimePeriod] = useState('today'); // 'today', 'weekly', 'monthly'
  
  // Quick entry modal state
  const [showQuickEntry, setShowQuickEntry] = useState(false);
  
  // Withdraw modal state
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  
  // Cash management state
  const [dailyCash, setDailyCashState] = useState(null);
  const [availableCash, setAvailableCash] = useState(0);
  const [showMorningSetup, setShowMorningSetup] = useState(false);
  const [showInsufficientFunds, setShowInsufficientFunds] = useState(false);
  const [insufficientFundsData, setInsufficientFundsData] = useState(null);
  const [cashLoading, setCashLoading] = useState(false);
  
  // Daily summary state
  const [dailySummary, setDailySummary] = useState({
    totalExpenses: 0,
    totalAmount: 0,
    approvedAmount: 0,
    paidAmount: 0,
    savingsAmount: 0,
    dailyBudget: 10000,
    isOverBudget: false,
    overBudgetAmount: 0
  });
  
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
  
  // Pagination
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_pages: 1,
    total_count: 0,
    limit: 10
  });

  useEffect(() => {
    const currentUser = getCurrentUserInfo();
    console.log('🔍 ManagerExpensePage - Current user info:', currentUser);
    console.log('🔍 ManagerExpensePage - User ID for permissions:', currentUser.userId);
    console.log('🔍 ManagerExpensePage - Token:', localStorage.getItem('token'));
    console.log('🔍 ManagerExpensePage - Officer type:', localStorage.getItem('officerType'));
    console.log('🔍 ManagerExpensePage - User type:', localStorage.getItem('userType'));
    console.log('🔍 ManagerExpensePage - Full localStorage:', {
      token: localStorage.getItem('token'),
      userType: localStorage.getItem('userType'),
      officerType: localStorage.getItem('officerType'),
      officerName: localStorage.getItem('officerName')
    });
    
    setUserInfo(currentUser);
    
    // Check if user is manager (check both role and officerType)
    if (currentUser.role !== 'manager' && currentUser.officerType !== 'manager') {
      console.log('❌ Access denied - User role:', currentUser.role, 'Officer type:', currentUser.officerType);
      setError('Access denied. Only managers can access this page.');
      return;
    }
    
    console.log('✅ Manager access confirmed, fetching expenses...');
    
    // Reset insufficient funds modal state
    setShowInsufficientFunds(false);
    setInsufficientFundsData(null);
    
    fetchExpenses();
    fetchStats();
    fetchDailyCash();
  }, []);

  // Debug expenses data
  useEffect(() => {
    console.log('🔍 ManagerExpensePage - Expenses state updated:', {
      expensesCount: expenses.length,
      expenses: expenses,
      userInfo: userInfo
    });
  }, [expenses, userInfo]);

  // Recalculate summary when time period changes
  useEffect(() => {
    const recalculateSummary = async () => {
      if (expenses.length > 0) {
        console.log('🔄 Recalculating summary for period:', timePeriod);
        const summary = await calculatePeriodSummary(expenses, timePeriod);
        setDailySummary(summary);
        console.log('📊 Manager Period Summary Updated:', summary);
      }
    };
    
    recalculateSummary();
  }, [timePeriod]);

  // Recalculate summary when availableCash changes (after withdrawal/add cash)
  useEffect(() => {
    const recalculateSummary = async () => {
      if (expenses.length > 0 && availableCash !== undefined) {
        console.log('🔄 Manager - Recalculating summary due to availableCash change:', availableCash);
        const summary = await calculatePeriodSummary(expenses, timePeriod);
        setDailySummary(summary);
        console.log('📊 Manager - Summary recalculated after cash change:', summary);
      }
    };
    recalculateSummary();
  }, [availableCash, expenses, timePeriod]);

  const fetchExpenses = async () => {
    try {
      console.log('🔄 ManagerExpensePage - Starting to fetch expenses...');
      setLoading(true);
      setError(null);
      
      const response = await getAllExpenses(filters);
      console.log('📡 ManagerExpensePage - API response:', response);
      
      if (response.success) {
        const expensesData = response.result.expenses || [];
        console.log('📊 ManagerExpensePage - Setting expenses:', expensesData);
        console.log('📊 ManagerExpensePage - Expenses count:', expensesData.length);
        console.log('📊 ManagerExpensePage - Expenses details:', expensesData.map(exp => ({ title: exp.title, amount: exp.amount, status: exp.status })));
        console.log('🔍 ManagerExpensePage - Full expense data source check:', {
          isRealData: expensesData.length > 0 && expensesData[0]._id && expensesData[0]._id.startsWith('68'),
          dataSource: 'API Response',
          expenseCount: expensesData.length,
          sampleExpense: expensesData[0] || null,
          allExpenses: expensesData.map(exp => ({ id: exp._id, title: exp.title, amount: exp.amount, status: exp.status }))
        });
        setExpenses(expensesData);
        setPagination(response.result.pagination || pagination);
        
        // Calculate period-based summary for real data
        const periodSummaryData = await calculatePeriodSummary(expensesData, timePeriod);
        setDailySummary(periodSummaryData);
        
        console.log('✅ ManagerExpensePage - Expenses loaded successfully');
        console.log('📊 Manager Period summary calculated:', periodSummaryData);
      } else {
        console.log('❌ ManagerExpensePage - API returned error:', response.message);
        setError(response.message || 'Failed to fetch expenses');
      }
    } catch (err) {
      console.error('❌ ManagerExpensePage - Error fetching expenses:', err);
      console.error('❌ ManagerExpensePage - Error details:', {
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
      console.log('🔄 ManagerExpensePage - Fetching stats...');
      const response = await getExpenseStats();
      console.log('📊 ManagerExpensePage - Stats response:', response);
      if (response.success) {
        console.log('📊 ManagerExpensePage - Setting stats:', response.result);
        setStats(response.result);
      } else {
        console.log('❌ ManagerExpensePage - Stats API error:', response.message);
      }
    } catch (err) {
      console.error('❌ ManagerExpensePage - Error fetching stats:', err);
    }
  };

  const fetchDailyCash = async () => {
    try {
      console.log('🔄 ManagerExpensePage - Fetching daily cash...');
      setCashLoading(true);
      const response = await getDailyCash();
      console.log('💰 ManagerExpensePage - Daily cash response:', response);
      console.log('💰 ManagerExpensePage - Response success:', response.success);
      console.log('💰 ManagerExpensePage - Response result:', response.result);
      console.log('💰 ManagerExpensePage - Current availableCash before update:', availableCash);
      
      if (response.success && (response.result || response.message)) {
        const cashData = response.result || response.message;
        console.log('✅ Daily cash found:', cashData);
        console.log('💰 Available amount:', cashData.available_amount);
        console.log('💰 Opening cash:', cashData.opening_cash);
        setDailyCashState(cashData);
        const newCashAmount = cashData.available_amount || cashData.opening_cash || 0;
        console.log('💰 Setting available cash to:', newCashAmount);
        setAvailableCash(newCashAmount);
        console.log('💰 Available cash after setting:', newCashAmount);
        
        // Immediately recalculate period summary with new cash data
        console.log('🔄 Manager - Recalculating period summary with new cash data');
        const periodSummaryData = await calculatePeriodSummary(expenses, timePeriod);
        setDailySummary(periodSummaryData);
        console.log('📊 Manager - Period summary recalculated:', periodSummaryData);
        
        // Cash is properly set up
        console.log('✅ Daily cash is properly set up');
        setShowMorningSetup(false);
      } else {
        console.log('❌ ManagerExpensePage - No daily cash setup found');
        console.log('❌ ManagerExpensePage - Response success:', response.success);
        console.log('❌ ManagerExpensePage - Response result:', response.result);
        console.log('❌ ManagerExpensePage - Response message:', response.message);
        setDailyCashState(null);
        setAvailableCash(0);
        setShowMorningSetup(false);
      }
    } catch (err) {
      console.error('❌ ManagerExpensePage - Error fetching daily cash:', err);
      setDailyCashState(null);
      setAvailableCash(0);
      setShowMorningSetup(false);
      
      // If it's a 404 error (no cash setup), that's expected
      if (err.response?.status === 404) {
        console.log('ℹ️ No daily cash setup found - this is expected for first-time setup');
      }
    } finally {
      setCashLoading(false);
    }
  };

  // Calculate period-based summary with real data
  const calculatePeriodSummary = async (expensesList, period) => {
    console.log('🔍 Manager calculatePeriodSummary - Input expenses:', expensesList);
    console.log('🔍 Manager calculatePeriodSummary - Period:', period);
    console.log('🔍 Manager calculatePeriodSummary - Expenses count:', expensesList.length);
    
    // Filter expenses based on time period
    let filteredExpenses = expensesList;
    const now = new Date();
    
    if (period === 'today') {
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      filteredExpenses = expensesList.filter(exp => {
        // Use expense_date if available, otherwise fall back to created_at/createdAt
        const expDate = new Date(exp.expense_date || exp.created_at || exp.createdAt);
        console.log('🔍 Manager - Filtering expense:', {
          title: exp.title,
          amount: exp.amount,
          expense_date: exp.expense_date,
          created_at: exp.created_at,
          createdAt: exp.createdAt,
          expDate: expDate,
          today: today,
          isToday: expDate >= today && expDate < tomorrow
        });
        return expDate >= today && expDate < tomorrow;
      });
    } else if (period === 'weekly') {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay()); // Start of current week
      weekStart.setHours(0, 0, 0, 0);
      
      filteredExpenses = expensesList.filter(exp => {
        const expDate = new Date(exp.created_at || exp.createdAt);
        return expDate >= weekStart;
      });
    } else if (period === 'monthly') {
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      
      filteredExpenses = expensesList.filter(exp => {
        const expDate = new Date(exp.created_at || exp.createdAt);
        return expDate >= monthStart;
      });
    }
    
    console.log('🔍 Manager calculatePeriodSummary - Filtered expenses count:', filteredExpenses.length);
    
    const totalAmount = filteredExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
    console.log('🔍 Manager calculatePeriodSummary - Total amount calculated:', totalAmount);
    
    // Calculate withdrawals in the period using real API data
    const withdrawalsInPeriod = await calculateCashAddedInPeriodFromAPI(period);
    
    // Period budget - can be made configurable later
    const periodBudget = period === 'today' ? 10000 : period === 'weekly' ? 70000 : 300000;
    // Amount saved = Available cash - Expenses (use real available cash)
    const availableCashAmount = availableCash || 0;
    console.log('💰 Manager calculatePeriodSummary - Available cash:', availableCashAmount);
    console.log('💰 Manager calculatePeriodSummary - Total amount:', totalAmount);
    console.log('💰 Manager calculatePeriodSummary - Withdrawals in period:', withdrawalsInPeriod);
    console.log('💰 Manager calculatePeriodSummary - Available cash type:', typeof availableCashAmount);
    console.log('💰 Manager calculatePeriodSummary - Total amount type:', typeof totalAmount);
    console.log('💰 Manager calculatePeriodSummary - Available cash is number:', !isNaN(availableCashAmount));
    console.log('💰 Manager calculatePeriodSummary - Total amount is number:', !isNaN(totalAmount));
    console.log('🔍 Manager calculatePeriodSummary - Total expenses:', expensesList.length);
    console.log('🔍 Manager calculatePeriodSummary - Filtered expenses:', filteredExpenses.length);
    console.log('🔍 Manager calculatePeriodSummary - Period:', period);
    
    // Use availableCash directly for cash remaining
    const savingsAmount = availableCashAmount;
    const isOverBudget = totalAmount > periodBudget;
    
    const summary = {
      totalExpenses: filteredExpenses.length,
      totalAmount: totalAmount,
      approvedAmount: filteredExpenses.filter(exp => exp.status === 'approved').reduce((sum, exp) => sum + (exp.amount || 0), 0),
      paidAmount: filteredExpenses.filter(exp => exp.status === 'paid').reduce((sum, exp) => sum + (exp.amount || 0), 0),
      savingsAmount: savingsAmount,
      cashAddedInPeriod: withdrawalsInPeriod,
      expenseCount: filteredExpenses.length,
      periodBudget: periodBudget,
      isOverBudget: isOverBudget,
      overBudgetAmount: isOverBudget ? totalAmount - periodBudget : 0,
      period: period
    };
    
    console.log('📊 Manager Period Summary Calculation:', {
      period: summary.period,
      totalExpenses: summary.totalExpenses,
      totalAmount: summary.totalAmount,
      approvedAmount: summary.approvedAmount,
      paidAmount: summary.paidAmount,
      savingsAmount: summary.savingsAmount,
      cashAddedInPeriod: summary.cashAddedInPeriod,
      isOverBudget: summary.isOverBudget,
      availableCash: availableCashAmount
    });
    console.log('📊 Manager Final Summary Object:', summary);
    
    return summary;
  };

  // Calculate cash added in the selected period using real API data
  const calculateCashAddedInPeriodFromAPI = async (period) => {
    try {
      console.log('🔄 Fetching real cash data for period:', period);
      const cashAdded = await calculateCashAddedInPeriod(period);
      console.log('💰 Real cash added in period:', cashAdded);
      return cashAdded;
    } catch (error) {
      console.error('❌ Error fetching cash data for period:', error);
      // Fallback to 0 if API fails
      return 0;
    }
  };

  const handleCreateExpense = async (expenseData) => {
    try {
      setFormLoading(true);
      
      // Check if sufficient cash is available before creating expense
      const hasSufficientCash = await checkCashBeforeExpense(expenseData.amount);
      if (!hasSufficientCash) {
        setFormLoading(false);
        return; // Don't create expense if insufficient funds
      }
      
      const response = await createExpense(expenseData);
      
      if (response.success) {
        setShowForm(false);
        fetchExpenses();
        fetchStats();
        fetchDailyCash(); // Refresh cash data
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


  const handleEditClick = (expense) => {
    console.log('🔍 ManagerExpensePage - Edit button clicked:', {
      expenseId: expense._id,
      expenseTitle: expense.title,
      currentUserId: userInfo?.userId,
      expenseCreatedBy: expense.created_by?._id
    });
    setEditingExpense(expense);
    setShowForm(true);
  };

  const handleViewClick = (expense) => {
    // For now, we'll show the expense details in an alert
    // You can replace this with a modal or detailed view component
    alert(`Expense Details:\n\nTitle: ${expense.title}\nAmount: ₹${expense.amount}\nCategory: ${expense.category}\nStatus: ${expense.status}\nPriority: ${expense.priority}\nDate: ${new Date(expense.expense_date).toLocaleDateString()}\nDescription: ${expense.description || 'No description'}`);
  };

  const handleWithdrawSubmit = async (withdrawData) => {
    try {
      setWithdrawLoading(true);
      console.log('🔍 Withdraw data:', withdrawData);
      
      // Call the actual API to withdraw cash
      const response = await withdrawCash(withdrawData);
      console.log('💰 Withdraw response:', response);
      
      if (response.success) {
        console.log('✅ Withdrawal successful');
        
        // Update local state immediately
        if (response.result) {
          setDailyCashState(response.result);
          setAvailableCash(response.result.available_amount || 0);
        }
        
        // Close the modal
        setShowWithdrawModal(false);
        
        // Show success message
        alert(`Withdrawal successful!\n\nAmount: ₹${withdrawData.amount}\nPurpose: ${withdrawData.purpose}\nType: ${withdrawData.withdrawType}\n\nYou can now use these funds to pay expenses directly.`);
        
        // Refresh all data
        fetchDailyCash();
        fetchExpenses();
        fetchStats();
        
      } else {
        console.error('❌ Withdrawal failed:', response.message);
        alert(`Failed to process withdrawal: ${response.message}`);
      }
      
    } catch (error) {
      console.error('❌ Error processing withdrawal:', error);
      alert('Failed to process withdrawal. Please try again.');
    } finally {
      setWithdrawLoading(false);
    }
  };

  const handleMorningCashSetup = async (cashData) => {
    try {
      setCashLoading(true);
      console.log('🔍 Morning cash setup data:', cashData);
      
      // Call the actual API to set daily cash
      const response = await setDailyCash(cashData);
      console.log('💰 Cash setup response:', response);
      
      if (response.success) {
        console.log('✅ Daily cash setup successful');
        
        // Update local state immediately
        console.log('💰 Setting cash state:', response.message);
        setDailyCashState(response.message);
        const newAvailableCash = response.message.available_amount || response.message.opening_cash || 0;
        console.log('💰 Setting available cash to:', newAvailableCash);
        setAvailableCash(newAvailableCash);
        
        // Close the modal
        setShowMorningSetup(false);
        
        // Show success message
        const isUpdate = response.message && response.message._id;
        const message = isUpdate 
          ? `Cash added successfully!\n\nAmount Added: ₹${cashData.opening_cash}\nNew Total: ₹${response.message.available_amount}\nDate: ${cashData.date}`
          : `Daily cash setup successful!\n\nOpening Cash: ₹${cashData.opening_cash}\nDate: ${cashData.date}\n\nYou can now track expenses against this amount.`;
        alert(message);
        
        // Don't refresh data automatically - keep the local state
        console.log('✅ Cash setup completed, keeping local state');
        
      } else {
        console.error('❌ Cash setup failed:', response.message);
        alert(`Failed to setup daily cash: ${response.message}`);
      }
      
    } catch (error) {
      console.error('❌ Error setting up daily cash:', error);
      alert('Failed to setup daily cash. Please try again.');
    } finally {
      setCashLoading(false);
    }
  };

  const checkCashBeforeExpense = async (expenseAmount) => {
    try {
      console.log('🔍 Checking cash availability for amount:', expenseAmount);
      const response = await checkSufficientCash(expenseAmount);
      console.log('🔍 Cash check response:', response);
      
      // Extract the actual data from the response
      const cashCheck = response.message || response;
      console.log('🔍 Extracted cash check data:', cashCheck);
      console.log('🔍 Sufficient check:', cashCheck.sufficient);
      
      if (!cashCheck.sufficient) {
        console.log('❌ Insufficient cash:', cashCheck);
        setInsufficientFundsData(cashCheck);
        setShowInsufficientFunds(true);
        return false;
      }
      
      console.log('✅ Sufficient cash available');
      return true;
    } catch (error) {
      console.error('Error checking cash availability:', error);
      // If check fails, allow the expense (fallback)
      return true;
    }
  };

  const handleInsufficientFundsWithdraw = () => {
    setShowInsufficientFunds(false);
    setShowWithdrawModal(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingExpense(null);
  };

  const handleAddExpenseClick = () => {
    // Reset insufficient funds modal when opening form
    setShowInsufficientFunds(false);
    setInsufficientFundsData(null);
    setShowForm(true);
  };

  const handleRefresh = async () => {
    try {
      console.log('🔄 Manager - Manual refresh triggered');
      setLoading(true);
      await Promise.all([
        fetchExpenses(),
        fetchStats(),
        fetchDailyCash()
      ]);
      console.log('✅ Manager - Manual refresh completed');
    } catch (error) {
      console.error('❌ Manager - Manual refresh failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
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
      <div className="min-h-screen bg-primaryBg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading expenses...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-primaryBg flex items-center justify-center">
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
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-primaryBg"
      style={{ paddingTop: '80px' }}
    >
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-6 sm:mb-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Manager Expense Dashboard</h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">
                Create and manage expenses for approval
              </p>
            </div>
            <div className="flex flex-col lg:flex-row lg:items-center gap-4 w-full lg:w-auto">
              {/* View Mode Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1 w-fit flex-shrink-0">
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    viewMode === 'table' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  📊 Table View
                </button>
                <button
                  onClick={() => setViewMode('ledger')}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    viewMode === 'ledger' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  📋 Ledger View
                </button>
              </div>
              
              {/* Manager Action Buttons */}
              <div className="flex flex-wrap gap-2 lg:ml-auto relative z-10">
                <button
                  onClick={() => setShowQuickEntry(true)}
                  className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 text-sm whitespace-nowrap"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>Quick Add</span>
                </button>
                
                <button
                  onClick={() => setShowWithdrawModal(true)}
                  className="px-3 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors flex items-center space-x-2 text-sm whitespace-nowrap"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                  <span>Withdraw</span>
                </button>
                
                <button
                  onClick={handleAddExpenseClick}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primaryDark transition-colors flex items-center space-x-2 text-sm whitespace-nowrap"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Add Expense</span>
                </button>

                <button
                  onClick={handleRefresh}
                  disabled={loading}
                  className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2 text-sm whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg 
                    className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Cash Status Banner */}
        <motion.div variants={itemVariants} className="mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-full bg-blue-100">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-blue-800">
                    Available Cash: ₹{availableCash.toLocaleString('en-IN')}
                  </h3>
                  <p className="text-xs text-blue-600">
                    {dailyCash ? `Opening Cash: ₹${dailyCash.opening_cash?.toLocaleString('en-IN')}` : 'No cash setup for today'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowMorningSetup(true)}
                className="px-3 py-1 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {dailyCash ? 'Add Cash' : 'Setup Cash'}
              </button>
            </div>
          </div>
        </motion.div>


        {/* Expense Summary Cards */}
        <motion.div variants={itemVariants} className="mb-6 sm:mb-8">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
              <div className="flex items-center gap-3">
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
              {/* Withdrawals in Period */}
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

              {/* Total Amount Spent */}
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Amount Spent ({timePeriod === 'today' ? 'Today' : timePeriod === 'weekly' ? 'This Week' : 'This Month'})</p>
                    <p className="text-2xl font-bold text-red-600">₹{dailySummary.totalAmount.toLocaleString('en-IN')}</p>
                    <p className="text-xs text-gray-500 mt-1">{dailySummary.totalExpenses} expenses</p>
                  </div>
                  <div className="p-3 bg-red-100 rounded-full">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Amount Saved */}
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Cash Remaining ({timePeriod === 'today' ? 'Today' : timePeriod === 'weekly' ? 'This Week' : 'This Month'})</p>
                    <p className="text-2xl font-bold text-green-600">₹{dailySummary.savingsAmount.toLocaleString('en-IN')}</p>
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

        {/* Expense Display */}
        <motion.div variants={itemVariants}>
          {viewMode === 'table' ? (
            <ExpenseTable
              expenses={expenses}
              loading={loading}
              onEdit={handleEditClick}
              onDelete={handleDeleteExpense}
              onView={handleViewClick}
              onApprove={() => {}} // Managers can't approve
              onReject={() => {}} // Managers can't reject
              onMarkPaid={() => {}} // Managers can't mark as paid
              userRole="manager"
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

      {/* Withdraw Modal */}
      <WithdrawModal
        isOpen={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        onSubmit={handleWithdrawSubmit}
        loading={withdrawLoading}
      />

      {/* Morning Cash Setup Modal */}
      <MorningCashSetup
        isOpen={showMorningSetup}
        onClose={() => setShowMorningSetup(false)}
        onSubmit={handleMorningCashSetup}
        loading={cashLoading}
        existingCash={dailyCash}
      />

      {/* Insufficient Funds Modal */}
      <InsufficientFundsModal
        isOpen={showInsufficientFunds}
        onClose={() => setShowInsufficientFunds(false)}
        onWithdraw={handleInsufficientFundsWithdraw}
        availableAmount={insufficientFundsData?.available || 0}
        requiredAmount={insufficientFundsData?.required || 0}
        shortfall={insufficientFundsData?.shortfall || 0}
      />

    </motion.div>
  );
};

export default ManagerExpensePage;

