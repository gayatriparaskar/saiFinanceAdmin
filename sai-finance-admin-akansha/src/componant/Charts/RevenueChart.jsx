import React, { useState, useEffect } from 'react';
import ReactApexChart from 'react-apexcharts';
import { motion } from 'framer-motion';

const RevenueChart = ({ title = "Revenue Analytics", data = null }) => {
  const [chartData, setChartData] = useState({
    series: [
      {
        name: 'Revenue',
        data: [85000, 92000, 78000, 105000, 98000, 112000, 125000, 118000, 134000, 128000, 145000, 152000]
      },
      {
        name: 'Expenses',
        data: [45000, 52000, 48000, 65000, 58000, 72000, 78000, 75000, 85000, 82000, 92000, 95000]
      },
      {
        name: 'Profit',
        data: [40000, 40000, 30000, 40000, 40000, 40000, 47000, 43000, 49000, 46000, 53000, 57000]
      }
    ]
  });

  useEffect(() => {
    if (data && Array.isArray(data)) {
      setChartData({
        series: [
          { name: 'Revenue', data: data },
          { name: 'Expenses', data: data.map(val => val * 0.6) },
          { name: 'Profit', data: data.map(val => val * 0.4) }
        ]
      });
    }
  }, [data]);

  const options = {
    chart: {
      type: 'line',
      height: 350,
      fontFamily: 'Poppins, sans-serif',
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 1000,
      },
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: false,
          zoom: true,
          zoomin: true,
          zoomout: true,
          pan: false,
        }
      }
    },
    colors: ['#2563eb', '#ef4444', '#10b981'],
    stroke: {
      width: [3, 3, 3],
      curve: 'smooth'
    },
    xaxis: {
      categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      labels: {
        style: {
          fontSize: '12px',
          fontFamily: 'Poppins, sans-serif',
        }
      }
    },
    yaxis: {
      labels: {
        formatter: function (val) {
          return '₹' + (val / 1000).toFixed(0) + 'K';
        },
        style: {
          fontSize: '12px',
          fontFamily: 'Poppins, sans-serif',
        }
      }
    },
    legend: {
      position: 'top',
      horizontalAlign: 'right',
      fontFamily: 'Poppins, sans-serif',
    },
    grid: {
      borderColor: '#f1f5f9',
      strokeDashArray: 3,
    },
    tooltip: {
      y: {
        formatter: function (val) {
          return '₹' + val.toLocaleString();
        }
      }
    },
    markers: {
      size: 5,
      hover: {
        size: 8
      }
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span className="text-sm text-gray-600">Live Data</span>
        </div>
      </div>
      
      <ReactApexChart 
        options={options} 
        series={chartData.series} 
        type="line" 
        height={350} 
      />
      
      <div className="mt-4 grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">₹1.4M</div>
          <div className="text-sm text-gray-500">Total Revenue</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">₹847K</div>
          <div className="text-sm text-gray-500">Total Expenses</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">₹553K</div>
          <div className="text-sm text-gray-500">Net Profit</div>
        </div>
      </div>
    </motion.div>
  );
};

export default RevenueChart;
