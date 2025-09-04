import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaUsers } from 'react-icons/fa';

const OfficerTable = ({ 
  officers = [], 
  loading = false,
  onEditClick,
  onSaveEdit,
  onCancelEdit,
  onAssignToClick,
  onStatusClick,
  onViewDetails,
  editingOfficer,
  editingData,
  setEditingData
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [assignFilter, setAssignFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const formatCurrency = (amount) => {
    return `₹${(amount || 0).toLocaleString()}`;
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  // Filter officers
  const filteredOfficers = officers.filter(officer => {
    const matchesSearch = officer.officer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    officer.officer_code?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || officer.status === statusFilter;
    const matchesAssign = !assignFilter || officer.assignTo === assignFilter;
    return matchesSearch && matchesStatus && matchesAssign;
  });

  // Pagination
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedOfficers = filteredOfficers.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredOfficers.length / itemsPerPage);

  if (loading) {
    return (
      <motion.div 
        variants={itemVariants}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-64 mb-4"></div>
          <div className="space-y-4">
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      variants={itemVariants}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
    >
      <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
        <FaUsers className="mr-2 text-purple-600" />
        Officer Collection Overview
      </h2>
      
      {/* Search and Filter */}
      <div className="mb-6 space-y-4">
        {/* Search Input */}
        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 mb-2">Search Officers</label>
          <input
            type="text"
            placeholder="Search by name or code..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {/* Filter Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="">All Status</option>
              <option value="approved by manager">Approved by Manager</option>
              <option value="approved by accounter">Approved by Accounter</option>
              <option value="deposited to bank">Deposited to Bank</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Assignment</label>
            <select
              value={assignFilter}
              onChange={(e) => setAssignFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="">All Assignments</option>
              <option value="officer">Officer</option>
              <option value="accounter">Accounter</option>
              <option value="manager">Manager</option>
            </select>
          </div>
        </div>
      </div>

      {/* Officer Table */}
      <div className="overflow-x-auto -mx-4 sm:mx-0">
        {paginatedOfficers.length > 0 ? (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Officer Name
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Officer Code
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Today's Collection
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Collection
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Paid Amount
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Remaining Amount
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assign To
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedOfficers.map((officer, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {officer.officer_name}
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {officer.officer_code}
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-medium">
                    {formatCurrency(officer.todayCollection || 0)}
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                    {formatCurrency(officer.totalCollection || 0)}
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm">
                    {editingOfficer === officer.officer_id ? (
                      <input
                        type="number"
                        value={editingData.paidAmount}
                        onChange={(e) => setEditingData({...editingData, paidAmount: parseFloat(e.target.value) || 0})}
                        className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                    ) : (
                      <span className="text-purple-600 font-medium">
                        {formatCurrency(officer.paidAmount || 0)}
                      </span>
                    )}
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm">
                    {editingOfficer === officer.officer_id ? (
                      <input
                        type="number"
                        value={editingData.remainingAmount}
                        onChange={(e) => setEditingData({...editingData, remainingAmount: parseFloat(e.target.value) || 0})}
                        className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                    ) : (
                      <span className="text-orange-600 font-medium">
                        {formatCurrency(officer.remainingAmount || 0)}
                      </span>
                    )}
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => onAssignToClick(officer)}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors text-xs font-medium"
                    >
                      {officer.assignTo || 'Assign'}
                    </button>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => onStatusClick(officer)}
                      className="px-3 py-1 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-colors text-xs font-medium"
                    >
                      {officer.status || 'Set Status'}
                    </button>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      {editingOfficer === officer.officer_id ? (
                        <>
                          <button
                            onClick={() => onSaveEdit(officer.officer_id)}
                            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors text-xs"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => onCancelEdit()}
                            className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors text-xs"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => onEditClick(officer)}
                            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-xs"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => onViewDetails(officer)}
                            className="px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors text-xs"
                          >
                            View
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-500">
              <FaUsers className="text-4xl mx-auto mb-4" />
              <p className="text-lg font-medium mb-2">No Officers Found</p>
              <p className="text-sm">Officer data is being loaded or no officers are available.</p>
              <div className="mt-4 text-xs text-gray-400">
                <p>Debug Info:</p>
                <p>Total Officers: {officers.length}</p>
                <p>Filtered Officers: {filteredOfficers.length}</p>
                <p>Search Term: "{searchTerm}"</p>
                <p>Status Filter: "{statusFilter}"</p>
                <p>Assign Filter: "{assignFilter}"</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {startIndex + 1} to {Math.min(endIndex, filteredOfficers.length)} of {filteredOfficers.length} results
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 border rounded-md text-sm font-medium ${
                  currentPage === page
                    ? 'border-blue-500 bg-blue-500 text-white'
                    : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default OfficerTable;
