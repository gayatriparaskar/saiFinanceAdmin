import React, { useState, useEffect } from 'react';
import ReactApexChart from 'react-apexcharts';
import { motion } from 'framer-motion';
import { useLocalTranslation } from '../../hooks/useLocalTranslation';

const SimpleChart = ({ title = "Financial Overview", data = [], showWeekdays = false }) => {
  const { t } = useLocalTranslation();
  const [chartData, setChartData] = useState({
    series: [{
      name: 'Amount',
      data: [0]
    }],
    categories: ['']
  });

  useEffect(() => {
    // Month names array
    const monthNames = [
      t('Jan'), t('Feb'), t('Mar'), t('Apr'), t('May'), t('Jun'),
      t('Jul'), t('Aug'), t('Sep'), t('Oct'), t('Nov'), t('Dec')
    ];

    // Weekday names array
    const weekdayNames = [
      t('Mon'), t('Tue'), t('Wed'), t('Thu'), t('Fri'), t('Sat'), t('Sun')
    ];

    if (Array.isArray(data) && data.length > 0) {
      const labels = showWeekdays ? weekdayNames : monthNames;
      setChartData({
        series: [{
          name: t('Amount'),
          data: data
        }],
        categories: data.map((_, index) => labels[index] || (showWeekdays ? `Day ${index + 1}` : `Month ${index + 1}`))
      });
    } else {
      // Default data
      const labels = showWeekdays ? weekdayNames : monthNames;
      const defaultData = showWeekdays ? [1200, 1500, 1800, 2200, 2500, 2800, 3000] : [1200, 1500, 1800, 2200, 2500, 2800];
      setChartData({
        series: [{
          name: t('Amount'),
          data: defaultData
        }],
        categories: labels.slice(0, defaultData.length)
      });
    }
  }, [data, t, showWeekdays]);

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
    colors: ['#ff6b6b'],
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
      strokeColors: ['#ff6b6b'],
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
      className="bg-white rounded-lg shadow-md p-3 xs:p-4 sm:p-6 hover:shadow-lg transition-shadow duration-300"
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
          height={window.innerWidth < 640 ? 250 : 350} 
        />
    </motion.div>
  );
};

export default SimpleChart;
