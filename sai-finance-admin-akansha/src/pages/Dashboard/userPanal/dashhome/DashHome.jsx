import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import CardDataStats from "../../../../componant/CardDataStats/CardDataStats";
import ChartOne from "../../../../componant/Charts/ChartOne";
import ChartTwo from "../../../../componant/Charts/ChartTwo";
import ChartThree from "../../../../componant/Charts/ChartThree";
import axios from "../../../../axios";

const DashHome = () => {
  const [data, setData] = useState([]);
  const [weekDays, setweekDays] = useState([""]);
  const [weekAmtData, setweekAmtData] = useState([0]);
  const [userdata, setUserData] = useState([]);
  const [monthsData, setMonthData] = useState([""]);
  const [monthlyAmtData, setMonthlyAmtData] = useState([0]);
  const [dailyCollection, setDailyCollection] = useState(0);
  const [totalLoanAmt, setTotalLoanAmt] = useState(0);
  const [totalCollection, setTotalCollection] = useState(0);
  const [savingUsers, setSavingUsers] = useState(0);
  const [loading, setLoading] = useState(true);

  // DailyCollections
  useEffect(() => {
    axios.get(`/admins/totalCollectionsToday`).then((res) => {
      if (res?.data) setDailyCollection(res?.data?.result?.totalAmount || 0);
    }).catch((error) => {
      console.error("Error fetching daily collections:", error);
      setDailyCollection(0);
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
    }).finally(() => {
      setTimeout(() => setLoading(false), 800);
    });
  }, []);

  // total collection
  useEffect(() => {
    axios.get("/admins/totalCollections").then((res) => {
      if (res?.data) setTotalCollection(res?.data?.result?.totalAmount || 0);
    }).catch((error) => {
      console.error("Error fetching total collections:", error);
      setTotalCollection(0);
    });
  }, []);

  // saving users
  useEffect(() => {
    axios.get("account/").then((res) => {
      if (res?.data?.result && Array.isArray(res.data.result)) {
        const activeSavingUsers = res.data.result.filter(user => user.status === 'active' || user.is_active === true);
        setSavingUsers(activeSavingUsers.length);
      } else {
        setSavingUsers(0);
      }
    }).catch((error) => {
      console.error("Error fetching saving users:", error);
      setSavingUsers(0);
    });
  }, []);

  // monthly stats
  useEffect(() => {
    axios.get("/admins/totalCollectionsMonthlyStats").then((res) => {
      if (res?.data?.result && Array.isArray(res.data.result)) {
        setData(res.data.result);
        const months = res.data.result.map((e) => e.month || "");
        const monthsAmt = res.data.result.map((e) => Number(e.totalAmount || 0));
        setMonthData(months.length > 0 ? months : [""]);
        setMonthlyAmtData(monthsAmt.length > 0 ? monthsAmt : [0]);
      } else {
        setMonthData([""]);
        setMonthlyAmtData([0]);
      }
    }).catch((error) => {
      console.error("Error fetching monthly stats:", error);
      setMonthData([""]);
      setMonthlyAmtData([0]);
    });
  }, []);

  // weekly stats
  useEffect(() => {
    axios.get("/admins/totalCollectionsWeeklyStats").then((res) => {
      if (res?.data?.result?.dailyStats && Array.isArray(res.data.result.dailyStats)) {
        const weeks = res.data.result.dailyStats.map((e) => e.day || "");
        const weeksAmt = res.data.result.dailyStats.map((e) => Number(e.totalAmount || 0));
        setweekDays(weeks.length > 0 ? weeks : [""]);
        setweekAmtData(weeksAmt.length > 0 ? weeksAmt : [0]);
      } else {
        setweekDays([""]);
        setweekAmtData([0]);
      }
    }).catch((error) => {
      console.error("Error fetching weekly stats:", error);
      setweekDays([""]);
      setweekAmtData([0]);
    });
  }, []);

  const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.9 },
    visible: (index) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        delay: index * 0.1,
        duration: 0.6,
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    }),
  };

  const chartVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    visible: (index) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        delay: 0.4 + index * 0.2,
        duration: 0.8,
        type: "spring",
        stiffness: 80,
        damping: 20,
      },
    }),
  };

  const cardData = [
    {
      title: "Daily Collection",
      total: `₹ ${dailyCollection.toLocaleString()}`,
      rate: "+5.2%",
      levelUp: true,
      icon: "💰",
    },
    {
      title: "Total Loan Customer",
      total: userdata.length.toLocaleString(),
      rate: "-2.3%",
      levelDown: true,
      icon: "👥",
    },
    {
      title: "Active Saving Users",
      total: savingUsers.toLocaleString(),
      rate: "+8.4%",
      levelUp: true,
      icon: "💸",
    },
    {
      title: "Total Outgoing",
      total: `₹ ${totalLoanAmt.toLocaleString()}`,
      rate: "+1.8%",
      levelUp: true,
      icon: "📤",
    },
    {
      title: "Total Collections",
      total: `₹ ${totalCollection.toLocaleString()}`,
      rate: "+12.5%",
      levelUp: true,
      icon: "🏦",
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-primaryBg flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="min-h-screen bg-primaryBg pt-20 pb-8 px-4 lg:px-6"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Finance Dashboard
        </h1>
        <p className="text-gray-600 text-lg">
          Welcome back! Here's your finance overview
        </p>
      </motion.div>

      {/* Cards Section with Staggered Animation */}
      <motion.div
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 mb-10"
      >
        {cardData.map((card, index) => (
          <motion.div
            key={card.title}
            custom={index}
            variants={cardVariants}
            whileHover={{ y: -5 }}
            transition={{ duration: 0.3 }}
          >
            <CardDataStats
              title={card.title}
              total={card.total}
              rate={card.rate}
              levelUp={card.levelUp}
              levelDown={card.levelDown}
            >
              {card.icon}
            </CardDataStats>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts Section with Enhanced Animation */}
      <motion.div
        initial="hidden"
        animate="visible"
        className="grid grid-cols-12 gap-8"
      >
        <motion.div
          custom={0}
          variants={chartVariants}
          className="col-span-12 xl:col-span-7"
        >
          <ChartOne monthsData={monthsData} monthlyAmtData={monthlyAmtData} />
        </motion.div>

        <motion.div
          custom={1}
          variants={chartVariants}
          className="col-span-12 xl:col-span-5"
        >
          <ChartTwo weekDays={weekDays} weekAmtData={weekAmtData} />
        </motion.div>

        <motion.div
          custom={2}
          variants={chartVariants}
          className="col-span-12"
        >
          <ChartThree />
        </motion.div>
      </motion.div>

      {/* Floating Action Button */}
      <motion.button
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.5, duration: 0.5, type: "spring" }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-8 right-8 w-14 h-14 bg-primary hover:bg-primaryDark text-white rounded-full shadow-lg hover:shadow-xl flex items-center justify-center text-xl z-50 transition-all duration-300"
      >
        📊
      </motion.button>

      {/* Background decorative elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute top-20 right-20 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-xl"
        />
        <motion.div
          animate={{
            x: [0, -80, 0],
            y: [0, 60, 0],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute bottom-40 left-20 w-24 h-24 bg-gradient-to-br from-secondary/10 to-transparent rounded-full blur-xl"
        />
      </div>
    </motion.div>
  );
};

export default DashHome;
