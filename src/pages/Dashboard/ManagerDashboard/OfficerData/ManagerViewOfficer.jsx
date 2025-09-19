import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import dayjs from "dayjs";
import axios from "../../../../axios";
import jsPDF from 'jspdf';
import { useLocalTranslation } from "../../../../hooks/useLocalTranslation";
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

function ManagerViewOfficer() {
  const { t } = useLocalTranslation();
  const { id } = useParams();
  const [officerData, setOfficerData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();
  
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    async function fetchOfficerData() {
      try {
        setIsLoading(true);
        const response = await axios.get(`officers/${id}`);
        if (response?.data?.result) {
          setOfficerData(response.data.result);
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

    fetchOfficerData();
  }, [id, toast]);


  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('Loading officer details...')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {t('Officer Details')}
              </h1>
              <p className="text-gray-600">
                {officerData.name} - {officerData.officer_type}
              </p>
            </div>
            <div className="flex space-x-3">
              <Button
                leftIcon={<MdArrowBack />}
                colorScheme="gray"
                variant="outline"
                onClick={() => window.history.back()}
              >
                {t('Back')}
              </Button>
              <Button
                colorScheme="purple"
                onClick={() => {
                  const doc = new jsPDF();
                  doc.setFontSize(20);
                  doc.text('Officer Details Report', 20, 20);
                  doc.setFontSize(12);
                  doc.text(`Name: ${officerData.name}`, 20, 40);
                  doc.text(`Phone: ${officerData.phone_number}`, 20, 50);
                  doc.text(`Email: ${officerData.email}`, 20, 60);
                  doc.text(`Type: ${officerData.officer_type}`, 20, 70);
                  doc.text(`Status: ${officerData.isActive ? 'Active' : 'Inactive'}`, 20, 80);
                  doc.save(`officer-${officerData.name}-details.pdf`);
                }}
              >
                {t('Download PDF')}
              </Button>
            </div>
          </div>
        </div>

        {/* Officer Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-700">
              {t('Personal Information')}
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">{t('Full Name')}:</span>
                <span className="font-medium">{officerData.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t('Phone Number')}:</span>
                <span className="font-medium">{officerData.phone_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t('Email')}:</span>
                <span className="font-medium">{officerData.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t('Date of Birth')}:</span>
                <span className="font-medium">
                  {officerData.dob ? dayjs(officerData.dob).format('DD MMM, YYYY') : '-'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t('PAN Number')}:</span>
                <span className="font-medium">{officerData.pan}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t('Aadhar Number')}:</span>
                <span className="font-medium">{officerData.aadhar}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-700">
              {t('Officer Information')}
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">{t('Officer Type')}:</span>
                <span className="font-medium capitalize">{officerData.officer_type}</span>
              </div>
              {officerData.officer_code && (
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('Officer Code')}:</span>
                  <span className="font-medium">{officerData.officer_code}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">{t('Status')}:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  officerData.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {officerData.isActive ? t('Active') : t('Inactive')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t('Created At')}:</span>
                <span className="font-medium">
                  {officerData.createdAt ? dayjs(officerData.createdAt).format('DD MMM, YYYY h:mm A') : '-'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t('Updated At')}:</span>
                <span className="font-medium">
                  {officerData.updatedAt ? dayjs(officerData.updatedAt).format('DD MMM, YYYY h:mm A') : '-'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        {officerData.officer_type === 'collection_officer' && (
          <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-700">
              {t('Collection Officer Details')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900">{t('Assigned Users')}</h4>
                <p className="text-blue-700">View users assigned to this officer</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium text-green-900">{t('Collection Performance')}</h4>
                <p className="text-green-700">View collection statistics</p>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}

export default ManagerViewOfficer;
