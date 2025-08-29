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
import { MdEdit, MdArrowBack, MdDownload } from "react-icons/md";

function OfficerInfo() {
  const { t } = useLocalTranslation();
  const { id } = useParams();
  const [officerData, setOfficerData] = useState({});
  const [userCollections, setUserCollections] = useState([]);
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
          console.log(response.data.result, "officer data with collections");
          setOfficerData(response.data.result);
          setEditData(response.data.result);
          
          // Extract user collections from the officer data
          // Handle different possible data structures
          let collections = [];
          if (response.data.result.user_collections) {
            collections = response.data.result.user_collections;
            console.log(collections, "collections");
          } else if (response.data.result.collections) {
            collections = response.data.result.collections;
          } else if (response.data.result.userCollections) {
            collections = response.data.result.userCollections;
          } else if (Array.isArray(response.data.result)) {
            // If the result is directly an array of collections
            collections = response.data.result;
          }
          
          console.log("Extracted collections:", collections);
          setUserCollections(Array.isArray(collections) ? collections : []);
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
        // Set empty collections on error
        setUserCollections([]);
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
      console.log("Saving officer data:", editData);
      console.log("Officer ID:", id);
      
      const response = await axios.put(`officers/${id}`, editData);
      
      console.log("API Response:", response.data);
      
      if (response?.data) {
        toast({
          title: "Officer updated successfully",
          status: "success",
          duration: 4000,
          isClosable: true,
        });
        
        // Update the officer data with the response
        setOfficerData(response.data.result || editData);
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Update error:", error);
      console.error("Error response:", error.response?.data);
      
      toast({
        title: "Update failed",
        description: error.response?.data?.message || "Something went wrong",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    }
  };

  // Handle PDF Download
  const handleDownloadPDF = () => {
    try {
      // Create PDF content
      const pdfContent = generatePDFContent();
      
      // Create blob and download
      const blob = new Blob([pdfContent], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `officer_${officerData?.name || 'info'}_${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "PDF Downloaded Successfully",
        status: "success",
        duration: 4000,
        isClosable: true,
      });
    } catch (error) {
      console.error("PDF Download error:", error);
      toast({
        title: "Download failed",
        description: "Something went wrong while downloading the PDF",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    }
  };

  // Generate PDF content
  const generatePDFContent = () => {
    const currentDate = new Date().toLocaleDateString();
    const currentTime = new Date().toLocaleTimeString();
    
    let content = `OFFICER INFORMATION REPORT
Generated on: ${currentDate} at ${currentTime}
==================================================

OFFICER DETAILS:
================
Officer Name: ${officerData?.name || 'N/A'}
Officer ID: ${officerData?.officer_code || 'N/A'}
Phone Number: ${officerData?.phone_number || 'N/A'}
Join Date: ${officerData?.created_on ? dayjs(officerData.created_on).format("D MMM, YYYY") : 'N/A'}

USER COLLECTIONS SUMMARY:
========================
Total Collections: ${userCollections.length}
Total Amount: ₹ ${userCollections.reduce((sum, collection) => sum + (collection.collected_amount || collection.amount || 0), 0).toLocaleString()}
Average Amount: ₹ ${userCollections.length > 0 
  ? (userCollections.reduce((sum, collection) => sum + (collection.collected_amount || collection.amount || 0), 0) / userCollections.length).toLocaleString(undefined, {maximumFractionDigits: 0})
  : '0'}

DETAILED COLLECTIONS:
====================
`;

    if (userCollections.length > 0) {
      userCollections.forEach((collection, index) => {
        content += `
${index + 1}. Collection Details:
   User Name: ${collection.name || collection.user_name || collection.user_id?.full_name || collection.account_holder_name || collection.user_id || 'N/A'}
   Phone Number: ${collection.phone_number || 'N/A'}
   Collection Amount: ₹ ${collection.collected_amount?.toLocaleString() || collection.amount?.toLocaleString() || '0'}
   Penalty: ₹ ${collection.penalty?.toLocaleString() || '0'}
   Collection Date: ${collection.collected_on ? dayjs(collection.collected_on).format("D MMM, YYYY") : 
     collection.collection_date ? dayjs(collection.collection_date).format("D MMM, YYYY") : 
     collection.created_on ? dayjs(collection.created_on).format("D MMM, YYYY") : 'N/A'}
   Account Type: ${collection.account_type === 'loan account' || collection.type === 'loan' || collection.transaction_type === 'loan' ? 'Loan Account' : 
     collection.type === 'withdraw' || collection.transaction_type === 'withdraw' ? 'Withdraw' : 'Savings Account'}
   Status: ${collection.status === 'completed' || collection.status === 'success' ? 'Completed' : 
     collection.status === 'pending' ? 'Pending' : 'Active'}
`;
      });
    } else {
      content += `No collections found for this officer.\n`;
    }

    content += `
==================================================
End of Report
Generated by: SAI Finance Admin System
`;

    return content;
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
    <div className="min-h-screen top-10 bg-primaryBg py-16 px-6">
      <div className="w-full">
        

                 {/* Officer Information Card */}
         <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                       <div className="flex justify-between items-center mb-6 border-b pb-3">
              <h2 className="text-xl font-semibold text-gray-800">
                {t('Personal Information')}
              </h2>
              <div className="flex gap-2">
                <Button
                  leftIcon={<MdDownload />}
                  colorScheme="green"
                  size="sm"
                  variant="outline"
                  onClick={handleDownloadPDF}
                >
                  {t('Download PDF')}
                </Button>
                <Button
                  leftIcon={<MdEdit />}
                  colorScheme="blue"
                  size="sm"
                  className="bg-primary hover:bg-primaryDark"
                  onClick={() => {
                    console.log("Opening edit form with data:", editData);
                    setIsEditing(true);
                  }}
                >
                  {t('Edit Officer')}
                </Button>
              </div>
            </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  {t('Officer Name')}
                </label>
                <p className="text-lg font-semibold text-gray-800">
                  {officerData?.name || 'N/A'}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  {t('Officer ID')}
                </label>
                <p className="text-lg font-semibold text-gray-800">
                  {officerData?.officer_code || 'N/A'}
                </p>
              </div>
              
              
            </div>
            
            <div className="space-y-4">
              {/* <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  {t('Email')}
                </label>
                <p className="text-lg font-semibold text-gray-800">
                  {officerData?.email || 'N/A'}
                </p>
              </div> */}
{/*               
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  {t('Department')}
                </label>
                <p className="text-lg font-semibold text-gray-800">
                  {officerData?.department || 'N/A'}
                </p>
              </div> */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  {t('Phone Number')}
                </label>
                <p className="text-lg font-semibold text-gray-800">
                  {officerData?.phone_number || 'N/A'}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  {t('Join Date')}
                </label>
                <p className="text-lg font-semibold text-gray-800">
                  {officerData?.created_on ? dayjs(officerData.created_on).format("D MMM, YYYY") : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Status Card */}
        {/* <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
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
                {officerData?.updated_on ? dayjs(officerData.updated_on).format("D MMM, YYYY h:mm A") : 'N/A'}
              </p>
            </div>
          </div>
        </div> */}

        {/* User Collections Card */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 border-b pb-3">
            {t('User Collections')}
          </h2>
          
          {/* Collection Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-blue-600">{t('Total Collections')}</div>
                  <div className="text-2xl font-bold text-blue-900">{userCollections.length}</div>
                </div>
                <div className="text-3xl">📊</div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-green-600">{t('Total Amount')}</div>
                                     <div className="text-2xl font-bold text-green-900">
                     ₹ {userCollections.reduce((sum, collection) => sum + (collection.collected_amount || collection.amount || 0), 0).toLocaleString()}
                   </div>
                </div>
                <div className="text-3xl">💰</div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-purple-600">{t('Average Amount')}</div>
                                     <div className="text-2xl font-bold text-purple-900">
                     ₹ {userCollections.length > 0 
                       ? (userCollections.reduce((sum, collection) => sum + (collection.collected_amount || collection.amount || 0), 0) / userCollections.length).toLocaleString(undefined, {maximumFractionDigits: 0})
                       : '0'
                     }
                   </div>
                </div>
                <div className="text-3xl">📈</div>
              </div>
            </div>
          </div>
          
          {userCollections.length > 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('Sr No.')}
                      </th>
                                             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                         {t('User Name')}
                       </th>
                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                         {t('Phone Number')}
                       </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                         {t('Collection Amount')}
                       </th>
                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                         {t('Penalty')}
                       </th>
                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                         {t('Collection Date')}
                       </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('Type')}
                      </th>
                                                                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('Status')}
                        </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {userCollections.map((collection, index) => (
                      <tr key={index} className="hover:bg-gray-50 transition-colors duration-200">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {index + 1}
                        </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                           {collection.name || collection.user_name || collection.user_id?.full_name || collection.account_holder_name || collection.user_id || 'N/A'}
                         </td>
                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                           {collection.phone_number || 'N/A'}
                         </td>
                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                           ₹ {collection.collected_amount?.toLocaleString() || collection.amount?.toLocaleString() || collection.deposit_amount?.toLocaleString() || collection.withdraw_amount?.toLocaleString() || '0'}
                         </td>
                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                           ₹ {collection.penalty?.toLocaleString() || '0'}
                         </td>
                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                           {collection.collected_on ? dayjs(collection.collected_on).format("D MMM, YYYY") : 
                            collection.collection_date ? dayjs(collection.collection_date).format("D MMM, YYYY") : 
                            collection.created_on ? dayjs(collection.created_on).format("D MMM, YYYY") : 'N/A'}
                         </td>
                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                           <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                             collection.account_type === 'loan account' || collection.type === 'loan' || collection.transaction_type === 'loan'
                               ? 'bg-blue-100 text-blue-800' 
                               : collection.type === 'withdraw' || collection.transaction_type === 'withdraw'
                               ? 'bg-red-100 text-red-800'
                               : 'bg-green-100 text-green-800'
                           }`}>
                             {collection.account_type === 'loan account' || collection.type === 'loan' || collection.transaction_type === 'loan' ? t('Loan') : 
                              collection.type === 'withdraw' || collection.transaction_type === 'withdraw' ? t('Withdraw') : t('Savings')}
                           </span>
                         </td>
                                                                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              collection.status === 'completed' || collection.status === 'success'
                                ? 'bg-green-100 text-green-800' 
                                : collection.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {collection.status === 'completed' || collection.status === 'success' ? t('Completed') : 
                               collection.status === 'pending' ? t('Pending') : t('Active')}
                            </span>
                          </td>
                       </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📊</div>
              <p className="text-gray-500 text-lg font-medium">{t('No collections found for this officer')}</p>
              <p className="text-gray-400 text-sm mt-2">{t('Collections will appear here when users make payments')}</p>
              <div className="mt-6">
                <div className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-lg">
                  <span className="text-sm">💡 {t('Tip: Collections are automatically added when users make transactions')}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

             {/* Edit Officer Drawer */}
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

export default OfficerInfo;
