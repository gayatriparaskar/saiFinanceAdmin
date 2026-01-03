import React, { useEffect, useState } from "react";
import { useParams} from "react-router-dom";
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
import { MdEdit, MdDownload } from "react-icons/md";
import Table from "../../componant/Table/Table";
import Cell from "../../componant/Table/cell";
// import OfficerNavbar from "../../components/OfficerNavbar";

function OfficerInfo() {
  const { t } = useLocalTranslation();
  const { id } = useParams();
  const [officerData, setOfficerData] = useState({});
  const [userCollections, setUserCollections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editData, setEditData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [reportType, setReportType] = useState('daily'); // New state for report type
  const [collectionData, setCollectionData] = useState({}); // New state for collection data

  console.log('🔄 OfficerInfo component rendered with ID:', id);
  console.log('🔄 Current URL:', window.location.href);

  const toast = useToast();
  
  // const { isOpen, onOpen, onClose } = useDisclosure();

  // Function to fetch collection data based on report type
  const fetchCollectionData = async (period) => {
    try {
      let endpoint = '';
      switch (period) {
        case 'daily':
          endpoint = 'admins/userWiseDailyCollections';
          break;
        case 'weekly':
          endpoint = 'admins/userWiseWeeklyCollections';
          break;
        case 'monthly':
          endpoint = 'admins/userWiseMonthlyCollections';
          break;
        default:
          endpoint = 'admins/userWiseDailyCollections';
      }

      const response = await axios.get(endpoint);
      console.log(`📊 ${period} collection data:`, response.data);
      
      if (response.data?.result?.collections) {
        setCollectionData(response.data.result.collections);
      }
    } catch (error) {
      console.error(`Error fetching ${period} collection data:`, error);
      setCollectionData([]);
    }
  };

  // Table columns configuration
  const columns = React.useMemo(
    () => [
      {
        Header: t('Sr No.', 'Sr No.'),
        accessor: "srNo",
        Cell: ({ value, row: { index } }) => <Cell text={index + 1} />,
        width: 60,
        minWidth: 60,
      },
      {
        Header: t('User Name', 'User Name'),
        accessor: "userName",
        Cell: ({ value }) => <Cell text={value || '-'} />,
        minWidth: 120,
      },
      {
        Header: t('Phone', 'Phone'),
        accessor: "phoneNumber",
        Cell: ({ value }) => <Cell text={value || '-'} />,
        minWidth: 100,
      },
      {
        Header: t('Address', 'Address'),
        accessor: "address",
        Cell: ({ value }) => <Cell text={value || '-'} />,
        minWidth: 120,
      },
      {
        Header: t('Account Type', 'Account Type'),
        accessor: "accountType",
        Cell: ({ value }) => (
          <Cell 
            text={
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                value === 'loan account'
                  ? 'bg-blue-100 text-blue-800' 
                  : value === 'saving account'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {value === 'loan account' ? t('Loan Account') : 
                 value === 'saving account' ? t('Saving Account') : value}
              </span>
            } 
          />
        ),
        minWidth: 100,
      },
      {
        Header: t('Total Amount', 'Total Amount'),
        accessor: "totalAmount",
        Cell: ({ value }) => <Cell text={`₹${value?.toLocaleString() || '0'}`} />,
        minWidth: 100,
      },
      {
        Header: t('Due Amount', 'Due Amount'),
        accessor: "dueAmount",
        Cell: ({ value }) => <Cell text={`₹${value?.toLocaleString() || '0'}`} />,
        minWidth: 100,
      },
      {
        Header: t('Collected', 'Collected'),
        accessor: "collectedAmount",
        Cell: ({ value }) => <Cell text={`₹${value?.toLocaleString() || '0'}`} />,
        minWidth: 100,
      },
      {
        Header: t('Penalty', 'Penalty'),
        accessor: "penalty",
        Cell: ({ value }) => <Cell text={`₹${value?.toLocaleString() || '0'}`} />,
        minWidth: 80,
      },
      {
        Header: t('Remaining EMI', 'Remaining EMI'),
        accessor: "remainingEmiDays",
        Cell: ({ value }) => <Cell text={`${value || 0} days`} />,
        minWidth: 100,
      },
      {
        Header: t('Start Date', 'Start Date'),
        accessor: "startDate",
        Cell: ({ value }) => <Cell text={value || '-'} />,
        minWidth: 90,
      },
      {
        Header: t('End Date', 'End Date'),
        accessor: "endDate",
        Cell: ({ value }) => <Cell text={value || '-'} />,
        minWidth: 90,
      },
      {
        Header: t('Collection Date', 'Collection Date'),
        accessor: "collectionDate",
        Cell: ({ value }) => <Cell text={value || '-'} />,
        minWidth: 90,
      },
      {
        Header: t('Total Collection', 'Total Collection'),
        accessor: "totalCollection",
        Cell: ({ value }) => <Cell text={`₹${value?.toLocaleString() || '0'}`} />,
        minWidth: 120,
      },
    ],
    [t]
  );

  // Function to get collection amount for a user
  const getUserCollectionAmount = (userId) => {
    if (!collectionData || collectionData.length === 0) return 0;
    
    const userCollection = collectionData.find(item => 
      item.user_id === userId || 
      item.user_id?.toString() === userId?.toString()
    );
    
    return userCollection ? (userCollection.total_amount || 0) : 0;
  };

  // Transform collections data for table
  const tableData = React.useMemo(() => {
    return userCollections.map((collection) => {
      const userId = collection.user_id || collection.user_id?._id;
      const totalCollection = getUserCollectionAmount(userId);
      
      return {
        srNo: '', // Will be handled by the Cell component
        userName: collection.name || collection.user_name || collection.user_id?.full_name || collection.account_holder_name || collection.user_id || '-',
        phoneNumber: collection.phone_number || '-',
        address: collection.address || '-',
        accountType: collection.account_type || 'N/A',
        totalAmount: collection.total_amount || 0,
        dueAmount: collection.total_due_amount || 0,
        totalCollection: totalCollection, // Add total collection amount
      collectedAmount: collection.collected_amount || collection.amount || collection.deposit_amount || collection.withdraw_amount || 0,
      penalty: collection.penalty || 0,
      remainingEmiDays: collection.remaining_emi_days || 0,
      startDate: collection.start_date ? dayjs(collection.start_date).format("D MMM, YYYY") : '-',
      endDate: collection.end_date ? dayjs(collection.end_date).format("D MMM, YYYY") : '-',
      collectionDate: collection.collected_on ? dayjs(collection.collected_on).format("D MMM, YYYY") : 
                     collection.collection_date ? dayjs(collection.collection_date).format("D MMM, YYYY") : 
                     collection.created_on ? dayjs(collection.created_on).format("D MMM, YYYY") : '-',
      type: collection.account_type === 'loan account' || collection.type === 'loan' || collection.transaction_type === 'loan' ? 'loan' : 
            collection.type === 'withdraw' || collection.transaction_type === 'withdraw' ? 'withdraw' : 'savings',
      status: collection.status === 'completed' || collection.status === 'success' ? 'completed' : 
              collection.status === 'pending' ? 'pending' : 'active'
    };
  });
  }, [userCollections, collectionData]);

  useEffect(() => {
    async function fetchOfficerData() {
      try {
        setIsLoading(true);
        
        // Fetch officer basic information
        const officerResponse = await axios.get(`officers/${id}`);
        if (officerResponse?.data?.result) {
          console.log(officerResponse.data.result, "officer data");
          setOfficerData(officerResponse.data.result);
          setEditData(officerResponse.data.result);
        }
        
        // Fetch officer collections data separately
        try {
          const collectionsResponse = await axios.get(`officers/${id}/collections`);
          if (collectionsResponse?.data?.result) {
            console.log(collectionsResponse.data.result, "collections data");
            setUserCollections(Array.isArray(collectionsResponse.data.result) ? collectionsResponse.data.result : []);
          }
        } catch (collectionsError) {
          console.log("Collections endpoint not available, using officer data collections");
          // Fallback to collections from officer data
          let collections = [];
          if (officerResponse.data.result.user_collections) {
            collections = officerResponse.data.result.user_collections;
          } else if (officerResponse.data.result.collections) {
            collections = officerResponse.data.result.collections;
          } else if (officerResponse.data.result.userCollections) {
            collections = officerResponse.data.result.userCollections;
          }
          console.log(collections, "collections");  
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
        setUserCollections([]);
      } finally {
        setIsLoading(false);
      }
    }
    
    if (id) {
      fetchOfficerData();
    }
  }, [id, toast]);

  // Fetch collection data when report type changes
  useEffect(() => {
    if (id) {
      fetchCollectionData(reportType);
    }
  }, [reportType, id]);

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
Officer Name: ${officerData?.name || '-'}
Officer ID: ${officerData?.officer_code || '-'}
Phone Number: ${officerData?.phone_number || '-'}
Join Date: ${officerData?.created_on ? dayjs(officerData.created_on).format("D MMM, YYYY") : '-'}

ALLOTTED USERS SUMMARY:
========================
Total Users Allotted: ${userCollections.length}
Total Loan Amount: ₹ ${userCollections.reduce((sum, collection) => sum + (collection.total_amount || 0), 0).toLocaleString()}
Total Collected Amount: ₹ ${userCollections.reduce((sum, collection) => sum + (collection.collected_amount || collection.amount || 0), 0).toLocaleString()}
Total Due Amount: ₹ ${userCollections.reduce((sum, collection) => sum + (collection.total_due_amount || 0), 0).toLocaleString()}
Average Collection: ₹ ${userCollections.length > 0 
  ? (userCollections.reduce((sum, collection) => sum + (collection.collected_amount || collection.amount || 0), 0) / userCollections.length).toLocaleString(undefined, {maximumFractionDigits: 0})
  : '0'}

DETAILED USER INFORMATION:
=========================
`;

    if (userCollections.length > 0) {
      userCollections.forEach((collection, index) => {
        content += `
${index + 1}. User Details:
   User Name: ${collection.name || collection.user_name || collection.user_id?.full_name || collection.account_holder_name || collection.user_id || '-'}
   Phone Number: ${collection.phone_number || '-'}
   Address: ${collection.address || '-'}
   Account Type: ${collection.account_type === 'loan account' ? 'Loan Account' : 
     collection.account_type === 'saving account' ? 'Saving Account' : collection.account_type || 'N/A'}
   Total Amount: ₹ ${collection.total_amount?.toLocaleString() || '0'}
   Due Amount: ₹ ${collection.total_due_amount?.toLocaleString() || '0'}
   Collected Amount: ₹ ${collection.collected_amount?.toLocaleString() || collection.amount?.toLocaleString() || '0'}
   Penalty: ₹ ${collection.penalty?.toLocaleString() || '0'}
   Remaining EMI Days: ${collection.remaining_emi_days || 0} days
   Start Date: ${collection.start_date ? dayjs(collection.start_date).format("D MMM, YYYY") : '-'}
   End Date: ${collection.end_date ? dayjs(collection.end_date).format("D MMM, YYYY") : '-'}
   Collection Date: ${collection.collected_on ? dayjs(collection.collected_on).format("D MMM, YYYY") : 
     collection.collection_date ? dayjs(collection.collection_date).format("D MMM, YYYY") : 
     collection.created_on ? dayjs(collection.created_on).format("D MMM, YYYY") : '-'}
`;
      });
    } else {
      content += `No users allotted to this officer.\n`;
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
      <div className="min-h-screen bg-primaryBg flex items-center justify-center ">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">{t('Loading officer details...')}</p>
        </div>
      </div>
    );
  }

  // Determine officer type and name for navbar
  // const getOfficerType = () => {
  //   // Check if this is a manager viewing officer details
  //   const currentUserType = localStorage.getItem('userType');
  //   const currentOfficerType = localStorage.getItem('officerType');
    
  //   if (currentUserType === 'manager' || currentOfficerType === 'manager') {
  //     return 'manager';
  //   } else if (currentUserType === 'accounter' || currentOfficerType === 'accounter') {
  //     return 'accounter';
  //   } else if (currentUserType === 'collection_officer' || currentOfficerType === 'collection_officer') {
  //     return 'collection_officer';
  //   }
    
  //   return 'manager'; // Default to manager
  // };

  // const getOfficerName = () => {
  //   return localStorage.getItem('officerName') || 'Manager';
  // };

  return (
    <>
      {/* <OfficerNavbar 
        officerType={getOfficerType()} 
        officerName={getOfficerName()} 
        pageName="Officer Details" 
      /> */}
      <div className="min-h-screen bg-primaryBg py-4 px-2 sm:px-4 lg:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Officer Information Section */}
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6">
            {/* Officer Details */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                {t('Officer Information')}
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs sm:text-sm font-medium text-gray-500">{t('Officer Name')}</p>
                  <p className="text-sm sm:text-base font-semibold text-gray-800 truncate">{officerData?.name || '-'}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs sm:text-sm font-medium text-gray-500">{t('Officer ID')}</p>
                  <p className="text-sm sm:text-base font-semibold text-gray-800">{officerData?.officer_code || '-'}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs sm:text-sm font-medium text-gray-500">{t('Phone')}</p>
                  <p className="text-sm sm:text-base font-semibold text-gray-800">{officerData?.phone_number || '-'}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs sm:text-sm font-medium text-gray-500">{t('Join Date')}</p>
                  <p className="text-sm sm:text-base font-semibold text-gray-800">
                    {officerData?.created_on ? dayjs(officerData.created_on).format("D MMM, YYYY") : '-'}
                  </p>
                </div>
              </div>
            </div>

            {/* Summary Cards and Action Buttons Row */}
            <div className="flex flex-col md:flex-row gap-4 mb-6 w-full">
              {/* Summary Cards - Takes available space */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full md:w-2/3">
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-blue-600">{t('Total Collections')} : {userCollections.length}</p>
                    </div>
                    <div className="bg-blue-100 p-2 rounded-full">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-100 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-green-600">{t('Total Amount')} :                         ₹{userCollections.reduce((sum, c) => sum + (c.collected_amount || c.amount || 0), 0).toLocaleString()}
                   </p>

                    </div>
                    <div className="bg-green-100 p-2 rounded-full">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons - Fixed width on desktop */}
              <div className="flex flex-row gap-3 w-full md:w-1/3">
                <Button
                  leftIcon={<MdDownload className="text-lg" />}
                  w="full"
                  colorScheme="blue"
                  size="md"
                  onClick={handleDownloadPDF}
                >
                  <span className="text-sm sm:text-base">{t('Download PDF')}</span>
                </Button>
                <Button
                  leftIcon={<MdEdit className="text-lg" />}
                  w="full"
                  colorScheme="purple"
                  size="md"
                  onClick={() => {
                    console.log("Opening edit form with data:", editData);
                    setIsEditing(true);
                  }}
                >
                  <span className="text-sm sm:text-base">{t('Edit Officer')}</span>
                </Button>
              </div>
            </div>

            {/* Report Type Selection */}
            <div className="mb-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-gray-50 p-3 rounded-lg">
                <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                  {t('Report Type')}:
                </label>
                <div className="w-full sm:w-auto flex-1">
                  <select
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="daily">{t('Daily')}</option>
                    <option value="weekly">{t('Weekly')}</option>
                    <option value="monthly">{t('Monthly')}</option>
                  </select>
                </div>
                <span className="text-xs sm:text-sm text-gray-500 mt-1 sm:mt-0">
                  {reportType === 'daily' ? t('Today') :
                  reportType === 'weekly' ? t('This Week') :
                  t('This Month')}
                </span>
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
                {officerData?.updated_on ? dayjs(officerData.updated_on).format("D MMM, YYYY h:mm A") : '-'}
              </p>
            </div>
        {/* Allotted Users Table */}
        {userCollections.length > 0 ? (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="bg-white border-b border-gray-200 px-4 py-3 sm:px-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="mb-2 sm:mb-0">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800">
                    {t('Allotted Users & Collection Details')}
                  </h3>
                  <p className="hidden sm:block text-xs text-gray-500 mt-1">
                    {t('Users assigned to this officer and their collection information')}
                  </p>
                </div>
                <div className="text-xs text-gray-500">
                  {t('Showing')} <span className="font-medium">{userCollections.length}</span> {t('users')}
                </div>
              </div>
            </div>
            <div className="overflow-x-auto -mx-2 sm:mx-0">
              <Table
                columns={columns}
                data={tableData}
                isLoading={isLoading}
                className="min-w-full"
                p={0}
                m={0}
              />
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="text-gray-300 text-6xl mb-4">👥</div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">{t('No users allotted to this officer')}</h3>
            <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto">
              {t('Users will appear here when they are assigned to this officer')}
            </p>
            <div className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm">
              <span>💡 {t('Tip: Users are assigned to officers through the user management system')}</span>
            </div>
          </div>
        )}
      </div>

        {/* Edit Officer Drawer */}
        <Drawer 
          isOpen={isEditing} 
          placement="right" 
          onClose={() => setIsEditing(false)}
          size={["full", "md"]}
        >
          <DrawerOverlay />
          <DrawerContent>
            <DrawerCloseButton className="top-4 right-4" />
            <DrawerHeader className="border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">{t('Edit Officer Details')}</h2>
            </DrawerHeader>

            <DrawerBody className="p-4 sm:p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('Officer Name')}
                  </label>
                  <Input
                    value={editData?.name || ''}
                    onChange={(e) => setEditData({...editData, name: e.target.value})}
                    placeholder={t('Enter officer name')}
                    size="md"
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('Phone Number')}
                  </label>
                  <Input
                    type="tel"
                    value={editData?.phone_number || ''}
                    onChange={(e) => setEditData({...editData, phone_number: e.target.value})}
                    placeholder={t('Enter phone number')}
                    size="md"
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('Email')}
                  </label>
                  <Input
                    type="email"
                    value={editData?.email || ''}
                    onChange={(e) => setEditData({...editData, email: e.target.value})}
                    placeholder={t('Enter email address')}
                    size="md"
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('Address')}
                  </label>
                  <Input
                    value={editData?.address || ''}
                    onChange={(e) => setEditData({...editData, address: e.target.value})}
                    placeholder={t('Enter address')}
                    size="md"
                    className="w-full"
                  />
                </div>
              </div>
            </DrawerBody>

            <DrawerFooter className="border-t border-gray-200 px-4 py-3 sm:px-6">
              <div className="flex flex-col sm:flex-row w-full gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditing(false)}
                  flex={1}
                  size="md"
                >
                  {t('Cancel')}
                </Button>
                <Button 
                  colorScheme="blue" 
                  onClick={handleEditSave}
                  isLoading={isLoading}
                  flex={1}
                  size="md"
                >
                  {t('Save Changes')}
                </Button>
              </div>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </div>
    </>
  );
}

export default OfficerInfo;
