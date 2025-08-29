import React, { useState, useEffect } from 'react';
import ReactApexChart from 'react-apexcharts';
import { motion } from 'framer-motion';
import { useLocalTranslation } from '../../hooks/useLocalTranslation';

const WeeklyChart = ({ title = "Weekly Statistics", data = [] }) => {
  const { t } = useLocalTranslation();
  const [chartData, setChartData] = useState({
    series: [{
      name: 'Weekly Amount',
      data: [0]
    }],
    categories: ['']
  });

  useEffect(() => {
    if (Array.isArray(data) && data.length > 0) {
      setChartData({
        series: [{
          name: 'Weekly Amount',
          data: data
        }],
        categories: data.map((_, index) => `Week ${index + 1}`)
      });
    } else {
      // Default weekly data
      setChartData({
        series: [{
          name: 'Weekly Amount',
          data: [2500, 3200, 2800, 4100, 3600, 3900, 2200]
        }],
        categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      });
    }
  }, [data]);

  const options = {
    chart: {
      height: 350,
      type: 'bar',
      toolbar: {
        show: false
      }
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        horizontal: false,
        columnWidth: '60%'
      }
    },
    colors: ['#ffa726'],
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
    dataLabels: {
      enabled: false
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
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <span className="text-sm text-gray-600">{t("Weekly Data")}</span>
        </div>
      </div>
      
      <ReactApexChart 
        options={options} 
        series={chartData.series} 
        type="bar" 
        height={350} 
      />
    </motion.div>
  );
};

export default WeeklyChart;
