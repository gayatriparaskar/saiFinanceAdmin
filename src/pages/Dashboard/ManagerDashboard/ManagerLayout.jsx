import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';
import ManagerNavbar from './ManagerNavbar';
import ManagerDashboardContent from './ManagerDashboardContent';

// Import manager-specific pages from their new locations
import ManagerLoanAccount from './LoanAccount/ManagerLoanAccount';
import ManagerCreateLoanUser from './LoanAccount/ManagerCreateLoanUser';
import ManagerViewLoanUser from './LoanAccount/ManagerViewLoanUser';
import ManagerSavingAccount from './SavingAccount/ManagerSavingAccount';
import ManagerOverdueLoans from './Overdue/ManagerOverdueLoans';
import ManagerOfficer from './OfficerData/ManagerOfficer';
// import CreateLoanUser from '../../LoanAccounts/CreateLoanUser';
// import ViewLoanUser from '../../LoanAccounts/ViewLoanUser';
import AddDailyCollection from '../../LoanAccounts/AddDailyCollection';
import ManagerAddDailyCollection from './LoanAccount/ManagerAddDailyCollection';
import ManagerCreateSavingUser from './SavingAccount/ManagerCreateSavingUser';
import ManagerViewSavingUser from './SavingAccount/ManagerViewSavingUser';
import AddSavingCollection from '../../SavingAccount/AddSavingCollection';
import ManagerAddSavingCollection from './SavingAccount/ManagerAddSavingCollection';
import ManagerViewOfficer from './OfficerData/ManagerViewOfficer';
import ManagerCreateOfficer from './OfficerData/ManagerCreateOfficer';
import WeeklyReport from '../../Reports/WeeklyReport';
import DailyReport from '../../Reports/DailyReport';
import CombinedReport from '../../Reports/CombinedReport';
import ManagerExpensePage from '../../common/Expenses/ManagerExpensePage';

const pageTransition = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
};

const ManagerLayout = () => {
  const officerName = localStorage.getItem('officerName') || 'Manager';
  
  return (
    <div className="min-h-screen bg-gray-50">
      <ManagerNavbar officerName={officerName} pageName="Manager Dashboard" />
      
      <div className="pt-16 sm:pt-20">
        <Routes>
          {/* Dashboard Route */}
          <Route path="/" element={<ManagerDashboardContent />} />
          
          {/* Loan Account Routes */}
          <Route
            path="loan-account"
            element={
              <motion.div {...pageTransition}>
                <ManagerLoanAccount />
              </motion.div>
            }
          />
          <Route
            path="create-loan-user"
            element={
              <motion.div {...pageTransition}>
                <ManagerCreateLoanUser />
              </motion.div>
            }
          />
          <Route
            path="view-loan-user/:id"
            element={
              <motion.div {...pageTransition}>
                <ManagerViewLoanUser />
              </motion.div>
            }
          />
          <Route
            path="add-daily-collection"
            element={
              <motion.div {...pageTransition}>
                <AddDailyCollection />
              </motion.div>
            }
          />
          <Route
            path="add-daily-collection/:id"
            element={
              <motion.div {...pageTransition}>
                <AddDailyCollection />
              </motion.div>
            }
          />
          <Route
            path="manager-add-daily-collection"
            element={
              <motion.div {...pageTransition}>
                <ManagerAddDailyCollection />
              </motion.div>
            }
          />
          <Route
            path="manager-add-daily-collection/:id"
            element={
              <motion.div {...pageTransition}>
                <ManagerAddDailyCollection />
              </motion.div>
            }
          />
          <Route
            path="overdue-loans"
            element={
              <motion.div {...pageTransition}>
                <ManagerOverdueLoans />
              </motion.div>
            }
          />
          
          {/* Saving Account Routes */}
          <Route
            path="saving-account"
            element={
              <motion.div {...pageTransition}>
                <ManagerSavingAccount />
              </motion.div>
            }
          />
          <Route
            path="create-saving-user"
            element={
              <motion.div {...pageTransition}>
                <ManagerCreateSavingUser />
              </motion.div>
            }
          />
          <Route
            path="view-saving-user/:id"
            element={
              <motion.div {...pageTransition}>
                <ManagerViewSavingUser />
              </motion.div>
            }
          />
          <Route
            path="add-saving-collection/:id"
            element={
              <motion.div {...pageTransition}>
                <AddSavingCollection />
              </motion.div>
            }
          />
          <Route
            path="manager-add-saving-collection"
            element={
              <motion.div {...pageTransition}>
                <ManagerAddSavingCollection />
              </motion.div>
            }
          />
          <Route
            path="manager-add-saving-collection/:id"
            element={
              <motion.div {...pageTransition}>
                <ManagerAddSavingCollection />
              </motion.div>
            }
          />
          
          {/* Officer Routes */}
          <Route
            path="officer"
            element={
              <motion.div {...pageTransition}>
                <ManagerOfficer />
              </motion.div>
            }
          />
          <Route
            path="view-officer/:id"
            element={
              <motion.div {...pageTransition}>
                <ManagerViewOfficer />
              </motion.div>
            }
          />
          <Route
            path="create-officer"
            element={
              <motion.div {...pageTransition}>
                <ManagerCreateOfficer />
              </motion.div>
            }
          />
          
          {/* Expenses Routes */}
          <Route
            path="expenses"
            element={
              <motion.div {...pageTransition}>
                <ManagerExpensePage />
              </motion.div>
            }
          />
          
          {/* Reports Routes */}
          <Route
            path="reports"
            element={
              <motion.div {...pageTransition}>
                <CombinedReport />
              </motion.div>
            }
          />
          <Route
            path="weekly-report"
            element={
              <motion.div {...pageTransition}>
                <WeeklyReport />
              </motion.div>
            }
          />
          <Route
            path="daily-report"
            element={
              <motion.div {...pageTransition}>
                <DailyReport />
              </motion.div>
            }
          />
          
          {/* Catch-all route for unmatched paths */}
          <Route
            path="*"
            element={
              <div className="p-6">
                <h1 className="text-2xl font-bold text-red-600 mb-4">Page Not Found</h1>
                <p className="text-gray-600">The requested page could not be found.</p>
                <p className="text-sm text-gray-500 mt-2">Current path: {window.location.pathname}</p>
              </div>
            }
          />
        </Routes>
      </div>
    </div>
  );
};

export default ManagerLayout;
