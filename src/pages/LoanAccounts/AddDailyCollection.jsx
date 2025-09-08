import React, { useEffect, useState } from "react";
import axios from "../../axios";
import { useLocalTranslation } from "../../hooks/useLocalTranslation";
import { useParams, useNavigate } from "react-router-dom";
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
  Menu,
  MenuButton,
} from "@chakra-ui/react";

const AddDailyCollection = () => {
  const { t } = useLocalTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const initialFormState = {
    collected_officer_code: "1100",
    amount: "",
    addPenaltyFlag: false,
    penaltyType: "",   // "percentage" | "amount"
    penaltyValue: "",  // number
  };

  const [formData, setFormData] = useState(initialFormState);
  const [userData, setOfficerData] = useState([]);

  useEffect(() => {
    async function fetchData() {
      axios.get(`users/${id}`).then((response) => {
        if (response?.data) {
          setOfficerData(response?.data?.result);
        }
      });
    }
    fetchData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submitting:", formData);

    axios
      .post(`dailyCollections/byAdmin/${id}`, formData)
      .then((res) => {
        if (res.data) {
          toast({
            title: "Success! Collection Added Successfully",
            status: "success",
            duration: 4000,
            isClosable: true,
            position: "top",
          });
          // Redirect to ViewLoanUser page after successful submission
          navigate(`/dash/view-loan-user/${id}`);
        }
      })
      .catch((err) => {
        toast({
          title: "Something Went Wrong!",
          status: "error",
          duration: 4000,
          isClosable: true,
          position: "top",
        });
      });
  };

  return (
    <div className="mx-4 my-6 lg:m-6 lg:py-24 lg:pt-28 py-16">
      {/* Loan Info */}
      <div className="flex flex-col gap-4 py-4 ">
        <div className="w-full flex flex-col sm:flex-row gap-2 sm:gap-4 justify-center sm:justify-end ">
          <Menu>
            <MenuButton
              as={Button}
              className="bg-primaryDark hover:bg-primaryLight w-full sm:w-auto text-xs sm:text-sm"
              colorScheme="#FF782D"
            >
              {t("Total Loan")} {userData?.active_loan_id?.loan_amount} Rs.
            </MenuButton>
            <MenuButton
              as={Button}
              className="bg-primaryDark hover:bg-primaryLight w-full sm:w-auto text-xs sm:text-sm"
              colorScheme="#FF782D"
            >
              {t("Total Due Amount")}{" "}
              {userData?.active_loan_id?.total_due_amount} Rs.
            </MenuButton>
            <MenuButton
              as={Button}
              className="bg-primaryDark hover:bg-primaryLight w-full sm:w-auto text-xs sm:text-sm"
              colorScheme="#FF782D"
            >
              {t("Total Penalty")}{" "}
              {userData?.active_loan_id?.total_penalty_amount} Rs.
            </MenuButton>
          </Menu>
        </div>

        <div className="w-full flex justify-center sm:justify-end ">
          <Menu>
            <MenuButton
              as={Button}
              className="bg-primaryDark hover:bg-primaryLight w-full sm:w-auto text-xs sm:text-sm"
              colorScheme="#FF782D"
            >
              {t("Emi Amount")} {userData?.active_loan_id?.emi_day} Rs.
            </MenuButton>
          </Menu>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6">
        <h3 className="text-xl font-bold text-purple mb-4">
          {t("Add Daily Collection")}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2 text-start">
          {/* Officer Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              {t("Collected Officer Code")}
            </label>
            <input
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              name="collected_officer_code"
              value={formData.collected_officer_code}
              type="text"
              onChange={handleChange}
              placeholder={t("Officer Code")}
            />
          </div>

          {/* Officer Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              {t("Collected Officer Name")}
            </label>
            <input
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              value="Admin Officer"
              type="text"
              disabled
            />
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              {t("Amount")}
            </label>
            <input
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              name="amount"
              value={formData.amount}
              type="number"
              onChange={handleChange}
              placeholder={t("Amount")}
            />
          </div>

          {/* Penalty Checkbox */}
          <div className="flex items-center mt-6">
            <input
              type="checkbox"
              name="addPenaltyFlag"
              checked={formData.addPenaltyFlag}
              onChange={handleChange}
            />
            <label className="ml-2 text-sm font-medium text-gray-700">
              {t("Add Penalty")}
            </label>
          </div>

          {/* Conditional Penalty Inputs */}
          {formData.addPenaltyFlag && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {t("Penalty Type")}
                </label>
                <select
                  name="penaltyType"
                  value={formData.penaltyType}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                >
                  <option value="">{t("Select Type")}</option>
                  <option value="percentage">{t("Percentage (%)")}</option>
                  <option value="amount">{t("Fixed Amount (₹)")}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {t("Penalty Value")}
                </label>
                <input
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  name="penaltyValue"
                  value={formData.penaltyValue}
                  type="number"
                  onChange={handleChange}
                  placeholder={t("Enter Penalty")}
                />
              </div>
            </>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-center sm:justify-end mt-6">
          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-3 bg-purple text-white font-medium rounded-md focus:outline-none"
          >
            {t("Submit Collection")}
          </button>
        </div>
      </form>

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirm Collection</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <p>
              <strong>Collected Officer Code:</strong>{" "}
              {formData.collected_officer_code}
            </p>
            <p>
              <strong>Amount:</strong> {formData.amount}
            </p>
            <p>
              <strong>Penalty Applied:</strong>{" "}
              {formData.addPenaltyFlag
                ? `${formData.penaltyType} (${formData.penaltyValue})`
                : "No"}
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

export default AddDailyCollection;
