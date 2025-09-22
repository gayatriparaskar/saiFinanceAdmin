import React from "react";
import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useLocalTranslation } from "../../../../hooks/useLocalTranslation";

import axios from "../../../../axios";
import { FaArrowRightLong } from "react-icons/fa6";
import Correct from "../../../../Images/Vector.png";
import bgImage from "../../../../Images/Section (2).png";
import Info from "../../../../Images/ph_info-duotone.png";
import Table from "../../../../componant/Table/Table";
import Cell from "../../../../componant/Table/cell";
import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  InputGroup,
  InputLeftElement,
  Input,
  Button,
  InputRightAddon,
  useDisclosure,
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  useToast,
  Select,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  FormControl,
  FormLabel,
} from "@chakra-ui/react";

import { MdEdit } from "react-icons/md";
import { HiStatusOnline } from "react-icons/hi";
import { FaPlus } from "react-icons/fa";

function ManagerLoanAccount() {
  const { t } = useLocalTranslation();
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [newID, setNewID] = useState(null);
  const [totalLoanAmt, setTotalLoanAmt] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editData, setEditData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoadingOfficers, setIsLoadingOfficers] = useState(false);
  const [officers, setOfficers] = useState([]);
  const [isOfficerChangeModalOpen, setIsOfficerChangeModalOpen] = useState(false);
  const [selectedUserForOfficerChange, setSelectedUserForOfficerChange] = useState(null);
  const [newOfficerId, setNewOfficerId] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const usersPerPage = 10;
  const toast = useToast()
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = React.useRef();

  // Sort functions
  const getSortDisplayName = (sortKey) => {
    const sortNames = {
      'amount_high_to_low': 'Amount (High to Low)',
      'amount_low_to_high': 'Amount (Low to High)',
      'name_a_to_z': 'Name (A to Z)',
      'name_z_to_a': 'Name (Z to A)',
      'date_newest': 'Date (Newest)',
      'date_oldest': 'Date (Oldest)',
      'emi_days_high': 'EMI Days (High)',
      'emi_days_low': 'EMI Days (Low)'
    };
    return sortNames[sortKey] || sortKey;
  };

  const handleSort = (sortKey) => {
    setSortBy(sortKey);
    
    let sortedData = [...filteredData];
    
    switch (sortKey) {
      case 'amount_high_to_low':
        sortedData.sort((a, b) => (b.active_loan_id?.loan_amount || 0) - (a.active_loan_id?.loan_amount || 0));
        break;
      case 'amount_low_to_high':
        sortedData.sort((a, b) => (a.active_loan_id?.loan_amount || 0) - (b.active_loan_id?.loan_amount || 0));
        break;
      case 'name_a_to_z':
        sortedData.sort((a, b) => (a.full_name || '').localeCompare(b.full_name || ''));
        break;
      case 'name_z_to_a':
        sortedData.sort((a, b) => (b.full_name || '').localeCompare(a.full_name || ''));
        break;
      case 'date_newest':
        sortedData.sort((a, b) => new Date(b.active_loan_id?.created_on || 0) - new Date(a.active_loan_id?.created_on || 0));
        break;
      case 'date_oldest':
        sortedData.sort((a, b) => new Date(a.active_loan_id?.created_on || 0) - new Date(b.active_loan_id?.created_on || 0));
        break;
      case 'emi_days_high':
        sortedData.sort((a, b) => (b.active_loan_id?.remaining_emi_days || 0) - (a.active_loan_id?.remaining_emi_days || 0));
        break;
      case 'emi_days_low':
        sortedData.sort((a, b) => (a.active_loan_id?.remaining_emi_days || 0) - (b.active_loan_id?.remaining_emi_days || 0));
        break;
      default:
        break;
    }
    
    setFilteredData(sortedData);
  };

  // Fetch collection officers only
  const fetchOfficers = async () => {
    try {
      setIsLoadingOfficers(true);
      const response = await axios.get("officers");
      console.log('🔍 Raw officers response:', response?.data);
      
      if (response?.data?.result) {
        // Filter to show ONLY collection officers
        const collectionOfficers = response.data.result.filter(officer => {
          // Check officer_type field specifically (from backend model)
          const officerType = officer.officer_type;
          
          // Only include officers with collection_officer type specifically
          const isCollectionOfficer = officerType === "collection_officer";
          
          return isCollectionOfficer;
        });
        
        console.log('👥 All officers:', response.data.result.length);
        console.log('👥 Collection officers found:', collectionOfficers.length);
        console.log('👥 Sample officer data:', response.data.result[0]);
        
        setOfficers(collectionOfficers);
        
        if (collectionOfficers.length === 0) {
          console.log('⚠️ No collection officers found');
          setOfficers([]);
          
          // Show a toast to inform the user
          toast({
            title: t("No collection officers found"),
            description: t("No officers with officer_type='collection_officer' found. Please check officer data."),
            status: "warning",
            duration: 5000,
            isClosable: true,
          });
        }
      }
    } catch (error) {
      console.error("❌ Error fetching officers:", error);
      toast({
        title: t("Error fetching officers"),
        description: t("Failed to load collection officers. Please try again."),
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoadingOfficers(false);
    }
  };

  const fetchData = async () => {
    try {
      const response = await axios.get("users/");
      if (response?.data) {
        setData(response?.data?.result);
        console.log("🔄 Fresh data fetched:", response?.data?.result);
        setFilteredData(response?.data?.result);
        
        // Calculate total loan amount
        const sum = response.data.result.reduce((acc, item) => {
          return acc + (item.active_loan_id?.loan_amount || 0);
        }, 0);
        setTotalLoanAmt(sum);
      }
    } catch (error) {
      console.error("❌ Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
    fetchOfficers();
  }, []);

  useEffect(() => {
    let result = data;
    
    // Apply search filter
    if (searchTerm) {
      result = result.filter(user =>
        user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone_number?.includes(searchTerm) ||
        user.active_loan_id?.loan_amount?.toString().includes(searchTerm)
      );
    }

    // Apply sorting
    if (sortBy) {
      result = [...result].sort((a, b) => {
        let aValue, bValue;
        
        if (sortBy === 'full_name') {
          aValue = a.full_name || '';
          bValue = b.full_name || '';
        } else if (sortBy === 'loan_amount') {
          aValue = a.active_loan_id?.loan_amount || 0;
          bValue = b.active_loan_id?.loan_amount || 0;
        } else if (sortBy === 'created_on') {
          aValue = new Date(a.active_loan_id?.created_on || 0);
          bValue = new Date(b.active_loan_id?.created_on || 0);
        } else {
          aValue = a[sortBy] || '';
          bValue = b[sortBy] || '';
        }

        if (sortOrder === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });
    }

    setFilteredData(result);
  }, [data, searchTerm, sortBy, sortOrder]);

  const totalPages = Math.ceil(filteredData.length / usersPerPage);
  const startIndex = (currentPage - 1) * usersPerPage;
  const endIndex = startIndex + usersPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  const handleViewLoan = (userId) => {
    navigate(`/manager-dashboard/view-loan-user/${userId}`);
  };

  const handleEditLoan = (userId) => {
    navigate(`/manager-dashboard/add-daily-collection/${userId}`);
  };

  const handleEditLoanAccount = (user) => {
    setEditData(user);
    setIsEditing(true);
  };


  // Handle edit save
  const handleEditSave = async () => {
    try {
      // Validate required fields
      if (!editData?.full_name || !editData?.phone_number) {
        toast({
          title: t("Validation Error"),
          description: t("Full name and phone number are required"),
          status: "error",
          duration: 4000,
          isClosable: true,
        });
        return;
      }

      // Update user details
      const userUpdateData = {
        full_name: editData.full_name,
        phone_number: editData.phone_number,
        email: editData.email || "",
        address: editData.address || "",
        officer_id: editData.officer_id?._id || editData.officer_id || null
      };

      // Update loan details
      const loanUpdateData = {
        loan_amount: editData.active_loan_id?.loan_amount || 0,
        total_amount: editData.active_loan_id?.total_amount || 0,
        emi_day: editData.active_loan_id?.emi_day || 0,
        total_due_amount: editData.active_loan_id?.total_due_amount || 0,
        interest_rate: editData.active_loan_id?.interest_rate || 0,
        principle_amount: editData.active_loan_id?.principle_amount || 0,
        total_penalty_amount: editData.active_loan_id?.total_penalty_amount || 0,
        created_on: editData.active_loan_id?.created_on || new Date(),
        end_date: editData.active_loan_id?.end_date || new Date()
      };

      // Update user details
      const userResponse = await axios.put(`users/${editData._id}`, userUpdateData);
      
      // Update loan details using admin route
      const loanResponse = await axios.put(`users/${editData._id}`, {
        ...userUpdateData,
        ...loanUpdateData
      });

      if (userResponse.data && loanResponse.data) {
        toast({
          title: t("User and Loan details updated successfully"),
          status: "success",
          duration: 4000,
          isClosable: true,
          position: "top"
        });

        // Update local state with new data
        const updatedData = data.map((item) =>
          item._id === editData._id ? { ...item, ...editData } : item
        );
        
        setData(updatedData);
        setFilteredData(updatedData);
        setIsEditing(false);
        setEditData(null);
      }
    } catch (err) {
      console.error("Update error:", err);
      toast({
        title: t("Update Failed"),
        description: err.response?.data?.message || t("Failed to update user and loan details"),
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    }
  };

  const handleEditClose = () => {
    setIsEditing(false);
    setEditData(null);
  };

  const handleOfficerChange = (user) => {
    setSelectedUserForOfficerChange(user);
    setNewOfficerId(user.officer_id || "");
    setIsOfficerChangeModalOpen(true);
  };

  const confirmOfficerChange = async () => {
    if (!selectedUserForOfficerChange || !newOfficerId) return;

    try {
      const response = await axios.put(`users/${selectedUserForOfficerChange._id}`, {
        officer_id: newOfficerId
      });

      if (response.data.success) {
        toast({
          title: t("Officer updated successfully"),
          description: t("User's assigned officer has been updated."),
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        
        // Refresh data
        fetchData();
        setIsOfficerChangeModalOpen(false);
        setSelectedUserForOfficerChange(null);
        setNewOfficerId("");
      }
    } catch (error) {
      console.error("Error updating officer:", error);
      toast({
        title: t("Error updating officer"),
        description: t("Failed to update user's assigned officer."),
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const columns = useMemo(() => [
    {
      Header: t('SR NO.'),
      accessor: "srNo",
      Cell: ({ row }) => startIndex + row.index + 1,
    },
    {
      Header: t('ACCOUNT HOLDER'),
      accessor: "full_name",
      Cell: ({ value }) => <Cell text={value || t('N/A')} />,
    },
    {
      Header: t('Officer Alloted'),
      accessor: "officer_name",
      Cell: ({ value, row: { original } }) => {
        const officer = original?.officer_id;
        if (!officer) {
          return (
            <div className="flex flex-col">
              <Cell text={t("No Officer Assigned")} />
              <span className="text-xs text-red-500">{t("Unassigned")}</span>
            </div>
          );
        }
        
        return (
          <div className="flex flex-col">
            <Cell text={officer.name || officer.full_name || 'Unknown'} />
            {officer.officer_code && (
              <span className="text-xs text-gray-500">
                Code: {officer.officer_code}
              </span>
            )}
            {officer.role && (
              <span className="text-xs text-blue-500">
                Role: {officer.role}
              </span>
            )}
          </div>
        );
      },
    },
    {
      Header: t('LOAN AMOUNT'),
      accessor: "loan_amount",
      Cell: ({ value, row: { original } }) => (
        <Cell text={`Rs. ${original?.active_loan_id?.loan_amount || 0}`} />
      ),
    },
    {
      Header: t('TOTAL AMOUNT'),
      accessor: "total_amount",
      Cell: ({ value, row: { original } }) => (
        <Cell text={`Rs. ${original?.active_loan_id?.total_amount || 0}`} />
      ),
    },
    {
      Header: t('EMI DAY'),
      accessor: "emi_day",
      Cell: ({ value, row: { original } }) => (
        <Cell text={original?.active_loan_id?.emi_day || t('N/A')} />
      ),
    },
    {
      Header: t('REMAINING EMI DAYS'),
      accessor: "remaining_emi_days",
      Cell: ({ value, row: { original } }) => {
        const remainingDays = original?.active_loan_id?.remaining_emi_days;
        return (
          <Cell 
            text={remainingDays ? `${remainingDays} days` : t('N/A')} 
            className={remainingDays && remainingDays < 30 ? 'text-red-600 font-semibold' : ''}
          />
        );
      },
    },
    {
      Header: t('TOTAL DUE AMOUNT'),
      accessor: "total_due_amount",
      Cell: ({ value, row: { original } }) => (
        <Cell text={`Rs. ${original?.active_loan_id?.total_due_amount || 0}`} />
      ),
    },
    {
      Header: t('DATE CREATED'),
      accessor: "created_on",
      Cell: ({ value, row: { original } }) => (
        <Cell text={original?.active_loan_id?.created_on ? dayjs(original.active_loan_id.created_on).format('DD MMM, YYYY h:mm A') : t('N/A')} />
      ),
    },
    {
      Header: t('END DATE'),
      accessor: "end_date",
      Cell: ({ value, row: { original } }) => (
        <Cell text={original?.active_loan_id?.end_date ? dayjs(original.active_loan_id.end_date).format('DD MMM, YYYY') : t('N/A')} />
      ),
    },
    {
      Header: t('PHONE'),
      accessor: "phone_number",
      Cell: ({ value }) => <Cell text={value || t('N/A')} />,
    },
    {
      Header: t('STATUS'),
      accessor: "status",
      Cell: ({ value, row: { original } }) => {
        // For loan accounts, check if user has an active loan (active_loan_id exists)
        const hasActiveLoan = original?.active_loan_id && original.active_loan_id !== null;
        const isActive = hasActiveLoan;
        
        return (
          <div className="flex items-center space-x-2">
            <HiStatusOnline className={`h-4 w-4 ${isActive ? 'text-green-500' : 'text-red-500'}`} />
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              isActive 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {isActive ? t('Active') : t('Inactive')}
            </span>
          </div>
        );
      },
    },
    {
      Header: t('ACTION'),
      accessor: "action",
      Cell: ({ value, row: { original } }) => (
        <div className="flex space-x-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleViewLoan(original._id)}
            className="text-primary hover:text-primaryDark p-1"
            title="View Details"
          >
            <HiStatusOnline />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleEditLoan(original._id)}
            className="text-secondary hover:text-secondaryDark p-1"
            title="Add Collection"
          >
            <FaPlus />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleEditLoanAccount(original)}
            className="text-green-600 hover:text-green-800 p-1"
            title="Edit Account"
          >
            <MdEdit />
          </motion.button>
          <Menu>
            <MenuButton as={Button} size="sm" variant="ghost">
              ⋮
            </MenuButton>
            <MenuList>
              <MenuItem onClick={() => handleOfficerChange(original)}>
                {t('Change Officer')}
              </MenuItem>
            </MenuList>
          </Menu>
        </div>
      ),
    },
  ], [data, currentPage, officers, startIndex, t]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-gray-50"
    >
      {/* Header Section */}
      <motion.div
        variants={itemVariants}
        className="flex-shrink-0 pb-0 px-4 mb-0"
      >
        <section className="md:p-0">
          <div className="py-0 mt-8 mb-4">
                         <motion.div 
               variants={itemVariants}
               className="flex justify-between items-center mb-0 loan-header-responsive"
             >

              {/* Stats Section */}
                 <motion.div
                   variants={itemVariants}
                   className="flex gap-2 stats-section"
                 >
                   <Menu>
                     <MenuButton
                       as={Button}
                       colorScheme="blue"
                       className="bg-primary hover:bg-primaryDark text-white text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
                       fontWeight={700}
                     >
                       <span className="hidden sm:inline">{t('Total Loan Outgoing')} : ₹ {totalLoanAmt.toLocaleString()}</span>
                       <span className="sm:hidden">Total: ₹{totalLoanAmt.toLocaleString()}</span>
                     </MenuButton>
                   </Menu>
                   <Menu>
                     <MenuButton
                       as={Button}
                       colorScheme="purple"
                       className="bg-secondary hover:bg-secondaryDark text-white text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
                       fontWeight={700}
                     >
                       <span className="hidden sm:inline">{t('Total Active User')} : {data.length}</span>
                       <span className="sm:hidden">Active: {data.length}</span>
                     </MenuButton>
                   </Menu>
                   
                 </motion.div>
                   {/* Search Section */}
                <motion.div
                  variants={itemVariants}
                  className="w-84 search-section"
                >
                  <InputGroup borderRadius={5} size="sm">
                    <InputLeftElement pointerEvents="none" />
                    <Input
                      type="text"
                      placeholder={t('Search...')}
                      focusBorderColor="blue.500"
                      border="1px solid #949494"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <InputRightAddon p={0} border="none">
                      <Button
                        className="bg-primary hover:bg-primaryDark text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
                        colorScheme="blue"
                        size="sm"
                        borderLeftRadius={0}
                        borderRightRadius={3.3}
                        border="1px solid #949494"
                      >
                        {t('Search')}
                      </Button>
                    </InputRightAddon>
                  </InputGroup>
                </motion.div>

                 {/* Actions Section */}
                 <motion.div
                   variants={itemVariants}
                   className="flex gap-2 actions-section"
                 >
                   <Menu>
                     <MenuButton
                       as={Button}
                       colorScheme="gray"
                       className="bg-gray-600 hover:bg-gray-700 text-white text-xs sm:text-sm px-3 sm:px-4 py-2 sm:py-2 rounded-lg shadow-md font-medium"
                       rightIcon={<span className="text-xs">▼</span>}
                     >
                       <span className="hidden sm:inline">📊 {t('Sort By', 'Sort By')}</span>
                       <span className="sm:hidden">📊 Sort</span>
                       {sortBy && (
                         <span className="ml-1 text-xs bg-gray-500 px-2 py-1 rounded-full">
                           {getSortDisplayName(sortBy)} {sortOrder === 'asc' ? '↑' : '↓'}
                         </span>
                       )}
                     </MenuButton>
                     <MenuList 
                       className="bg-white border border-gray-200 rounded-lg shadow-lg py-2 min-w-[200px] z-50"
                       placement="bottom-start"
                       zIndex={9999}
                     >
                       <MenuItem 
                         onClick={() => handleSort('amount_high_to_low')}
                         className="hover:bg-blue-50 px-4 py-2 text-sm"
                       >
                         <span className="flex items-center justify-between w-full">
                           <span>💰 {t('Amount High to Low')}</span>
                           {sortBy === 'amount_high_to_low' && (
                             <span className="text-blue-600 font-bold">
                               {sortOrder === 'asc' ? '↑' : '↓'}
                             </span>
                           )}
                         </span>
                       </MenuItem>
                       <MenuItem 
                         onClick={() => handleSort('amount_low_to_high')}
                         className="hover:bg-blue-50 px-4 py-2 text-sm"
                       >
                         <span className="flex items-center justify-between w-full">
                           <span>💰 {t('Amount Low to High')}</span>
                           {sortBy === 'amount_low_to_high' && (
                             <span className="text-blue-600 font-bold">
                               {sortOrder === 'asc' ? '↑' : '↓'}
                             </span>
                           )}
                         </span>
                       </MenuItem>
                       <MenuItem 
                         onClick={() => handleSort('name_a_z')}
                         className="hover:bg-blue-50 px-4 py-2 text-sm"
                       >
                         <span className="flex items-center justify-between w-full">
                           <span>👤 {t('Name A-Z')}</span>
                           {sortBy === 'name_a_z' && (
                             <span className="text-blue-600 font-bold">
                               {sortOrder === 'asc' ? '↑' : '↓'}
                             </span>
                           )}
                         </span>
                       </MenuItem>
                       <MenuItem 
                         onClick={() => handleSort('date_created')}
                         className="hover:bg-blue-50 px-4 py-2 text-sm"
                       >
                         <span className="flex items-center justify-between w-full">
                           <span>📅 {t('Date Created')}</span>
                           {sortBy === 'date_created' && (
                             <span className="text-blue-600 font-bold">
                               {sortOrder === 'asc' ? '↑' : '↓'}
                             </span>
                           )}
                         </span>
                       </MenuItem>
                       {sortBy && (
                         <MenuItem 
                           onClick={() => { setSortBy(''); setSortOrder('asc'); }}
                           className="hover:bg-red-50 px-4 py-2 text-sm border-t border-gray-200 mt-1"
                         >
                           <span className="flex items-center text-red-600">
                             <span className="mr-2">🗑️</span>
                             {t('Clear Sort', 'Clear Sort')}
                           </span>
                         </MenuItem>
                       )}
                     </MenuList>
                   </Menu>

                   <Link to={`/dash/create-loan-user`} onClick={() => console.log('🔄 Navigating to create loan user...')}>
                     <Button
                       colorScheme="blue"
                       className="bg-primary hover:bg-primaryDark text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
                     >
                       <span className="hidden sm:inline">{t('Add New User', 'Add New User')}</span>
                       <span className="sm:hidden">Add User</span>
                     </Button>
                   </Link>
                   <Button
                     colorScheme="blue"
                     className="bg-blue-500 hover:bg-blue-600 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 mr-2"
                     onClick={fetchData}
                   >
                     <span className="hidden sm:inline">{t('Refresh Data', 'Refresh Data')}</span>
                     <span className="sm:hidden">Refresh</span>
                   </Button>
                
                 </motion.div>
             </motion.div>
          </div>
        </section>
      </motion.div>
      {/* Table */}
      <motion.div
        variants={itemVariants}
        className="max-w-7xl mx-auto px-4 pb-6"
      >
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <Table
            data={paginatedData}
            columns={columns}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </motion.div>

      {/* Officer Change Modal */}
      <AlertDialog
        isOpen={isOfficerChangeModalOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => setIsOfficerChangeModalOpen(false)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              {t('Change Officer')}
            </AlertDialogHeader>
            <AlertDialogBody>
              <p className="mb-4">{t('Select new officer for')} {selectedUserForOfficerChange?.full_name}:</p>
              <Select
                value={newOfficerId}
                onChange={(e) => setNewOfficerId(e.target.value)}
                placeholder={t('Select Officer')}
              >
                {officers.map((officer) => (
                  <option key={officer._id} value={officer._id}>
                    {officer.name}
                  </option>
                ))}
              </Select>
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setIsOfficerChangeModalOpen(false)}>
                {t('Cancel')}
              </Button>
              <Button colorScheme="blue" onClick={confirmOfficerChange} ml={3}>
                {t('Update Officer')}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {/* Edit Loan Account Drawer */}
      <Drawer isOpen={isEditing} placement="right" onClose={handleEditClose} size="lg">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>{t('Edit User & Loan Details')}</DrawerHeader>
          <DrawerBody>
            {editData && (
              <div className="space-y-6">
                {/* Personal Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-purple">{t('Personal Information')}</h3>
                  <div className="space-y-4">
                    <FormControl>
                      <FormLabel>{t('Full Name')} *</FormLabel>
                      <Input
                        placeholder={t('Full Name')}
                        value={editData?.full_name || ""}
                        onChange={(e) =>
                          setEditData({ ...editData, full_name: e.target.value })
                        }
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>{t('Phone Number')} *</FormLabel>
                      <Input
                        placeholder={t('Phone Number')}
                        value={editData?.phone_number || ""}
                        onChange={(e) =>
                          setEditData({ ...editData, phone_number: e.target.value })
                        }
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>{t('Email')}</FormLabel>
                      <Input
                        placeholder={t('Email')}
                        value={editData?.email || ""}
                        onChange={(e) =>
                          setEditData({ ...editData, email: e.target.value })
                        }
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>{t('Address')}</FormLabel>
                      <Input
                        placeholder={t('Address')}
                        value={editData?.address || ""}
                        onChange={(e) =>
                          setEditData({ ...editData, address: e.target.value })
                        }
                      />
                    </FormControl>
                  </div>
                </div>

                {/* Officer Selection */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-purple">{t('Officer Allocation')}</h3>
                  <FormControl>
                    <FormLabel>{t('Collection Officer')}</FormLabel>
                    <Select
                      placeholder={officers.length === 0 ? 'No officers available' : t('Select Officer')}
                      value={editData?.officer_id?._id || ''}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          officer_id: officers.find(officer => officer._id === e.target.value) || null
                        })
                      }
                      isLoading={isLoadingOfficers}
                      isDisabled={isLoadingOfficers || officers.length === 0}
                    >
                      {officers.map((officer) => (
                        <option key={officer._id} value={officer._id}>
                          {officer.name}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                </div>

                {/* Loan Details */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-purple">{t('Loan Details')}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormControl>
                      <FormLabel>{t('Loan Amount')}</FormLabel>
                      <Input
                        type="number"
                        value={editData?.active_loan_id?.loan_amount || ""}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            active_loan_id: {
                              ...editData.active_loan_id,
                              loan_amount: Number(e.target.value)
                            }
                          })
                        }
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>{t('EMI Day')}</FormLabel>
                      <Input
                        type="number"
                        value={editData?.active_loan_id?.emi_day || ""}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            active_loan_id: {
                              ...editData.active_loan_id,
                              emi_day: Number(e.target.value)
                            }
                          })
                        }
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>{t('Interest Rate')}</FormLabel>
                      <Input
                        type="number"
                        value={editData?.active_loan_id?.interest_rate || ""}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            active_loan_id: {
                              ...editData.active_loan_id,
                              interest_rate: Number(e.target.value)
                            }
                          })
                        }
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>{t('Total Due Amount')}</FormLabel>
                      <Input
                        type="number"
                        value={editData?.active_loan_id?.total_due_amount || ""}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            active_loan_id: {
                              ...editData.active_loan_id,
                              total_due_amount: Number(e.target.value)
                            }
                          })
                        }
                      />
                    </FormControl>
                  </div>
                </div>
              </div>
            )}
          </DrawerBody>
          <DrawerFooter>
            <Button variant="outline" mr={3} onClick={handleEditClose}>
              {t('Cancel')}
            </Button>
            <Button colorScheme="blue" onClick={handleEditSave}>
              {t('Save Changes')}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </motion.div>
  );
}

export default ManagerLoanAccount;