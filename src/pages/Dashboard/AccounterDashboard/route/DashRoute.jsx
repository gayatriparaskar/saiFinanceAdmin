import React from "react";
import { Routes, Route } from "react-router-dom";
import { motion } from "framer-motion";
import CustomerPage from "../../../accountant/CustomerPage";
import Officer from "../../../common/OfficerData/Officer";
import AccountantExpensePage from "../../../common/Expenses/AccountantExpensePage";
import AccounterViewLoanUser from "../LoanAccount/AccounterViewLoanUser";
import AccounterViewSavingUser from "../SavingAccount/AccounterViewSavingUser";
import AccounterViewOfficer from "../OfficerData/AccounterViewOfficer";

const pageTransition = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
};

const DashRoute = () => {
  console.log('🔍 AccounterDashRoute component rendered');
  console.log('🔍 Current path:', window.location.pathname);
  console.log('🔍 Full URL:', window.location.href);
  console.log('🔍 DashRoute - This should show instead of main dashboard');
  
  return (
    <Routes>
      <Route
        path="/officer-controls"
        element={
          <motion.div {...pageTransition}>
            <Officer />
          </motion.div>
        }
      />
      <Route
        path="/customers"
        element={
          <motion.div {...pageTransition}>
            <CustomerPage />
          </motion.div>
        }
      />
      <Route
        path="/accountant-expenses"
        element={
          <motion.div {...pageTransition}>
            <AccountantExpensePage />
          </motion.div>
        }
      />
      <Route
        path="/reports"
        element={
          <motion.div {...pageTransition}>
            <div className="p-6">
              <h1 className="text-2xl font-bold text-blue-600">Reports</h1>
              <p className="text-gray-600">Reports page coming soon...</p>
            </div>
          </motion.div>
        }
      />
      
      <Route
        path="/view-loan-user/:id"
        element={
          <motion.div {...pageTransition}>
            <AccounterViewLoanUser />
          </motion.div>
        }
      />
      <Route
        path="/view-saving-user/:id"
        element={
          <motion.div {...pageTransition}>
            <AccounterViewSavingUser />
          </motion.div>
        }
      />
      <Route
        path="/view-officer/:id"
        element={
          <motion.div {...pageTransition}>
            <AccounterViewOfficer />
          </motion.div>
        }
      />
      <Route
        path="*"
        element={
          <div className="p-6">
            <h1 className="text-2xl font-bold text-red-600">Route Not Found</h1>
            <p className="text-gray-600">Current path: {window.location.pathname}</p>
            <p className="text-gray-600">Available routes: /officer-controls, /customers, /accountant-expenses, /reports, /view-loan-user/:id, /view-saving-user/:id, /view-officer/:id</p>
          </div>
        }
      />
    </Routes>
  );
};

export default DashRoute;
