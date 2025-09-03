import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocalTranslation } from '../../hooks/useLocalTranslation';
import axios from '../../axios';
import OfficerNavbar from '../../components/OfficerNavbar';
import { 
  FaCalculator, 
  FaChartPie, 
  FaFileInvoiceDollar, 
  FaBalanceScale,
  FaChartBar,
  FaReceipt,
  FaMoneyBillWave,
  FaBell
} from 'react-icons/fa';

function AccounterDashboard() {
  const { t } = useLocalTranslation();
  const [stats, setStats] = useState({
    totalTransactions: 0,
    pendingApprovals: 0,
    monthlyRevenue: 0,
    outstandingAmounts: 0
  });
  const [loading, setLoading] = useState(true);
  const [officerName, setOfficerName] = useState('');

  useEffect(() => {
    // Get officer name from localStorage
    const storedOfficerName = localStorage.getItem('officerName') || 'Accounter';
    setOfficerName(storedOfficerName);
    
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch financial data (you can add these endpoints later)
      // For now, using mock data
      setStats({
        totalTransactions: 1250,
        pendingApprovals: 23,
        monthlyRevenue: 450000,
        outstandingAmounts: 125000
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
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
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-primaryBg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Accounter Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <OfficerNavbar officerType="accounter" officerName={officerName} pageName="Accounter Dashboard" />
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="min-h-screen bg-primaryBg pt-16"
      >
        {/* Welcome Header */}
        {/* <motion.div 
          variants={itemVariants}
          className="bg-white shadow-sm border-b border-gray-200 px-6 py-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Welcome, {officerName}!</h1>
              <p className="text-gray-600">Accounter Dashboard - Financial overview and accounting management</p>
            </div>
          </div>
        </motion.div> */}

      {/* Stats Cards */}
      <motion.div 
        variants={itemVariants}
        className="px-6 py-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Transactions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Transactions</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalTransactions.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <FaCalculator className="text-2xl text-blue-600" />
              </div>
            </div>
          </div>

          {/* Pending Approvals */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.pendingApprovals}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <FaBalanceScale className="text-2xl text-yellow-600" />
              </div>
            </div>
          </div>

          {/* Monthly Revenue */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                <p className="text-3xl font-bold text-green-600">₹{stats.monthlyRevenue.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <FaMoneyBillWave className="text-2xl text-green-600" />
              </div>
            </div>
          </div>

          {/* Outstanding Amounts */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Outstanding</p>
                <p className="text-3xl font-bold text-red-600">₹{stats.outstandingAmounts.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <FaFileInvoiceDollar className="text-2xl text-red-600" />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Financial Charts Section */}
      <motion.div 
        variants={itemVariants}
        className="px-6 py-6"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Revenue Trend</h3>
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <div className="text-center text-gray-500">
                <FaChartBar className="text-4xl mx-auto mb-2" />
                <p>Revenue Chart</p>
                <p className="text-sm">Chart component will be added here</p>
              </div>
            </div>
          </div>

          {/* Expense Breakdown */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Expense Breakdown</h3>
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <div className="text-center text-gray-500">
                <FaChartPie className="text-4xl mx-auto mb-2" />
                <p>Expense Chart</p>
                <p className="text-sm">Pie chart will be added here</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div 
        variants={itemVariants}
        className="px-6 py-6"
      >
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button className="flex flex-col items-center justify-center space-y-2 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors">
              <FaCalculator className="text-2xl text-blue-600" />
              <span className="text-blue-800 font-medium text-sm">New Transaction</span>
            </button>
            <button className="flex flex-col items-center justify-center space-y-2 p-4 bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition-colors">
              <FaReceipt className="text-2xl text-green-600" />
              <span className="text-green-800 font-medium text-sm">Generate Report</span>
            </button>
            <button className="flex flex-col items-center justify-center space-y-2 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 transition-colors">
              <FaBalanceScale className="text-2xl text-purple-600" />
              <span className="text-purple-800 font-medium text-sm">Approve Expenses</span>
            </button>
            <button className="flex flex-col items-center justify-center space-y-2 p-4 bg-orange-50 hover:bg-orange-100 rounded-lg border border-orange-200 transition-colors">
              <FaFileInvoiceDollar className="text-2xl text-orange-600" />
              <span className="text-orange-800 font-medium text-sm">View Invoices</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Recent Transactions */}
      <motion.div 
        variants={itemVariants}
        className="px-6 py-6"
      >
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Transactions</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-700">Loan Collection - ₹25,000</span>
              </div>
              <span className="text-sm text-gray-500">2 hours ago</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-gray-700">Saving Deposit - ₹15,000</span>
              </div>
              <span className="text-sm text-gray-500">4 hours ago</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-gray-700">Penalty Collection - ₹500</span>
              </div>
              <span className="text-sm text-gray-500">6 hours ago</span>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  </>
);
}

export default AccounterDashboard;
