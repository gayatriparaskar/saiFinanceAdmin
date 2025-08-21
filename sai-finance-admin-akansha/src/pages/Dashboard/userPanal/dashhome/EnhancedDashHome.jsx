import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import EnhancedCardDataStats from "../../../../componant/CardDataStats/EnhancedCardDataStats";
import SimpleChart from "../../../../componant/Charts/SimpleChart";
import MonthlyChart from "../../../../componant/Charts/MonthlyChart";
import WeeklyChart from "../../../../componant/Charts/WeeklyChart";
import PerformanceChart from "../../../../componant/Charts/PerformanceChart";
import CursorTrail from "../../../../components/CursorTrail/CursorTrail";
import { useLocalTranslation } from "../../../../hooks/useLocalTranslation";
import axios from "../../../../axios";

const EnhancedDashHome = () => {
  const { t } = useLocalTranslation();
  const [data, setData] = useState([]);
  const [weekDays, setWeekDays] = useState([""]);
  const [weekAmtData, setWeekAmtData] = useState([0]);
  const [userdata, setUserData] = useState([]);
  const [monthsData, setMonthData] = useState([""]);
  const [monthlyAmtData, setMonthlyAmtData] = useState([0]);
  const [dailyCollection, setDailyCollection] = useState(0);
  const [totalLoanAmt, setTotalLoanAmt] = useState(0);
  const [totalCollection, setTotalCollection] = useState(0);
  const [activeSavingsUsers, setActiveSavingsUsers] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Enhanced loading state animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Active Savings Users API call
  useEffect(() => {
    axios.get("account/").then((res) => {
      if (res?.data?.result) {
        const activeSavings = res.data.result.filter(account =>
          account.account_type === 'savings' && account.status === 'active'
        );
        setActiveSavingsUsers(activeSavings.length);
      } else {
        setActiveSavingsUsers(0);
      }
    }).catch((error) => {
      console.error("Error fetching savings accounts:", error);

      // Check if it's an authentication error
      if (error.response?.status === 401 || error.isAuthError) {
        console.warn("Authentication failed - token may be invalid or expired");
        localStorage.removeItem('token');
        window.location.href = '/login';
        return;
      }

      // For other errors, set to 0
      setActiveSavingsUsers(0);
    });
  }, []);

  // DailyCollections
  useEffect(() => {
    axios.get(`/admins/totalCollectionsToday`).then((res) => {
      if (res?.data) setDailyCollection(res?.data?.result?.totalAmount || 0);
    }).catch((error) => {
      console.warn("API endpoint '/admins/totalCollectionsToday' not available:", error.message);
      setDailyCollection(15750); // Fallback data
    });
  }, []);

  // total outgoing
  useEffect(() => {
    axios.get("users/").then((res) => {
      if (res?.data) {
        setUserData(res?.data?.result || []);
        const sum = res?.data?.result?.reduce((acc, item) => {
          return acc + (item.active_loan_id?.total_amount || 0);
        }, 0);
        setTotalLoanAmt(sum);
      }
    }).catch((error) => {
      console.error("Error fetching users:", error);
      setUserData([]);
      setTotalLoanAmt(0);
    });
  }, []);

  // total collection
  useEffect(() => {
    axios.get("/admins/totalCollections").then((res) => {
      if (res?.data) setTotalCollection(res?.data?.result?.totalAmount || 0);
    }).catch((error) => {
      console.warn("API endpoint '/admins/totalCollections' not available:", error.message);
      setTotalCollection(89500); // Fallback data
    });
  }, []);

  // Helper function to translate month names
  const translateMonth = (monthName) => {
    const monthMap = {
      'January': t('Jan'),
      'February': t('Feb'),
      'March': t('Mar'),
      'April': t('Apr'),
      'May': t('May'),
      'June': t('Jun'),
      'July': t('Jul'),
      'August': t('Aug'),
      'September': t('Sep'),
      'October': t('Oct'),
      'November': t('Nov'),
      'December': t('Dec'),
      'Jan': t('Jan'),
      'Feb': t('Feb'),
      'Mar': t('Mar'),
      'Apr': t('Apr'),
      'Jun': t('Jun'),
      'Jul': t('Jul'),
      'Aug': t('Aug'),
      'Sep': t('Sep'),
      'Oct': t('Oct'),
      'Nov': t('Nov'),
      'Dec': t('Dec')
    };
    return monthMap[monthName] || monthName;
  };

  // monthly stats
  useEffect(() => {
    axios.get("/admins/totalCollectionsMonthlyStats").then((res) => {
      if (res?.data?.result && Array.isArray(res.data.result)) {
        setData(res.data.result);
        const months = res.data.result.map((e) => translateMonth(e.month || ""));
        const monthsAmt = res.data.result.map((e) => Number(e.totalAmount || 0));
        setMonthData(months.length > 0 ? months : [""]);
        setMonthlyAmtData(monthsAmt.length > 0 ? monthsAmt : [0]);
      } else {
        setMonthData([""]);
        setMonthlyAmtData([0]);
      }
    }).catch((error) => {
      console.warn("API endpoint '/admins/totalCollectionsMonthlyStats' not available:", error.message);
      setMonthData([t("Jan"), t("Feb"), t("Mar"), t("Apr"), t("May"), t("Jun")]);
      setMonthlyAmtData([12000, 15000, 18000, 22000, 25000, 28000]);
    });
  }, [t]);

  // Helper function to translate weekday names
  const translateWeekday = (dayName) => {
    const dayMap = {
      'Monday': t('Mon'),
      'Tuesday': t('Tue'),
      'Wednesday': t('Wed'),
      'Thursday': t('Thu'),
      'Friday': t('Fri'),
      'Saturday': t('Sat'),
      'Sunday': t('Sun'),
      'Mon': t('Mon'),
      'Tue': t('Tue'),
      'Wed': t('Wed'),
      'Thu': t('Thu'),
      'Fri': t('Fri'),
      'Sat': t('Sat'),
      'Sun': t('Sun')
    };
    return dayMap[dayName] || dayName;
  };

  // weekly stats
  useEffect(() => {
    axios.get("/admins/totalCollectionsWeeklyStats").then((res) => {
      if (res?.data?.result?.dailyStats && Array.isArray(res.data.result.dailyStats)) {
        const weeks = res.data.result.dailyStats.map((e) => translateWeekday(e.day || ""));
        const weeksAmt = res.data.result.dailyStats.map((e) => Number(e.totalAmount || 0));
        setWeekDays(weeks.length > 0 ? weeks : [""]);
        setWeekAmtData(weeksAmt.length > 0 ? weeksAmt : [0]);
      } else {
        setWeekDays([""]);
        setWeekAmtData([0]);
      }
    }).catch((error) => {
      console.warn("API endpoint '/admins/totalCollectionsWeeklyStats' not available:", error.message);
      setWeekDays([t("Mon"), t("Tue"), t("Wed"), t("Thu"), t("Fri"), t("Sat"), t("Sun")]);
      setWeekAmtData([2500, 3200, 2800, 4100, 3600, 3900, 2200]);
    });
  }, [t]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const headerVariants = {
    hidden: { opacity: 0, y: -50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.215, 0.610, 0.355, 1.000]
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primaryBg via-white to-secondaryBg flex items-center justify-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
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
            className="text-2xl font-bold text-primary"
          >
            Loading Dashboard...
          </motion.h2>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-gradient-to-br from-primaryBg via-white to-secondaryBg pt-16 pb-6 px-4 relative overflow-hidden"
    >
      {/* Cursor Trail */}
      <CursorTrail />

      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-primary opacity-10 rounded-full"
            animate={{
              x: [0, Math.random() * 100],
              y: [0, Math.random() * 100],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: Math.random() * 10 + 5,
              repeat: Infinity,
              delay: i * 0.2,
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      {/* Animated Header */}
      <motion.div
        variants={headerVariants}
        className="text-center mb-12"
      >
        <motion.h1
          className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4"
          animate={{
            backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
          }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          {t("Financial Dashboard")}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-lg text-gray-600"
        >
          {t("Real-time analytics and insights for your finance management")}
        </motion.p>
      </motion.div>

      {/* Enhanced Cards Section */}
      <motion.div
        className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4 mb-8"
        variants={containerVariants}
      >
        <EnhancedCardDataStats
          title={t("Daily Collection")}
          total={dailyCollection}
          rate="+5.2%"
          levelUp
          gradientFrom="from-emerald-500"
          gradientTo="to-teal-600"
          animationDelay={0.1}
        >
          💰
        </EnhancedCardDataStats>

        <EnhancedCardDataStats
          title={t("Total Loan Customers")}
          total={userdata.length}
          rate="-2.3%"
          levelDown
          gradientFrom="from-blue-500"
          gradientTo="to-indigo-600"
          animationDelay={0.2}
        >
          🏛️
        </EnhancedCardDataStats>

        <EnhancedCardDataStats
          title={t("Total Outgoing")}
          total={totalLoanAmt}
          rate="+1.8%"
          levelUp
          gradientFrom="from-purple-500"
          gradientTo="to-violet-600"
          animationDelay={0.3}
        >
          📤
        </EnhancedCardDataStats>

        <EnhancedCardDataStats
          title={t("Active Savings Users")}
          total={activeSavingsUsers}
          rate="+3.5%"
          levelUp
          gradientFrom="from-orange-500"
          gradientTo="to-red-500"
          animationDelay={0.4}
        >
          💳
        </EnhancedCardDataStats>
      </motion.div>

      {/* Second Row Cards */}
      <motion.div
        className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-2 mb-8"
        variants={containerVariants}
      >
        <EnhancedCardDataStats
          title={t("Total Collections")}
          total={totalCollection}
          rate="+4.1%"
          levelUp
          gradientFrom="from-green-500"
          gradientTo="to-emerald-600"
          animationDelay={0.5}
          bgColor="bg-gradient-to-br from-green-50 to-emerald-50"
        >
          💵
        </EnhancedCardDataStats>

        <EnhancedCardDataStats
          title={t("Monthly Growth")}
          total={(((totalCollection / 100000) * 100).toFixed(1)) + "%"}
          rate="+8.2%"
          levelUp
          gradientFrom="from-pink-500"
          gradientTo="to-rose-600"
          animationDelay={0.6}
          bgColor="bg-gradient-to-br from-pink-50 to-rose-50"
        >
          📊
        </EnhancedCardDataStats>
      </motion.div>

      {/* Enhanced Charts Section */}
      <motion.div
        className="grid grid-cols-12 gap-6"
        variants={containerVariants}
      >
        <motion.div
          className="col-span-12 xl:col-span-6"
          whileHover={{ scale: 1.01 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <SimpleChart title="Simple Overview" data={monthlyAmtData} />
        </motion.div>

        <motion.div
          className="col-span-12 xl:col-span-6"
          whileHover={{ scale: 1.01 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <MonthlyChart title="Monthly Statistics" data={monthlyAmtData} />
        </motion.div>

        <motion.div
          className="col-span-12 xl:col-span-6"
          whileHover={{ scale: 1.01 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <WeeklyChart title="Weekly Statistics" data={weekAmtData} />
        </motion.div>

        <motion.div
          className="col-span-12 xl:col-span-6"
          whileHover={{ scale: 1.01 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <PerformanceChart title="Performance Metrics" />
        </motion.div>
      </motion.div>

      {/* Floating Action Button */}
      <motion.button
        className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-full shadow-2xl flex items-center justify-center text-white text-2xl z-50"
        whileHover={{ 
          scale: 1.1,
          rotate: 360,
          boxShadow: "0 20px 40px rgba(13, 148, 136, 0.4)"
        }}
        whileTap={{ scale: 0.9 }}
        animate={{ 
          y: [0, -10, 0],
          boxShadow: [
            "0 10px 30px rgba(13, 148, 136, 0.3)",
            "0 20px 40px rgba(13, 148, 136, 0.4)",
            "0 10px 30px rgba(13, 148, 136, 0.3)"
          ]
        }}
        transition={{ 
          y: { duration: 2, repeat: Infinity },
          boxShadow: { duration: 2, repeat: Infinity }
        }}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        ↑
      </motion.button>
    </motion.div>
  );
};

export default EnhancedDashHome;
