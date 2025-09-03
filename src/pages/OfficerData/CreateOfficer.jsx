import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../axios";
import { useToast, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, FormControl, FormLabel, FormErrorMessage } from "@chakra-ui/react";
import { useLocalTranslation } from "../../hooks/useLocalTranslation";

const CreateOfficer = () => {
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

  const handleOfficerCodeSubmit = () => {
    // Validate officer code
    if (!formData.officer_code.trim()) {
      setOfficerCodeError(t("Officer Code is required"));
      return;
    }
    
    if (isNaN(formData.officer_code) || parseInt(formData.officer_code) <= 0) {
      setOfficerCodeError(t("Officer Code must be a positive number"));
      return;
    }

    setOfficerCodeError("");
    onClose();
  };

  const handleOfficerCodeChange = (e) => {
    setFormData(prev => ({
      ...prev,
      officer_code: e.target.value || null
    }));
    if (officerCodeError) {
      setOfficerCodeError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Comprehensive form validation
    const errors = [];

    // Officer Type validation
    if (!formData.officer_type) {
      errors.push(t("Officer Type is required"));
    }

    // Officer Code validation - only required for collection_officer
    if (formData.officer_type === "collection_officer") {
      if (!formData.officer_code || formData.officer_code.toString().trim() === "") {
        errors.push(t("Officer Code is required for Collection Officers"));
      } else if (isNaN(formData.officer_code) || parseInt(formData.officer_code) <= 0) {
        errors.push(t("Officer Code must be a positive number"));
      }
    }

    // Name validation
    if (!formData.name.trim()) {
      errors.push(t("Name is required"));
    } else if (formData.name.trim().length < 2) {
      errors.push(t("Name must be at least 2 characters"));
    }

    // Phone number validation (10 digits only)
    const phoneRegex = /^[0-9]{10}$/;
    if (!formData.phone_number) {
      errors.push(t("Phone Number is required"));
    } else if (!phoneRegex.test(formData.phone_number)) {
      errors.push(t("Phone Number must be exactly 10 digits"));
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      errors.push(t("Email is required"));
    } else if (!emailRegex.test(formData.email)) {
      errors.push(t("Please enter a valid email address"));
    }

    // PAN Number validation (10 characters, alphanumeric)
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!formData.pan) {
      errors.push(t("PAN Number is required"));
    } else if (!panRegex.test(formData.pan.toUpperCase())) {
      errors.push(t("PAN Number must be in correct format (e.g., ABCDE1234F)"));
    }

    // Aadhar Number validation (12 digits)
    const aadharRegex = /^[0-9]{12}$/;
    if (!formData.aadhar) {
      errors.push(t("Aadhar Number is required"));
    } else if (!aadharRegex.test(formData.aadhar)) {
      errors.push(t("Aadhar Number must be exactly 12 digits"));
    }

    // Date of Birth validation
    if (!formData.dob) {
      errors.push(t("Date of Birth is required"));
    } else {
      const dob = new Date(formData.dob);
      const today = new Date();
      const age = today.getFullYear() - dob.getFullYear();
      if (age < 18 || age > 100) {
        errors.push(t("Age must be between 18 and 100 years"));
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

    // Prepare data with proper formatting
    const submitData = {
      ...formData,
      name: formData.name.trim(),
      email: formData.email.toLowerCase(),
      pan: formData.pan.toUpperCase(),
    };

    // Handle officer_code based on officer_type
    if (formData.officer_type === "collection_officer") {
      if (formData.officer_code && formData.officer_code.trim() !== "") {
        submitData.officer_code = formData.officer_code.trim();
      } else {
        submitData.officer_code = null;
      }
    } else {
      // For non-collection officers, don't include officer_code field at all
      delete submitData.officer_code;
    }

    try {
      const res = await axios.post("officers", submitData);
      if (res.data) {
        toast({
          title: t("Success! Officer Added successfully"),
          status: "success",
          duration: 4000,
          isClosable: true,
          position: "top",
        });
        setFormData(initialFormState);
        
        // Redirect to officer page after successful creation
        setTimeout(() => {
          navigate("/dash/officer");
        }, 1500);
      }
    } catch (err) {
      console.error("API Error:", err);
      toast({
        title: t("Something Went Wrong!"),
        description: err.response?.data?.message || t("An error occurred."),
        status: "error",
        duration: 4000,
        isClosable: true,
        position: "top",
      });
    }
  };

  return (
    <div className="m-6 py-8 ">
      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6">
        <h3 className="text-xl font-bold text-purple mb-4">
          {t("Create Officer")}
        </h3>

        <div className="grid grid-cols-2 gap-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              {t("Name")} *
            </label>
            <input
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-primary sm:text-sm"
              name="name"
              value={formData.name}
              type="text"
              onChange={handleChange}
              placeholder={t("Enter officer's name")}
              required
            />
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              {t("Phone Number")} *
            </label>
            <input
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-primary sm:text-sm"
              name="phone_number"
              value={formData.phone_number}
              type="text"
              maxLength={10}
              pattern="[0-9]{10}"
              onChange={handleChange}
              placeholder={t("Enter 10-digit phone number")}
              required
            />
          </div>

          {/* ✅ Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              {t("Email")} *
            </label>
            <input
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-primary sm:text-sm"
              name="email"
              value={formData.email}
              type="email"
              onChange={handleChange}
              placeholder={t("Enter Email")}
              required
            />
          </div>
          {/* ✅ Pan Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              {t("PAN Number")} *
            </label>
            <input
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-primary sm:text-sm"
              name="pan"
              value={formData.pan}
              type="text"
              maxLength={10}
              onChange={handleChange}
              placeholder={t("Enter PAN Number")}
              required
            />
          </div>
          {/* ✅ Aadhar Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              {t("Aadhar Number")} *
            </label>
            <input
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-primary sm:text-sm"
              name="aadhar"
              value={formData.aadhar}
              type="text"
              maxLength={12}
              onChange={handleChange}
              placeholder={t("Enter Aadhar Number")}
              required
            />
          </div>
          {/* ✅ Date of Birth */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              {t("Date of Birth")} *
            </label>
            <input
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-primary sm:text-sm"
              name="dob"
              value={formData.dob}
              type="date"
              onChange={handleChange}
              required
            />
          </div>

          {/* Officer Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              {t("Officer Type")} *
            </label>
            <select
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-primary sm:text-sm"
              name="officer_type"
              value={formData.officer_type}
              onChange={handleChange}
              required
            >
              <option value="collection_officer">{t("Collection Officer")}</option>
              <option value="manager">{t("Manager")}</option>
              <option value="admin">{t("Admin")}</option>
              <option value="accounter">{t("Accounter")}</option>
            </select>
          </div>

                        {/* Officer Code Display - Only show for collection_officer */}
              {formData.officer_type === "collection_officer" && formData.officer_code && formData.officer_code.toString().trim() !== "" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {t("Officer Code")}
                  </label>
                  <div className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 px-3 py-2 text-sm">
                    {formData.officer_code}
                  </div>
                </div>
              )}

          {/* Is Active */}
          <div className="flex items-center mt-2">
            <label className="block text-sm font-medium text-gray-700 mr-2">
              {t("Is Active")}
            </label>
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="accent-primary focus:ring-primary h-4 w-4 border-none rounded"
            />
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            type="submit"
            className="px-4 py-2 bg-primaryDark text-white font-medium rounded-md hover:bg-indigo-700 focus:outline-none"
          >
            {t("Submit Officer")}
          </button>
        </div>
      </form>

      {/* Officer Code Popup Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{t("Enter Officer Code")}</ModalHeader>
          <ModalBody>
            <FormControl isInvalid={!!officerCodeError}>
              <FormLabel>{t("Officer Code")} *</FormLabel>
              <Input
                type="number"
                value={formData.officer_code}
                onChange={handleOfficerCodeChange}
                placeholder={t("Enter officer code")}
                autoFocus
              />
              <FormErrorMessage>{officerCodeError}</FormErrorMessage>
            </FormControl>
            <p className="text-sm text-gray-600 mt-2">
              {t("Officer Code is required for Collection Officers")}
            </p>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              {t("Cancel")}
            </Button>
            <Button colorScheme="blue" onClick={handleOfficerCodeSubmit}>
              {t("Submit")}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default CreateOfficer;
