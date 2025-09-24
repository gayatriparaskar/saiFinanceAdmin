import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../../../axios";
import { useToast, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, FormControl, FormLabel, FormErrorMessage } from "@chakra-ui/react";
import { useLocalTranslation } from "../../../../hooks/useLocalTranslation";

const ManagerCreateOfficer = () => {
  const { t } = useLocalTranslation();
  const navigate = useNavigate();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const initialFormState = {
    name: "",
    phone_number: "",
    email: "",
    pan: "",
    aadhar: "",
    dob: "",
    officer_type: "manager",
    officer_code: null,
    isActive: true,
  };

  const [formData, setFormData] = useState(initialFormState);
  const [officerCodeError, setOfficerCodeError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    console.log(`Field changed: ${name}, Value: ${value}, Type: ${type}, Checked: ${checked}`);
    
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear officer_code when officer_type changes to non-collection_officer
    if (name === "officer_type" && value !== "collection_officer") {
      setFormData((prevData) => ({
        ...prevData,
        officer_code: null,
      }));
    }

    // Open popup for officer code when collection_officer is selected
    if (name === "officer_type" && value === "collection_officer") {
      onOpen();
    }
  };

  const handleOfficerCodeChange = (e) => {
    const value = e.target.value;
    setFormData((prevData) => ({
      ...prevData,
      officer_code: value,
    }));

    // Validate officer code format
    if (value && !/^[A-Z]{2}\d{4}$/.test(value)) {
      setOfficerCodeError("Officer code must be in format: XX1234 (2 letters + 4 numbers)");
    } else {
      setOfficerCodeError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate officer code for collection officers
    if (formData.officer_type === "collection_officer" && !formData.officer_code) {
      setOfficerCodeError("Officer code is required for collection officers");
      return;
    }

    if (formData.officer_type === "collection_officer" && officerCodeError) {
      return;
    }

    try {
      // Prepare data with phone number as password
      const submitData = {
        ...formData,
        password: formData.phone_number, // Use phone number as password
      };
      
      const response = await axios.post("officers", submitData);
      
      if (response.data.success) {
        toast({
          title: t("Success"),
          description: t("Officer created successfully"),
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        
        setFormData(initialFormState);
        navigate("/manager-dashboard/officer");
      }
    } catch (error) {
      console.error("Error creating officer:", error);
      toast({
        title: t("Error"),
        description: error.response?.data?.message || t("Failed to create officer"),
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const resetForm = () => {
    setFormData(initialFormState);
    setOfficerCodeError("");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">{t("Create Officer")}</h1>
            <Button
              colorScheme="blue"
              onClick={() => navigate("/manager-dashboard/officer")}
              variant="outline"
            >
              {t("Back to Officers")}
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-700">
                {t("Personal Information")}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("Full Name")} *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("Phone Number")} *
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
                    {t("Email")} *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("Date of Birth")} *
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
                    {t("PAN Number")} *
                  </label>
                  <input
                    type="text"
                    name="pan"
                    value={formData.pan}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("Aadhar Number")} *
                  </label>
                  <input
                    type="text"
                    name="aadhar"
                    value={formData.aadhar}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Officer Details */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-700">
                {t("Officer Details")}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("Officer Type")} *
                  </label>
                  <select
                    name="officer_type"
                    value={formData.officer_type}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="manager">{t("Manager")}</option>
                    <option value="collection_officer">{t("Collection Officer")}</option>
                    <option value="admin">{t("Admin")}</option>
                  </select>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-700">
                    {t("Active Officer")}
                  </label>
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-4 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={resetForm}
                className="px-6 py-2"
              >
                {t("Reset")}
              </Button>
              <Button
                type="submit"
                colorScheme="blue"
                className="px-6 py-2"
              >
                {t("Create Officer")}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Officer Code Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{t("Enter Officer Code")}</ModalHeader>
          <ModalBody>
            <FormControl isInvalid={!!officerCodeError}>
              <FormLabel>{t("Officer Code")} *</FormLabel>
              <Input
                value={formData.officer_code || ""}
                onChange={handleOfficerCodeChange}
                placeholder="e.g., AB1234"
                maxLength={6}
              />
              <FormErrorMessage>{officerCodeError}</FormErrorMessage>
            </FormControl>
            <p className="text-sm text-gray-500 mt-2">
              {t("Format: 2 letters followed by 4 numbers (e.g., AB1234)")}
            </p>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              {t("Cancel")}
            </Button>
            <Button
              colorScheme="blue"
              onClick={onClose}
              isDisabled={!!officerCodeError || !formData.officer_code}
            >
              {t("Confirm")}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default ManagerCreateOfficer;
