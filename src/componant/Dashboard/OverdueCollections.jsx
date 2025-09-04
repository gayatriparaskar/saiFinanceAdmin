import React from 'react';
import { motion } from 'framer-motion';
import { 
  FaExclamationTriangle, 
  FaClock, 
  FaMoneyBillWave,
  FaUser,
  FaPhone,
  FaUserTie
} from 'react-icons/fa';
import dayjs from 'dayjs';

const OverdueCollections = ({ 
  overdueLoans, 
  loading, 
  error, 
  getDaysOverdueColor, 
  getPenaltyAmount,
  totalOverdueAmount,
  totalPenalties 
}) => {
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
      <motion.div 
        variants={itemVariants}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
          <span className="ml-3 text-gray-600">Loading overdue collections...</span>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div 
        variants={itemVariants}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <div className="text-center py-8">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Overdue Collections</h3>
          <p className="text-gray-600">{error}</p>
        </div>
      </motion.div>
    );
  }

  if (overdueLoans.length === 0) {
    return (
      <motion.div 
        variants={itemVariants}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <div className="text-center py-8">
          <div className="text-green-500 text-4xl mb-4">🎉</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Overdue Collections</h3>
          <p className="text-gray-600">All loans are current and up to date!</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      variants={itemVariants}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-red-100 rounded-lg">
            <FaExclamationTriangle className="text-red-600 text-xl" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Overdue Collections</h2>
            <p className="text-sm text-gray-600">{overdueLoans.length} loans require attention</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-red-600">₹{totalOverdueAmount.toLocaleString()}</div>
          <div className="text-sm text-gray-500">Total Outstanding</div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-red-600">Overdue Loans</div>
              <div className="text-2xl font-bold text-red-800">{overdueLoans.length}</div>
            </div>
            <FaClock className="text-red-600 text-xl" />
          </div>
        </div>

        <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-orange-600">Total Penalties</div>
              <div className="text-2xl font-bold text-orange-800">₹{totalPenalties.toLocaleString()}</div>
            </div>
            <FaMoneyBillWave className="text-orange-600 text-xl" />
          </div>
        </div>

        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-yellow-600">Avg. Days Overdue</div>
              <div className="text-2xl font-bold text-yellow-800">
                {Math.round(overdueLoans.reduce((sum, loan) => sum + loan.daysOverdue, 0) / overdueLoans.length)}
              </div>
            </div>
            <FaExclamationTriangle className="text-yellow-600 text-xl" />
          </div>
        </div>
      </div>

      {/* Overdue Loans List */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Overdue Loans</h3>
        {overdueLoans.slice(0, 5).map((loan, index) => (
          <motion.div
            key={loan.loanId}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <FaUser className="text-gray-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{loan.userName}</h4>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <FaPhone className="text-xs" />
                      <span>{loan.phoneNumber}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <FaUserTie className="text-xs" />
                      <span>{loan.officerName}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  getDaysOverdueColor(loan.daysOverdue) === 'red' ? 'bg-red-100 text-red-800' :
                  getDaysOverdueColor(loan.daysOverdue) === 'orange' ? 'bg-orange-100 text-orange-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {loan.daysOverdue} days overdue
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-gray-500">Outstanding</div>
                <div className="font-semibold text-red-600">₹{loan.totalDueAmount?.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-gray-500">Daily EMI</div>
                <div className="font-semibold">₹{loan.emiAmount}</div>
              </div>
              <div>
                <div className="text-gray-500">Penalty</div>
                <div className="font-semibold text-orange-600">₹{getPenaltyAmount(loan.emiAmount)}</div>
              </div>
              <div>
                <div className="text-gray-500">Overdue Since</div>
                <div className="font-semibold text-gray-700">
                  {dayjs(loan.endDate).add(1, 'day').format('D MMM, YYYY')}
                </div>
              </div>
            </div>
          </motion.div>
        ))}

        {overdueLoans.length > 5 && (
          <div className="text-center pt-4">
            <button 
              onClick={() => window.location.href = '/dash/overdue-loans'}
              className="text-primary hover:text-primaryDark font-medium text-sm"
            >
              View all {overdueLoans.length} overdue loans →
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default OverdueCollections;
