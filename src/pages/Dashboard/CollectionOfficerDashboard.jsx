import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocalTranslation } from '../../hooks/useLocalTranslation';
// import axios from '../../axios';
import OfficerNavbar from '../../components/OfficerNavbar';
import { 
  FaHandHoldingUsd, 
  FaChartLine, 
  FaUserFriends, 
  FaClipboardCheck,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaMoneyBillWave,
  // FaBell
} from 'react-icons/fa';

function CollectionOfficerDashboard() {
  // const { t } = useLocalTranslation();
  const [stats, setStats] = useState({
    todayCollections: 0,
    totalCollections: 0,
    pendingCollections: 0,
    monthlyTarget: 0
  });
  const [loading, setLoading] = useState(true);
  const [officerName, setOfficerName] = useState('');

  useEffect(() => {
    // Get officer name from localStorage
    const storedOfficerName = localStorage.getItem('officerName') || 'Collection Officer';
    setOfficerName(storedOfficerName);
    
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch collection data (you can add these endpoints later)
      // For now, using mock data
      setStats({
        todayCollections: 12500,
        totalCollections: 450000,
        pendingCollections: 8,
        monthlyTarget: 500000
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
          <p className="text-gray-600">Loading Collection Officer Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <OfficerNavbar officerType="collection_officer" officerName={officerName} pageName="Collection Dashboard" />
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="min-h-screen bg-primaryBg pt-16"
      >
        Welcome Header
        <motion.div 
          variants={itemVariants}
          className="bg-white shadow-sm border-b border-gray-200 px-6 py-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Welcome, {officerName}!</h1>
              <p className="text-gray-600">Collection Officer Dashboard - Track your daily collections and targets</p>
            </div>
          </div>
        </motion.div>

      {/* Stats Cards */}
      <motion.div 
        variants={itemVariants}
        className="px-6 py-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Today's Collections */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Today's Collections</p>
                <p className="text-3xl font-bold text-green-600">₹{stats.todayCollections.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <FaHandHoldingUsd className="text-2xl text-green-600" />
              </div>
            </div>
          </div>

          {/* Total Collections */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Collections</p>
                <p className="text-3xl font-bold text-blue-600">₹{stats.totalCollections.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <FaMoneyBillWave className="text-2xl text-blue-600" />
              </div>
            </div>
          </div>

          {/* Pending Collections */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Collections</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.pendingCollections}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <FaClipboardCheck className="text-2xl text-yellow-600" />
              </div>
            </div>
          </div>

          {/* Monthly Target */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Target</p>
                <p className="text-3xl font-bold text-purple-600">₹{stats.monthlyTarget.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <FaChartLine className="text-2xl text-purple-600" />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Collection Progress */}
      <motion.div 
        variants={itemVariants}
        className="px-6 py-6"
      >
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Progress</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Collection Progress</span>
                <span>{Math.round((stats.totalCollections / stats.monthlyTarget) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((stats.totalCollections / stats.monthlyTarget) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">₹{stats.totalCollections.toLocaleString()}</p>
                <p className="text-sm text-green-600">Collected</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">₹{(stats.monthlyTarget - stats.totalCollections).toLocaleString()}</p>
                <p className="text-sm text-blue-600">Remaining</p>
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
            <button className="flex flex-col items-center justify-center space-y-2 p-4 bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition-colors">
              <FaHandHoldingUsd className="text-2xl text-green-600" />
              <span className="text-green-800 font-medium text-sm">New Collection</span>
            </button>
            <button className="flex flex-col items-center justify-center space-y-2 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors">
              <FaUserFriends className="text-2xl text-blue-600" />
              <span className="text-blue-800 font-medium text-sm">View Customers</span>
            </button>
            <button className="flex flex-col items-center justify-center space-y-2 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 transition-colors">
              <FaMapMarkerAlt className="text-2xl text-purple-600" />
              <span className="text-purple-800 font-medium text-sm">Route Map</span>
            </button>
            <button className="flex flex-col items-center justify-center space-y-2 p-4 bg-orange-50 hover:bg-orange-100 rounded-lg border border-orange-200 transition-colors">
              <FaCalendarAlt className="text-2xl text-orange-600" />
              <span className="text-orange-800 font-medium text-sm">Schedule</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Recent Collections */}
      <motion.div 
        variants={itemVariants}
        className="px-6 py-6"
      >
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Collections</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-700">Loan Collection - ₹5,000</span>
              </div>
              <span className="text-sm text-gray-500">2 hours ago</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-gray-700">Saving Deposit - ₹2,000</span>
              </div>
              <span className="text-sm text-gray-500">4 hours ago</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-gray-700">Penalty Collection - ₹200</span>
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

export default CollectionOfficerDashboard;
