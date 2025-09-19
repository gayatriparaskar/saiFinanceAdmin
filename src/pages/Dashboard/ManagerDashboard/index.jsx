import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ManagerLayout from './ManagerLayout';

const ManagerDashboard = () => {
  return (
    <Routes>
      <Route path="/*" element={<ManagerLayout />} />
    </Routes>
  );
};

export default ManagerDashboard;