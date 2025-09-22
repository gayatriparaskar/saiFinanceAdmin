import React from "react";
import { Routes, Route } from "react-router-dom";
import { motion } from "framer-motion";
import Home from "../../Home/Home";
import LoanAccount from "../../LoanAccounts/LoanAccount";
import CreateLoanUser from "../../LoanAccounts/CreateLoanUser";
import ViewLoanUser from "../../LoanAccounts/ViewLoanUser";
import AddDailyCollection from "../../LoanAccounts/AddDailyCollection";
import SavingAccount from "../../SavingAccount/SavingAccount";
import CreateSavingUser from "../../SavingAccount/CreateSavingUser";
import ViewSavingUser from "../../SavingAccount/ViewSavingUser";
import AddSavingCollection from "../../SavingAccount/AddSavingCollection";
import Officer from "../../OfficerData/Officer";
import CreateOfficer from "../../OfficerData/CreateOfficer";
import ViewOfficerDetails from "../../OfficerData/ViewOfficerDetails";
import OverdueLoans from "../../LoanAccounts/OverdueLoans";
import DashHome from "../userPanal/dashhome/DashHome";
import OfficerInfo from "../../SavingAccount/officerInfo";
import WeeklyReport from "../../Reports/WeeklyReport";
import DailyReport from "../../Reports/DailyReport";
import CombinedReport from "../../Reports/CombinedReport";

const pageTransition = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
};

const DashRoute = () => {
  console.log('🔍 DashRoute component rendered');
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
    </Routes>
  );
};

export default DashRoute;
