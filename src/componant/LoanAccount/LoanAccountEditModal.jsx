import React from 'react';
import { useLocalTranslation } from '../../hooks/useLocalTranslation';
import {
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerCloseButton,
  DrawerContent,
  DrawerOverlay,
  Input,
  Select,
  Button,
} from "@chakra-ui/react";

const LoanAccountEditModal = ({
  isOpen,
  onClose,
  editData,
  setEditData,
  officers,
  isLoadingOfficers,
  onSave
}) => {
  const { t } = useLocalTranslation();

  return (
    <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="lg">
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader>{t('Edit User & Loan Details', 'Edit User & Loan Details')}</DrawerHeader>
        <DrawerBody>
          <div className="space-y-6">
            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-purple">{t('Personal Information')}</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('Full Name')} *</label>
                  <Input
                    placeholder={t('Full Name', 'Full Name')}
                    value={editData?.full_name || ""}
                    onChange={(e) =>
                      setEditData({ ...editData, full_name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('Phone Number')} *</label>
                  <Input
                    placeholder={t('Phone Number', 'Phone Number')}
                    value={editData?.phone_number || ""}
                    onChange={(e) =>
                      setEditData({ ...editData, phone_number: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('Email')}</label>
                  <Input
                    placeholder={t('Email', 'Email')}
                    value={editData?.email || ""}
                    onChange={(e) =>
                      setEditData({ ...editData, email: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('Address')}</label>
                  <Input
                    placeholder={t('Address', 'Address')}
                    value={editData?.address || ""}
                    onChange={(e) =>
                      setEditData({ ...editData, address: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>

            {/* Officer Selection */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-purple">{t('Officer Allocation')}</h3>
              <Select
                placeholder={officers.length === 0 ? 'No officers available' : t('Select Officer', 'Select Officer')}
                value={editData?.officer_id?._id || ''}
                onChange={(e) =>
                  setEditData({
                    ...editData,
                    officer_id: officers.find(officer => officer._id === e.target.value) || null
                  })
                }
                isLoading={isLoadingOfficers}
                isDisabled={isLoadingOfficers || officers.length === 0}
              >
                {officers.length === 0 ? (
                  <option value="" disabled>No officers available</option>
                ) : (
                  officers.map((officer) => (
                    <option key={officer._id} value={officer._id}>
                      {officer.name || officer.full_name || 'Unknown Officer'} 
                      {officer.officer_code && ` (${officer.officer_code})`}
                    </option>
                  ))
                )}
              </Select>
              {officers.length === 0 && (
                <div className="text-sm text-red-500 mt-1">
                  No officers found. Please refresh or check officer data.
                </div>
              )}
            </div>

            {/* Loan Details */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-purple">{t('Loan Details')}</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('Loan Amount')} (₹)</label>
                  <Input
                    placeholder={t('Loan Amount', 'Loan Amount')}
                    type="number"
                    value={editData?.active_loan_id?.loan_amount || ""}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        active_loan_id: {
                          ...editData.active_loan_id,
                          loan_amount: Number(e.target.value)
                        }
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('Total Amount')} (₹)</label>
                  <Input
                    placeholder={t('Total Amount', 'Total Amount')}
                    type="number"
                    value={editData?.active_loan_id?.total_amount || ""}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        active_loan_id: {
                          ...editData.active_loan_id,
                          total_amount: Number(e.target.value)
                        }
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('Daily EMI')} (₹)</label>
                  <Input
                    placeholder={t('Daily EMI', 'Daily EMI')}
                    type="number"
                    value={editData?.active_loan_id?.emi_day || ""}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        active_loan_id: {
                          ...editData.active_loan_id,
                          emi_day: Number(e.target.value)
                        }
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('Total Due Amount')} (₹)</label>
                  <Input
                    placeholder={t('Total Due Amount', 'Total Due Amount')}
                    type="number"
                    value={editData?.active_loan_id?.total_due_amount || ""}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        active_loan_id: {
                          ...editData.active_loan_id,
                          total_due_amount: Number(e.target.value)
                        }
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('Interest Rate')} (%)</label>
                  <Input
                    placeholder={t('Interest Rate (%)', 'Interest Rate (%)')}
                    type="number"
                    value={editData?.active_loan_id?.interest_rate || ""}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        active_loan_id: {
                          ...editData.active_loan_id,
                          interest_rate: Number(e.target.value)
                        }
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('Principle Amount')} (₹)</label>
                  <Input
                    placeholder={t('Principle Amount', 'Principle Amount')}
                    type="number"
                    value={editData?.active_loan_id?.principle_amount || ""}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        active_loan_id: {
                          ...editData.active_loan_id,
                          principle_amount: Number(e.target.value)
                        }
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('Total Penalty Amount')} (₹)</label>
                  <Input
                    placeholder={t('Total Penalty Amount', 'Total Penalty Amount')}
                    type="number"
                    value={editData?.active_loan_id?.total_penalty_amount || ""}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        active_loan_id: {
                          ...editData.active_loan_id,
                          total_penalty_amount: Number(e.target.value)
                        }
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('Start Date')}</label>
                  <Input
                    placeholder={t('Start Date', 'Start Date')}
                    type="date"
                    value={editData?.active_loan_id?.created_on ? new Date(editData.active_loan_id.created_on).toISOString().split('T')[0] : ""}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        active_loan_id: {
                          ...editData.active_loan_id,
                          created_on: new Date(e.target.value)
                        }
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('End Date')}</label>
                  <Input
                    placeholder={t('End Date', 'End Date')}
                    type="date"
                    value={editData?.active_loan_id?.end_date ? new Date(editData.active_loan_id.end_date).toISOString().split('T')[0] : ""}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        active_loan_id: {
                          ...editData.active_loan_id,
                          end_date: new Date(e.target.value)
                        }
                      })
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        </DrawerBody>
        <DrawerFooter>
          <Button variant="outline" mr={3} onClick={onClose}>
            {t('Cancel', 'Cancel')}
          </Button>
          <Button colorScheme="blue" onClick={onSave}>
            {t('Save Changes', 'Save Changes')}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default LoanAccountEditModal;
