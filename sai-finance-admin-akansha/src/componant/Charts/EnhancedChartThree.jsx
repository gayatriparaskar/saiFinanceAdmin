import React, { useState, useEffect } from 'react';
import ReactApexChart from 'react-apexcharts';
import { motion } from 'framer-motion';

const EnhancedChartThree = () => {
  const [state, setState] = useState({
    series: [245, 189, 156, 89],
  });

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const options = {
    chart: {
      fontFamily: 'Poppins, sans-serif',
      type: 'donut',
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 1200,
        animateGradually: {
          enabled: true,
          delay: 150
        },
        dynamicAnimation: {
          enabled: true,
          speed: 350
        }
      },
    },
    colors: ['#2563eb', '#7c3aed', '#10b981', '#f59e0b'],
    labels: ['Loan Accounts', 'Saving Accounts', 'Active Officers', 'Collections'],
    legend: {
      show: false,
      position: 'bottom',
    },
    plotOptions: {
      pie: {
        donut: {
          size: '70%',
          background: 'transparent',
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: '16px',
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 600,
              color: '#374151',
              offsetY: -10,
            },
            value: {
              show: true,
              fontSize: '24px',
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 700,
              color: '#111827',
              offsetY: 10,
              formatter: function (val) {
                return val + "%";
              }
            },
            total: {
              show: true,
              showAlways: false,
              label: 'Total',
              fontSize: '16px',
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 600,
              color: '#6b7280',
              formatter: function (w) {
                return w.globals.seriesTotals.reduce((a, b) => {
                  return a + b
                }, 0) + '%'
              }
            }
          }
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      width: 3,
      colors: ['#ffffff']
    },
    states: {
      hover: {
        filter: {
          type: 'lighten',
          value: 0.15,
        }
      }
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
          return val + "%";
        }
      }
    },
    responsive: [
      {
        breakpoint: 2600,
        options: {
          chart: {
            width: 380,
          },
        },
      },
      {
        breakpoint: 640,
        options: {
          chart: {
            width: 250,
          },
        },
      },
    ],
  };

  const analyticsData = [
    { label: 'Loan Accounts', color: '#0d9488', value: 65, icon: '🏦' },
    { label: 'Saving Accounts', color: '#f97316', value: 34, icon: '💰' },
    { label: 'Active Users', color: '#8b5cf6', value: 45, icon: '👥' },
    { label: 'Pending', color: '#06b6d4', value: 12, icon: '⏳' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="col-span-12 rounded-2xl border border-gray-200 bg-white px-6 pb-6 pt-6 shadow-lg hover:shadow-xl transition-shadow duration-300 dark:border-strokedark dark:bg-boxdark xl:col-span-5"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mb-6 justify-between gap-4 sm:flex"
      >
        <div>
          <motion.h5
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-2xl font-bold text-gray-900 dark:text-white mb-2"
          >
            Account Analytics
          </motion.h5>
          <p className="text-sm text-gray-600">Distribution of account types and user activity</p>
        </div>
        <motion.div
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <select className="relative z-20 inline-flex appearance-none bg-gray-50 border border-gray-200 rounded-lg py-2 pl-4 pr-8 text-sm font-medium outline-none hover:bg-gray-100 transition-colors duration-200">
            <option className="dark:bg-boxdark">Monthly</option>
            <option className="dark:bg-boxdark">Quarterly</option>
            <option className="dark:bg-boxdark">Yearly</option>
          </select>
          <svg className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.8 }}
        className="mb-6"
      >
        <div id="enhancedChartThree" className="mx-auto flex justify-center">
          <ReactApexChart options={options} series={state.series} type="donut" width={350} />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="grid grid-cols-2 gap-4"
      >
        {analyticsData.map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.9 + index * 0.1 }}
            whileHover={{ scale: 1.05, x: 5 }}
            className="flex items-center p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all duration-200"
          >
            <span className="text-2xl mr-3">{item.icon}</span>
            <div className="flex-1">
              <div className="flex items-center mb-1">
                <motion.span
                  className="mr-2 block h-3 w-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                />
                <p className="text-sm font-semibold text-gray-900">{item.label}</p>
              </div>
              <motion.div
                className="flex items-center justify-between"
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ delay: 1 + index * 0.1, duration: 0.5 }}
              >
                <span className="text-lg font-bold text-gray-900">{item.value}%</span>
                <motion.div
                  className="h-2 bg-gray-200 rounded-full overflow-hidden"
                  style={{ width: '60px' }}
                >
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: item.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${item.value}%` }}
                    transition={{ delay: 1.2 + index * 0.1, duration: 0.8 }}
                  />
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
};

export default EnhancedChartThree;
