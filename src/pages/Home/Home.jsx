import React from 'react';
import './Home.css';

const Home = () => {
  const cards = [
    {
      id: 1,
      title: 'Total Users',
      value: '1,234',
      icon: '👥',
      color: '#4CAF50',
      description: 'Active users in the system'
    },
    {
      id: 2,
      title: 'Loan Accounts',
      value: '567',
      icon: '💰',
      color: '#2196F3',
      description: 'Active loan accounts'
    },
    {
      id: 3,
      title: 'Saving Accounts',
      value: '890',
      icon: '🏦',
      color: '#FF9800',
      description: 'Total saving accounts'
    },
    {
      id: 4,
      title: 'Total Revenue',
      value: '$45,678',
      icon: '📈',
      color: '#9C27B0',
      description: 'Monthly revenue generated'
    },
    {
      id: 5,
      title: 'Pending Requests',
      value: '23',
      icon: '⏳',
      color: '#F44336',
      description: 'Requests awaiting approval'
    },
    {
      id: 6,
      title: 'Active Loans',
      value: '456',
      icon: '📋',
      color: '#795548',
      description: 'Currently active loans'
    },
    {
      id: 7,
      title: 'New Applications',
      value: '78',
      icon: '📝',
      color: '#607D8B',
      description: 'New loan applications'
    },
    {
      id: 8,
      title: 'Customer Support',
      value: '12',
      icon: '🎧',
      color: '#E91E63',
      description: 'Open support tickets'
    },
    {
      id: 9,
      title: 'System Health',
      value: '98%',
      icon: '💚',
      color: '#4CAF50',
      description: 'System uptime status'
    },
    {
      id: 10,
      title: 'Data Analytics',
      value: '24/7',
      icon: '📊',
      color: '#00BCD4',
      description: 'Real-time monitoring'
    },
    {
      id: 11,
      title: 'Security Status',
      value: 'Secure',
      icon: '🔒',
      color: '#8BC34A',
      description: 'System security level'
    },
    {
      id: 12,
      title: 'Backup Status',
      value: 'Updated',
      icon: '💾',
      color: '#FF5722',
      description: 'Last backup time'
    },
    {
      id: 13,
      title: 'API Calls',
      value: '2.3K',
      icon: '🔌',
      color: '#3F51B5',
      description: 'API requests today'
    },
    {
      id: 14,
      title: 'Database Size',
      value: '1.2GB',
      icon: '🗄️',
      color: '#009688',
      description: 'Current database size'
    },
    {
      id: 15,
      title: 'Performance',
      value: 'Fast',
      icon: '⚡',
      color: '#FFC107',
      description: 'System performance'
    },
    {
      id: 16,
      title: 'User Sessions',
      value: '89',
      icon: '🖥️',
      color: '#673AB7',
      description: 'Active user sessions'
    },
    {
      id: 17,
      title: 'Notifications',
      value: '15',
      icon: '🔔',
      color: '#FF9800',
      description: 'Unread notifications'
    },
    {
      id: 18,
      title: 'Updates',
      value: 'v2.1.0',
      icon: '🔄',
      color: '#795548',
      description: 'Current version'
    },
    {
      id: 19,
      title: 'Integration',
      value: 'Connected',
      icon: '🔗',
      color: '#607D8B',
      description: 'Third-party services'
    },
    {
      id: 20,
      title: 'Compliance',
      value: '100%',
      icon: '✅',
      color: '#4CAF50',
      description: 'Regulatory compliance'
    },
    {
      id: 21,
      title: 'Audit Logs',
      value: '1,456',
      icon: '📋',
      color: '#2196F3',
      description: 'Today\'s audit entries'
    },
    {
      id: 22,
      title: 'Error Rate',
      value: '0.1%',
      icon: '⚠️',
      color: '#FF9800',
      description: 'System error rate'
    },
    {
      id: 23,
      title: 'Cache Hit',
      value: '95%',
      icon: '🎯',
      color: '#9C27B0',
      description: 'Cache hit ratio'
    },
    {
      id: 24,
      title: 'Network',
      value: 'Stable',
      icon: '🌐',
      color: '#00BCD4',
      description: 'Network status'
    },
    {
      id: 25,
      title: 'Maintenance',
      value: 'Scheduled',
      icon: '🔧',
      color: '#607D8B',
      description: 'Next maintenance'
    }
  ];

  return (
    <div className="home-container">
      <div className="home-header">
        <h1>Dashboard Overview</h1>
        <p>Welcome to your financial administration dashboard</p>
      </div>
      
      <div className="cards-grid">
        {cards.map((card) => (
          <div key={card.id} className="card" style={{ borderTop: `4px solid ${card.color}` }}>
            <div className="card-icon" style={{ backgroundColor: card.color }}>
              <span>{card.icon}</span>
            </div>
            <div className="card-content">
              <h3 className="card-title">{card.title}</h3>
              <div className="card-value">{card.value}</div>
              <p className="card-description">{card.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
