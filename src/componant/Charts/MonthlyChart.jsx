import React, { useState, useEffect } from 'react';
import ReactApexChart from 'react-apexcharts';
import { motion } from 'framer-motion';
import { useLocalTranslation } from '../../hooks/useLocalTranslation';

const MonthlyChart = ({ title = "Monthly Statistics", data = [] }) => {
  const { t } = useLocalTranslation();
  const [chartData, setChartData] = useState({
    series: [{
      name: 'Monthly Amount',
      data: [0]
    }],
    categories: ['']
  });

  useEffect(() => {
    if (Array.isArray(data) && data.length > 0) {
      setChartData({
        series: [{
          name: 'Monthly Amount',
          data: data
        }],
        categories: data.map((_, index) => `Month ${index + 1}`)
      });
    } else {
      // Default monthly data
      setChartData({
        series: [{
          name: 'Monthly Amount',
          data: [12000, 15000, 18000, 22000, 25000, 28000]
        }],
        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
      });
    }
  }, [data]);

  const options = {
    chart: {
      height: 350,
      type: 'area',
      toolbar: {
        show: false
      },
      zoom: {
        enabled: false
      }
    },
    stroke: {
      curve: 'smooth',
      width: 2
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.3
      }
    },
    colors: ['#4ecdc4'],
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
      size: 4,
      colors: ['#ffffff'],
      strokeColors: ['#4ecdc4'],
      strokeWidth: 2,
      hover: {
        size: 6
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
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-sm text-gray-600">{t("Monthly Data")}</span>
        </div>
      </div>
      
      <ReactApexChart 
        options={options} 
        series={chartData.series} 
        type="area" 
        height={350} 
      />
    </motion.div>
  );
};

export default MonthlyChart;
