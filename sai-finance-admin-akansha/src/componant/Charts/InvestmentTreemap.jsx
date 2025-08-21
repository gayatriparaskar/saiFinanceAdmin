import React, { useState, useEffect } from 'react';
import ReactApexChart from 'react-apexcharts';
import { motion } from 'framer-motion';

const InvestmentTreemap = ({ title = "Portfolio Distribution", data = null }) => {
  const [chartData, setChartData] = useState({
    series: [
      {
        data: [
          {
            x: 'Loan Portfolio',
            y: 218000
          },
          {
            x: 'Savings Accounts',
            y: 149000
          },
          {
            x: 'Investment Funds',
            y: 184000
          },
          {
            x: 'Cash Reserves',
            y: 55000
          },
          {
            x: 'Fixed Deposits',
            y: 84000
          },
          {
            x: 'Insurance Products',
            y: 31000
          },
          {
            x: 'Mutual Funds',
            y: 70000
          },
          {
            x: 'Bonds',
            y: 44000
          },
          {
            x: 'Real Estate',
            y: 68000
          },
          {
            x: 'Gold Investment',
            y: 29000
          },
          {
            x: 'Crypto Assets',
            y: 15000
          },
          {
            x: 'Emergency Fund',
            y: 22000
          }
        ]
      }
    ]
  });

  useEffect(() => {
    if (data && Array.isArray(data)) {
      const treemapData = data.map((value, index) => ({
        x: ['Loans', 'Savings', 'Investments', 'Reserves', 'Deposits', 'Insurance'][index] || `Category ${index + 1}`,
        y: value
      }));
      setChartData({
        series: [{
          data: treemapData
        }]
      });
    }
  }, [data]);

  const options = {
    chart: {
      type: 'treemap',
      height: 400,
      fontFamily: 'Poppins, sans-serif',
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 1200,
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
    legend: {
      show: false
    },
    title: {
      text: '',
      align: 'left'
    },
    dataLabels: {
      enabled: true,
      style: {
        fontSize: '12px',
        fontFamily: 'Poppins, sans-serif',
        fontWeight: 'bold',
        colors: ['#fff']
      },
      formatter: function(text, op) {
        return [text, '₹' + (op.value / 1000).toFixed(0) + 'K']
      },
      offsetY: -4
    },
    plotOptions: {
      treemap: {
        enableShades: true,
        shadeIntensity: 0.5,
        reverseNegativeShade: true,
        colorScale: {
          ranges: [
            {
              from: 0,
              to: 30000,
              color: '#ef4444'
            },
            {
              from: 30001,
              to: 60000,
              color: '#f97316'
            },
            {
              from: 60001,
              to: 100000,
              color: '#eab308'
            },
            {
              from: 100001,
              to: 150000,
              color: '#22c55e'
            },
            {
              from: 150001,
              to: 250000,
              color: '#2563eb'
            }
          ]
        }
      }
    },
    tooltip: {
      y: {
        formatter: function (val) {
          return '₹' + val.toLocaleString();
        }
      }
    }
  };

  const getPortfolioStats = () => {
    const totalValue = chartData.series[0].data.reduce((sum, item) => sum + item.y, 0);
    const largestCategory = chartData.series[0].data.reduce((max, item) => 
      item.y > max.y ? item : max, chartData.series[0].data[0]
    );
    const diversification = chartData.series[0].data.length;
    
    return {
      totalValue,
      largestCategory,
      diversification,
      largestPercentage: Math.round((largestCategory.y / totalValue) * 100)
    };
  };

  const stats = getPortfolioStats();

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
          <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
            {stats.diversification} Categories
          </div>
        </div>
      </div>
      
      <ReactApexChart 
        options={options} 
        series={chartData.series} 
        type="treemap" 
        height={400} 
      />
      
      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-700">₹{(stats.totalValue / 100000).toFixed(1)}L</div>
          <div className="text-sm text-blue-600">Total Portfolio Value</div>
        </div>
        <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4">
          <div className="text-lg font-bold text-green-700">{stats.largestCategory.x}</div>
          <div className="text-sm text-green-600">{stats.largestPercentage}% - Top Category</div>
        </div>
      </div>
      
      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-lg font-semibold text-gray-800">{stats.diversification}</div>
          <div className="text-xs text-gray-500">Asset Types</div>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-lg font-semibold text-gray-800">
            ₹{Math.round(stats.totalValue / stats.diversification / 1000)}K
          </div>
          <div className="text-xs text-gray-500">Avg per Category</div>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-lg font-semibold text-gray-800">
            {Math.round((1 - stats.largestCategory.y / stats.totalValue) * 100)}%
          </div>
          <div className="text-xs text-gray-500">Diversification</div>
        </div>
      </div>
      
      <div className="mt-4 flex items-center justify-center space-x-4 text-xs">
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-red-500 rounded"></div>
          <span className="text-gray-600">Low (₹0-30K)</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-orange-500 rounded"></div>
          <span className="text-gray-600">Medium (₹30-60K)</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-yellow-500 rounded"></div>
          <span className="text-gray-600">Good (₹60-100K)</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span className="text-gray-600">High (₹100-150K)</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-blue-500 rounded"></div>
          <span className="text-gray-600">Excellent (₹150K+)</span>
        </div>
      </div>
    </motion.div>
  );
};

export default InvestmentTreemap;
