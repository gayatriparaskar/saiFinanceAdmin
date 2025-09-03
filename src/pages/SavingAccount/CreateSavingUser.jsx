import React, { useEffect, useState } from "react";
import axios from "../../axios";
import { useLocalTranslation } from "../../hooks/useLocalTranslation";
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

const CreateSavingUser = () => {
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
  const [officerData, setOfficerData] = useState([]);

  useEffect(() => {
    async function fetchData() {
      console.log('🔄 Fetching collection officers for saving user creation...');
      axios.get("officers").then((response) => {
        if (response?.data) {
          console.log('📊 All officers response:', response.data);
          
          // Filter to show only collection officers
          const collectionOfficers = response.data.result?.filter(officer => 
            officer.officer_type === 'collection_officer' && officer.is_active
          ) || [];
          
          console.log('👥 Collection officers found:', collectionOfficers.length);
          if (collectionOfficers.length > 0) {
            console.log('👤 Sample collection officer:', collectionOfficers[0]);
          }
          
          setOfficerData(collectionOfficers);
        }
      }).catch(error => {
        console.error('❌ Error fetching officers:', error);
      });
    }
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSavingDetailsChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => {
      let updatedDetails = { ...prevData.saving_details, [name]: value };

      if (
        name === "amount_to_be" ||
        name === "interest_rate" ||
        name === "emi_day"
      ) {
        const amount = parseFloat(updatedDetails.amount_to_be) || 0;
        const rate = parseFloat(updatedDetails.interest_rate) || 0;
        const emi_day = parseInt(updatedDetails.emi_day) || 1;

        const total_interest_pay = (amount * rate * 4) / 100;
        const total_amount = amount + total_interest_pay;
        const emi_amount = total_amount / (emi_day || 1);

        updatedDetails = {
          ...updatedDetails,
          total_interest_pay: Math.ceil(total_interest_pay),
          total_amount: Math.ceil(total_amount),
          emi_amount: Math.ceil(emi_amount),
        };
      }

      return {
        ...prevData,
        saving_details: updatedDetails,
      };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Comprehensive form validation
    const errors = [];

    // Full Name validation
    if (!formData.full_name.trim()) {
      errors.push(t("Full Name is required"));
    } else if (formData.full_name.trim().length < 2) {
      errors.push(t("Full Name must be at least 2 characters"));
    }

    // Phone number validation (10 digits only)
    const phoneRegex = /^[0-9]{10}$/;
    if (!formData.phone_number) {
      errors.push(t("Phone Number is required"));
    } else if (!phoneRegex.test(formData.phone_number)) {
      errors.push(t("Phone Number must be exactly 10 digits"));
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

    // Address validation
    if (!formData.address.trim()) {
      errors.push(t("Address is required"));
    } else if (formData.address.trim().length < 10) {
      errors.push(t("Address must be at least 10 characters"));
    }

    // Aadhar Number validation (12 digits)
    const aadharRegex = /^[0-9]{12}$/;
    if (!formData.aadhar_no) {
      errors.push(t("Aadhar Number is required"));
    } else if (!aadharRegex.test(formData.aadhar_no)) {
      errors.push(t("Aadhar Number must be exactly 12 digits"));
    }

    // PAN Number validation (10 characters, alphanumeric)
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!formData.pan_no) {
      errors.push(t("PAN Number is required"));
    } else if (!panRegex.test(formData.pan_no.toUpperCase())) {
      errors.push(t("PAN Number must be in correct format (e.g., ABCDE1234F)"));
    }

    // Monthly Income validation
    if (!formData.monthly_income) {
      errors.push(t("Monthly Income is required"));
    } else if (isNaN(formData.monthly_income) || parseFloat(formData.monthly_income) <= 0) {
      errors.push(t("Monthly Income must be a positive number"));
    }

    // Saving Amount validation
    if (!formData.saving_details.amount_to_be) {
      errors.push(t("Saving Amount is required"));
    } else if (isNaN(formData.saving_details.amount_to_be) || parseFloat(formData.saving_details.amount_to_be) <= 0) {
      errors.push(t("Saving Amount must be a positive number"));
    }

    // Interest Rate validation
    if (!formData.saving_details.interest_rate) {
      errors.push(t("Interest Rate is required"));
    } else if (isNaN(formData.saving_details.interest_rate) || parseFloat(formData.saving_details.interest_rate) <= 0 || parseFloat(formData.saving_details.interest_rate) > 100) {
      errors.push(t("Interest Rate must be between 0 and 100"));
    }

    // // EMI Day validation
    // if (!formData.saving_details.emi_day) {
    //   errors.push(t("EMI Day is required"));
    // } else if (isNaN(formData.saving_details.emi_day) || parseInt(formData.saving_details.emi_day) <= 0) {
    //   errors.push(t("EMI Day must be a positive number"));
    // }

    // Officer validation
    if (!formData.officer_id) {
      errors.push(t("Please select an Officer"));
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

    const payload = {
      phone_number: formData.phone_number,
      aadhar_no: formData.aadhar_no,
      pan_no: formData.pan_no.toUpperCase(),
      full_name: formData.full_name.trim(),
      dob: formData.dob,
      address: formData.address.trim(),
      monthly_income: formData.monthly_income,
      officer_id: formData.officer_id,
      Account_details: {
        ...formData.saving_details,
      },
    };

    axios
      .post("admins/createAccountUser", payload)
      .then((res) => {
        if (res.data) {
          toast({
            title: t("Success! Saving User Created"),
            status: "success",
            duration: 4000,
            isClosable: true,
            position: "top",
          });
          window.location.reload();
        }
      })
      .catch((error) => {
        console.error("API Error:", error);
        toast({
          title: t("Something Went Wrong!"),
          description: error.response?.data?.message || t("Please try again"),
          status: "error",
          duration: 4000,
          isClosable: true,
          position: "top",
        });
      });
  };

  return (
    <div className="m-6 py-8">
      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6">
        <h3 className="text-xl font-bold text-purple mb-4">
          {t("Create Saving Account User")}
        </h3>

        <h4 className="text-lg font-bold mt-6">
          {t("Saving Account Details")}
        </h4>
        <div className=" grid grid-cols-3 gap-4 mt-2 text-start">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              {t("Saving Amount")}
            </label>
            <input
              className="mt-1 block w-2/3 rounded-md border-gray-300 shadow-sm sm:text-sm"
              name="amount_to_be"
              value={formData.saving_details.amount_to_be}
              type="number"
              onChange={handleSavingDetailsChange}
              placeholder="Amount To Be"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              {t("Interest Rate (%)")}
            </label>
            <input
              className="mt-1 block w-2/3 rounded-md border-gray-300 shadow-sm sm:text-sm"
              name="interest_rate"
              value={formData.saving_details.interest_rate}
              type="number"
              onChange={handleSavingDetailsChange}
              placeholder={t("Interest Rate")}
            />
          </div>

          <div className="mt-4">
            <Button colorScheme="teal" onClick={() => setIsModalOpen(true)}>
              {t("Generate Details", "Generate Details")}
            </Button>
          </div>
        </div>

        <hr className="my-4" />

        <h4 className="text-lg font-bold mt-6">{t("Personal Details")}</h4>
        <div className=" grid grid-cols-3 gap-4 text-start">
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
              {t("Select Officer", "Select Officer")}
            </label>
            <select
              name="officer_id"
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
            >
              <option value="">{t("Select Officer", "Select Officer")}</option>
              {officerData?.map((el) => (
                <option key={el._id} value={el._id}>
                  {el.name}
                </option>
              ))}
            </select>
            {officerData.length === 0 && (
              <p className="text-sm text-red-600 mt-1">
                No collection officers available. Please contact an administrator.
              </p>
            )}
            {officerData.length > 0 && (
              <p className="text-sm text-gray-500 mt-1">
                Showing {officerData.length} collection officer(s) for account assignment
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            type="submit"
            className="px-4 py-2 bg-primaryDark text-white font-medium rounded-md hover:bg-indigo-700"
          >
            {t("Submit Saving User", "Submit Saving User")}
          </button>
        </div>
      </form>

      {/* Modal for Saving Details */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Saving Calculation Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <p>
              <strong>Amount To Be:</strong>{" "}
              {formData.saving_details.amount_to_be}
            </p>
            <p>
              <strong>{t("Interest Rate:")}:</strong>{" "}
              {formData.saving_details.interest_rate}%
            </p>
            <p>
              <strong>Total Interest:</strong>{" "}
              {formData.saving_details.total_interest_pay}
            </p>
            <p>
              <strong>Total Amount:</strong>{" "}
              {formData.saving_details.total_amount}
            </p>
            <p>
              <strong>EMI Day:</strong> {formData.saving_details.emi_day}
            </p>
            <p>
              <strong>EMI Amount:</strong>{" "}
              {formData.saving_details.emi_amount}
            </p>
          </ModalBody>
          <ModalFooter>
            <Button onClick={() => setIsModalOpen(false)} colorScheme="red">
              Cancel
            </Button>
            <Button onClick={() => setIsModalOpen(false)} colorScheme="green">
              OK
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default CreateSavingUser;
