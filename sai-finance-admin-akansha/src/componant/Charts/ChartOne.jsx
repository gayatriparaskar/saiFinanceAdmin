import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import { motion } from "framer-motion";
import { useLocalTranslation } from "../../hooks/useLocalTranslation";

const ChartOne = ({ monthsData = [], monthlyAmtData = [] }) => {
  const { t } = useLocalTranslation();

  const [series, setSeries] = useState([
    {
      name: "Monthly Revenue",
      data: [0],
    },
    {
      name: "Growth Trend",
      data: [0],
    },
  ]);

  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsLoaded(true), 300);
    
    if (Array.isArray(monthlyAmtData) && monthlyAmtData.length > 0) {
      setSeries([
        { name: "Monthly Revenue", data: monthlyAmtData },
        { name: "Growth Trend", data: monthlyAmtData.map(val => val * 0.8) },
      ]);
    }
  }, [monthlyAmtData]);

  const options = {
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "left",
      floating: false,
      fontSize: "14px",
      fontFamily: "Poppins, sans-serif",
      fontWeight: 500,
      markers: {
        width: 8,
        height: 8,
        radius: 4,
      },
    },
    colors: ["#0d9488", "#f97316"],
    chart: {
      fontFamily: "Poppins, sans-serif",
      height: 400,
      type: "area",
      animations: {
        enabled: true,
        easing: "easeinout",
        speed: 1200,
        animateGradually: {
          enabled: true,
          delay: 200,
        },
        dynamicAnimation: {
          enabled: true,
          speed: 600,
        },
      },
      dropShadow: {
        enabled: true,
        color: "#0d9488",
        top: 6,
        left: 0,
        blur: 10,
        opacity: 0.15,
      },
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
      },
    },
    responsive: [
      {
        breakpoint: 1024,
        options: {
          chart: {
            height: 300,
          },
        },
      },
    ],
    stroke: {
      width: [3, 3],
      curve: "smooth",
    },
    fill: {
      type: "solid",
      opacity: [0.8, 0.6],
    },
    grid: {
      show: true,
      borderColor: "#e0e6ed",
      strokeDashArray: 5,
      xaxis: {
        lines: {
          show: true,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    markers: {
      size: 5,
      colors: ["#ffffff"],
      strokeColors: ["#0d9488", "#f97316"],
      strokeWidth: 3,
      strokeOpacity: 1,
      fillOpacity: 1,
      hover: {
        size: 8,
        sizeOffset: 3,
      },
    },
    xaxis: {
      type: "category",
      categories: Array.isArray(monthsData) && monthsData.length ? monthsData : [""],
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      labels: {
        style: {
          colors: "#6b7280",
          fontSize: "12px",
          fontFamily: "Poppins, sans-serif",
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: "#6b7280",
          fontSize: "12px",
          fontFamily: "Poppins, sans-serif",
        },
        formatter: function (val) {
          return "₹" + val.toLocaleString();
        },
      },
      min: 0,
    },
    tooltip: {
      theme: "dark",
      style: {
        fontSize: "12px",
        fontFamily: "Poppins, sans-serif",
      },
      y: {
        formatter: function (val) {
          return "₹" + val.toLocaleString();
        },
      },
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="relative rounded-3xl border-2 border-gray-100 bg-white p-6 shadow-xl hover:shadow-2xl hover:border-primary/30 transition-all duration-500 group overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      <div className="relative z-10">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="flex flex-wrap items-start justify-between gap-4 mb-6"
        >
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Revenue Analytics</h3>
            <p className="text-gray-600 text-sm">Monthly performance overview</p>
          </div>
          
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="flex gap-2"
          >
            {["Day", "Week", "Month"].map((period, index) => (
              <motion.button
                key={period}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                  period === "Month" 
                    ? "bg-primary text-white shadow-lg" 
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {period}
              </motion.button>
            ))}
          </motion.div>
        </motion.div>

        {/* Legend */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="flex flex-wrap gap-6 mb-6"
        >
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full bg-primary shadow-sm"></div>
            <div>
              <p className="font-semibold text-gray-900">Monthly Revenue</p>
              <p className="text-xs text-gray-500">Primary income source</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full bg-secondary shadow-sm"></div>
            <div>
              <p className="font-semibold text-gray-900">Growth Trend</p>
              <p className="text-xs text-gray-500">Performance indicator</p>
            </div>
          </div>
        </motion.div>

        {/* Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: isLoaded ? 1 : 0, scale: isLoaded ? 1 : 0.9 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="relative"
        >
          <div id="chartOne" className="-mx-2">
            <ReactApexChart 
              options={options} 
              series={series} 
              type="area" 
              height={400} 
            />
          </div>
        </motion.div>

        {/* Decorative elements */}
        <div className="absolute top-6 right-6 w-3 h-3 bg-primary rounded-full opacity-30 group-hover:opacity-60 transition-colors duration-300"></div>
        <div className="absolute bottom-6 left-6 w-2 h-2 bg-secondary rounded-full opacity-40 group-hover:opacity-80 transition-colors duration-300"></div>
      </div>

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    </motion.div>
  );
};

export default ChartOne;
