import React, { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import { motion } from 'framer-motion';
import { useLocalTranslation } from '../../hooks/useLocalTranslation';

const ChartTwo = ({ weekDays = [], weekAmtData = [] }) => {
  const [series, setSeries] = useState([
    {
      name: 'Daily Collections',
      data: [0],
    },
    {
      name: 'Target Achievement',
      data: [0],
    },
  ]);

  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsLoaded(true), 500);
    
    if (Array.isArray(weekAmtData) && weekAmtData.length > 0) {
      setSeries([
        { name: 'Daily Collections', data: weekAmtData },
        { name: 'Target Achievement', data: weekAmtData.map(val => val * 0.7) },
      ]);
    }
  }, [weekAmtData]);

  const options = {
    colors: ['#0d9488', '#f97316'],
    chart: {
      fontFamily: 'Poppins, sans-serif',
      type: 'bar',
      height: 400,
      stacked: false,
      toolbar: { show: false },
      zoom: { enabled: false },
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 1000,
        animateGradually: {
          enabled: true,
          delay: 150,
        },
        dynamicAnimation: {
          enabled: true,
          speed: 400,
        },
      },
      dropShadow: {
        enabled: true,
        color: '#0d9488',
        top: 4,
        left: 0,
        blur: 8,
        opacity: 0.2,
      },
    },
    responsive: [
      {
        breakpoint: 1536,
        options: {
          plotOptions: {
            bar: {
              borderRadius: 6,
              columnWidth: '35%',
            },
          },
        },
      },
      {
        breakpoint: 768,
        options: {
          plotOptions: {
            bar: {
              borderRadius: 4,
              columnWidth: '50%',
            },
          },
        },
      },
    ],
    plotOptions: {
      bar: {
        horizontal: false,
        borderRadius: 8,
        columnWidth: '30%',
        borderRadiusApplication: 'end',
        borderRadiusWhenStacked: 'last',
        dataLabels: {
          position: 'top',
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent'],
    },
    xaxis: {
      categories: Array.isArray(weekDays) && weekDays.length ? weekDays : [""],
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      labels: {
        style: {
          colors: '#6b7280',
          fontSize: '12px',
          fontFamily: 'Poppins, sans-serif',
          fontWeight: 500,
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: '#6b7280',
          fontSize: '12px',
          fontFamily: 'Poppins, sans-serif',
        },
        formatter: function (val) {
          return '₹' + val.toLocaleString();
        },
      },
    },
    fill: {
      type: 'solid',
      opacity: 0.9,
    },
    legend: {
      show: true,
      position: 'top',
      horizontalAlign: 'left',
      fontFamily: 'Poppins, sans-serif',
      fontWeight: 500,
      fontSize: '14px',
      markers: {
        width: 8,
        height: 8,
        radius: 4,
      },
    },
    grid: {
      show: true,
      borderColor: '#e5e7eb',
      strokeDashArray: 3,
      position: 'back',
      xaxis: {
        lines: {
          show: false,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    tooltip: {
      theme: 'dark',
      style: {
        fontSize: '12px',
        fontFamily: 'Poppins, sans-serif',
      },
      y: {
        formatter: function (val) {
          return '₹' + val.toLocaleString();
        },
      },
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
      className="relative rounded-3xl border-2 border-gray-100 bg-white p-6 shadow-xl hover:shadow-2xl hover:border-secondary/30 transition-all duration-500 group overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 bg-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      <div className="relative z-10">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="flex items-center justify-between mb-6"
        >
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Weekly Performance</h3>
            <p className="text-gray-600 text-sm">Daily collection insights</p>
          </div>
          
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="relative"
          >
            <select className="appearance-none bg-secondary text-white px-4 py-2 rounded-xl text-sm font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-secondary/50 transition-all duration-300">
              <option value="" className="bg-white text-gray-900">This Week</option>
              <option value="" className="bg-white text-gray-900">Last Week</option>
              <option value="" className="bg-white text-gray-900">This Month</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </motion.div>
        </motion.div>

        {/* Stats Row */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="grid grid-cols-2 gap-4 mb-6"
        >
          <div className="bg-primary/10 p-4 rounded-2xl border border-primary/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <span className="text-white text-lg">📊</span>
              </div>
              <div>
                <p className="text-xs text-gray-600 font-medium">Average Daily</p>
                <p className="text-lg font-bold text-primary">
                  ₹{weekAmtData.length > 0 ? Math.round(weekAmtData.reduce((a, b) => a + b, 0) / weekAmtData.length).toLocaleString() : '0'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-secondary/10 p-4 rounded-2xl border border-secondary/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center">
                <span className="text-white text-lg">🎯</span>
              </div>
              <div>
                <p className="text-xs text-gray-600 font-medium">Weekly Total</p>
                <p className="text-lg font-bold text-secondary">
                  ₹{weekAmtData.reduce((a, b) => a + b, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: isLoaded ? 1 : 0, scale: isLoaded ? 1 : 0.9 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="relative"
        >
          <div id="chartTwo" className="-mx-2">
            <ReactApexChart 
              options={options} 
              series={series} 
              type="bar" 
              height={400} 
            />
          </div>
        </motion.div>

        {/* Decorative elements */}
        <div className="absolute top-6 right-12 w-3 h-3 bg-secondary rounded-full opacity-30 group-hover:opacity-60 transition-colors duration-300"></div>
        <div className="absolute bottom-6 right-6 w-2 h-2 bg-primary rounded-full opacity-40 group-hover:opacity-80 transition-colors duration-300"></div>
      </div>

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    </motion.div>
  );
};

export default ChartTwo;
