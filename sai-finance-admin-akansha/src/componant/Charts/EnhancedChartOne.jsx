import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import { motion } from "framer-motion";

const EnhancedChartOne = ({ monthsData = [], monthlyAmtData = [] }) => {
  const [series, setSeries] = useState([
    {
      name: "Monthly Collections",
      data: [45000, 52000, 48000, 61000, 55000, 67000, 59000, 72000, 68000, 75000, 71000, 82000],
    },
    {
      name: "Target Revenue",
      data: [50000, 55000, 52000, 65000, 60000, 70000, 65000, 78000, 72000, 80000, 75000, 85000],
    },
    {
      name: "Projected Growth",
      data: [47000, 54000, 51000, 63000, 58000, 69000, 62000, 75000, 70000, 78000, 73000, 84000],
    },
  ]);

  useEffect(() => {
    if (Array.isArray(monthlyAmtData) && monthlyAmtData.length > 0) {
      setSeries([
        { name: "Monthly Collections", data: monthlyAmtData },
        { name: "Target Revenue", data: monthlyAmtData.map(val => val * 1.15) },
        { name: "Projected Growth", data: monthlyAmtData.map(val => val * 1.08) },
      ]);
    } else {
      // Fallback to realistic sample data if no data provided
      const sampleData = [45000, 52000, 48000, 61000, 55000, 67000, 59000, 72000, 68000, 75000, 71000, 82000];
      setSeries([
        { name: "Monthly Collections", data: sampleData },
        { name: "Target Revenue", data: sampleData.map(val => val * 1.15) },
        { name: "Projected Growth", data: sampleData.map(val => val * 1.08) },
      ]);
    }
  }, [monthlyAmtData]);

  const options = {
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "left",
      fontSize: '14px',
      fontFamily: 'Poppins, sans-serif',
      markers: {
        width: 12,
        height: 12,
        radius: 6,
      },
    },
    colors: ["#0d9488", "#f97316"],
    chart: {
      fontFamily: "Poppins, sans-serif",
      height: 400,
      type: "area",
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
      dropShadow: {
        enabled: true,
        color: "#0d9488",
        top: 10,
        blur: 4,
        left: 0,
        opacity: 0.2,
      },
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: true,
          zoom: true,
          zoomin: true,
          zoomout: true,
          pan: true,
        },
        export: {
          csv: {
            filename: 'monthly-revenue-data',
          },
          svg: {
            filename: 'monthly-revenue-chart',
          },
          png: {
            filename: 'monthly-revenue-chart',
          }
        }
      },
    },
    responsive: [
      {
        breakpoint: 1024,
        options: {
          chart: {
            height: 300,
          },
        },
      },
      {
        breakpoint: 1366,
        options: {
          chart: {
            height: 350,
          },
        },
      },
    ],
    stroke: {
      width: [3, 3],
      curve: "smooth",
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.1,
        stops: [0, 90, 100],
        colorStops: [
          {
            offset: 0,
            color: "#0d9488",
            opacity: 0.6
          },
          {
            offset: 100,
            color: "#0d9488",
            opacity: 0.1
          }
        ]
      }
    },
    grid: {
      show: true,
      borderColor: '#f1f5f9',
      strokeDashArray: 3,
      xaxis: {
        lines: {
          show: true,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    markers: {
      size: 6,
      colors: "#fff",
      strokeColors: ["#0d9488", "#f97316"],
      strokeWidth: 3,
      strokeOpacity: 0.9,
      strokeDashArray: 0,
      fillOpacity: 1,
      discrete: [],
      hover: {
        size: 8,
        sizeOffset: 2,
      },
    },
    xaxis: {
      type: "category",
      categories: Array.isArray(monthsData) && monthsData.length ? monthsData : [""],
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      labels: {
        style: {
          colors: '#64748b',
          fontSize: '12px',
          fontFamily: 'Poppins, sans-serif',
        }
      }
    },
    yaxis: {
      title: {
        text: 'Amount (₹)',
        style: {
          fontSize: "14px",
          fontWeight: 600,
          color: '#64748b',
          fontFamily: 'Poppins, sans-serif',
        },
      },
      labels: {
        style: {
          colors: '#64748b',
          fontSize: '12px',
          fontFamily: 'Poppins, sans-serif',
        },
        formatter: function (val) {
          return "₹" + val.toLocaleString();
        }
      },
      min: 0,
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
          return "₹" + val.toLocaleString();
        }
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="col-span-12 rounded-2xl border border-gray-200 bg-white px-6 pb-6 pt-6 shadow-lg hover:shadow-xl transition-shadow duration-300 dark:border-strokedark dark:bg-boxdark xl:col-span-8"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex flex-wrap items-start justify-between gap-3 sm:flex-nowrap mb-6"
      >
        <div className="flex w-full flex-wrap gap-3 sm:gap-5">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="flex min-w-47.5 p-3 bg-teal-50 rounded-xl"
          >
            <span className="mt-1 mr-3 flex h-4 w-full max-w-4 items-center justify-center rounded-full border-2 border-primary">
              <span className="block h-2.5 w-full max-w-2.5 rounded-full bg-primary"></span>
            </span>
            <div className="w-full">
              <p className="font-semibold text-primary text-lg">Monthly Collections</p>
              <p className="text-sm font-medium text-gray-600">Current Financial Year</p>
            </div>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="flex min-w-47.5 p-3 bg-orange-50 rounded-xl"
          >
            <span className="mt-1 mr-3 flex h-4 w-full max-w-4 items-center justify-center rounded-full border-2 border-secondary">
              <span className="block h-2.5 w-full max-w-2.5 rounded-full bg-secondary"></span>
            </span>
            <div className="w-full">
              <p className="font-semibold text-secondary text-lg">Projected Revenue</p>
              <p className="text-sm font-medium text-gray-600">Growth Projections</p>
            </div>
          </motion.div>
        </div>
        <div className="flex w-full max-w-45 justify-end">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="inline-flex items-center rounded-xl bg-gray-50 p-2 shadow-sm"
          >
            <button className="rounded-lg bg-white py-2 px-4 text-sm font-medium text-gray-900 shadow-sm hover:bg-gray-50 hover:shadow-md transition-all duration-200">
              Day
            </button>
            <button className="rounded-lg py-2 px-4 text-sm font-medium text-gray-700 hover:bg-white hover:shadow-sm transition-all duration-200">
              Week
            </button>
            <button className="rounded-lg py-2 px-4 text-sm font-medium text-gray-700 hover:bg-white hover:shadow-sm transition-all duration-200">
              Month
            </button>
          </motion.div>
        </div>
      </motion.div>
      
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <div id="enhancedChartOne" className="-ml-5">
          <ReactApexChart options={options} series={series} type="area" height={400} />
        </div>
      </motion.div>
    </motion.div>
  );
};

export default EnhancedChartOne;
