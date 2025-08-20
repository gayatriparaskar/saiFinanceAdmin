import React, { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import { motion } from 'framer-motion';

const EnhancedChartTwo = ({ weekDays = [], weekAmtData = [] }) => {
  const [series, setSeries] = useState([
    {
      name: 'Weekly Collections',
      data: [0],
    },
    {
      name: 'Target Revenue',
      data: [0],
    },
  ]);

  useEffect(() => {
    if (Array.isArray(weekAmtData) && weekAmtData.length > 0) {
      setSeries([
        { name: 'Weekly Collections', data: weekAmtData },
        { name: 'Target Revenue', data: weekAmtData.map(val => val * 1.15) },
      ]);
    }
  }, [weekAmtData]);

  const options = {
    colors: ['#0d9488', '#f97316'],
    chart: {
      fontFamily: 'Poppins, sans-serif',
      type: 'bar',
      height: 380,
      stacked: false,
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 1000,
        animateGradually: {
          enabled: true,
          delay: 150
        },
        dynamicAnimation: {
          enabled: true,
          speed: 350
        }
      },
      toolbar: { 
        show: true,
        tools: {
          download: true,
          selection: true,
          zoom: true,
          zoomin: true,
          zoomout: true,
          pan: true,
        }
      },
      zoom: { enabled: true },
      dropShadow: {
        enabled: true,
        top: 3,
        left: 0,
        blur: 3,
        opacity: 0.15,
      }
    },
    responsive: [
      {
        breakpoint: 1536,
        options: {
          plotOptions: {
            bar: {
              borderRadius: 8,
              columnWidth: '40%',
            },
          },
        },
      },
    ],
    plotOptions: {
      bar: {
        horizontal: false,
        borderRadius: 8,
        columnWidth: '50%',
        borderRadiusApplication: 'end',
        borderRadiusWhenStacked: 'last',
        dataLabels: {
          position: 'top',
        }
      },
    },
    dataLabels: { 
      enabled: true,
      style: {
        fontSize: '12px',
        fontFamily: 'Poppins, sans-serif',
        fontWeight: 600,
        colors: ['#374151']
      },
      formatter: function (val) {
        return "₹" + val.toLocaleString();
      },
      offsetY: -20,
    },
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent']
    },
    xaxis: { 
      categories: Array.isArray(weekDays) && weekDays.length ? weekDays : [""],
      labels: {
        style: {
          colors: '#64748b',
          fontSize: '12px',
          fontFamily: 'Poppins, sans-serif',
        }
      },
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      title: {
        text: 'Amount (₹)',
        style: {
          fontSize: "14px",
          fontWeight: 600,
          color: '#64748b',
          fontFamily: 'Poppins, sans-serif',
        },
      },
      labels: {
        style: {
          colors: '#64748b',
          fontSize: '12px',
          fontFamily: 'Poppins, sans-serif',
        },
        formatter: function (val) {
          return "₹" + val.toLocaleString();
        }
      }
    },
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'light',
        shadeIntensity: 0.1,
        opacityFrom: 0.9,
        opacityTo: 0.7,
        stops: [0, 100]
      }
    },
    legend: {
      position: 'top',
      horizontalAlign: 'left',
      fontFamily: 'Poppins, sans-serif',
      fontWeight: 500,
      fontSize: '14px',
      markers: { 
        radius: 8,
        width: 12,
        height: 12,
      },
    },
    grid: {
      show: true,
      borderColor: '#f1f5f9',
      strokeDashArray: 3,
    },
    tooltip: {
      enabled: true,
      theme: 'light',
      style: {
        fontSize: '12px',
        fontFamily: 'Poppins, sans-serif',
      },
      y: {
        formatter: function (val) {
          return "₹" + val.toLocaleString();
        }
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6 }}
      className="col-span-12 rounded-2xl border border-gray-200 bg-white p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 dark:border-strokedark dark:bg-boxdark xl:col-span-4"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mb-6 justify-between gap-4 sm:flex"
      >
        <div>
          <motion.h4
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-2xl font-bold text-gray-900 dark:text-white mb-2"
          >
            Weekly Performance
          </motion.h4>
          <p className="text-sm text-gray-600">Collections vs Target Revenue</p>
        </div>
        <motion.div
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="relative z-20 inline-block">
            <select className="relative z-20 inline-flex appearance-none bg-gray-50 border border-gray-200 rounded-lg py-2 pl-4 pr-8 text-sm font-medium outline-none hover:bg-gray-100 transition-colors duration-200">
              <option value="" className='dark:bg-boxdark'>This Week</option>
              <option value="" className='dark:bg-boxdark'>Last Week</option>
              <option value="" className='dark:bg-boxdark'>Last Month</option>
            </select>
            <svg className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </motion.div>
      </motion.div>
      
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <div id="enhancedChartTwo" className="-ml-5 -mb-4">
          <ReactApexChart options={options} series={series} type="bar" height={380} />
        </div>
      </motion.div>
    </motion.div>
  );
};

export default EnhancedChartTwo;
