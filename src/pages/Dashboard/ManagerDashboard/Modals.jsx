import React from 'react';
import { FaTimesCircle} from 'react-icons/fa';

const Modals = ({
  showOfficerDetails,
  selectedOfficer,
  setShowOfficerDetails,
  showAssignTo,
  setShowAssignTo,
  showStatus,
  setShowStatus,
  showBankAssignment,
  setShowBankAssignment,
  handleAssignToSubmit,
  handleStatusSubmit,
  handleBankAssignmentSubmit,
  getOfficerTodayCollection,
  getOfficerTotalCollection,
  getOfficerRemainingAmount
}) => {
  return (
    <>
      {/* Officer Details Modal */}
      {showOfficerDetails && selectedOfficer && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Officer Details & Collections</h3>
                <button
                  onClick={() => setShowOfficerDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimesCircle size={20} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="border-b pb-4">
                  <h4 className="font-semibold text-gray-700 mb-2">{selectedOfficer.name || selectedOfficer.username}</h4>
                  <p className="text-sm text-gray-600">{selectedOfficer.email}</p>
                  <p className="text-sm text-gray-600">Phone: {selectedOfficer.phone || '-'}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-blue-600 font-medium">Today's Loan Collection</p>
                    <p className="text-lg font-bold text-blue-900">₹{getOfficerTodayCollection(selectedOfficer._id).toLocaleString()}</p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-sm text-green-600 font-medium">Total Collection</p>
                    <p className="text-lg font-bold text-green-900">₹{getOfficerTotalCollection(selectedOfficer._id).toLocaleString()}</p>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <p className="text-sm text-purple-600 font-medium">Remaining Amount</p>
                    <p className="text-lg font-bold text-purple-900">₹{getOfficerRemainingAmount(selectedOfficer._id).toLocaleString()}</p>
                  </div>
                  <div className="bg-orange-50 p-3 rounded-lg">
                    <p className="text-sm text-orange-600 font-medium">Status</p>
                    <p className="text-lg font-bold text-orange-900">
                      {(selectedOfficer.is_active || selectedOfficer.isActive) ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                </div>
                
                <div className="pt-4">
                  <button
                    onClick={() => setShowOfficerDetails(false)}
                    className="w-full bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assign To Modal */}
      {showAssignTo && selectedOfficer && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Assign Officer</h3>
                <button
                  onClick={() => setShowAssignTo(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimesCircle size={20} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="border-b pb-4">
                  <h4 className="font-semibold text-gray-700 mb-2">{selectedOfficer.name || selectedOfficer.username}</h4>
                  <p className="text-sm text-gray-600">Select assignment type</p>
                </div>
                
                <div className="space-y-3">
                  <label className="flex items-center space-x-3">
                    <input type="radio" name="assignment" value="officer" className="text-blue-600" />
                    <span>Officer</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input type="radio" name="assignment" value="manager" className="text-blue-600" />
                    <span>Manager</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input type="radio" name="assignment" value="accounter" className="text-blue-600" />
                    <span>Accounter</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input type="radio" name="assignment" value="payment complete" className="text-blue-600" />
                    <span>Payment Complete</span>
                  </label>
                </div>
                
                <div className="pt-4 flex space-x-3">
                  <button
                    onClick={() => {
                      const selectedValue = document.querySelector('input[name="assignment"]:checked')?.value;
                      if (selectedValue) {
                        handleAssignToSubmit(selectedOfficer, selectedValue);
                      } else {
                        alert('Please select an assignment type');
                      }
                    }}
                    className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
                  >
                    Assign
                  </button>
                  <button
                    onClick={() => setShowAssignTo(false)}
                    className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Modal */}
      {showStatus && selectedOfficer && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Update Status</h3>
                <button
                  onClick={() => setShowStatus(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimesCircle size={20} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="border-b pb-4">
                  <h4 className="font-semibold text-gray-700 mb-2">{selectedOfficer.name || selectedOfficer.username}</h4>
                  <p className="text-sm text-gray-600">Select new status</p>
                </div>
                
                <div className="space-y-3">
                  <label className="flex items-center space-x-3">
                    <input type="radio" name="status" value="approved_by_manager" className="text-blue-600" />
                    <span>Approved by Manager</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input type="radio" name="status" value="approved_by_accounter" className="text-blue-600" />
                    <span>Approved by Accounter</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input type="radio" name="status" value="deposited_to_bank" className="text-blue-600" />
                    <span>Deposited to Bank</span>
                  </label>
                </div>
                
                <div className="pt-4 flex space-x-3">
                  <button
                    onClick={() => {
                      const selectedValue = document.querySelector('input[name="status"]:checked')?.value;
                      if (selectedValue) {
                        handleStatusSubmit(selectedOfficer, selectedValue);
                      } else {
                        alert('Please select a status');
                      }
                    }}
                    className="flex-1 bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition-colors"
                  >
                    Update Status
                  </button>
                  <button
                    onClick={() => setShowStatus(false)}
                    className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bank Assignment Modal */}
      {showBankAssignment && selectedOfficer && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Bank Assignment</h3>
                <button
                  onClick={() => setShowBankAssignment(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimesCircle size={20} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="border-b pb-4">
                  <h4 className="font-semibold text-gray-700 mb-2">{selectedOfficer.name || selectedOfficer.username}</h4>
                  <p className="text-sm text-gray-600">Assign bank deposit</p>
                </div>
                
                <div className="space-y-3">
                  <label className="flex items-center space-x-3">
                    <input type="radio" name="bank" value="sbi" className="text-blue-600" />
                    <span>State Bank of India</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input type="radio" name="bank" value="hdfc" className="text-blue-600" />
                    <span>HDFC Bank</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input type="radio" name="bank" value="icici" className="text-blue-600" />
                    <span>ICICI Bank</span>
                  </label>
                </div>
                
                <div className="pt-4 flex space-x-3">
                  <button
                    onClick={() => {
                      const selectedValue = document.querySelector('input[name="bank"]:checked')?.value;
                      if (selectedValue) {
                        handleBankAssignmentSubmit(selectedOfficer, selectedValue);
                      } else {
                        alert('Please select a bank');
                      }
                    }}
                    className="flex-1 bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition-colors"
                  >
                    Assign Bank
                  </button>
                  <button
                    onClick={() => setShowBankAssignment(false)}
                    className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Modals;
