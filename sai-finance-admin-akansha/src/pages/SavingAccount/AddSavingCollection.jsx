import React, { useEffect, useState } from "react";
import axios from "../../axios";
import { useToast, Button, Menu, MenuButton, Select } from "@chakra-ui/react";
import { useParams } from "react-router-dom";

const AddSavingCollection = () => {
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
        title: "Success!",
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
        title: "Something Went Wrong!",
        description: err.response?.data?.message || "Error occurred",
        status: "error",
        duration: 4000,
        isClosable: true,
        position: "top",
      });
    }
  };

  return (
    <div className="m-6 py-12">
      {/* Account Summary */}
      <div className="flex flex-col gap-4 py-4">
        <div className="w-full flex gap-4 justify-end">
          <Menu>
            <MenuButton as={Button} className="bg-primaryDark hover:bg-primaryLight w-auto" colorScheme="#FF782D">
              Total saving Rs. {userData?.current_amount || 0} Rs.
            </MenuButton>
            {/* <MenuButton as={Button} className="bg-primaryDark hover:bg-primaryLight" colorScheme="#FF782D">
              Total Due Amount {userData?.total_amount || 0} Rs.
            </MenuButton> */}
            <MenuButton as={Button} className="bg-primaryDark hover:bg-primaryLight" colorScheme="#FF782D">
              Total Interest Pay {userData?.total_interest_pay || 0} Rs.
            </MenuButton>
          </Menu>
        </div>
        <div className="w-full flex gap-4 justify-end">
          <Menu>
            <MenuButton as={Button} className="bg-primaryDark hover:bg-primaryLight" colorScheme="#FF782D">
              Emi Day {userData?.emi_day || 0}
            </MenuButton>
          </Menu>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6">
        <h3 className="text-xl font-bold text-purple mb-4">
          Add Saving Transaction
        </h3>

        <div className="grid grid-cols-2 gap-4 mt-2 text-start">
          {/* Transaction Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Transaction Type
            </label>
            <Select
              value={transactionType}
              onChange={(e) => setTransactionType(e.target.value)}
            >
              <option value="deposit">Deposit</option>
              <option value="withdraw">Withdraw</option>
            </Select>
          </div>

          {/* Officer Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Collected Officer Code
            </label>
            <input
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              name="collected_officer_code"
              value={formData.collected_officer_code}
              type="text"
              onChange={handleChange}
              placeholder="Officer Code"
            />
          </div>
          {/* Officer Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Collected Officer Name
            </label>
            <input
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              name="collected_officer_code"
              value="Admin Officer"
              type="text"
              onChange={handleChange}
              placeholder="Officer Name"
            />
          </div>

          {/* Deposit Amount */}
          {transactionType === "deposit" && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Deposit Amount
              </label>
              <input
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                name="deposit_amount"
                value={formData.deposit_amount}
                type="number"
                onChange={handleChange}
                placeholder="Deposit Amount"
              />
            </div>
          )}

          {/* Withdraw Amount */}
          {/* Withdraw Amount */}
          {transactionType === "withdraw" && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Withdraw Amount
              </label>
              <input
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                name="withdraw_amount"
                value={formData.withdraw_amount}
                type="number"
                onChange={handleChange}
                placeholder="Withdraw Amount"
              />
              {formData.withdraw_amount > 0 && (
                <p className="text-sm text-red-500 mt-1">
                  3% extra deduction:{" "}
                  {(formData.withdraw_amount * 0.03).toFixed(2)} | Total Saving
                  se Cut:{" "}
                  {(
                    Number(formData.withdraw_amount) +
                    formData.withdraw_amount * 0.03
                  ).toFixed(2)}
                </p>
              )}
            </div>
          )}

          {/* Penalty Checkbox (only for deposit) */}
          {transactionType === "deposit" && (
            <div className="flex items-center">
              <input
                type="checkbox"
                name="addPenaltyFlag"
                checked={formData.addPenaltyFlag}
                onChange={handleChange}
              />
              <label className="ml-2 text-sm font-medium text-gray-700">
                Add Penalty
              </label>
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="flex justify-end mt-6">
          <button
            type="submit"
            className="px-4 py-2 bg-primary text-white font-medium rounded-md hover:bg-indigo-700"
          >
            Submit Transaction
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddSavingCollection;