import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import dayjs from "dayjs";
import axios from "../../axios";
import { useLocalTranslation } from "../../hooks/useLocalTranslation";
import {
  Button,
  useDisclosure,
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Input,
  useToast,
} from "@chakra-ui/react";
import { MdEdit, MdArrowBack } from "react-icons/md";

function ViewOfficer() {
  const { t } = useLocalTranslation();
  const { id } = useParams();
  const [officerData, setOfficerData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [editData, setEditData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const toast = useToast();
  
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    async function fetchOfficerData() {
      try {
        setIsLoading(true);
        const response = await axios.get(`officers/${id}`);
        if (response?.data?.result) {
          setOfficerData(response.data.result);
          setEditData(response.data.result);
        }
      } catch (error) {
        console.error("Error fetching officer data:", error);
        toast({
          title: "Error fetching officer data",
          description: error.response?.data?.message || "Something went wrong",
          status: "error",
          duration: 4000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    }
    
    if (id) {
      fetchOfficerData();
    }
  }, [id, toast]);

  const handleEditSave = async () => {
    try {
      const response = await axios.put(`officers/${id}`, editData);
      if (response?.data) {
        toast({
          title: "Officer updated successfully",
          status: "success",
          duration: 4000,
          isClosable: true,
        });
        setOfficerData(editData);
        setIsEditing(false);
      }
    } catch (error) {
      toast({
        title: "Update failed",
        description: error.response?.data?.message || "Something went wrong",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-primaryBg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('Loading officer details...')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primaryBg py-8 px-6 mt-20">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Link to="officer">
              <Button
                leftIcon={<MdArrowBack />}
                variant="outline"
                colorScheme="blue"
                className="bg-white hover:bg-gray-50"
              >
                {t('Back to Officers')}
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-gray-800">
              {t('Officer Details')}
            </h1>
          </div>
          
          <Button
            leftIcon={<MdEdit />}
            colorScheme="blue"
            className="bg-primary hover:bg-primaryDark"
            onClick={() => setIsEditing(true)}
          >
            {t('Edit Officer')}
          </Button>
        </div>

        {/* Officer Information Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 border-b pb-3">
            {t('Personal Information')}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  {t('Officer Name')}
                </label>
                <p className="text-lg font-semibold text-gray-800">
                  {officerData?.name || '-'}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  {t('Employee ID')}
                </label>
                <p className="text-lg font-semibold text-gray-800">
                  {officerData?.officer_code || '-'}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  {t('Phone Number')}
                </label>
                <p className="text-lg font-semibold text-gray-800">
                  {officerData?.phone_number || '-'}
                </p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  {t('Email')}
                </label>
                <p className="text-lg font-semibold text-gray-800">
                  {officerData?.email || '-'}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  {t('Department')}
                </label>
                <p className="text-lg font-semibold text-gray-800">
                  {officerData?.department || '-'}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  {t('Join Date')}
                </label>
                <p className="text-lg font-semibold text-gray-800">
                  {officerData?.created_on ? dayjs(officerData.created_on).format("D MMM, YYYY") : '-'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Status Card */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 border-b pb-3">
            {t('Status Information')}
          </h2>
          
          <div className="flex items-center gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                {t('Current Status')}
              </label>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                officerData?.isActive 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {officerData?.isActive ? t('Active') : t('Inactive')}
              </span>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                {t('Last Updated')}
              </label>
              <p className="text-sm text-gray-600">
                {officerData?.updated_on ? dayjs(officerData.updated_on).format("D MMM, YYYY h:mm A") : '-'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Drawer */}
      <Drawer isOpen={isEditing} placement="right" onClose={() => setIsEditing(false)} size="md">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">
            {t('Edit Officer Details')}
          </DrawerHeader>
          
          <DrawerBody>
            <div className="space-y-4 pt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('Officer Name')}
                </label>
                <Input
                  value={editData?.name || ""}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  placeholder={t('Enter officer name')}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('Employee ID')}
                </label>
                <Input
                  value={editData?.officer_code || ""}
                  onChange={(e) => setEditData({ ...editData, officer_code: e.target.value })}
                  placeholder={t('Enter employee ID')}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('Phone Number')}
                </label>
                <Input
                  value={editData?.phone_number || ""}
                  onChange={(e) => setEditData({ ...editData, phone_number: e.target.value })}
                  placeholder={t('Enter phone number')}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('Email')}
                </label>
                <Input
                  value={editData?.email || ""}
                  onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                  placeholder={t('Enter email address')}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('Department')}
                </label>
                <Input
                  value={editData?.department || ""}
                  onChange={(e) => setEditData({ ...editData, department: e.target.value })}
                  placeholder={t('Enter department')}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('Status')}
                </label>
                <select
                  value={editData?.isActive ? "active" : "inactive"}
                  onChange={(e) => setEditData({ ...editData, isActive: e.target.value === "active" })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">{t('Active')}</option>
                  <option value="inactive">{t('Inactive')}</option>
                </select>
              </div>
            </div>
          </DrawerBody>
          
          <DrawerFooter borderTopWidth="1px">
            <Button variant="outline" mr={3} onClick={() => setIsEditing(false)}>
              {t('Cancel')}
            </Button>
            <Button colorScheme="blue" onClick={handleEditSave}>
              {t('Save Changes')}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}

export default ViewOfficer;
