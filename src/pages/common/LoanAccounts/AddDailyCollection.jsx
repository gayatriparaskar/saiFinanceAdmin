import React, { useEffect, useState } from "react";
import axios from "../../axios";
import { useLocalTranslation } from "../../hooks/useLocalTranslation";
import { useParams, useNavigate } from "react-router-dom";
import { useUser } from "../../hooks/use-user";
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
  const { data: currentUser, isLoading: userLoading } = useUser();

  const initialFormState = {
    collected_officer_code: currentUser?.role === "manager" ? null : (currentUser?.officer_id?.officer_code || "1100"),
    amount: "",
    addPenaltyFlag: false,
    penaltyType: "",   // "percentage" | "amount"
    penaltyValue: "",  // number
  };

  const [formData, setFormData] = useState(initialFormState);
  const [userData, setOfficerData] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isUserListMode, setIsUserListMode] = useState(false);

  // Update formData when currentUser is loaded
  useEffect(() => {
    if (currentUser) {
      setFormData(prev => ({
        ...prev,
        collected_officer_code: currentUser.role === "manager" ? null : (currentUser.officer_id?.officer_code || "1100")
      }));
    }
  }, [currentUser]);

  useEffect(() => {
    async function fetchData() {
      if (id) {
        // If ID is provided, fetch specific user data
        setIsUserListMode(false);
        axios.get(`users/${id}`).then((response) => {
          if (response?.data) {
            setOfficerData(response?.data?.result);
          }
        }).catch((error) => {
          console.error('Error fetching user data:', error);
          toast({
            title: "Error",
            description: "Failed to fetch user data",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
        });
      } else {
        // If no ID provided, fetch all users with active loans
        setIsUserListMode(true);
        axios.get('users').then((response) => {
          if (response?.data?.result) {
            // Filter users who have active loans
            const usersWithLoans = response.data.result.filter(user => 
              user.active_loan_id && user.active_loan_id.length > 0
            );
            setOfficerData(usersWithLoans);
          }
        }).catch((error) => {
          console.error('Error fetching users data:', error);
          toast({
            title: "Error",
            description: "Failed to fetch users data",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
        });
      }
    }
    fetchData();
  }, [id, toast]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setOfficerData(user); // Set the selected user as the current user data
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submitting:", formData);
    console.log("EMI Days BEFORE payment:", userData?.active_loan_id?.emi_day);

    axios
      .post(`dailyCollections/byAdmin/${id}`, formData)
      .then((res) => {
        if (res.data) {
          console.log("Payment successful! Response:", res.data);
          console.log("EMI Days AFTER payment (from response):", res.data?.result?.emi_day);
          
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

  // If in user list mode and no user selected, show user selection
  if (isUserListMode && !selectedUser) {
    return (
      <div className="mx-2 sm:mx-4 my-2 sm:my-4 lg:m-4 lg:py-4 lg:pt-6 py-2 pt-4">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-xl font-bold text-purple mb-4">
            {t("Select User for Daily Collection")}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userData.map((user) => (
              <div
                key={user._id}
                onClick={() => handleUserSelect(user)}
                className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:bg-gray-50 hover:border-blue-500 transition-colors"
              >
                <h4 className="font-semibold text-gray-900">{user.name}</h4>
                <p className="text-sm text-gray-600">ID: {user._id}</p>
                <p className="text-sm text-gray-600">
                  Loan Amount: ₹{user.active_loan_id?.[0]?.loan_amount || 'N/A'}
                </p>
                <p className="text-sm text-gray-600">
                  EMI: ₹{user.active_loan_id?.[0]?.emi_day || 'N/A'}
                </p>
              </div>
            ))}
          </div>
          {userData.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No users with active loans found.
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-2 sm:mx-4 my-2 sm:my-4 lg:m-4 lg:py-4 py-2 ">
      {/* Back button for user list mode */}
      {isUserListMode && selectedUser && (
        <div className="mb-4">
          <button
            onClick={() => setSelectedUser(null)}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            ← Back to User Selection
          </button>
        </div>
      )}

      {/* User Information */}
      {userData && (
        <div className=" p-2 mb-6">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
            {/* User Information Section */}
            <div className="flex flex-col gap-2 text-start">
              <h2 className="text-lg font-bold text-purple">
                {t('Name')}: <span className="ml-2 text-base">{userData.full_name || 'N/A'}</span>
              </h2>
              <h2 className="text-lg font-bold text-purple">
                {t('Phone')}: <span className="ml-2 text-base">{userData.phone_number || 'N/A'}</span>
              </h2>
              <h2 className="text-lg font-bold text-purple">
                {t('Start Date')}: <span className="ml-2 text-base">
                  {userData.active_loan_id?.created_on 
                    ? new Date(userData.active_loan_id.created_on).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })
                    : 'N/A'
                  }
                </span>
              </h2>
              <h2 className="text-lg font-bold text-purple">
                {t('End Date')}: <span className="ml-2 text-base">
                  {userData.active_loan_id?.end_date 
                    ? new Date(userData.active_loan_id.end_date).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })
                    : 'N/A'
                  }
                </span>
              </h2>
            </div>
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
          </div>
        </div>
      )}

      

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
