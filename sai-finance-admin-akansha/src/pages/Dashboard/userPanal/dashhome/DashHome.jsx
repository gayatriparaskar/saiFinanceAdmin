import React, { useEffect, useState } from "react";
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

  return (
    <div className="min-h-screen bg-primaryLight pt-20 pb-6 px-4">
      {/* Cards Section with Animation */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4 mb-8">
        <div className="transform transition-all duration-500 ease-in-out hover:scale-105 animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
          <CardDataStats title="Daily Collection" total={`₹ ${dailyCollection}`} rate="+5.2%" levelUp>
            📈
          </CardDataStats>
        </div>

        <div className="transform transition-all duration-500 ease-in-out hover:scale-105 animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
          <CardDataStats title="Total Loan Customer" total={userdata.length} rate="-2.3%" levelDown>
            👥
          </CardDataStats>
        </div>

        <div className="transform transition-all duration-500 ease-in-out hover:scale-105 animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
          <CardDataStats title="Total Outgoing" total={`₹ ${totalLoanAmt}`} rate="+1.8%" levelUp>
            💸
          </CardDataStats>
        </div>

        <div className="transform transition-all duration-500 ease-in-out hover:scale-105 animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
          <CardDataStats title="Total Collections" total={`₹ ${totalCollection}`}>
            🏦
          </CardDataStats>
        </div>
      </div>

      {/* Charts Section with Animation */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 xl:col-span-6 transform transition-all duration-700 ease-in-out hover:scale-102 animate-fadeInUp" style={{ animationDelay: '0.5s' }}>
          <ChartOne monthsData={monthsData} monthlyAmtData={monthlyAmtData} />
        </div>

        <div className="col-span-12 xl:col-span-6 transform transition-all duration-700 ease-in-out hover:scale-102 animate-fadeInUp" style={{ animationDelay: '0.6s' }}>
          <ChartTwo weekDays={weekDays} weekAmtData={weekAmtData} />
        </div>

        <div className="col-span-12 transform transition-all duration-700 ease-in-out hover:scale-102 animate-fadeInUp" style={{ animationDelay: '0.7s' }}>
          <ChartThree />
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeInUp {
          animation: fadeInUp 0.8s ease-out forwards;
          opacity: 0;
        }
        
        .hover\\:scale-102:hover {
          transform: scale(1.02);
        }
        
        .hover\\:scale-105:hover {
          transform: scale(1.05);
        }
      `}</style>
    </div>
  );
};

export default DashHome;
