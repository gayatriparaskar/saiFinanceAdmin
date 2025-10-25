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
import { useNavigate } from "react-router-dom";

const CreateSavingUser = () => {
  const { t } = useLocalTranslation();
  const toast = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Debug function to check modal state
  const handleModalClose = (event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    console.log("Modal close triggered");
    setIsModalOpen(false);
  };
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
    setFormData((prevData) => {
      let updatedDetails = { ...prevData.saving_details, [name]: value };

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

  // Function to calculate saving details when modal opens
  const calculateSavingDetails = () => {
    try {
      const dailyEmiAmount = parseFloat(formData.saving_details.amount_to_be) || 0;
      const rate = parseFloat(formData.saving_details.interest_rate) || 0;
      const emi_day = 120; // Fixed at 120 days

      const total_amount = dailyEmiAmount * emi_day;
      const total_interest_pay = (total_amount * rate * 4) / 100; // 4 months interest
      const emi_amount = dailyEmiAmount;

      return {
        amount_to_be: dailyEmiAmount,
        total_amount: Math.ceil(total_amount),
        emi_day: emi_day,
        emi_amount: Math.ceil(emi_amount),
        total_interest_pay: Math.ceil(total_interest_pay),
      };
    } catch (error) {
      console.error("Error in calculateSavingDetails:", error);
      return {
        amount_to_be: 0,
        total_amount: 0,
        emi_day: 120,
        emi_amount: 0,
        total_interest_pay: 0,
      };
    }
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
              {t("Daily EMI Amount")} <span className="text-red-500">*</span>
            </label>
            <input
              className="mt-1 block w-2/3 rounded-md border-gray-300 shadow-sm sm:text-sm"
              name="amount_to_be"
              value={formData.saving_details.amount_to_be}
              type="number"
              onChange={handleSavingDetailsChange}
              placeholder="Daily EMI Amount"
            />
            <p className="text-xs text-gray-500 mt-1">
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

          <div className="mt-4">
            <Button colorScheme="teal" onClick={() => {
              console.log("Opening modal, current state:", isModalOpen);
              setIsModalOpen(true);
            }}>
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
      <Modal 
        key={isModalOpen ? 'open' : 'closed'}
        isOpen={isModalOpen} 
        onClose={handleModalClose} 
        isCentered 
        size="lg"
        closeOnOverlayClick={true}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            Saving Calculation Details
          </ModalHeader>
          <ModalCloseButton onClick={handleModalClose} />
          <ModalBody>
            <div className="space-y-2">
              {(() => {
                const calculatedDetails = calculateSavingDetails();
                if (!calculatedDetails) {
                  return <div>No calculation data available</div>;
                }
                const totalAmount = calculatedDetails.total_amount || 0;
                const futureAmount = calculateFutureAmount(totalAmount);
                const interestEarned = calculateInterestEarned(totalAmount);
                const interestRate = 5;
                const days = 120;
                
                return (
                  <>
                    {/* Basic Saving Details */}
                    <div className="text-left">
                      <div className="mb-2"><strong>Daily EMI Amount:</strong> ₹{calculatedDetails.amount_to_be}</div>
                      <div className="mb-2"><strong>Interest Rate:</strong> {interestRate}%</div>
                      <div className="mb-2"><strong>Total Amount:</strong> ₹{calculatedDetails.total_amount}</div>
                      <div className="mb-2"><strong>Interest Earned:</strong> ₹{interestEarned.toLocaleString()}</div>
                      <div className="mb-2"><strong>Final Amount:</strong> ₹{futureAmount.toLocaleString()}</div>
                      <div className="mb-2"><strong>Daily EMI:</strong> ₹{calculatedDetails.emi_amount}</div>
                    </div>
                    
                    {/* Duration Details */}
                    <div className="border-t pt-3 mt-3">
                      <div className="text-left">
                        <div className="mb-2"><strong>Saving Start Date:</strong> {new Date().toLocaleDateString()}</div>
                        <div className="mb-2"><strong>Saving End Date:</strong> {new Date(Date.now() + (days * 24 * 60 * 60 * 1000)).toLocaleDateString()}</div>
                        <div className="mb-2"><strong>Saving Duration:</strong> {days} days ({Math.round(days/30)} months)</div>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button 
              onClick={handleModalClose} 
              colorScheme="red" 
              variant="outline"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleModalClose} 
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
