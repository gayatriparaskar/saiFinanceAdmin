import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import axios from "../../../../axios";
import jsPDF from 'jspdf';
import autoTable from "jspdf-autotable";
import { useLocalTranslation } from "../../../../hooks/useLocalTranslation";
import OfficerNavbar from "../../../../components/OfficerNavbar";
import Table from "../../../../componant/Table/Table";
import Cell from "../../../../componant/Table/cell";
import {
  Button,
  useDisclosure,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useToast,
  Badge,
} from "@chakra-ui/react";
import { MdDownload } from "react-icons/md";


function ManagerViewOfficer() {
  const { t } = useLocalTranslation();
  const { id } = useParams();
  const [officerData, setOfficerData] = useState({});
  const [allocatedUsers, setAllocatedUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(false);
  const toast = useToast();
  
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Inside your component
const navigate = useNavigate();
  // Fetch allocated users for this officer
 const fetchAllocatedUsers = async () => {
  try {
    setUsersLoading(true);
    console.log("🔍 Fetching users for officer ID:", id);

    // Get specific officer details by ID
    const response = await axios.get(`officers/${id}`);
    const officerData = response?.data?.result;

    console.log("📊 Officer response:", officerData);

    if (officerData?._id === id) {
      console.log("👮 Officer matched, fetching allocated users...");

      const allUsers = officerData.user_collections || [];
      console.log("👥 Users under this officer:", allUsers);

      // Directly set officer's allocated users
      setAllocatedUsers(allUsers);
    } else {
      console.log("⚠️ Officer ID did not match, no users allocated.");
      setAllocatedUsers([]);
    }
  } catch (error) {
    console.error("Error fetching allocated users:", error);
    toast({
      title: "Error fetching allocated users",
      description: error.response?.data?.message || "Something went wrong",
      status: "error",
      duration: 4000,
      isClosable: true,
    });
  } finally {
    setUsersLoading(false);
  }
};


  useEffect(() => {
    async function fetchOfficerData() {
      try {
        setIsLoading(true);
        console.log('🔍 Fetching officer data for ID:', id);
        const response = await axios.get(`officers/${id}`);
        console.log('👮 Officer response:', response?.data?.result);
        
        if (response?.data?.result) {
          setOfficerData(response.data.result);
          console.log('✅ Officer data set:', response.data.result);
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
      fetchAllocatedUsers();
    }
  }, [id, toast]);

  // Define table columns for allocated users


const columns = React.useMemo(() => [
  {
    Header: t('SR NO.'),
    accessor: 'sr_no',
    Cell: ({ row }) => <Cell text={row.index + 1} />
  },
  {
    Header: t('USER NAME'),
    accessor: 'name',
    Cell: ({ value }) => <Cell text={value || '-'} />
  },
  {
    Header: t('PHONE NUMBER'),
    accessor: 'phone_number',
    Cell: ({ value }) => <Cell text={value || '-'} />
  },
  {
    Header: t('ACCOUNT TYPE'),
    accessor: 'account_type',
    Cell: ({ value, row: { original } }) => {
      let accountType = 'N/A';
      if (original.active_loan_id && original.saving_account_id) {
        accountType = 'both';
      } else if (original.active_loan_id) {
        accountType = 'loan';
      } else if (original.saving_account_id) {
        accountType = 'saving';
      }
      return (
        <Badge colorScheme={
          accountType === 'loan' ? 'blue' : accountType === 'saving' ? 'green' : accountType === 'both' ? 'purple' : 'gray'
        }>
          {accountType}
        </Badge>
      );
    }
  },
  {
    Header: t('STATUS'),
    accessor: 'is_deleted',
    Cell: ({ value, row: { original } }) => {
      const isActive = !value && !original.is_on_hold;
      return (
        <Badge colorScheme={isActive ? 'green' : 'red'}>
          {isActive ? 'Active' : 'Inactive'}
        </Badge>
      );
    }
  },
  {
    Header: t('CREATED DATE'),
    accessor: 'createdAt',
    Cell: ({ value }) => (
      <Cell text={value ? dayjs(value).format('DD MMM, YYYY') : 'N/A'} />
    )
  },
  {
    Header: t('ACTIONS'),
    accessor: 'actions',
    Cell: ({ row: { original } }) => {
      const handleView = () => {
        if (original.active_loan_id) {
          navigate(`/view-loan-user/${original._id}`);
        } else if (original.saving_account_id) {
          navigate(`/view-savingUser-details/${original._id}`);
        } else {
          toast({
            title: "No account found",
            description: "This user doesn't have loan or saving account.",
            status: "info",
            duration: 3000,
            isClosable: true,
          });
        }
      };

      return (
        <Button colorScheme="blue" size="sm" onClick={handleView}>
          View
        </Button>
      );
    }
  }
], [t, navigate]);


  // Generate PDF for officer details
  const generateOfficerPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('Officer Details Report', 20, 20);
    doc.setFontSize(12);
    doc.text(`Name: ${officerData.name}`, 20, 40);
    doc.text(`Officer Code: ${officerData.officer_code || 'N/A'}`, 20, 50);
    doc.text(`Phone: ${officerData.phone_number}`, 20, 60);
    doc.text(`Join Date: ${officerData.createdAt ? dayjs(officerData.createdAt).format('DD MMM, YYYY') : 'N/A'}`, 20, 70);
    doc.text(`Officer Type: ${officerData.officer_type || 'N/A'}`, 20, 80);
    doc.text(`Total Allocated Users: ${allocatedUsers.length}`, 20, 90);
    doc.save(`officer-${officerData.name}-details.pdf`);
  };

  // Generate PDF for allocated users
  const generateUsersPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text(`Users Allocated to ${officerData.name}`, 20, 20);
    doc.setFontSize(12);
    
    if (allocatedUsers.length > 0) {
      const tableData = allocatedUsers.map((user, index) => [
        index + 1,
        user.name || 'N/A',
        user.phone_number || 'N/A',
        user.user_type || 'N/A',
        user.status || 'N/A',
        user.createdAt ? dayjs(user.createdAt).format('DD MMM, YYYY') : 'N/A'
      ]);

      autoTable(doc, {
        head: [['Sr. No.', 'User Name', 'Phone Number', 'Account Type', 'Status', 'Created Date']],
        body: tableData,
        startY: 40,
        styles: { fontSize: 10 },
        headStyles: { fillColor: [66, 139, 202] }
      });
    } else {
      doc.text('No users allocated to this officer', 20, 40);
    }
    
    doc.save(`officer-${officerData.name}-allocated-users.pdf`);
  };

  // Get officer info for navbar
  const getOfficerType = () => {
    return localStorage.getItem('officerType') || 'manager';
  };

  const getOfficerName = () => {
    return localStorage.getItem('officerName') || 'Manager';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-primaryBg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('Loading officer details...')}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* <OfficerNavbar 
        officerType={getOfficerType()} 
        officerName={getOfficerName()} 
        pageName="Officer Details" 
      /> */}
      <div className="px-2 sm:px-4 lg:px-6 bg-primaryBg pt-4">
        <section className="md:p-1">
          <div className="py-2">
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 sm:gap-6">
              {/* Officer Information Section */}
              <div className="flex flex-col gap-4 text-start w-full lg:w-auto">
                <h2 className="text-lg sm:text-xl font-bold text-purple text-oswald">
                  {t('Name', 'Name')}: <span className="ml-2 lg:ml-4 text-base sm:text-lg">{officerData?.name}</span>
                </h2>
                <div className="flex flex-col lg:flex-row gap-4 lg:gap-20">
                  <h2 className="text-lg font-bold text-purple text-oswald">
                    {t('Officer Code', 'Officer Code')}:
                    <span className="ml-2 lg:ml-4">
                      {officerData?.officer_code || 'N/A'}
                    </span>
                  </h2>
                  <h2 className="text-lg font-bold text-purple text-oswald">
                    {t('Join Date', 'Join Date')}:
                    <span className="ml-2 lg:ml-4">
                      {officerData?.createdAt ? dayjs(officerData.created_on).format('D MMM, YYYY') : 'N/A'}
                    </span>
                  </h2>
                </div>
                <div className="flex flex-col lg:flex-row gap-4 lg:gap-20">
                  <h2 className="text-lg font-bold text-purple text-oswald">
                    {t('Phone Number', 'Phone Number')}:
                    <span className="ml-2 lg:ml-4">
                      {officerData?.phone_number || 'N/A'}
                    </span>
                  </h2>
                  <h2 className="text-lg font-bold text-purple text-oswald">
                    {t('Officer Type', 'Officer Type')}:
                    <span className="ml-2 lg:ml-4">
                      {officerData?.officer_type || 'N/A'}
                    </span>
                  </h2>
                </div>
              </div>

              {/* Buttons Section */}
              <div className="flex flex-col gap-3 sm:gap-4 w-full lg:w-auto lg:items-end">
                {/* Summary Buttons Row */}
                <div className="flex flex-col sm:flex-row gap-2 lg:gap-3 w-full lg:w-auto">
                  <Button
                    colorScheme="blue"
                    size="sm"
                    borderRadius="md"
                    px={2}
                    className="bg-primaryDark hover:bg-primaryLight w-full sm:w-auto text-xs sm:text-sm"
                  >
                    <span className="truncate">Total Allocated Users: {allocatedUsers.length}</span>
                  </Button>

                  <Button
                    colorScheme="blue"
                    size="sm"
                    borderRadius="md"
                    px={2}
                    className="bg-primaryDark hover:bg-primaryLight w-full sm:w-auto text-xs sm:text-sm"
                  >
                    <span className="truncate">Active Users: {allocatedUsers.filter(user => user.status === 'active' || !user.is_deleted).length}</span>
                  </Button>

                  <Button
                    colorScheme="blue"
                    size="sm"
                    borderRadius="md"
                    px={2}
                    className="bg-primaryDark hover:bg-primaryLight w-full sm:w-auto text-xs sm:text-sm"
                  >
                    <span className="truncate">Loan Users: {allocatedUsers.filter(user => user.active_loan_id || user.account_type === 'loan account').length}</span>
                  </Button>

                  <Button
                    colorScheme="blue"
                    size="sm"
                    borderRadius="md"
                    px={2}
                    className="bg-primaryDark hover:bg-primaryLight w-full sm:w-auto text-xs sm:text-sm"
                  >
                    <span className="truncate">Saving Users: {allocatedUsers.filter(user => user.saving_account_id || user.account_type === 'saving account').length}</span>
                  </Button>
                </div>

                {/* Action Buttons Row */}
                <div className="flex flex-col sm:flex-row gap-2 lg:gap-3 w-full lg:w-auto">
                  <Menu>
                    <MenuButton
                      as={Button}
                      colorScheme="blue"
                      size="sm"
                      borderRadius="md"
                      px={2}
                      className="w-full sm:w-auto text-xs sm:text-sm"
                      rightIcon={<span>▼</span>}
                      leftIcon={<MdDownload />}
                    >
                      {t('Download PDF', 'Download PDF')}
                    </MenuButton>
                    <MenuList bg="white" border="1px solid #e2e8f0" boxShadow="lg" zIndex={10000}>
                      <MenuItem onClick={generateOfficerPDF} _hover={{ bg: "gray.100" }}>
                        {t('Download Officer Details', 'Download Officer Details')}
                      </MenuItem>
                      <MenuItem onClick={generateUsersPDF} _hover={{ bg: "gray.100" }}>
                        {t('Download Allocated Users', 'Download Allocated Users')}
                      </MenuItem>
                    </MenuList>
                  </Menu>

                  <Button
                    colorScheme="purple"
                    size="sm"
                    borderRadius="md"
                    px={2}
                    className="w-full sm:w-auto text-xs sm:text-sm"
                    onClick={fetchAllocatedUsers}
                    isLoading={usersLoading}
                  >
                    {t('Refresh Users', 'Refresh Users')}
                  </Button>
                </div>
              </div>
            </div>

            <div className="mt-2">
              <Table
                isLoading={usersLoading}
                data={allocatedUsers || []}
                columns={columns}
              />
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

export default ManagerViewOfficer;