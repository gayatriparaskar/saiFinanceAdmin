import React from 'react';
import { motion } from 'framer-motion';
import { FaUsers, FaUserTie, FaMoneyBillWave, FaChartLine } from 'react-icons/fa';

const StatsCards = ({ stats }) => {
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <motion.div 
      variants={itemVariants}
      className="px-6 py-6"
    >
      {console.log('🎯 Rendering stats with values:', stats)}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Officers */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Officers</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalOfficers}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <FaUsers className="text-2xl text-blue-600" />
            </div>
          </div>
        </div>

        {/* Active Officers */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Officers</p>
              <p className="text-3xl font-bold text-green-600">{stats.activeOfficers}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <FaUserTie className="text-2xl text-green-600" />
            </div>
          </div>
        </div>

        {/* Total Collections */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Collections (₹)</p>
              <p className="text-3xl font-bold text-purple-600">₹{stats.totalCollections?.toLocaleString() || '0'}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <FaMoneyBillWave className="text-2xl text-purple-600" />
            </div>
          </div>
        </div>

        {/* Today's Collections */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Today's Collections (₹)</p>
              <p className="text-3xl font-bold text-orange-600">₹{stats.todayCollections?.toLocaleString() || '0'}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <FaChartLine className="text-2xl text-orange-600" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default StatsCards;
