import React, { useEffect, useState } from "react";
import axios from "../../../../axios";
import { useLocalTranslation } from "../../../../hooks/useLocalTranslation";
import {
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Button,
  ModalFooter,
} from "@chakra-ui/react";

const ManagerCreateSavingUser = () => {
  const { t } = useLocalTranslation();
  const toast = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);

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
      amount_to_be: 0,
      interest_rate: "",
      emi_day: 120,
      emi_amount: 0,
      total_interest_pay: 0,
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
    const { amount_to_be, interest_rate, emi_day } = formData.saving_details;
    
    if (amount_to_be && interest_rate && emi_day) {
      const principal = parseFloat(amount_to_be);
      const rate = parseFloat(interest_rate) / 100;
      const days = parseInt(emi_day);
      
      const totalInterest = principal * rate * (days / 365);
      const totalAmount = principal + totalInterest;
      const emiAmount = totalAmount / days;
      
      setFormData((prevData) => ({
        ...prevData,
        saving_details: {
          ...prevData.saving_details,
          total_interest_pay: totalInterest,
          total_amount: totalAmount,
          emi_amount: emiAmount,
        },
      }));
    }
  };

  useEffect(() => {
    calculateSavingDetails();
  }, [formData.saving_details.amount_to_be, formData.saving_details.interest_rate, formData.saving_details.emi_day]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post("account/", formData);
      
      if (response.data.success) {
        toast({
          title: t("Success"),
          description: t("Saving account created successfully"),
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        
        setFormData(initialFormState);
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error("Error creating saving account:", error);
      toast({
        title: t("Error"),
        description: error.response?.data?.message || t("Failed to create saving account"),
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData(initialFormState);
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">{t("Create Saving User")}</h1>
            <Button
              colorScheme="blue"
              onClick={() => setIsModalOpen(true)}
              size="lg"
            >
              {t("Create New Saving Account")}
            </Button>
          </div>

          <div className="text-center py-12">
            <div className="text-gray-500 text-lg mb-4">
              {t("Click the button above to create a new saving account")}
            </div>
          </div>
        </div>
      </div>

      {/* Create Saving Account Modal */}
      <Modal isOpen={isModalOpen} onClose={resetForm} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{t("Create Saving Account")}</ModalHeader>
          <ModalCloseButton />
          <form onSubmit={handleSubmit}>
            <ModalBody>
              <div className="space-y-6">
                {/* Personal Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-gray-700">
                    {t("Personal Information")}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {fieldLabels.full_name} *
                      </label>
                      <input
                        type="text"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {fieldLabels.phone_number} *
                      </label>
                      <input
                        type="tel"
                        name="phone_number"
                        value={formData.phone_number}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {fieldLabels.dob} *
                      </label>
                      <input
                        type="date"
                        name="dob"
                        value={formData.dob}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {fieldLabels.aadhar_no} *
                      </label>
                      <input
                        type="text"
                        name="aadhar_no"
                        value={formData.aadhar_no}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {fieldLabels.pan_no} *
                      </label>
                      <input
                        type="text"
                        name="pan_no"
                        value={formData.pan_no}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {fieldLabels.monthly_income} *
                      </label>
                      <input
                        type="number"
                        name="monthly_income"
                        value={formData.monthly_income}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("Address")} *
                    </label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      required
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Officer Assignment */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-gray-700">
                    {t("Officer Assignment")}
                  </h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("Assign Officer")} *
                    </label>
                    <select
                      name="officer_id"
                      value={formData.officer_id}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">{t("Select Officer")}</option>
                      {officers.map((officer) => (
                        <option key={officer._id} value={officer._id}>
                          {officer.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Saving Details */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-gray-700">
                    {t("Saving Details")}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t("Amount to be Saved")} *
                      </label>
                      <input
                        type="number"
                        name="saving_details.amount_to_be"
                        value={formData.saving_details.amount_to_be}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t("Interest Rate (%)")} *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        name="saving_details.interest_rate"
                        value={formData.saving_details.interest_rate}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t("EMI Days")} *
                      </label>
                      <input
                        type="number"
                        name="saving_details.emi_day"
                        value={formData.saving_details.emi_day}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t("Daily EMI Amount")}
                      </label>
                      <input
                        type="number"
                        value={formData.saving_details.emi_amount}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t("Total Interest")}
                      </label>
                      <input
                        type="number"
                        value={formData.saving_details.total_interest_pay}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t("Total Amount")}
                      </label>
                      <input
                        type="number"
                        value={formData.saving_details.total_amount}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={resetForm}>
                {t("Cancel")}
              </Button>
              <Button
                type="submit"
                colorScheme="blue"
                isLoading={isLoading}
                loadingText={t("Creating...")}
              >
                {t("Create Account")}
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default ManagerCreateSavingUser;
