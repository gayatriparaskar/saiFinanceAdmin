import React from "react";

const TestDashHome = () => {
  return (
    <div className="min-h-screen bg-primaryBg pt-20 pb-6 px-4">
      <div className="container mx-auto">
        <h1 className="text-4xl font-bold text-primary mb-8 text-center">
          🏠 Dashboard Home - Test Version
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <h3 className="text-xl font-semibold mb-2">Daily Collection</h3>
            <p className="text-3xl font-bold text-primary">₹ 0</p>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <h3 className="text-xl font-semibold mb-2">Total Loan Customers</h3>
            <p className="text-3xl font-bold text-primary">0</p>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <h3 className="text-xl font-semibold mb-2">Total Outgoing</h3>
            <p className="text-3xl font-bold text-primary">₹ 0</p>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <h3 className="text-xl font-semibold mb-2">Active Savings Users</h3>
            <p className="text-3xl font-bold text-primary">0</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow-lg mb-6">
          <h3 className="text-xl font-semibold mb-4">System Status</h3>
          <p className="text-green-600">✅ Dashboard is working correctly!</p>
          <p className="text-gray-600 mt-2">This is a simplified version to test routing and basic functionality.</p>
        </div>
        
        <div className="text-center">
          <p className="text-gray-500">If you can see this page, the routing is working correctly.</p>
        </div>
      </div>
    </div>
  );
};

export default TestDashHome;
