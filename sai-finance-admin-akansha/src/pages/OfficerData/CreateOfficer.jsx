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
    isActive: true,
  };

  const [formData, setFormData] = useState(initialFormState);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("officers", formData);
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
            />
          </div>
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
          <div className="flex items-center">
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
