import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "../../../../axios";
import { useToast, Button, Menu, MenuButton, Select } from "@chakra-ui/react";
import { RepeatIcon } from "@chakra-ui/icons";
import { useParams } from "react-router-dom";
import { useLocalTranslation } from "../../../../hooks/useLocalTranslation";
import { useUser } from "../../../../hooks/use-user";

const ManagerAddSavingCollection = () => {
  const { t } = useLocalTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const toast = useToast();
  const { data: currentUser, isLoading: userLoading } = useUser();

  const initialFormState = {
    collected_officer_code: currentUser?.role === "manager" ? null : (currentUser?.officer_id?.officer_code || 1100),
    deposit_amount: "",
    withdraw_amount: "",
    addPenaltyFlag: false,
  };

  const [formData, setFormData] = useState(initialFormState);
  const [userData, setUserData] = useState(null);
  const [transactionType, setTransactionType] = useState("deposit"); // default deposit

  // Update formData when currentUser is loaded
  useEffect(() => {
    if (currentUser) {
      setFormData(prev => ({
        ...prev,
        collected_officer_code: currentUser.role === "manager" ? null : (currentUser.officer_id?.officer_code || 1100)
      }));
    }
  }, [currentUser]);

  // ✅ fetch user data
  const fetchUserData = async () => {
    try {
      const response = await axios.get(`account/${id}`);
      if (response?.data) {
        setUserData(response?.data?.account);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);

      // Show user-friendly error message
      toast({
        title: "Error Loading Account",
        description: error.code === 'ECONNABORTED'
          ? "Request timed out. Please try again."
          : "Failed to load account details. Please check your connection.",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top"
      });

      // Set fallback data
      setUserData({
        current_amount: 0,
        total_interest_pay: 0,
        emi_day: 0
      });
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [id]);

  // ✅ handle input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]:
        type === "checkbox"
          ? checked
          : name === "deposit_amount" || name === "withdraw_amount"
          ? Number(value)
          : value,
    }));
  };

  // ✅ handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Comprehensive form validation
    const errors = [];

    // Officer Code validation
    if (!formData.collected_officer_code) {
      errors.push(t("Officer Code is required"));
    } else if (isNaN(formData.collected_officer_code) || parseInt(formData.collected_officer_code) <= 0) {
      errors.push(t("Officer Code must be a positive number"));
    }

    // Transaction type specific validations
    if (transactionType === "deposit") {
      // Deposit Amount validation
      if (!formData.deposit_amount) {
        errors.push(t("Deposit Amount is required"));
      } else if (isNaN(formData.deposit_amount) || parseFloat(formData.deposit_amount) <= 0) {
        errors.push(t("Deposit Amount must be a positive number"));
      }
    } else if (transactionType === "withdraw") {
      // Withdraw Amount validation
      if (!formData.withdraw_amount) {
        errors.push(t("Withdraw Amount is required"));
      } else if (isNaN(formData.withdraw_amount) || parseFloat(formData.withdraw_amount) <= 0) {
        errors.push(t("Withdraw Amount must be a positive number"));
      } else if (parseFloat(formData.withdraw_amount) > (userData?.current_amount || 0)) {
        errors.push(t("Withdraw Amount cannot exceed current balance"));
      } 
    }

    // Show all validation errors
    if (errors.length > 0) {
      toast({
        title: t("Validation Errors"),
        description: errors.join(", "),
        status: "error",
        duration: 6000,
        isClosable: true,
        position: "top",
      });
      return;
    }

    let apiUrl = "";
    let payload = {
      collected_officer_code: formData.collected_officer_code,
    };

    if (transactionType === "deposit") {
      apiUrl = `savingDailyCollections/byAdmin/${id} `;
      payload = {
        ...payload,
        deposit_amount: parseFloat(formData.deposit_amount),
        addPenaltyFlag: formData.addPenaltyFlag,
      };
    } else {
      apiUrl = `savingDailyCollections/withdrawByAdmin/${id}`;

      // 👉 3% extra deduction logic (user jitna withdraw karega usse +3% saving se cut hoga)
      const withdrawAmount = parseFloat(formData.withdraw_amount);
      const threePercent = (withdrawAmount * 3) / 100;
      const totalDeduction = withdrawAmount + threePercent;

      payload = {
        ...payload,
        withdraw_amount: withdrawAmount, // user ko jitna milega
        total_deduction: totalDeduction, // saving se jitna cut hoga
        deduction_percent: 3,
        deducted_amount: threePercent,
      };
    }

    try {
      console.log("Saving payment - EMI Days BEFORE:", userData?.emi_day);
      const res = await axios.post(apiUrl, payload);
      console.log("Saving payment successful! Response:", res.data);
      console.log("EMI Days AFTER payment (from response):", res.data?.result?.emi_day);

      toast({
        title: t('Success!', 'Success!'),
        description: res.data.message,
        status: "success",
        duration: 4000,
        isClosable: true,
        position: "top",
      });

      // ✅ Reset form
      setFormData(initialFormState);

      // ✅ Update UI without reload
      await fetchUserData();
      
      // ✅ Redirect to manager page after successful collection
      setTimeout(() => {
        navigate("/manager-dashboard/view-saving-user/${id}");
      }, 2000);
    } catch (err) {
      console.error("API Error:", err);
      toast({
        title: t('Something Went Wrong!', 'Something Went Wrong!'),
        description: err.response?.data?.message || t('Error occurred', 'Error occurred'),
        status: "error",
        duration: 4000,
        isClosable: true,
        position: "top",
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen bg-gradient-to-br from-primaryBg via-white to-secondaryBg  pb-4 px-2 sm:px-4 relative overflow-hidden"
    >
      {/* Animated Header */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="text-center mb-8"
      >
       
       
      </motion.div>

      {/* User Information */}
      {userData && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-8 max-w-6xl mx-auto"
        >
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
            {/* User Information Section */}
            <div className="flex flex-col gap-2 text-start">
              <h2 className="text-lg font-bold text-purple">
                {t('Name')}: <span className="ml-2 text-base">{userData?.user_id?.full_name }</span>
              </h2>
              <h2 className="text-lg font-bold text-purple">
                {t('Phone')}: <span className="ml-2 text-base">{userData?.user_id?.phone_number }</span>
              </h2>
              <h2 className="text-lg font-bold text-purple">
                {t('Start Date')}: <span className="ml-2 text-base">
                  {userData.created_on 
                    ? new Date(userData.created_on).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })
                    : ''
                  }
                </span>
              </h2>
              <h2 className="text-lg font-bold text-purple">
                {t('End Date')}: <span className="ml-2 text-base">
                  {userData.end_date 
                    ? new Date(userData.end_date).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })
                    : 'N/A'
                  }
                </span>
              </h2>
            </div>

   {/* Account Summary Buttons */}
   <div className="flex flex-col sm:flex-row gap-4 py-4 mb-4">
     <Button
       size="lg"
       colorScheme="blue"
       className="flex-1 bg-primaryDark hover:bg-primaryLight text-white"
       leftIcon={<RepeatIcon />}
     >
       {t('Total Saving')} {userData?.current_amount || 0} {t('Rs.')}
     </Button>
     <Button
       size="lg"
       colorScheme="purple"
       className="flex-1 bg-primaryDark hover:bg-primaryLight text-white"
       leftIcon={<RepeatIcon />}
     >
       {t('Total Interest')} {userData?.total_interest_pay || 0} {t('रु.')}
     </Button>
     <Button
       size="lg"
       colorScheme="green"
       className="flex-1 bg-primaryDark hover:bg-primaryLight text-white"
       leftIcon={<RepeatIcon />}
     >
       {t('EMI Day')} {userData?.emi_day || 0}
     </Button>
   </div>
                </div>
        </motion.div>
      )}

    

      {/* Form Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="max-w-4xl mx-auto"
      >
        <form onSubmit={handleSubmit} className=" ">
          {/* <h3 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4 mt-0">
            {t('Transaction Details', 'Transaction Details')}
          </h3> */}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-start mb-0">
            {/* Transaction Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('Transaction Type', 'Transaction Type')}
              </label>
              <Select
                value={transactionType}
                onChange={(e) => setTransactionType(e.target.value)}
                className="w-full"
              >
                <option value="deposit">{t('Deposit', 'Deposit')}</option>
                <option value="withdraw">{t('Withdraw', 'Withdraw')}</option>
              </Select>
            </div>

            {/* Officer Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('Collected Officer Code', 'Collected Officer Code')}
              </label>
              <input
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                name="collected_officer_code"
                value={formData.collected_officer_code}
                type="text"
                onChange={handleChange}
                placeholder={t('Officer Code', 'Officer Code')}
              />
            </div>

            {/* Officer Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('Collected Officer Name', 'Collected Officer Name')}
              </label>
              <input
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                name="collected_officer_name"
                value={t('Admin Officer', 'Admin Officer')}
                type="text"
                onChange={handleChange}
                placeholder={t('Officer Name', 'Officer Name')}
                readOnly
              />
            </div>

            {/* Deposit Amount */}
            {transactionType === "deposit" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('Deposit Amount', 'Deposit Amount')}
                </label>
                <input
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                  name="deposit_amount"
                  value={formData.deposit_amount}
                  type="number"
                  onChange={handleChange}
                  placeholder={t('Enter deposit amount', 'Enter deposit amount')}
                />
              </div>
            )}

            {/* Withdraw Amount */}
            {transactionType === "withdraw" && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('Withdraw Amount', 'Withdraw Amount')}
                </label>
                <input
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                  name="withdraw_amount"
                  value={formData.withdraw_amount}
                  type="number"
                  onChange={handleChange}
                  placeholder={t('Enter withdraw amount', 'Enter withdraw amount')}
                />
                {formData.withdraw_amount > 0 && (
                  <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-200">
                    <p className="text-sm text-red-600 font-medium">
                      {t('Deduction Details:', 'Deduction Details:')}
                    </p>
                    <p className="text-xs text-red-500 mt-1">
                      {t('3% extra deduction:', '3% extra deduction:')} ₹{(formData.withdraw_amount * 0.03).toFixed(2)}
                    </p>
                    <p className="text-xs text-red-500">
                      {t('Total amount deducted from savings:', 'Total amount deducted from savings:')} ₹{(
                        Number(formData.withdraw_amount) +
                        formData.withdraw_amount * 0.03
                      ).toFixed(2)}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Penalty Checkbox (only for deposit) */}
            {transactionType === "deposit" && (
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  name="addPenaltyFlag"
                  checked={formData.addPenaltyFlag}
                  onChange={handleChange}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label className="text-sm font-medium text-gray-700">
                  {t('Add Penalty', 'Add Penalty')}
                </label>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="px-8 py-3 bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {t('Submit Transaction', 'Submit Transaction')}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default ManagerAddSavingCollection;
