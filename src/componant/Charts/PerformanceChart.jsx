import React, { useState, useEffect } from 'react';
import ReactApexChart from 'react-apexcharts';
import { motion } from 'framer-motion';

const PerformanceChart = ({ title = "Performance Metrics", data = null }) => {
  const [chartData, setChartData] = useState({
    series: [78, 85, 92, 67],
    labels: ['Loan Processing', 'Customer Satisfaction', 'Collection Efficiency', 'Officer Performance']
  });

  useEffect(() => {
    if (data && Array.isArray(data)) {
      setChartData({
        series: data,
        labels: ['Loan Processing', 'Customer Satisfaction', 'Collection Efficiency', 'Officer Performance']
      });
    }
  }, [data]);

  const options = {
    chart: {
      type: 'radialBar',
      height: 350,
      fontFamily: 'Poppins, sans-serif',
    },
    plotOptions: {
      radialBar: {
        offsetY: 0,
        startAngle: 0,
        endAngle: 270,
        hollow: {
          margin: 15,
          size: '30%',
          background: 'white',
          image: undefined,
        },
        dataLabels: {
          name: {
            show: true,
            fontSize: '14px',
            fontFamily: 'Poppins, sans-serif',
            color: '#374151',
            offsetY: -10
          },
          value: {
            show: true,
            fontSize: '16px',
            fontFamily: 'Poppins, sans-serif',
            color: '#111827',
            offsetY: 16,
            formatter: function (val) {
              return val + '%';
            }
          }
        }
      }
    },
    colors: ['#2563eb', '#7c3aed', '#10b981', '#f59e0b'],
    labels: chartData.labels,
    legend: {
      show: true,
      floating: true,
      fontSize: '14px',
      position: 'left',
      offsetX: 50,
      offsetY: 10,
      labels: {
        useSeriesColors: true,
      },
      formatter: function(seriesName, opts) {
        return seriesName + ": " + opts.w.globals.series[opts.seriesIndex] + '%'
      },
      itemMargin: {
        horizontal: 10,
        vertical: 5
      }
    },
    responsive: [{
      breakpoint: 480,
      options: {
        legend: {
          show: false
        }
      }
    }]
  };

  const getPerformanceLevel = (value) => {
    if (value >= 90) return { text: 'Excellent', color: 'text-green-600' };
    if (value >= 80) return { text: 'Good', color: 'text-blue-600' };
    if (value >= 70) return { text: 'Average', color: 'text-yellow-600' };
    return { text: 'Needs Improvement', color: 'text-red-600' };
  };

  const averageScore = Math.round(chartData.series.reduce((a, b) => a + b, 0) / chartData.series.length);
  const performance = getPerformanceLevel(averageScore);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
      className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        <div className="flex items-center space-x-2">
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${performance.color} bg-opacity-10`}>
            {performance.text}
          </div>
        </div>
      </div>
      
      <div className="relative">
        <ReactApexChart 
          options={options} 
          series={chartData.series} 
          type="radialBar" 
          height={350} 
        />
        
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-800">{averageScore}%</div>
            <div className="text-sm text-gray-500">Overall Score</div>
          </div>
        </div>
      </div>
      
      <div className="mt-6 grid grid-cols-2 gap-4">
        {chartData.labels.map((label, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium text-gray-700">{label}</span>
            <span className="text-sm font-bold text-gray-900">{chartData.series[index]}%</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default PerformanceChart;
