import React, { useState, useEffect } from 'react';
import ReactApexChart from 'react-apexcharts';

const Taskchart = ({ collectionStatusData = {} }) => {
  const [series, setSeries] = useState([0, 0, 0, 0]);
  
  const options = {
    chart: {
      type: 'donut',
    },
    labels: ["Pending Collections", "On Hold", "In Progress", "Completed Collections"],
    theme: {
      monochrome: {
        enabled: false
      }
    },
    colors: ['#FF4560', '#FEB019', '#008FFB', '#00E396'],
    plotOptions: {
      pie: {
        dataLabels: {
          offset: -5
        },
        donut: {
          size: '55%'
        }
      }
    },
    title: {
      text: "Collection Status Overview",
      align: 'center',
      style: {
        fontSize: '16px',
        fontWeight: 'bold'
      }
    },
    legend: {
      show: true,
      position: 'bottom'
    }
  };

  useEffect(() => {
    if (collectionStatusData) {
      const { pending = 0, onHold = 0, inProgress = 0, completed = 0 } = collectionStatusData;
      setSeries([pending, onHold, inProgress, completed]);
    }
  }, [collectionStatusData]);

  const total = series.reduce((sum, value) => sum + value, 0);

  return (
    <div className="sm:px-7.5 col-span-12 rounded-sm border border-stroke bg-white px-5 pb-5 p-4 shadow-default dark:border-strokedark dark:bg-boxdark xl:col-span-5">
      <div className="mb-3 justify-between gap-4 sm:flex">
        <h5 className="text-xl font-semibold text-black dark:text-white">Collection Status</h5>
        <div className="text-sm text-gray-500">
          Total: {total}
        </div>
      </div>
      <div id="chart">
        <ReactApexChart options={options} series={series} type="donut" />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-4">
        {[
          { label: 'Pending', value: collectionStatusData.pending || 0, color: '#FF4560' },
          { label: 'On Hold', value: collectionStatusData.onHold || 0, color: '#FEB019' },
          { label: 'In Progress', value: collectionStatusData.inProgress || 0, color: '#008FFB' },
          { label: 'Completed', value: collectionStatusData.completed || 0, color: '#00E396' }
        ].map(({ label, value, color }) => (
          <div key={label} className="flex items-center justify-between p-2 bg-gray-50 rounded">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: color }}></div>
              <span className="text-sm font-medium">{label}</span>
            </div>
            <span className="text-sm font-bold">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Taskchart;
