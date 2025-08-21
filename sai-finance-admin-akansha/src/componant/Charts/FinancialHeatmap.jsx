import React, { useState, useEffect } from 'react';
import ReactApexChart from 'react-apexcharts';
import { motion } from 'framer-motion';

const FinancialHeatmap = ({ title = "Financial Activity Heatmap", data = null }) => {
  const [chartData, setChartData] = useState({
    series: [
      {
        name: "Jan",
        data: generateData(12)
      },
      {
        name: "Feb",
        data: generateData(12)
      },
      {
        name: "Mar",
        data: generateData(12)
      },
      {
        name: "Apr",
        data: generateData(12)
      },
      {
        name: "May",
        data: generateData(12)
      },
      {
        name: "Jun",
        data: generateData(12)
      }
    ]
  });

  function generateData(count) {
    const series = [];
    for (let i = 0; i < count; i++) {
      series.push({
        x: `Week ${i + 1}`,
        y: Math.floor(Math.random() * (100 - 10 + 1)) + 10
      });
    }
    return series;
  }

  useEffect(() => {
    if (data && Array.isArray(data)) {
      // Convert provided data to heatmap format
      const heatmapData = data.map((monthData, monthIndex) => ({
        name: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][monthIndex] || `Month ${monthIndex + 1}`,
        data: Array.isArray(monthData) ? monthData.map((val, weekIndex) => ({
          x: `Week ${weekIndex + 1}`,
          y: Math.floor((val / 1000) % 100) // Convert to percentage-like value
        })) : generateData(12)
      }));
      setChartData({ series: heatmapData.slice(0, 6) });
    }
  }, [data]);

  const options = {
    chart: {
      type: 'heatmap',
      height: 400,
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
          zoom: false,
          zoomin: false,
          zoomout: false,
          pan: false,
        }
      }
    },
    dataLabels: {
      enabled: false
    },
    colors: ["#2563eb"],
    title: {
      text: '',
      align: 'left',
      style: {
        fontSize: '16px',
        fontFamily: 'Poppins, sans-serif',
        color: '#374151'
      }
    },
    plotOptions: {
      heatmap: {
        shadeIntensity: 0.5,
        radius: 8,
        useFillColorAsStroke: true,
        colorScale: {
          ranges: [
            {
              from: 0,
              to: 20,
              name: 'Low Activity',
              color: '#ecfdf5'
            },
            {
              from: 21,
              to: 40,
              name: 'Moderate',
              color: '#86efac'
            },
            {
              from: 41,
              to: 60,
              name: 'Good',
              color: '#22c55e'
            },
            {
              from: 61,
              to: 80,
              name: 'High',
              color: '#16a34a'
            },
            {
              from: 81,
              to: 100,
              name: 'Excellent',
              color: '#15803d'
            }
          ]
        }
      }
    },
    xaxis: {
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
    grid: {
      padding: {
        right: 20
      }
    },
    legend: {
      show: true,
      position: 'bottom',
      fontFamily: 'Poppins, sans-serif',
    },
    tooltip: {
      y: {
        formatter: function (val, opts) {
          return val + '% Activity';
        }
      }
    }
  };

  const getActivityStats = () => {
    let totalActivity = 0;
    let highActivityDays = 0;
    
    chartData.series.forEach(month => {
      month.data.forEach(day => {
        totalActivity += day.y;
        if (day.y >= 70) highActivityDays++;
      });
    });
    
    const avgActivity = Math.round(totalActivity / (chartData.series.length * 12));
    const activityPercentage = Math.round((highActivityDays / (chartData.series.length * 12)) * 100);
    
    return { avgActivity, activityPercentage, highActivityDays };
  };

  const stats = getActivityStats();

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
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-600">Real-time</span>
        </div>
      </div>
      
      <ReactApexChart 
        options={options} 
        series={chartData.series} 
        type="heatmap" 
        height={400} 
      />
      
      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.avgActivity}%</div>
          <div className="text-sm text-blue-500">Average Activity</div>
        </div>
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{stats.activityPercentage}%</div>
          <div className="text-sm text-green-500">High Performance Days</div>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">{stats.highActivityDays}</div>
          <div className="text-sm text-purple-500">Peak Days</div>
        </div>
      </div>
      
      <div className="mt-4 flex items-center justify-center space-x-6 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-200 rounded"></div>
          <span className="text-gray-600">Low</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-400 rounded"></div>
          <span className="text-gray-600">Medium</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-600 rounded"></div>
          <span className="text-gray-600">High</span>
        </div>
      </div>
    </motion.div>
  );
};

export default FinancialHeatmap;
