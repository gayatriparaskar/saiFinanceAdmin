import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from "../../axios";
import { useToast, Button, Menu, MenuButton, Select } from "@chakra-ui/react";
import { useParams } from "react-router-dom";
import { useLocalTranslation } from "../../hooks/useLocalTranslation";

const AddSavingCollection = () => {
  const { t } = useLocalTranslation();
  const { id } = useParams();
  const toast = useToast();

  const initialFormState = {
    collected_officer_code: 1100,
    deposit_amount: "",
    withdraw_amount: "",
    addPenaltyFlag: false,
  };

  const [formData, setFormData] = useState(initialFormState);
  const [userData, setUserData] = useState(null);
  const [transactionType, setTransactionType] = useState("deposit"); // default deposit

  // ✅ fetch user data
  const fetchUserData = async () => {
    try {
      const response = await axios.get(`account/${id}`);
      if (response?.data) {
        setUserData(response?.data?.account);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
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

    let apiUrl = "";
    let payload = {
      collected_officer_code: formData.collected_officer_code,
    };

    if (transactionType === "deposit") {
      apiUrl = `savingDailyCollections/byAdmin/${id} `;
      payload = {
        ...payload,
        deposit_amount: formData.deposit_amount,
        addPenaltyFlag: formData.addPenaltyFlag,
      };
    } else {
      apiUrl = `http://localhost:3001/api/savingDailyCollections/withdrawByAdmin/${id}`;

      // 👉 3% extra deduction logic (user jitna withdraw karega usse +3% saving se cut hoga)
      const threePercent = (formData.withdraw_amount * 3) / 100;
      const totalDeduction = formData.withdraw_amount + threePercent;

      payload = {
        ...payload,
        withdraw_amount: formData.withdraw_amount, // user ko jitna milega
        total_deduction: totalDeduction, // saving se jitna cut hoga
        deduction_percent: 3,
        deducted_amount: threePercent,
      };
    }

    try {
      const res = await axios.post(apiUrl, payload);

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
    } catch (err) {
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
      className="min-h-screen bg-gradient-to-br from-primaryBg via-white to-secondaryBg pt-24 pb-6 px-4 relative overflow-hidden"
    >
      {/* Animated Header */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4">
          {t('Add Saving Collection', 'Add Saving Collection')}
        </h1>
        <p className="text-lg text-gray-600">
          {t('Manage deposits and withdrawals for saving accounts', 'Manage deposits and withdrawals for saving accounts')}
        </p>
      </motion.div>

      {/* Account Summary Cards */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3 mb-8 max-w-6xl mx-auto"
      >
        <motion.div
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="bg-white rounded-xl shadow-lg p-6 border border-primary/10"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t('Total Saving', 'Total Saving')}</p>
              <p className="text-2xl font-bold text-primary">₹ {userData?.current_amount || 0}</p>
            </div>
            <div className="text-3xl">💰</div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="bg-white rounded-xl shadow-lg p-6 border border-secondary/10"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t('Total Interest', 'Total Interest')}</p>
              <p className="text-2xl font-bold text-secondary">₹ {userData?.total_interest_pay || 0}</p>
            </div>
            <div className="text-3xl">📈</div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="bg-white rounded-xl shadow-lg p-6 border border-green-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t('EMI Day', 'EMI Day')}</p>
              <p className="text-2xl font-bold text-green-600">{userData?.emi_day || 0}</p>
            </div>
            <div className="text-3xl">📅</div>
          </div>
        </motion.div>
      </motion.div>

      {/* Form Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="max-w-4xl mx-auto"
      >
        <form onSubmit={handleSubmit} className="bg-white shadow-xl rounded-2xl p-8 border border-primary/10">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-6">
            {t('Transaction Details', 'Transaction Details')}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-start">
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
                {t('Collected Officer Code', 'संग्रहकर्ता अधिकारी कोड')}
              </label>
              <input
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                name="collected_officer_code"
                value={formData.collected_officer_code}
                type="text"
                onChange={handleChange}
                placeholder={t('Officer Code', 'अधिकारी कोड')}
              />
            </div>

            {/* Officer Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('Collected Officer Name', 'संग्रहकर्ता अधिकारी नाम')}
              </label>
              <input
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                name="collected_officer_name"
                value={t('Admin Officer', 'प्रशासन अधिकारी')}
                type="text"
                onChange={handleChange}
                placeholder={t('Officer Name', 'अधिकारी नाम')}
                readOnly
              />
            </div>

            {/* Deposit Amount */}
            {transactionType === "deposit" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('Deposit Amount', 'जमा राशि')}
                </label>
                <input
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                  name="deposit_amount"
                  value={formData.deposit_amount}
                  type="number"
                  onChange={handleChange}
                  placeholder={t('Enter deposit amount', 'जमा राशि दर्ज करें')}
                />
              </div>
            )}

            {/* Withdraw Amount */}
            {transactionType === "withdraw" && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('Withdraw Amount', 'निकासी राशि')}
                </label>
                <input
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                  name="withdraw_amount"
                  value={formData.withdraw_amount}
                  type="number"
                  onChange={handleChange}
                  placeholder={t('Enter withdraw amount', 'निकासी राशि दर्ज करें')}
                />
                {formData.withdraw_amount > 0 && (
                  <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-200">
                    <p className="text-sm text-red-600 font-medium">
                      {t('Deduction Details:', 'कटौती विवरण:')}
                    </p>
                    <p className="text-xs text-red-500 mt-1">
                      {t('3% extra deduction:', '3% अतिरिक्त कटौती:')} ₹{(formData.withdraw_amount * 0.03).toFixed(2)}
                    </p>
                    <p className="text-xs text-red-500">
                      {t('Total amount deducted from savings:', 'बचत से काटी जाने वाली कुल राशि:')} ₹{(
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
                  {t('Add Penalty', 'दंड जोड़ें')}
                </label>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end mt-8">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="px-8 py-3 bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {t('Submit Transaction', 'लेनदेन जमा करें')}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default AddSavingCollection;
