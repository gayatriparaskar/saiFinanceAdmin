import React from "react";
import { Routes, Route } from "react-router-dom";
import { motion } from "framer-motion";
import Home from "../../Home/Home";
import LoanAccount from "../../common/LoanAccounts/LoanAccount";
import CreateLoanUser from "../../common/LoanAccounts/CreateLoanUser";
import ViewLoanUser from "../../common/LoanAccounts/ViewLoanUser";
import AddDailyCollection from "../../common/LoanAccounts/AddDailyCollection";
import SavingAccount from "../../common/SavingAccounts/SavingAccount";
import CreateSavingUser from "../../common/SavingAccounts/CreateSavingUser";
import ViewSavingUser from "../../common/SavingAccounts/ViewSavingUser";
import AddSavingCollection from "../../common/SavingAccounts/AddSavingCollection";
import Officer from "../../common/OfficerData/Officer";
import CreateOfficer from "../../common/OfficerData/CreateOfficer";
import ViewOfficerDetails from "../../common/OfficerData/ViewOfficerDetails";
import OverdueLoans from "../../common/LoanAccounts/OverdueLoans";
import DashHome from "../userPanal/dashhome/DashHome";
import OfficerInfo from "../../common/SavingAccounts/officerInfo";
import WeeklyReport from "../../common/Reports/WeeklyReport";
import DailyReport from "../../common/Reports/DailyReport";
import CombinedReport from "../../common/Reports/CombinedReport";
import ExpenseManagement from "../../pages/admin/ExpenseManagement";
import ManagerExpensePage from "../../common/Expenses/ManagerExpensePage";
import AccountantExpensePage from "../../common/Expenses/AccountantExpensePage";
import InactiveUsers from "../InactiveUsers";

const pageTransition = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
};

const DashRoute = () => {
  console.log('🔍 DashRoute component rendered');
  console.log('🔍 Current path:', window.location.pathname);
  console.log('🔍 Full URL:', window.location.href);
  return (
    <Routes>
      <Route
        path="/"
        element={
          <motion.div {...pageTransition}>
            <DashHome />
          </motion.div>
        }
      />
      <Route
        path="/home"
        element={
          <motion.div {...pageTransition}>
            <DashHome />
          </motion.div>
        }
      />
      <Route
        path="/loan-accounts"
        element={
          <motion.div {...pageTransition}>
            <LoanAccount />
          </motion.div>
        }
      />
      <Route
        path="/create-loan-user"
        element={
          <motion.div {...pageTransition}>
            <CreateLoanUser />
          </motion.div>
        }
      />
      <Route
        path="/view-loan-user/:id"
        element={
          <motion.div {...pageTransition}>
            <div onClick={() => console.log('✅ ViewLoanUser route rendered')}>
              <ViewLoanUser />
            </div>
          </motion.div>
        }
      />
      <Route
        path="/add-daily-collection/:id"
        element={
          <motion.div {...pageTransition}>
            <AddDailyCollection />
          </motion.div>
        }
      />
      <Route
        path="/overdue-loans"
        element={
          <motion.div {...pageTransition}>
            <OverdueLoans />
          </motion.div>
        }
      />
      <Route
        path="/saving-accounts"
        element={
          <motion.div {...pageTransition}>
            <SavingAccount />
          </motion.div>
        }
      />
      <Route
        path="/create-saving-user"
        element={
          <motion.div {...pageTransition}>
            <div onClick={() => console.log('✅ CreateSavingUser route rendered')}>
              <CreateSavingUser />
            </div>
          </motion.div>
        }
      />
      <Route
        path="/view-savingUser-details/:id"
        element={
          <motion.div {...pageTransition}>
            <div onClick={() => console.log('✅ ViewSavingUser route rendered')}>
              <ViewSavingUser />
            </div>
          </motion.div>
        }
      />
      <Route
        path="/add-Saving-collection/:id"
        element={
          <motion.div {...pageTransition}>
            <AddSavingCollection />
          </motion.div>
        }
      />
      <Route
        path="/officer"
        element={
          <motion.div {...pageTransition}>
            <Officer />
          </motion.div>
        }
      />
      <Route
        path="/create-officer"
        element={
          <motion.div {...pageTransition}>
            <CreateOfficer />
          </motion.div>
        }
      />
      <Route
        path="/view-officer/:id"
        element={
          <motion.div {...pageTransition}>
            <OfficerInfo />
          </motion.div>
        }
      />
      <Route
        path="/officer-info"
        element={
          <motion.div {...pageTransition}>
            <OfficerInfo />
          </motion.div>
        }
      />
      <Route
        path="/weekly-report"
        element={
          <motion.div {...pageTransition}>
            <WeeklyReport />
          </motion.div>
        }
      />
      <Route
        path="/daily-report"
        element={
          <motion.div {...pageTransition}>
            <DailyReport />
          </motion.div>
        }
      />
      <Route
        path="/reports"
        element={
          <motion.div {...pageTransition}>
            <CombinedReport />
          </motion.div>
        }
      />
      <Route
        path="/officer-controls"
        element={
          <motion.div {...pageTransition}>
            <Officer />
          </motion.div>
        }
      />
      <Route
        path="/expenses"
        element={
          <motion.div {...pageTransition}>
            <ExpenseManagement />
          </motion.div>
        }
      />
      <Route
        path="*"
        element={
          <div className="p-6">
            <h1 className="text-2xl font-bold text-red-600">Route Not Found</h1>
            <p className="text-gray-600">Current path: {window.location.pathname}</p>
            <p className="text-gray-600">Available routes: /, /loan-accounts, /expenses, etc.</p>
          </div>
        }
      />
      <Route
        path="/manager-expenses"
        element={
          <motion.div {...pageTransition}>
            <ManagerExpensePage />
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
        path="/inactive-users"
        element={
          <motion.div {...pageTransition}>
            <InactiveUsers />
          </motion.div>
        }
      />
    </Routes>
  );
};

export default DashRoute;
