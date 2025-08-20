import React, { useState, useEffect } from 'react';
import ReactApexChart from 'react-apexcharts';
import { motion } from 'framer-motion';
import { useLocalTranslation } from '../../hooks/useLocalTranslation';

const ChartThree = () => {
  const { t } = useLocalTranslation();

  const [state, setState] = useState({
    series: [65, 34, 45, 23],
  });

  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsLoaded(true), 700);
  }, []);

  const analytics = [
    { label: t('Loan Applications', 'ऋण आवेदन'), color: '#0d9488', value: 65, icon: '📋' },
    { label: t('Active Customers', 'सक्रिय ग्राहक'), color: '#f97316', value: 34, icon: '👥' },
    { label: t('Payments Received', 'प्राप्त भुगतान'), color: '#14b8a6', value: 45, icon: '💰' },
    { label: t('Pending Reviews', 'लंबित समीक्षा'), color: '#fb923c', value: 23, icon: '⏳' },
  ];

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
          delay: 200,
        },
        dynamicAnimation: {
          enabled: true,
          speed: 600,
        },
      },
    },
    colors: ['#0d9488', '#f97316', '#14b8a6', '#fb923c'],
    labels: analytics.map(item => item.label),
    legend: {
      show: false,
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
            },
            value: {
              show: true,
              fontSize: '24px',
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 700,
              color: '#111827',
              formatter: function (val) {
                return val + '%';
              },
            },
            total: {
              show: true,
              showAlways: false,
              label: t('Total', 'कुल'),
              fontSize: '14px',
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 500,
              color: '#6b7280',
              formatter: function (w) {
                return w.globals.seriesTotals.reduce((a, b) => a + b, 0) + '%';
              },
            },
          },
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 3,
      colors: ['#ffffff'],
    },
    responsive: [
      {
        breakpoint: 2600,
        options: {
          chart: {
            width: 350,
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
    tooltip: {
      theme: 'dark',
      style: {
        fontSize: '12px',
        fontFamily: 'Poppins, sans-serif',
      },
      y: {
        formatter: function (val) {
          return val + '%';
        },
      },
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
      className="relative rounded-3xl border-2 border-gray-100 bg-white p-6 shadow-xl hover:shadow-2xl hover:border-primary/30 transition-all duration-500 group overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      <div className="relative z-10">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="flex items-center justify-between mb-6"
        >
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{t("Business Analytics", "व्यापार विश्लेषण")}</h3>
            <p className="text-gray-600 text-sm">{t("Customer interaction overview")}</p>
          </div>
          
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="relative"
          >
            <select className="appearance-none bg-primary text-white px-4 py-2 rounded-xl text-sm font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-300">
              <option value="" className="bg-white text-gray-900">{t("This Month")}</option>
              <option value="" className="bg-white text-gray-900">{t("Last Month")}</option>
              <option value="" className="bg-white text-gray-900">{t("This Quarter")}</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </motion.div>
        </motion.div>

        <div className="flex flex-col lg:flex-row items-center gap-8">
          {/* Chart */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
            animate={{ 
              opacity: isLoaded ? 1 : 0, 
              scale: isLoaded ? 1 : 0.8,
              rotate: 0 
            }}
            transition={{ delay: 0.9, duration: 1, type: "spring", stiffness: 100 }}
            className="flex-shrink-0"
          >
            <div id="chartThree" className="relative">
              <ReactApexChart 
                options={options} 
                series={state.series} 
                type="donut" 
                width={320}
                height={320}
              />
            </div>
          </motion.div>

          {/* Legend */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.1, duration: 0.8 }}
            className="flex-1 space-y-4 w-full"
          >
            {analytics.map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.2 + index * 0.1, duration: 0.5 }}
                whileHover={{ scale: 1.02, x: 5 }}
                className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all duration-300 group/item"
              >
                <div className="flex items-center gap-4">
                  <motion.div 
                    whileHover={{ rotate: 10, scale: 1.1 }}
                    className="flex items-center justify-center w-12 h-12 rounded-xl text-lg shadow-sm group-hover/item:shadow-md transition-shadow duration-300 bg-white border-2"
                    style={{ borderColor: `${item.color}` }}
                  >
                    <span>{item.icon}</span>
                  </motion.div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm group-hover/item:text-gray-700 transition-colors duration-300">
                      {item.label}
                    </p>
                    <p className="text-xs text-gray-500">{t("Active metrics", "सक्रिय मेट्रिक्स")}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${item.value}%` }}
                    transition={{ delay: 1.5 + index * 0.1, duration: 0.8, ease: "easeOut" }}
                    className="h-2 rounded-full relative overflow-hidden bg-gray-200"
                    style={{ minWidth: '60px' }}
                  >
                    <div 
                      className="h-full rounded-full"
                      style={{ 
                        backgroundColor: item.color,
                        width: '100%'
                      }}
                    ></div>
                  </motion.div>
                  
                  <motion.span 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.7 + index * 0.1, duration: 0.5 }}
                    className="text-lg font-bold min-w-[3rem] text-right"
                    style={{ color: item.color }}
                  >
                    {item.value}%
                  </motion.span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-6 right-20 w-3 h-3 bg-primary rounded-full opacity-30 group-hover:opacity-60 transition-colors duration-300"></div>
        <div className="absolute bottom-6 left-6 w-2 h-2 bg-secondary rounded-full opacity-40 group-hover:opacity-80 transition-colors duration-300"></div>
        <div className="absolute top-1/2 left-4 w-1 h-1 bg-primary/50 rounded-full opacity-50 group-hover:opacity-80 transition-colors duration-300"></div>
      </div>

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    </motion.div>
  );
};

export default ChartThree;
