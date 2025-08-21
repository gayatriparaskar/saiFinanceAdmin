import React, { useState, useEffect } from 'react';
import ReactApexChart from 'react-apexcharts';
import { motion } from 'framer-motion';

const ActivityChart = ({ title = "Daily Activity", data = null }) => {
  const [chartData, setChartData] = useState({
    series: [
      {
        name: 'Loans Processed',
        data: [12, 19, 15, 27, 22, 18, 24]
      },
      {
        name: 'Collections Made',
        data: [8, 14, 11, 18, 16, 13, 19]
      }
    ]
  });

  useEffect(() => {
    if (data && Array.isArray(data)) {
      setChartData({
        series: [
          { name: 'Loans Processed', data: data },
          { name: 'Collections Made', data: data.map(val => Math.floor(val * 0.7)) }
        ]
      });
    }
  }, [data]);

  const options = {
    chart: {
      type: 'bar',
      height: 300,
      fontFamily: 'Poppins, sans-serif',
      toolbar: {
        show: false
      }
    },
    colors: ['#3b82f6', '#10b981'],
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '60%',
        endingShape: 'rounded',
        borderRadius: 4,
      },
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent']
    },
    xaxis: {
      categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      labels: {
        style: {
          fontSize: '12px',
          fontFamily: 'Poppins, sans-serif',
        }
      }
    },
    yaxis: {
      labels: {
        style: {
          fontSize: '12px',
          fontFamily: 'Poppins, sans-serif',
        }
      }
    },
    fill: {
      opacity: 1,
      type: 'gradient',
      gradient: {
        shade: 'light',
        type: 'vertical',
        shadeIntensity: 0.3,
        gradientToColors: ['#60a5fa', '#34d399'],
        inverseColors: false,
        opacityFrom: 1,
        opacityTo: 0.8,
      }
    },
    tooltip: {
      y: {
        formatter: function (val) {
          return val + ' items';
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
    }
  };

  const totalLoans = chartData.series[0].data.reduce((a, b) => a + b, 0);
  const totalCollections = chartData.series[1].data.reduce((a, b) => a + b, 0);

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        <div className="text-sm text-gray-500">This Week</div>
      </div>
      
      <ReactApexChart 
        options={options} 
        series={chartData.series} 
        type="bar" 
        height={300} 
      />
      
      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{totalLoans}</div>
          <div className="text-sm text-blue-500">Total Loans</div>
        </div>
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{totalCollections}</div>
          <div className="text-sm text-green-500">Total Collections</div>
        </div>
      </div>
    </motion.div>
  );
};

export default ActivityChart;
