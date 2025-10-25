import React, { useEffect, useState } from "react";
import axios from "../../../axios";
import { useLocalTranslation } from "../../../hooks/useLocalTranslation";
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
import { useNavigate } from "react-router-dom";

const CreateSavingUser = () => {
  const { t } = useLocalTranslation();
  const toast = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // Calculate future amount after 120 days at 5% interest
  const calculateFutureAmount = (currentAmount, interestRate = 5, days = 120) => {
    if (!currentAmount || currentAmount <= 0) return 0;
    
    // Calculate full 5% interest regardless of time period
    const interest = currentAmount * (interestRate / 100);
    const futureAmount = currentAmount + interest;
    
    return Math.round(futureAmount * 100) / 100; // Round to 2 decimal places
  };

  // Calculate interest earned
  const calculateInterestEarned = (currentAmount, interestRate = 5, days = 120) => {
    if (!currentAmount || currentAmount <= 0) return 0;
    
    const futureAmount = calculateFutureAmount(currentAmount, interestRate, days);
    return Math.round((futureAmount - currentAmount) * 100) / 100;
  };
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
      interest_rate: "0",
      emi_day: 120, // Fixed at 120 days
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
    
    // Remove leading zeros for number inputs
    let processedValue = value;
    if (name === "amount_to_be" && value) {
      // Remove leading zeros but preserve the input if it's just zeros
      const numValue = parseFloat(value);
      if (!isNaN(numValue) && numValue > 0) {
        processedValue = numValue.toString();
      } else if (value === "0" || value === "00" || value === "000") {
        processedValue = "0";
      }
    }
    
    setFormData((prevData) => {
      let updatedDetails = { ...prevData.saving_details, [name]: processedValue };

      if (
        name === "amount_to_be" ||
        name === "interest_rate"
      ) {
        const dailyEmiAmount = parseFloat(updatedDetails.amount_to_be) || 0; // This is the daily EMI
        const rate = parseFloat(updatedDetails.interest_rate) || 0;
        const emi_day = 120; // Fixed at 120 days

        // For simple saving account:
        // - amount_to_be = daily EMI amount
        // - total_amount = daily EMI * 120 days
        // - emi_amount = daily EMI amount (same as amount_to_be)
        // - total_interest_pay = total_amount * interest_rate * (4 months / 12 months)
        const total_amount = dailyEmiAmount * emi_day;
        const total_interest_pay = (total_amount * rate * 4) / 100; // 4 months interest
        const emi_amount = dailyEmiAmount; // Daily EMI is the same as amount_to_be

        updatedDetails = {
          ...updatedDetails,
          emi_day: emi_day, // Fixed at 120
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

    // Set loading state
    setIsSubmitting(true);

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

    // Daily EMI Amount validation
    // if (!formData.saving_details.amount_to_be) {
    //   errors.push(t("Daily EMI Amount is required"));
    // } else if (isNaN(formData.saving_details.amount_to_be) || parseFloat(formData.saving_details.amount_to_be) <= 0) {
    //   errors.push(t("Daily EMI Amount must be a positive number"));
    // }

    // Interest Rate validation
    // if (!formData.saving_details.interest_rate) {
    //   errors.push(t("Interest Rate is required"));
    // } else if (isNaN(formData.saving_details.interest_rate) || parseFloat(formData.saving_details.interest_rate) <= 0 || parseFloat(formData.saving_details.interest_rate) > 100) {
    //   errors.push(t("Interest Rate must be between 0 and 100"));
    // }

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
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      setIsSubmitting(false);
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
      password: formData.phone_number, // Use phone number as password
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
            // Redirect to LoanAccount page after successful submission
            navigate("/dash/saving-accounts");
        }
        setIsSubmitting(false);
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
        setIsSubmitting(false);
      });
  };

  return (
    <div className="m-6 py-8">
      <style jsx global>{`
        .chakra-modal__content {
          z-index: 99999 !important;
        }
        .chakra-modal__overlay {
          z-index: 99998 !important;
        }
        .chakra-modal__content-container {
          z-index: 99999 !important;
        }
        [data-chakra-modal] {
          z-index: 99999 !important;
        }
      `}</style>
      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-bold text-purple mb-4">
          {t("Create Saving Account User")}
        </h3>

        <h4 className="text-base sm:text-lg font-bold mt-4 sm:mt-6">
          {t("Saving Account Details")}
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-2 text-start">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              {t("Daily EMI Amount")} <span className="text-red-500">*</span>
            </label>
            <input
              className="mt-1 block w-full sm:w-2/3 rounded-md border-gray-300 shadow-sm text-sm sm:text-base py-2 px-3"
              name="amount_to_be"
              value={formData.saving_details.amount_to_be}
              type="number"
              onChange={handleSavingDetailsChange}
              onBlur={(e) => {
                // Remove leading zeros when user finishes typing
                const value = e.target.value;
                if (value && !isNaN(parseFloat(value))) {
                  const cleanValue = parseFloat(value).toString();
                  if (cleanValue !== value) {
                    handleSavingDetailsChange({
                      target: {
                        name: 'amount_to_be',
                        value: cleanValue
                      }
                    });
                  }
                }
              }}
              placeholder="Daily EMI Amount"
            />
            <p className="text-xs text-gray-500 mt-2 mb-2">
              {t("This will be the daily payment amount for 120 days")}
            </p>
          </div>
          {/* <div>
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
          </div> */}

          <div className="mt-4 sm:mt-6">
            <Button 
              colorScheme="teal" 
              onClick={() => setIsModalOpen(true)}
              size="sm"
              className="w-full sm:w-auto"
            >
              {t("Generate Details", "Generate Details")}
            </Button>
          </div>
        </div>

        {/* Calculated Values Display */}
        {/* {(formData.saving_details.amount_to_be > 0 || formData.saving_details.interest_rate > 0) && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h5 className="text-md font-semibold text-blue-800 mb-3">
              {t("Calculated Values")}
            </h5>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">{t("Daily EMI Amount")}:</span>
                <span className="ml-2 text-green-600 font-semibold">
                  ₹{formData.saving_details.amount_to_be || 0}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700">{t("Total Amount (120 days)")}:</span>
                <span className="ml-2 text-blue-600 font-semibold">
                  ₹{formData.saving_details.total_amount || 0}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700">{t("Interest Amount (4 months)")}:</span>
                <span className="ml-2 text-purple-600 font-semibold">
                  ₹{formData.saving_details.total_interest_pay || 0}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700">{t("Duration")}:</span>
                <span className="ml-2 text-gray-600 font-semibold">
                  {formData.saving_details.emi_day || 120} {t("days")}
                </span>
              </div>
            </div>
          </div>
        )} */}

        <hr className="my-4" />

        <h4 className="text-base sm:text-lg font-bold mt-6 sm:mt-8">{t("Personal Details")}</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 text-start mt-4">
          {Object.keys(fieldLabels).map((key) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700">
                {fieldLabels[key]}
              </label>
              <input
                className="mt-1 block w-full sm:w-2/3 rounded-md border-gray-300 shadow-sm text-sm sm:text-base py-2 px-3"
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
          <div className="grid grid-cols-1 sm:col-span-2 lg:col-span-1">
            <label className="text-sm font-medium text-gray-700">
              {t("Select Officer", "Select Officer")}
            </label>
            <select
              name="officer_id"
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm sm:text-base py-2 px-3"
            >
              <option value="">{t("Select Officer", "Select Officer")}</option>
              {officerData?.map((el) => (
                <option key={el._id} value={el._id}>
                  {el.name}
                </option>
              ))}
            </select>
            {officerData.length === 0 && (
              <p className="text-sm text-red-600 mt-2">
                No collection officers available. Please contact an administrator.
              </p>
            )}
            {officerData.length > 0 && (
              <p className="text-sm text-gray-500 mt-2">
                Showing {officerData.length} collection officer(s) for account assignment
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-center sm:justify-end mt-6 sm:mt-8">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-6 py-3 font-medium rounded-md transition-all duration-200 w-full sm:w-auto ${
              isSubmitting
                ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                : "bg-primaryDark text-white hover:bg-indigo-700"
            }`}
          >
            {isSubmitting ? (
              <div className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                {t("Creating User...", "Creating User...")}
              </div>
            ) : (
              t("Submit Saving User", "Submit Saving User")
            )}
          </button>
        </div>
      </form>

      {/* Modal for Saving Details */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        isCentered 
        size="lg"
        closeOnOverlayClick={true}
      >
        <ModalOverlay 
          bg="blackAlpha.500" 
          style={{ zIndex: 99998 }}
        />
        <ModalContent>
          <ModalHeader>
            Saving Calculation Details
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <div className="space-y-3 sm:space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 bg-gray-50 rounded-lg gap-2">
                <strong className="text-sm sm:text-base">Amount To Be:</strong>
                <span className="text-blue-600 font-semibold text-sm sm:text-base">
                  ₹{formData.saving_details.amount_to_be || 0}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 bg-gray-50 rounded-lg gap-2">
                <strong className="text-sm sm:text-base">Total Amount:</strong>
                <span className="text-green-600 font-semibold text-sm sm:text-base">
                  ₹{formData.saving_details.total_amount || 0}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 bg-gray-50 rounded-lg gap-2">
                <strong className="text-sm sm:text-base">EMI Day:</strong>
                <span className="text-purple-600 font-semibold text-sm sm:text-base">
                  {formData.saving_details.emi_day || 120} days
                </span>
              </div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 bg-gray-50 rounded-lg gap-2">
                <strong className="text-sm sm:text-base">EMI Amount:</strong>
                <span className="text-orange-600 font-semibold text-sm sm:text-base">
                  ₹{formData.saving_details.emi_amount || 0}
                </span>
              </div>
              
              {/* Interest Calculation Section */}
              {(() => {
                const totalAmount = formData.saving_details.total_amount || 0;
                const futureAmount = calculateFutureAmount(totalAmount);
                const interestEarned = calculateInterestEarned(totalAmount);
                const interestRate = 5;
                const days = 120;
                
                return (
                  <>
                    <div className="border-t pt-3 sm:pt-4 mt-3 sm:mt-4">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 text-center">
                        💰 Interest Calculation (5% p.a. for 120 days)
                      </h3>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 bg-blue-50 rounded-lg gap-2">
                      <strong className="text-sm sm:text-base">Interest Rate:</strong>
                      <span className="text-blue-600 font-semibold text-sm sm:text-base">
                        {interestRate}% per annum
                      </span>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 bg-yellow-50 rounded-lg gap-2">
                      <strong className="text-sm sm:text-base">Interest Earned:</strong>
                      <span className="text-yellow-600 font-semibold text-sm sm:text-base">
                        +₹{interestEarned.toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 bg-green-50 rounded-lg border-2 border-green-200 gap-2">
                      <strong className="text-base sm:text-lg">Final Amount After 120 Days:</strong>
                      <span className="text-green-600 font-bold text-lg sm:text-xl">
                        ₹{futureAmount.toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="text-xs sm:text-sm text-gray-600 bg-gray-100 p-3 rounded-lg break-words">
                      <strong>Calculation:</strong> ₹{totalAmount.toLocaleString()} + (₹{totalAmount.toLocaleString()} × {interestRate}%) = ₹{futureAmount.toLocaleString()}
                    </div>
                  </>
                );
              })()}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button 
              onClick={() => setIsModalOpen(false)} 
              colorScheme="red" 
              variant="outline"
            >
              Cancel
            </Button>
            <Button 
              onClick={() => setIsModalOpen(false)} 
              colorScheme="green"
            >
              OK
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default CreateSavingUser;
