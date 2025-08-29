import React, { useState } from "react";
import axios from "../../axios";
import { useToast } from "@chakra-ui/react";
import { useLocalTranslation } from "../../hooks/useLocalTranslation";

const CreateOfficer = () => {
  const { t } = useLocalTranslation();
  const toast = useToast();

  const initialFormState = {
    officer_code: "",
    name: "",
    phone_number: "",
    email: "",
    pan: "",
    aadhar: "",
    dob: "",
    isActive: true,
  };

  const [formData, setFormData] = useState(initialFormState);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    console.log(`Field changed: ${name}, Value: ${value}, Type: ${type}, Checked: ${checked}`);
    
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Comprehensive form validation
    const errors = [];

    // Officer Code validation
    if (!formData.officer_code) {
      errors.push(t("Officer Code is required"));
    } else if (isNaN(formData.officer_code) || parseInt(formData.officer_code) <= 0) {
      errors.push(t("Officer Code must be a positive number"));
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
          {t("Create Loan Officer")}
        </h3>

        <div className="grid grid-cols-2 gap-4">
          {/* Officer Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              {t("Officer Code")}
            </label>
            <input
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-primary sm:text-sm"
              name="officer_code"
              onChange={handleChange}
              value={formData.officer_code}
              type="number"
              required
            />
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              {t("Name")}
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

          {/* ✅ Phone Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              {t("Phone Number")}
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
              {t("Email")}
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
              {t("Pan Number")}
            </label>
            <input
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-primary sm:text-sm"
              name="pan"
              value={formData.pan}
              type="text"
              onChange={handleChange}
              placeholder={t("Pan Number")}
              required
            />
          </div>
          {/* ✅ Aadhar Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              {t("Aadhar Number")}
            </label>
            <input
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-primary sm:text-sm"
              name="aadhar"
              value={formData.aadhar}
              type="number"
              onChange={handleChange}
              placeholder={t("Aadhar Number")}
              required
            />
          </div>

          {/* ✅ Date of Birth */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              {t("Date of Birth")}
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
    </div>
  );
};

export default CreateOfficer;
