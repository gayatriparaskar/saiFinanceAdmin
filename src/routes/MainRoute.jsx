import React, { useEffect, useState } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import NewDashboard from '../pages/Dashboard/main/NewDashboard';
import NewLogin from '../pages/SignIn/NewLogin';
import ManagerDashboard from '../pages/Dashboard/ManagerDashboard';
import AccounterDashboard from '../pages/Dashboard/AccounterDashboard';
import CollectionOfficerDashboard from '../pages/Dashboard/CollectionOfficerDashboard';
import OfficerInfo from '../pages/SavingAccount/officerInfo';
import UserDetailPage from '../pages/UserDetailPage/UserDetailPage';
import ManagerViewLoanUser from '../pages/Dashboard/ManagerDashboard/LoanAccount/ManagerViewLoanUser';
import ManagerViewSavingUser from '../pages/Dashboard/ManagerDashboard/SavingAccount/ManagerViewSavingUser';
import BlockedUsers from '../pages/BlockedUsers/BlockedUsers';
import InactiveUsers from '../pages/InactiveUsers/InactiveUsers';
import AccountantExpensePage from '../pages/common/Expenses/AccountantExpensePage';
import ExpenseManagement from '../pages/admin/expenses/expensesManagement';
import CustomerPage from '../pages/accountant/CustomerPage';

const MainRoute = () => {
  const [loading, setLoading] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [location]);

  const pageVariants = {
    initial: { opacity: 0, x: -20 },
    in: { opacity: 1, x: 0 },
    out: { opacity: 0, x: 20 }
  };

  const pageTransition = {
    type: "tween",
    ease: "anticipate",
    duration: 0.5
  };

  return (
    <>
      <AnimatePresence mode="wait">
        {loading && (
          <motion.div 
            key="loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-primaryBg to-secondaryBg z-50"
          >
            <div className="text-center">
              <motion.div
                animate={{ 
                  rotate: 360,
                  scale: [1, 1.2, 1]
                }}
                transition={{ 
                  rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                  scale: { duration: 1, repeat: Infinity }
                }}
                className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"
              />
              <motion.h2
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
              >
                Loading...
              </motion.h2>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route 
            path='/' 
            element={
              <motion.div
                initial="initial"
                animate="in"
                exit="out"
                variants={pageVariants}
                transition={pageTransition}
              >
                <NewLogin />
              </motion.div>
            }
          />
          
          <Route 
            path='/login' 
            element={
              <motion.div
                initial="initial"
                animate="in"
                exit="out"
                variants={pageVariants}
                transition={pageTransition}
              >
                <NewLogin/>
              </motion.div>
            }
          />

          <Route 
            path='/view-officer/:id' 
            element={
              <motion.div
                initial="initial"
                animate="in"
                exit="out"
                variants={pageVariants}
                transition={pageTransition}
              >
                <OfficerInfo/>
              </motion.div>
            }
          />

          <Route 
            path='/view-user/:userId' 
            element={
              <motion.div
                initial="initial"
                animate="in"
                exit="out"
                variants={pageVariants}
                transition={pageTransition}
              >
                <UserDetailPage/>
              </motion.div>
            }
          />

          <Route 
            path='/view-loan-user/:id' 
            element={
              <motion.div
                initial="initial"
                animate="in"
                exit="out"
                variants={pageVariants}
                transition={pageTransition}
              >
                <ManagerViewLoanUser/>
              </motion.div>
            }
          />

          <Route 
            path='/view-saving-user/:id' 
            element={
              <motion.div
                initial="initial"
                animate="in"
                exit="out"
                variants={pageVariants}
                transition={pageTransition}
              >
                <ManagerViewSavingUser/>
              </motion.div>
            }
          />

          <Route 
            path='/blocked-users' 
            element={
              <motion.div
                initial="initial"
                animate="in"
                exit="out"
                variants={pageVariants}
                transition={pageTransition}
              >
                <BlockedUsers/>
              </motion.div>
            }
          />

          <Route 
            path='/inactive-users' 
            element={
              <motion.div
                initial="initial"
                animate="in"
                exit="out"
                variants={pageVariants}
                transition={pageTransition}
              >
                <InactiveUsers/>
              </motion.div>
            }
          />

          <Route 
            path='/dash/*' 
            element={
              <motion.div
                initial="initial"
                animate="in"
                exit="out"
                variants={pageVariants}
                transition={pageTransition}
              >
                <NewDashboard/>
              </motion.div>
            }
          />

          <Route 
            path='/manager-dashboard/*' 
            element={
              <motion.div
                initial="initial"
                animate="in"
                exit="out"
                variants={pageVariants}
                transition={pageTransition}
              >
                <ManagerDashboard/>
              </motion.div>
            }
          />

          <Route 
            path='/manager/dashboard/*' 
            element={
              <motion.div
                initial="initial"
                animate="in"
                exit="out"
                variants={pageVariants}
                transition={pageTransition}
              >
                <ManagerDashboard/>
              </motion.div>
            }
          />

          <Route 
            path='/accounter-dashboard/customers' 
            element={
              <motion.div
                initial="initial"
                animate="in"
                exit="out"
                variants={pageVariants}
                transition={pageTransition}
              >
                <CustomerPage/>
              </motion.div>
            }
          />

          <Route 
            path='/accounter-dashboard/*' 
            element={
              <motion.div
                initial="initial"
                animate="in"
                exit="out"
                variants={pageVariants}
                transition={pageTransition}
              >
                <AccounterDashboard/>
              </motion.div>
            }
          />

          <Route 
            path='/accountant-expenses' 
            element={
              <motion.div
                initial="initial"
                animate="in"
                exit="out"
                variants={pageVariants}
                transition={pageTransition}
              >
                <AccountantExpensePage/>
              </motion.div>
            }
          />

          <Route 
            path='/expenses' 
            element={
              <motion.div
                initial="initial"
                animate="in"
                exit="out"
                variants={pageVariants}
                transition={pageTransition}
              >
                <ExpenseManagement/>
              </motion.div>
            }
          />

          <Route 
            path='/collection-dashboard' 
            element={
              <motion.div
                initial="initial"
                animate="in"
                exit="out"
                variants={pageVariants}
                transition={pageTransition}
              >
                <CollectionOfficerDashboard/>
              </motion.div>
            }
          />


        </Routes>
      </AnimatePresence>
    </>
  );
};

export default MainRoute;
