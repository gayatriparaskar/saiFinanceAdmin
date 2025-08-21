import React, { useState, useEffect } from 'react';
import ReactApexChart from 'react-apexcharts';
import { motion } from 'framer-motion';
import { useLocalTranslation } from '../../hooks/useLocalTranslation';

const SimpleChart = ({ title = "Financial Overview", data = [] }) => {
  const { t } = useLocalTranslation();
  const [chartData, setChartData] = useState({
    series: [{
      name: 'Amount',
      data: [0]
    }],
    categories: ['']
  });

  useEffect(() => {
    if (Array.isArray(data) && data.length > 0) {
      setChartData({
        series: [{
          name: 'Amount',
          data: data
        }],
        categories: data.map((_, index) => `Period ${index + 1}`)
      });
    } else {
      // Default data
      setChartData({
        series: [{
          name: 'Amount',
          data: [1200, 1500, 1800, 2200, 2500, 2800]
        }],
        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
      });
    }
  }, [data]);

  const options = {
    chart: {
      height: 350,
      type: 'line',
      toolbar: {
        show: false
      },
      zoom: {
        enabled: false
      }
    },
    stroke: {
      curve: 'smooth',
      width: 3
    },
    colors: ['#3b82f6'],
    grid: {
      borderColor: '#e5e7eb',
      strokeDashArray: 4
    },
    xaxis: {
      categories: chartData.categories,
      labels: {
        style: {
          colors: '#6b7280',
          fontSize: '12px'
        }
      }
    },
    yaxis: {
      labels: {
        style: {
          colors: '#6b7280',
          fontSize: '12px'
        },
        formatter: function (val) {
          return '₹' + val.toLocaleString();
        }
      }
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
      colors: ['#ffffff'],
      strokeColors: ['#3b82f6'],
      strokeWidth: 2,
      hover: {
        size: 7
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span className="text-sm text-gray-600">{t("Revenue")}</span>
        </div>
      </div>
      
      <ReactApexChart 
        options={options} 
        series={chartData.series} 
        type="line" 
        height={350} 
      />
    </motion.div>
  );
};

export default SimpleChart;
