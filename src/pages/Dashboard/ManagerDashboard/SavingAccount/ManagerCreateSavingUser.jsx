import React, { useEffect, useState } from "react";
import axios from "../../../../axios";
import { useLocalTranslation } from "../../../../hooks/useLocalTranslation";
import {
  useToast,
  Button,
} from "@chakra-ui/react";

const ManagerCreateSavingUser = () => {
  const { t } = useLocalTranslation();
  const toast = useToast();

      const initialFormState = {
        full_name: "",
        phone_number: "",
        dob: "",
        address: "",
        aadhar_no: "",
        pan_no: "",
        monthly_income: "",
        officer_id: "",
        saving_details: {
          amount_to_be: 0, // This will be the daily EMI amount
          interest_rate: "0", // Default interest rate
          emi_day: 120, // Fixed at 120 days
          emi_amount: 0,
          total_amount: 0,
        },
      };

  const fieldLabels = {
    full_name: t("Full Name", "Full Name"),
    phone_number: t("Phone Number", "Phone Number"),
    dob: t("Date of Birth", "Date of Birth"),
    address: t("Address", "Address"),
    aadhar_no: t("Aadhar Number", "Aadhar Number"),
    pan_no: t("PAN Number", "PAN Number"),
    monthly_income: t("Monthly Income", "Monthly Income"),
  };

  const [formData, setFormData] = useState(initialFormState);
  const [officers, setOfficers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchOfficers();
  }, []);

  const fetchOfficers = async () => {
    try {
      const response = await axios.get("officers");
      if (response?.data?.result) {
        setOfficers(response.data.result);
      }
    } catch (error) {
      console.error("Error fetching officers:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith("saving_details.")) {
      const fieldName = name.split(".")[1];
      setFormData((prevData) => ({
        ...prevData,
        saving_details: {
          ...prevData.saving_details,
          [fieldName]: type === "checkbox" ? checked : value,
        },
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

      const calculateSavingDetails = () => {
        const { amount_to_be } = formData.saving_details;
        
        if (amount_to_be) {
          const dailyEmiAmount = parseFloat(amount_to_be) || 0; // This is the daily EMI
          const emi_day = 120; // Fixed at 120 days

          // For simple saving account:
          // - amount_to_be = daily EMI amount
          // - total_amount = daily EMI * 120 days
          // - emi_amount = daily EMI amount (same as amount_to_be)
          const total_amount = dailyEmiAmount * emi_day;
          const emi_amount = dailyEmiAmount; // Daily EMI is the same as amount_to_be
          
          setFormData((prevData) => ({
            ...prevData,
            saving_details: {
              ...prevData.saving_details,
              emi_day: emi_day, // Fixed at 120
              total_amount: Math.ceil(total_amount),
              emi_amount: Math.ceil(emi_amount),
            },
          }));
        }
      };

  useEffect(() => {
    calculateSavingDetails();
  }, [formData.saving_details.amount_to_be]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Prepare payload in the same format as admin controller expects
      const payload = {
        phone_number: formData.phone_number,
        aadhar_no: formData.aadhar_no,
        pan_no: formData.pan_no.toUpperCase(),
        full_name: formData.full_name.trim(),
        dob: formData.dob,
        address: formData.address.trim(),
        monthly_income: formData.monthly_income,
        officer_id: formData.officer_id,
        password: formData.phone_number, // Use phone number as password
        Account_details: {
          ...formData.saving_details,
        },
      };

      const response = await axios.post("admins/createAccountUser", payload);
      
      if (response.data) {
        toast({
          title: t("Success! Saving User Created"),
          status: "success",
          duration: 4000,
          isClosable: true,
          position: "top",
        });
        
        setFormData(initialFormState);
      }
    } catch (error) {
      console.error("Error creating saving account:", error);
      toast({
        title: t("Something Went Wrong!"),
        description: error.response?.data?.message || t("Please try again"),
        status: "error",
        duration: 4000,
        isClosable: true,
        position: "top",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData(initialFormState);
  };

  return (
    <div className="m-6 py-8">
      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6">
        <h3 className="text-xl font-bold text-purple mb-4 text-center">
          {t("Create Saving Customer")}
        </h3>

        <h4 className="text-lg font-bold mt-6 text-center">
          {t("Saving Account Details")}
        </h4>
        <div className="grid grid-cols-3 gap-4 mt-2 text-start">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              {t("Daily EMI Amount")}
            </label>
            <input
              className="mt-1 block w-2/3 rounded-md border-gray-300 shadow-sm sm:text-sm"
              name="saving_details.amount_to_be"
              value={formData.saving_details.amount_to_be}
              type="number"
              onChange={handleChange}
              placeholder="Daily EMI Amount"
            />
          </div>
        </div>

        <hr className="my-4" />

        <h4 className="text-lg font-bold mt-6 text-center">{t("Personal Details")}</h4>
        <div className="grid grid-cols-3 gap-4 text-start">
          {Object.keys(fieldLabels).map((key) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700">
                {fieldLabels[key]}
              </label>
              <input
                className="mt-1 block w-2/3 rounded-md border-gray-300 shadow-sm sm:text-sm"
                name={key}
                value={formData[key]}
                type={key === "dob" ? "date" : "text"}
                maxLength={
                  key === "phone_number" ? 10 : key === "aadhar_no" ? 12 : undefined
                }
                pattern={
                  key === "phone_number"
                    ? "[0-9]{10}"
                    : key === "aadhar_no"
                    ? "[0-9]{12}"
                    : undefined
                }
                required={key === "phone_number" || key === "aadhar_no"}
                onChange={handleChange}
                placeholder={fieldLabels[key]}
              />
            </div>
          ))}
          <div className="grid grid-cols-1">
            <label className="text-sm font-medium text-gray-700">
              {t("Select Officers", "Select Officers")}
            </label>
            <select
              className="mt-1 block w-2/3 rounded-md border-gray-300 shadow-sm sm:text-sm"
              name="officer_id"
              value={formData.officer_id}
              onChange={handleChange}
            >
              <option value="">{t("Select Officer", "Select Officer")}</option>
              {officers.map((officer) => (
                <option key={officer._id} value={officer._id}>
                  {officer.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              {t("Showing")} {officers.length} {t("collection officer(s) for account assignment")}
            </p>
          </div>
        </div>


        <div className="flex justify-center mt-8">
          <Button
            type="submit"
            colorScheme="blue"
            isLoading={isLoading}
            loadingText={t("Creating...")}
            size="lg"
          >
            {t("Create Saving Account")}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ManagerCreateSavingUser;
