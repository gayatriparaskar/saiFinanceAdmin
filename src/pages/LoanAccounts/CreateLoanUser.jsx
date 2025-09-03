import React, { useEffect, useState } from "react";
import axios from "../../axios";
import { useLocalTranslation } from "../../hooks/useLocalTranslation";
import { useNavigate } from "react-router-dom";
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

const CreateLoanUser = () => {
  const { t } = useLocalTranslation();
  const toast = useToast();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const initialFormState = {
    full_name: "",
    phone_number: "",
    monthly_income: "",
    pan_no: "",
    aadhar_no: "",
    address: "",
    dob: "",
    officer_id: "",
    loan_details: {
      loan_amount: "",
      principle_amount: 0,
      file_charge: 500,
      interest_rate: "",
      duration_months: 4,
      emi_day: 0,
      total_amount: 0,
      total_interest_pay: 0,
      total_penalty_amount: 0,
      total_due_amount: 0,
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
      console.log('🔄 Fetching collection officers for loan user creation...');
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

  const handleloan_detailsChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => {
      let updatedloan_details = { ...prevData.loan_details, [name]: value };

      if (name === "loan_amount" || name === "interest_rate") {
        const loan_amount = parseFloat(updatedloan_details.loan_amount) || 0;
        const interest_rate = parseFloat(updatedloan_details.interest_rate) || 0;
        // Calculate file charge as 5% of loan amount
        const file_charge = Math.round(loan_amount * 0.05);
        const duration_months = 4;
        const principle_amount = loan_amount - file_charge;
        const total_interest_pay =
          (loan_amount * interest_rate * duration_months) / 100;
        const total_amount = loan_amount + total_interest_pay;
        const emi_day = total_amount / (duration_months * 30);

        updatedloan_details = {
          ...updatedloan_details,
          principle_amount,
          total_interest_pay: total_interest_pay.toFixed(2),
          total_amount: total_amount.toFixed(2),
          emi_day: Math.ceil(emi_day),
          file_charge: file_charge,
        };
      }
      return {
        ...prevData,
        loan_details: updatedloan_details,
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

    // Loan Amount validation
    if (!formData.loan_details.loan_amount) {
      errors.push(t("Loan Amount is required"));
    } else if (isNaN(formData.loan_details.loan_amount) || parseFloat(formData.loan_details.loan_amount) <= 0) {
      errors.push(t("Loan Amount must be a positive number"));
    }

    // Interest Rate validation
    if (!formData.loan_details.interest_rate) {
      errors.push(t("Interest Rate is required"));
    } else if (isNaN(formData.loan_details.interest_rate) || parseFloat(formData.loan_details.interest_rate) <= 0 || parseFloat(formData.loan_details.interest_rate) > 100) {
      errors.push(t("Interest Rate must be between 0 and 100"));
    }

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

    // Set password as phone number
    formData.password = formData.phone_number;

    axios
      .post("admins/createUser", formData)
      .then((res) => {
        if (res.data) {
          toast({
            title: t("Success! Loan Customer Added successfully"),
            status: "success",
            duration: 4000,
            isClosable: true,
            position: "top",
          });
          // Redirect to LoanAccount page after successful submission
          navigate("/dash/loan-account");
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
          {t("Create Loan Customer")}
        </h3>

        <h4 className="text-lg font-bold mt-6">{t("Loan Details")}</h4>
                 <div className=" grid grid-cols-3 gap-4 mt-2 text-start">
           <div>
             <label className="block text-sm font-medium text-gray-700">
               {t("Loan Amount")}
             </label>
             <input
               className="mt-1 block w-2/3 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
               name="loan_amount"
               value={formData.loan_details.loan_amount}
               type="number"
               min="0"
               step="0.01"
               required={true}
               onChange={handleloan_detailsChange}
               placeholder={t("Loan Amount")}
               onKeyPress={(e) => {
                 // Prevent non-numeric input
                 if (!/[0-9]/.test(e.key) && e.key !== "Backspace" && e.key !== "Delete" && e.key !== "Tab" && e.key !== "Enter" && e.key !== ".") {
                   e.preventDefault();
                 }
               }}
             />
           </div>
           <div>
             <label className="block text-sm font-medium text-gray-700">
               {t("Interest Rate")}
             </label>
             <input
               className="mt-1 block w-2/3 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
               name="interest_rate"
               value={formData.loan_details.interest_rate}
               type="number"
               min="0"
               max="100"
               step="0.01"
               required={true}
               onChange={handleloan_detailsChange}
               placeholder={t("Interest Rate")}
               onKeyPress={(e) => {
                 // Prevent non-numeric input
                 if (!/[0-9]/.test(e.key) && e.key !== "Backspace" && e.key !== "Delete" && e.key !== "Tab" && e.key !== "Enter" && e.key !== ".") {
                   e.preventDefault();
                 }
               }}
             />
           </div>
          <div className=" mt-4">
            <Button colorScheme="teal" onClick={() => setIsModalOpen(true)}>
              {t("Generate Details")}
            </Button>
          </div>
        </div>
        <br />
        <hr />

        <h4 className="text-lg font-bold mt-6">{t("Personal Details")}</h4>
                 <div className=" grid grid-cols-3 gap-4 text-start">
           {Object.keys(fieldLabels).map((key) => (
             <div key={key} className="">
               <label className="block text-sm font-medium text-gray-700">
                 {fieldLabels[key]}
               </label>
               <input
                 className="mt-1 block w-2/3 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                 name={key}
                 value={formData[key]}
                 type={
                   key === "dob" ? "date" :
                   key === "phone_number" || key === "aadhar_no" || key === "monthly_income" ? "number" :
                   "text"
                 }
                 maxLength={
                   key === "phone_number" ? 10 :
                   key === "aadhar_no" ? 12 :
                   key === "pan_no" ? 10 :
                   undefined
                 }
                 minLength={
                   key === "full_name" ? 2 :
                   key === "address" ? 10 :
                   undefined
                 }
                                   pattern={
                    key === "full_name" ? "[A-Za-z\\s]+" :
                    key === "phone_number" ? "[0-9]{10}" :
                    key === "aadhar_no" ? "[0-9]{12}" :
                    key === "pan_no" ? "[A-Za-z]{5}[0-9]{4}[A-Za-z]{1}" :
                    key === "monthly_income" ? "[0-9]+" :
                    undefined
                  }
                 min={
                   key === "monthly_income" ? "0" :
                   undefined
                 }
                 step={
                   key === "monthly_income" ? "0.01" :
                   undefined
                 }
                 required={true}
                 onChange={handleChange}
                 placeholder={fieldLabels[key]}
                                   onKeyPress={(e) => {
                    // Prevent non-text input for name field (only letters and spaces)
                    if (key === "full_name") {
                      if (!/[A-Za-z\s]/.test(e.key) && e.key !== "Backspace" && e.key !== "Delete" && e.key !== "Tab" && e.key !== "Enter") {
                        e.preventDefault();
                      }
                    }
                    // Prevent non-numeric input for number fields
                    if (key === "phone_number" || key === "monthly_income") {
                      if (!/[0-9]/.test(e.key) && e.key !== "Backspace" && e.key !== "Delete" && e.key !== "Tab" && e.key !== "Enter") {
                        e.preventDefault();
                      }
                    }
                    // Aadhar number - only allow exactly 12 digits
                    if (key === "aadhar_no") {
                      if (!/[0-9]/.test(e.key) && e.key !== "Backspace" && e.key !== "Delete" && e.key !== "Tab" && e.key !== "Enter") {
                        e.preventDefault();
                      }
                      // Prevent input if already 12 digits
                      if (formData[key].length >= 12 && e.key !== "Backspace" && e.key !== "Delete" && e.key !== "Tab" && e.key !== "Enter") {
                        e.preventDefault();
                      }
                    }
                    // Prevent non-alphanumeric input for PAN
                    if (key === "pan_no") {
                      if (!/[A-Za-z0-9]/.test(e.key) && e.key !== "Backspace" && e.key !== "Delete" && e.key !== "Tab" && e.key !== "Enter") {
                        e.preventDefault();
                      }
                    }
                  }}
               />
             </div>
           ))}
          <div className="grid grid-cols-1 ">
            <label className=" text-sm font-medium text-gray-700">
              {t("Select Officers")}
            </label>
            <select
              name="officer_id"
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="">{t("Select Officer")}</option>
              {officerData?.map((el) => (
                <option key={el?._id} value={el?._id}>
                  {el?.name}
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
            className="px-4 py-2 bg-primaryDark text-white font-medium rounded-md hover:bg-indigo-700 focus:outline-none"
          >
            {t("Submit Loan User")}
          </button>
        </div>
      </form>

      {/* Modal for Loan Details */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {t("Loan Calculation Details", "Loan Calculation Details")}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <p>
              <strong>{t("Loan Amount", "Loan Amount")}:</strong>{" "}
              {formData.loan_details.loan_amount}
            </p>
            <p>
              <strong>{t("Interest Rate", "Interest Rate")}:</strong>{" "}
              {formData.loan_details.interest_rate}%
            </p>
            <p>
              <strong>{t("Principle Amount", "Principle Amount")}:</strong>{" "}
              {formData.loan_details.principle_amount}
            </p>
            <p>
              <strong>{t("File Charge", "File Charge")}:</strong>{" "}
              {formData.loan_details.file_charge}
            </p>
            <p>
              <strong>
                {t("Total Interest Payable", "Total Interest Payable")}:
              </strong>{" "}
              {formData.loan_details.total_interest_pay}
            </p>
            <p>
              <strong>{t("Total Amount", "Total Amount")}:</strong>{" "}
              {formData.loan_details.total_amount}
            </p>
            <p>
              <strong>{t("Daily EMI", "Daily EMI")}:</strong>{" "}
              {formData.loan_details.emi_day}
            </p>
            <hr className="my-3" />
            <p>
              <strong>{t("Loan Start Date", "Loan Start Date")}:</strong>{" "}
              {new Date().toLocaleDateString()}
            </p>
            <p>
              <strong>{t("Loan End Date", "Loan End Date")}:</strong>{" "}
              {new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toLocaleDateString()}
            </p>
            <p>
              <strong>{t("Loan Duration", "Loan Duration")}:</strong>{" "}
              120 days (4 months)
            </p>
          </ModalBody>
          <ModalFooter display={"flex"} gap={"10px"}>
            <Button onClick={() => setIsModalOpen(false)} colorScheme="red">
              {t("Cancel", "Cancel")}
            </Button>
            <Button onClick={() => setIsModalOpen(false)} colorScheme="green">
              {t("OK", "OK")}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default CreateLoanUser;
