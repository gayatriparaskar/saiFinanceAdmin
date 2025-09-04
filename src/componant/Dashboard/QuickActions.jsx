import React from 'react';
import { motion } from 'framer-motion';
import { 
  FaDownload, 
  FaChartBar, 
  FaUsers,
  FaExclamationTriangle
} from 'react-icons/fa';

const QuickActions = ({ onActionClick }) => {
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  const actions = [
    {
      id: 'export-data',
      title: 'Export Data',
      icon: FaDownload,
      color: 'green',
      description: 'Export collection data to CSV'
    },
    {
      id: 'monthly-report',
      title: 'Monthly Report',
      icon: FaChartBar,
      color: 'blue',
      description: 'Generate monthly collection report'
    },
    {
      id: 'overdue-collections',
      title: 'Overdue Collections',
      icon: FaExclamationTriangle,
      color: 'red',
      description: 'Check overdue loan collections'
    },
    {
      id: 'officer-performance',
      title: 'Officer Performance',
      icon: FaUsers,
      color: 'purple',
      description: 'View officer collection performance'
    }
  ];

  const getColorClasses = (color) => {
    const colorMap = {
      blue: {
        bg: 'bg-blue-50',
        hover: 'hover:bg-blue-100',
        border: 'border-blue-200',
        text: 'text-blue-800',
        icon: 'text-blue-600'
      },
      green: {
        bg: 'bg-green-50',
        hover: 'hover:bg-green-100',
        border: 'border-green-200',
        text: 'text-green-800',
        icon: 'text-green-600'
      },
      purple: {
        bg: 'bg-purple-50',
        hover: 'hover:bg-purple-100',
        border: 'border-purple-200',
        text: 'text-purple-800',
        icon: 'text-purple-600'
      },
      red: {
        bg: 'bg-red-50',
        hover: 'hover:bg-red-100',
        border: 'border-red-200',
        text: 'text-red-800',
        icon: 'text-red-600'
      }
    };
    return colorMap[color] || colorMap.blue;
  };

  return (
    <motion.div 
      variants={itemVariants}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
    >
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map((action) => {
          const colors = getColorClasses(action.color);
          const IconComponent = action.icon;
          
          return (
            <motion.button
              key={action.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onActionClick && onActionClick(action.id)}
              className={`flex flex-col items-center justify-center space-y-2 p-4 ${colors.bg} ${colors.hover} rounded-lg border ${colors.border} transition-colors cursor-pointer`}
            >
              <IconComponent className={`text-2xl ${colors.icon}`} />
              <span className={`${colors.text} font-medium text-sm`}>
                {action.title}
              </span>
              <span className={`${colors.text} text-xs opacity-75 text-center`}>
                {action.description}
              </span>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
};

export default QuickActions;
