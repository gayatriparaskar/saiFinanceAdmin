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
      emi_day: 0,
      emi_amount: 0,
      total_interest_pay: 0,
      total_amount: 0,
    },
  };

  const fieldLabels = {
    full_name: t('Full Name', 'Full Name'),
    phone_number: t('Phone Number', 'Phone Number'),
    dob: t('Date of Birth', 'Date of Birth'),
    address: t('Address', 'Address'),
    aadhar_no: t('Aadhar Number', 'Aadhar Number'),
    pan_no: t('PAN Number', 'PAN Number'),
    monthly_income: t('Monthly Income', 'Monthly Income'),
  };

  const [formData, setFormData] = useState(initialFormState);
  const [officerData, setOfficerData] = useState([]);

  useEffect(() => {
    async function fetchData() {
      axios.get("officers").then((response) => {
        if (response?.data) {
          setOfficerData(response?.data?.result);
        }
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

  const payload = {
    phone_number: formData.phone_number,
    aadhar_no: formData.aadhar_no,
    pan_no: formData.pan_no,
    full_name: formData.full_name,
    dob: formData.dob,
    address: formData.address,
    monthly_income: formData.monthly_income,
    officer_id: formData.officer_id,
    Account_details: {
      ...formData.saving_details,
    },
  };

  axios
    .post("admins/createAccountUser", payload) // Make sure your backend route matches this
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
    .catch((err) => {
      toast({
        title: t("Something Went Wrong!"),
        status: "error",
        duration: 4000,
        isClosable: true,
        position: "top",
      });
    });
};


  return (
    <div className="m-6 py-8 mt-24 pt-8">
      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6">
        <h3 className="text-xl font-bold text-purple mb-4">
          {t("Create Saving Account User")}
        </h3>

        <h4 className="text-lg font-bold mt-6">{t("Saving Account Details")}</h4>
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
              {t('Interest Rate (%)', 'ब्याज दर (%)')}
            </label>
            <input
              className="mt-1 block w-2/3 rounded-md border-gray-300 shadow-sm sm:text-sm"
              name="interest_rate"
              value={formData.saving_details.interest_rate}
              type="number"
              onChange={handleSavingDetailsChange}
              placeholder={t('Interest Rate', 'ब्याज दर')}
            />
          </div>
          {/* <div>
            <label className="block text-sm font-medium text-gray-700">
              Emi Day
            </label>
            <input
              className="mt-1 block w-2/3 rounded-md border-gray-300 shadow-sm sm:text-sm"
              name="emi_day"
              value={formData.saving_details.emi_day}
              type="number"
              onChange={handleSavingDetailsChange}
              placeholder="EMI Days"
            />
          </div> */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              {t('Daily Withdraw Limit', 'दैनिक निकासी सीमा')}
            </label>
            <input
              className="mt-1 block w-2/3 rounded-md border-gray-300 shadow-sm sm:text-sm"
              name="daily_withdrawal_limit"
              value={formData.saving_details.daily_withdrawal_limit}
              type="number"
              onChange={handleSavingDetailsChange}
              placeholder={t('Withdraw Limit', 'निकासी सीमा')}
            />
          </div>
          <div className="mt-4">
            <Button colorScheme="teal" onClick={() => setIsModalOpen(true)}>
              {t('Generate Details', 'विवरण जनरेट करें')}
            </Button>
          </div>
        </div>

        <hr className="my-4" />

        <h4 className="text-lg font-bold mt-6">{t('Personal Details', 'व्यक्तिगत विवरण')}</h4>
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
                type="text"
                onChange={handleChange}
                placeholder={fieldLabels[key]}
              />
            </div>
          ))}
          <div className="grid grid-cols-1">
            <label className="text-sm font-medium text-gray-700">
              {t('Select Officer', 'अधिकारी चुनें')}
            </label>
            <select
              name="officer_id"
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
            >
              <option value="">{t('Select Officer', 'अधिकारी चुनें')}</option>
              {officerData?.map((el) => (
                <option key={el._id} value={el._id}>
                  {el.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            type="submit"
            className="px-4 py-2 bg-primaryDark text-white font-medium rounded-md hover:bg-indigo-700"
          >
            {t('Submit Saving User', 'ब��त उपयोगकर्ता जमा करें')}
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
              <strong>{t('Interest Rate:', 'ब्याज दर:')}:</strong>{" "}
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
