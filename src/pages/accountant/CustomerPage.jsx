import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocalTranslation } from '../../hooks/useLocalTranslation';
import OfficerNavbar from '../../components/OfficerNavbar';
import { getCurrentUserInfo } from '../../utils/authUtils';
import CustomerTable from '../../componant/Dashboard/CustomerTable';
import dayjs from 'dayjs';

const CustomerPage = () => {
  console.log('🔍 CustomerPage component rendered - This should show only customer table');
  const { t } = useLocalTranslation();
  const [officerName, setOfficerName] = useState('');
  const [userInfo, setUserInfo] = useState(null);
  const [timePeriod, setTimePeriod] = useState('all'); // 'all', 'daily', 'weekly', 'monthly'

  useEffect(() => {
    // Get current user info and check role
    const currentUserInfo = getCurrentUserInfo();
    setUserInfo(currentUserInfo);
    
    // Get officer name from localStorage
    const storedOfficerName = localStorage.getItem('officerName') || 'Accounter';
    setOfficerName(storedOfficerName);
    
    // Check if user is accounter
    if (currentUserInfo.role !== 'accounter') {
      console.warn('⚠️ User is not an accounter, cannot access customer page');
    }
  }, []);

  // Handle time period change
  const handleTimePeriodChange = (period) => {
    setTimePeriod(period);
    console.log('📊 Time period changed to:', period);
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

  return (
    <>
      <OfficerNavbar officerType="accounter" officerName={officerName} pageName="Customers" />
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="min-h-screen bg-primaryBg pt-16"
      >
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Customer Table Only */}
          <motion.div variants={itemVariants}>
            <CustomerTable timePeriod={timePeriod} />
          </motion.div>
        </div>
      </motion.div>
    </>
  );
};

export default CustomerPage;
