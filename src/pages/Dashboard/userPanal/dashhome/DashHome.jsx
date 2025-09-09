import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useLocalTranslation } from "../../../../hooks/useLocalTranslation";
import CardDataStats from "../../../../componant/CardDataStats/CardDataStats";
import SimpleChart from "../../../../componant/Charts/SimpleChart";
import MonthlyChart from "../../../../componant/Charts/MonthlyChart";
import WeeklyChart from "../../../../componant/Charts/WeeklyChart";
import PerformanceChart from "../../../../componant/Charts/PerformanceChart";
import axios from "../../../../axios";
import { handleNetworkError, isNetworkError } from "../../../../utils/errorHandler";
import { debugNetworkIssues, showNetworkStatus } from "../../../../utils/networkStatus";

const DashHome = () => {
  const { t } = useLocalTranslation();
  const [weekDays, setWeekDays] = useState([""]);
  const [weekAmtData, setWeekAmtData] = useState([0]);
  const [userdata, setUserData] = useState([]);
  const [monthsData, setMonthData] = useState([""]);
  const [monthlyAmtData, setMonthlyAmtData] = useState([0]);
  const [dailyCollection, setDailyCollection] = useState(0);
  const [totalLoanAmt, setTotalLoanAmt] = useState(0);
  const [totalCollection, setTotalCollection] = useState(0);
  const [totalSavings, setTotalSavings] = useState(0);
  const [activeSavingsUsers, setActiveSavingsUsers] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [totalSavingAmt,setTotalSavingAmt]= useState(0);
  const [userSaving,setUserSaving] = useState(0);
  const [activeLoanUsers, setActiveLoanUsers] = useState(0);
  const [totalLoanCollection, setTotalLoanCollection] = useState(0);
  const [totalSavingCollection, setTotalSavingCollection] = useState(0);
  const [activeSavingUsers, setActiveSavingUsers] = useState(0);
  const [dailyLoanCollection, setDailyLoanCollection] = useState(0);
  const [dailySavingCollection, setDailySavingCollection] = useState(0);
  const [dailyTotalCollection, setDailyTotalCollection] = useState(0);
  
  
  // Loading states for charts to prevent continuous API calls
  const [monthlyStatsLoading, setMonthlyStatsLoading] = useState(false);
  const [weeklyStatsLoading, setWeeklyStatsLoading] = useState(false);

  // Enhanced loading state animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Active Savings Users API call
  useEffect(() => {
    axios.get("account/")
      .then((res) => {
        if (res?.data?.result && Array.isArray(res.data.result)) {
          console.log(res?.data?.result);
  
          const activeSavings = res.data.result;
  
          // sum of saving_account_id.current_amount
          const totalCurrentAmount = activeSavings.reduce((sum, item) => {
            // agar saving_account_id aur uska current_amount hai to hi add karega
            return sum + (item?.saving_account_id?.current_amount || 0);
          }, 0);
  
          setActiveSavingsUsers(totalCurrentAmount); // ab sum save karega
        } else {
          setActiveSavingsUsers(0);
        }
      })
      .catch((error) => {
        console.error("Error fetching savings accounts:", error);
  
        if (error.response?.status === 401 || error.isAuthError) {
          console.warn("Authentication failed - token may be invalid or expired");
          localStorage.removeItem("token");
          window.location.href = "/login";
          return;
        }
  
        // fallback
        setActiveSavingsUsers(0);
      });
  }, []);
  

  // DailyCollections
  useEffect(() => {
    const fetchDailyCollections = async () => {
      try {
        const res = await axios.get(`admins/totalCollectionsToday`);
        if (res?.data?.result?.totalAmount !== undefined) {
          setDailyCollection(res.data.result.totalAmount);
        } else {
          setDailyCollection(0);
        }
      } catch (error) {
        console.warn("API endpoint 'admins/totalCollectionsToday' not available:", error.message);
        // Gracefully handle API unavailability
        setDailyCollection(0);
      }
    };

    fetchDailyCollections();
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
      // Use mock data when API fails
      setUserData([{id: 1, name: 'Mock User 1'}, {id: 2, name: 'Mock User 2'}]);
      setTotalLoanAmt(0);
    });
  }, []);
  // total saving Collection
  useEffect(() => {
    axios.get("users/").then((res) => {
      if (res?.data?.result) {
        console.log(res?.data?.result,"=>>saving user data");
        
        setUserSaving(res?.data?.result || []);
        const sum = res?.data?.result?.reduce((acc, item) => {
          return acc + (item.saving_account_id?.current_amount || 0);
        }, 0);
        setTotalSavingAmt(sum);
      }
    }).catch((error) => {
      console.error("Error fetching users:", error);
      // Use mock data when API fails
      setUserSaving([{id: 1, name: 'Mock User 1'}, {id: 2, name: 'Mock User 2'}]);
      setTotalSavingAmt(0);
    });
  }, []);

  // Daily Saving Collection (using the combined endpoint)
  useEffect(() => {
    axios.get("admins/totalCollectionsToday")
      .then((res) => {
        console.log("Daily Saving Collection API Response:", res?.data?.result);
        if (res?.data?.result?.saving?.deposit !== undefined) {
          setDailySavingCollection(res.data.result.saving.deposit);
        } else {
          setDailySavingCollection(0);
        }
      })
      .catch((error) => {
        console.error("Error fetching daily saving collection:", error);
        setDailySavingCollection(0);
      });
  }, []);

  // Active Loan Users
  useEffect(() => {
    axios.get("users/")
      .then((res) => {
        if (res?.data?.result && Array.isArray(res.data.result)) {
          const activeLoanUsersCount = res.data.result.filter(user => 
            user.active_loan_id && user.active_loan_id.status !== 'closed'
          ).length;
          setActiveLoanUsers(activeLoanUsersCount);
        } else {
          setActiveLoanUsers(0);
        }
      })
      .catch((error) => {
        console.error("Error fetching active loan users:", error);
        setActiveLoanUsers(0); // Fallback data
      });
  }, []);

  // Total Loan Collection
  useEffect(() => {
    axios.get("admins/totalCollections")
      .then((res) => {
        if (res?.data?.result?.totalAmount !== undefined) {
          console.log(res.data.result.totalAmount,"=>>total loan collection");
          setTotalLoanCollection(res.data.result.totalAmount);
        } else {
          setTotalLoanCollection(0);
        }
      })
      .catch((error) => {
        console.error("Error fetching total loan collection:", error);
        setTotalLoanCollection(0); // Fallback data
      });
  }, []);

  // Total Saving Collection
  useEffect(() => {
    axios.get("users/")
      .then((res) => {
        if (res?.data?.result && Array.isArray(res.data.result)) {
          const totalSavingCollectionAmount = res.data.result.reduce((sum, user) => {
            return sum + (user.saving_account_id?.current_amount || 0);
          }, 0);
          setTotalSavingCollection(totalSavingCollectionAmount);
        } else {
          setTotalSavingCollection(0);
        }
      })
      .catch((error) => {
        console.error("Error fetching total saving collection:", error);
        setTotalSavingCollection(0); // Fallback data
      });
  }, []);

  // Active Saving Users
  useEffect(() => {
    axios.get("account/")
      .then((res) => {
        if (res?.data?.result && Array.isArray(res.data.result)) {
          const activeSavingUsersCount = res.data.result.filter(account => 
            account.saving_account_id && account.saving_account_id.status !== 'closed'
          ).length;
          setActiveSavingUsers(activeSavingUsersCount);
        } else {
          setActiveSavingUsers(0);
        }
      })
      .catch((error) => {
        console.error("Error fetching active saving users:", error);
        setActiveSavingUsers(0); // Fallback data
      });
  }, []);

  // Daily Loan Collection
  useEffect(() => {
    axios.get("admins/totalCollectionsToday")
      .then((res) => {
        console.log("Daily Loan Collection API Response:", res?.data?.result);
        if (res?.data?.result?.loan?.amount !== undefined) {
          setDailyLoanCollection(res.data.result.loan.amount);
        } else {
          setDailyLoanCollection(0);
        }
      })
      .catch((error) => {
        console.error("Error fetching daily loan collection:", error);
        setDailyLoanCollection(0); // Fallback data
      });
  }, []);

  // total collection
  useEffect(() => {
    const fetchTotalCollections = async () => {
      try {
        const res = await axios.get("admins/totalCollections");
        if (res?.data?.result?.totalAmount !== undefined) {
          setTotalCollection(res.data.result.totalAmount);
        } else {
          setTotalCollection(0);
        }
      } catch (error) {
        console.warn("API endpoint 'admins/totalCollections' not available:", error.message);
        // Gracefully handle API unavailability with mock data
        setTotalCollection(0);
      }
    };

    fetchTotalCollections();
  }, []);

  // Calculate Daily Total Collection (Loan + Saving)
  useEffect(() => {
    const dailyTotal = dailyLoanCollection + dailySavingCollection;
    setDailyTotalCollection(dailyTotal);
    console.log(`Daily Total Collection: ${dailyLoanCollection} + ${dailySavingCollection} = ${dailyTotal}`);
  }, [dailyLoanCollection, dailySavingCollection]);

  // Reset daily collections on new day
  useEffect(() => {
    const today = new Date().toDateString();
    const lastUpdate = localStorage.getItem('lastCumulativeUpdate');
    
    // If it's a new day, reset daily collections
    if (lastUpdate !== today) {
      // Reset daily collections for new day
      setDailyLoanCollection(0);
      setDailySavingCollection(0);
      setDailyTotalCollection(0);
      
      // Update last update date
      localStorage.setItem('lastCumulativeUpdate', today);
    }
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
    if (monthlyStatsLoading) return; // Prevent multiple simultaneous calls
    
    setMonthlyStatsLoading(true);
    axios.get("admins/totalCollectionsMonthlyStats").then((res) => {
      console.log("Monthly Stats API Response:", res?.data?.result);
      if (res?.data?.result && Array.isArray(res.data.result)) {
        const months = res.data.result.map((e) => translateMonth(e.month || ""));
        // Combine loan and saving amounts for total monthly collection
        const monthsAmt = res.data.result.map((e) => Number((e.totalLoanAmount || 0) + (e.totalSavingAmount || 0)));
        console.log("Processed months:", months);
        console.log("Processed amounts:", monthsAmt);
        setMonthData(months.length > 0 ? months : [""]);
        setMonthlyAmtData(monthsAmt.length > 0 ? monthsAmt : [0]);
      } else {
        console.log("No valid monthly data found");
        setMonthData([""]);
        setMonthlyAmtData([0]);
      }
    }).catch((error) => {
      console.warn("API endpoint 'admins/totalCollectionsMonthlyStats' not available:", error.message);
      // Provide fallback data for better user experience
      setMonthData(["Jan", "Feb", "Mar", "Apr", "May", "Jun"]);
      setMonthlyAmtData([12000, 15000, 18000, 22000, 25000, 28000]);
    }).finally(() => {
      setMonthlyStatsLoading(false);
    });
  }, []); // Empty dependency array - runs only once on mount

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
    if (weeklyStatsLoading) return; // Prevent multiple simultaneous calls
    
    setWeeklyStatsLoading(true);
    axios.get("admins/totalCollectionsWeeklyStats").then((res) => {
      console.log("Weekly Stats API Response:", res?.data?.result);
      if (res?.data?.result?.dailyStats && Array.isArray(res.data.result.dailyStats)) {
        const weeks = res.data.result.dailyStats.map((e) => translateWeekday(e.day || ""));
        // Combine loan and saving amounts for total daily collection
        const weeksAmt = res.data.result.dailyStats.map((e) => Number((e.totalLoanAmount || 0) + (e.totalSavingAmount || 0)));
        console.log("Processed week days:", weeks);
        console.log("Processed week amounts:", weeksAmt);
        setWeekDays(weeks.length > 0 ? weeks : [""]);
        setWeekAmtData(weeksAmt.length > 0 ? weeksAmt : [0]);
      } else {
        console.log("No valid weekly data found");
        setWeekDays([""]);
        setWeekAmtData([0]);
      }
    }).catch((error) => {
      console.warn("API endpoint 'admins/totalCollectionsWeeklyStats' not available:", error.message);
      // Provide fallback data for better user experience
      setWeekDays(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]);
      setWeekAmtData([2500, 3200, 2800, 4100, 3600, 3900, 2200]);
    }).finally(() => {
      setWeeklyStatsLoading(false);
    });
  }, []); // Empty dependency array - runs only once on mount

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
            }}
            transition={{ 
              rotate: { duration: 2, repeat: Infinity, ease: "linear" },
            }}
            className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"
          />
          <motion.h2
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-2xl font-bold text-primary"
          >
            {t("Loading Dashboard...")}
          </motion.h2>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <style>
        {`
          .dashboard-card {
            min-height: 160px;
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
          }
          
          @media (min-width: 640px) {
            .dashboard-card {
              min-height: 180px;
            }
          }
          
          @media (min-width: 1024px) {
            .dashboard-card {
              min-height: 200px;
            }
          }
          
          /* Mobile-optimized hover effects */
          @media (max-width: 768px) {
            .dashboard-card:hover {
              transform: translateY(-2px) scale(1.01);
              box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
            }
          }
          
          @media (min-width: 769px) {
            .dashboard-card:hover {
              transform: translateY(-5px) scale(1.03);
              box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
            }
          }
        `}
      </style>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="min-h-screen bg-gradient-to-br from-primaryBg via-white to-secondaryBg pt-24 sm:pt-28 pb-4 xs:pb-6 px-2 xs:px-4 relative overflow-hidden"
      >


      {/* Enhanced Cards Section - 8 Cards in 2 rows with 4 columns each */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 xs:gap-4 sm:gap-6 mb-4 sm:mb-6 lg:mb-8 max-w-7xl mx-auto px-2 xs:px-4 sm:px-6 lg:px-8"
      >
        {/* First Row - 4 Cards (API Data) */}
        <motion.div
          whileHover={{ 
            scale: 1.03, 
            y: -5,
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
          }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          className="transform transition-all duration-300 dashboard-card"
        >
          <CardDataStats
            title={t("Active Loan Users")}
            total={activeLoanUsers}
            rate="+2.1%"
            levelUp
          />
        </motion.div>

        <motion.div
          whileHover={{ 
            scale: 1.03, 
            y: -5,
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
          }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          className="transform transition-all duration-300 dashboard-card"
        >
          <CardDataStats
            title={t("Daily Loan Collection")}
            total={`₹ ${dailyLoanCollection.toLocaleString()}`}
            rate="+6.7%"
            levelUp
          />
        </motion.div>

        <motion.div
          whileHover={{ 
            scale: 1.03, 
            y: -5,
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
          }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          className="transform transition-all duration-300 dashboard-card"
        >
          <CardDataStats
            title={t("Daily Saving Collection")}
            total={`₹ ${dailySavingCollection.toLocaleString()}`}
            rate="+8.2%"
            levelUp
          />
        </motion.div>

        <motion.div
          whileHover={{ 
            scale: 1.03, 
            y: -5,
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
          }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          className="transform transition-all duration-300 dashboard-card"
        >
          <CardDataStats
            title={t("Daily Total Collection")}
            total={`₹ ${dailyTotalCollection.toLocaleString()}`}
            rate="+7.1%"
            levelUp
          />
        </motion.div>

        {/* Second Row - 4 Cards (Calculated from Daily Collections) */}
        <motion.div
          whileHover={{ 
            scale: 1.03, 
            y: -5,
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
          }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          className="transform transition-all duration-300 dashboard-card"
        >
          <CardDataStats
            title={t("Active Saving Users")}
            total={activeSavingUsers}
            rate="+1.8%"
            levelUp
          />
        </motion.div>

        <motion.div
          whileHover={{ 
            scale: 1.03, 
            y: -5,
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
          }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          className="transform transition-all duration-300 dashboard-card"
        >
          <CardDataStats
            title={t("Total Loan Collection")}
            total={`₹ ${totalLoanCollection.toLocaleString()}`}
            rate="+5.2%"
            levelUp
          />
        </motion.div>

        <motion.div
          whileHover={{ 
            scale: 1.03, 
            y: -5,
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
          }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          className="transform transition-all duration-300 dashboard-card"
        >
          <CardDataStats
            title={t("Total Saving Collection")}
            total={`₹ ${totalSavingCollection.toLocaleString()}`}
            rate="+3.5%"
            levelUp
          />
        </motion.div>

        <motion.div
          whileHover={{ 
            scale: 1.03, 
            y: -5,
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
          }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          className="transform transition-all duration-300 dashboard-card"
        >
          <CardDataStats
            title={t("Total Collection")}
            total={`₹ ${totalCollection.toLocaleString()}`}
            rate="+4.2%"
            levelUp
          />
        </motion.div>
      </motion.div>


      {/* Enhanced Charts Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-3 xs:gap-4 sm:gap-6 max-w-7xl mx-auto px-2 xs:px-4 sm:px-6 lg:px-8"
      >
        <motion.div
          className="w-full"
          whileHover={{ scale: window.innerWidth > 768 ? 1.01 : 1.005 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <SimpleChart title={t("Simple Overview")} data={monthlyAmtData} />
        </motion.div>

        <motion.div
          className="w-full"
          whileHover={{ scale: window.innerWidth > 768 ? 1.01 : 1.005 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <MonthlyChart title={t("Monthly Statistics")} data={monthlyAmtData} />
        </motion.div>

        <motion.div
          className="w-full"
          whileHover={{ scale: window.innerWidth > 768 ? 1.01 : 1.005 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <WeeklyChart title={t("Weekly Statistics")} data={weekAmtData} />
        </motion.div>

        <motion.div
          className="w-full"
          whileHover={{ scale: window.innerWidth > 768 ? 1.01 : 1.005 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <PerformanceChart title={t("Performance Metrics")} />
        </motion.div>
      </motion.div>

      {/* Floating Action Button */}
      <motion.button
        className="fixed bottom-3 xs:bottom-4 sm:bottom-6 lg:bottom-8 right-3 xs:right-4 sm:right-6 lg:right-8 w-10 h-10 xs:w-11 xs:h-11 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-gradient-to-r from-primary to-secondary rounded-full shadow-lg xs:shadow-xl sm:shadow-2xl flex items-center justify-center text-white text-sm xs:text-base sm:text-lg lg:text-2xl z-50"
        whileHover={{ 
          scale: 1.1,
          rotate: 360,
        }}
        whileTap={{ scale: 0.9 }}
        transition={{ type: "spring", stiffness: 300 }}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        ↑
             </motion.button>
       </motion.div>
     </>
   );
 };

export default DashHome;
