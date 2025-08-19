import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import DashHome from "../userPanal/dashhome/DashHome";
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

const DashRoute = () => {
  // const token = localStorage.getItem("token");

  return (
    <>
      {/* <Authentication> */}
        <Routes>
          {/* <Route path='/home' element={<MainMcqs />} /> */}

          {/* User Routes */}
          <Route path='/home' element={<DashHome />} />
          <Route path='/c' element={<Carousel />} />
       
          <Route path='/loan-account' element={<LoanAccount />} />
          <Route path='/saving-account' element={<SavingAccount />} />
          <Route path='/create-loan-account' element={<CreateLoanUser />} />
          <Route path='/create-saving-account' element={<CreateSavingUser />} />
          <Route path='/view-user-details/:id' element={<ViewLoanUser />} />
          <Route path='/view-savingUser-details/:id' element={<ViewSavingUSer />} />
          <Route path='/demo-user' element={<DemoUser />} />
          <Route path='/active-user' element={<ActiveUser />} />
          <Route path='/officer' element={<Officer />} />
          <Route path='/create-officer' element={<CreateOfficer />} />
          <Route path='/add-daily-collection/:id' element={<AddDailyCollection />} />
          <Route path='/add-Saving-collection/:id' element={<AddSavingCollection />} />

          {/* Course Routes */}
          {/* <Route path='/view-course' element={<ViewCourse />} />
          <Route path='/create-course' element={<CreateCourses />} />
          <Route path='/edit-course/:id' element={<EditCourses />} />
          <Route path='/add-question/:id' element={<AddQuestion />} />
          <Route path='/view-question/:id' element={<ViewQuestion />} />
          <Route path='/edit-question/:id' element={<EditQuestion />} /> */}
          
          {/* Contest Routes */}
          {/* <Route path='/add-contest' element={<AddContest />} />
          <Route path='/view-contest' element={<ViewContest />} />
          <Route path='/edit-contest/:id' element={<EditContest />} />
          <Route path='/addcontest-question/:id' element={<ContAddQ />} />
          <Route path='/viewcontest-question/:id' element={<ContestViewQ />} />
          <Route path='/editcontest-question/:id' element={<ContestEditQ />} />
          <Route path='/join-user/:id' element={<ContestJoinUser/>} /> */}

          {/* Payment Routes */}
          {/* <Route path='/payment-request' element={<PaymentRequest />} /> */}


          <Route path="*" element={<Navigate to="/dash/home" replace />} />
         
        </Routes>
      {/* </Authentication> */}
    </>
  );
};

export default DashRoute;
