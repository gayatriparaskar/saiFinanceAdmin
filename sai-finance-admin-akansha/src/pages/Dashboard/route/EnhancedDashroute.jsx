import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import EnhancedDashHome from "../userPanal/dashhome/EnhancedDashHome";
import TestDashHome from "../userPanal/dashhome/TestDashHome";
import FixedEnhancedDashHome from "../userPanal/dashhome/FixedEnhancedDashHome";
import DemoUser from "../userControl/DemoUser";
import ViewCourse from "../courseControl/ViewCourse";
import ActiveUser from "../userControl/ActiveUser";
import CreateCourses from "../courseControl/CreateCourse";
import AddQuestion from "../questionControl/AddQuestion";
import EditCourses from "../courseControl/EditCourse";
import ViewQuestion from "../questionControl/ViewQuestion";
import EditQuestion from "../questionControl/EditQuestion";
import AddContest from "../contestControl/AddContest";
import ViewContest from "../contestControl/ViewContest";
import ContAddQ from "../questionControl/ContestAddQ";
import EditContest from "../contestControl/EditContest";
import ContestViewQ from "../questionControl/ContestViewQ";
import ContestEditQ from "../questionControl/ContestEditQ";
import ContestJoinUser from "../contestControl/JoinUser";
import PaymentRequest from "../paymentControl/PaymentRequest";
import LoanAccount from "../../LoanAccounts/LoanAccount";
import CreateLoanUser from "../../LoanAccounts/CreateLoanUser";
import ViewLoanUser from "../../LoanAccounts/ViewLoanUser";
import Officer from "../../OfficerData/Officer";
import CreateOfficer from "../../OfficerData/CreateOfficer";
import AddDailyCollection from "../../LoanAccounts/AddDailyCollection";
import Carousel from "../../OfficerData/Corouasol";
import SavingAccount from "../../SavingAccount/SavingAccount";
import CreateSavingUser from "../../SavingAccount/CreateSavingUser";
import ViewSavingUSer from "../../SavingAccount/ViewSavingUser";
import AddSavingCollection from "../../SavingAccount/AddSavingCollection";

const pageTransition = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
  transition: { duration: 0.4, ease: "easeInOut" }
};

const EnhancedDashRoute = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Routes>
        {/* Enhanced Dashboard Home */}
        <Route
          path='/home'
          element={
            <motion.div {...pageTransition}>
              <TestDashHome />
            </motion.div>
          }
        />
        
        <Route 
          path='/c' 
          element={
            <motion.div {...pageTransition}>
              <Carousel />
            </motion.div>
          } 
        />
       
        {/* Loan Account Routes */}
        <Route 
          path='/loan-account' 
          element={
            <motion.div {...pageTransition}>
              <LoanAccount />
            </motion.div>
          } 
        />
        <Route 
          path='/saving-account' 
          element={
            <motion.div {...pageTransition}>
              <SavingAccount />
            </motion.div>
          } 
        />
        <Route 
          path='/create-loan-account' 
          element={
            <motion.div {...pageTransition}>
              <CreateLoanUser />
            </motion.div>
          } 
        />
        <Route 
          path='/create-saving-account' 
          element={
            <motion.div {...pageTransition}>
              <CreateSavingUser />
            </motion.div>
          } 
        />
        <Route 
          path='/view-user-details/:id' 
          element={
            <motion.div {...pageTransition}>
              <ViewLoanUser />
            </motion.div>
          } 
        />
        <Route 
          path='/view-savingUser-details/:id' 
          element={
            <motion.div {...pageTransition}>
              <ViewSavingUSer />
            </motion.div>
          } 
        />
        
        {/* User Routes */}
        <Route 
          path='/demo-user' 
          element={
            <motion.div {...pageTransition}>
              <DemoUser />
            </motion.div>
          } 
        />
        <Route 
          path='/active-user' 
          element={
            <motion.div {...pageTransition}>
              <ActiveUser />
            </motion.div>
          } 
        />
        
        {/* Officer Routes */}
        <Route 
          path='/officer' 
          element={
            <motion.div {...pageTransition}>
              <Officer />
            </motion.div>
          } 
        />
        <Route 
          path='/create-officer' 
          element={
            <motion.div {...pageTransition}>
              <CreateOfficer />
            </motion.div>
          } 
        />
        
        {/* Collection Routes */}
        <Route 
          path='/add-daily-collection/:id' 
          element={
            <motion.div {...pageTransition}>
              <AddDailyCollection />
            </motion.div>
          } 
        />
        <Route 
          path='/add-Saving-collection/:id' 
          element={
            <motion.div {...pageTransition}>
              <AddSavingCollection />
            </motion.div>
          } 
        />

        {/* Default redirect */}
        <Route path="*" element={<Navigate to="/dash/home" replace />} />
      </Routes>
    </motion.div>
  );
};

export default EnhancedDashRoute;
