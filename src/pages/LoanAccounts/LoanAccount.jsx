import React from "react";
import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useLocalTranslation } from "../../hooks/useLocalTranslation";

import axios from "../../axios";
import { FaArrowRightLong } from "react-icons/fa6";
import Correct from "../../Images/Vector.png";
import bgImage from "../../Images/Section (2).png";
import Info from "../../Images/ph_info-duotone.png";
import Table from "../../componant/Table/Table";
import Cell from "../../componant/Table/cell";
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
} from "@chakra-ui/react";

import { MdEdit, MdDelete } from "react-icons/md";
import { HiStatusOnline } from "react-icons/hi";

function LoanAccount() {
  const { t } = useLocalTranslation();
  const [data, setData] = useState([]);
  const [newID, setNewID] = useState(null);
  const [totalLoanAmt, setTotalLoanAmt] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editData, setEditData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [officers, setOfficers] = useState([]);
  const [isLoadingOfficers, setIsLoadingOfficers] = useState(false);
  const [isOfficerChangeModalOpen, setIsOfficerChangeModalOpen] = useState(false);
  const [selectedUserForOfficerChange, setSelectedUserForOfficerChange] = useState(null);
  const [newOfficerId, setNewOfficerId] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const usersPerPage = 10;
  const toast = useToast()
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = React.useRef();

  // Fetch officers data
  const fetchOfficers = async () => {
    try {
      setIsLoadingOfficers(true);
      const response = await axios.get("officers");
      console.log('🔍 Raw officers response:', response?.data);
      
      if (response?.data?.result) {
        // Filter to show only collection officers
        const collectionOfficers = response.data.result.filter(officer => {
          // Check multiple possible role fields and values
          const role = officer.role || officer.role_type || officer.user_role || officer.type;
          const isCollectionOfficer = role && (
            role.toLowerCase().includes("collection") ||
            role.toLowerCase().includes("officer") ||
            role.toLowerCase().includes("field") ||
            role.toLowerCase().includes("agent")
          );
          
          // Also check if officer has collection-related permissions
          const hasCollectionPermission = officer.permissions && 
            (officer.permissions.includes("collection") || 
             officer.permissions.includes("loan") ||
             officer.permissions.includes("user_management"));
          
          return isCollectionOfficer || hasCollectionPermission;
        });
        
        console.log('👥 All officers:', response.data.result.length);
        console.log('👥 Collection officers found:', collectionOfficers.length);
        console.log('👥 Sample officer data:', response.data.result[0]);
        
        setOfficers(collectionOfficers);
        
        if (collectionOfficers.length === 0) {
          // If no collection officers found, show all officers for debugging
          console.log('⚠️ No collection officers found, showing all officers');
          setOfficers(response.data.result);
          
          // Show a toast to inform the user
          toast({
            title: "No collection officers found",
            description: "Showing all available officers. Please check officer roles.",
            status: "warning",
            duration: 5000,
            isClosable: true,
          });
        }
      } else if (response?.data?.officers) {
        // Alternative data structure
        const collectionOfficers = response.data.officers.filter(officer => {
          const role = officer.role || officer.role_type || officer.user_role || officer.type;
          return role && role.toLowerCase().includes("collection");
        });
        setOfficers(collectionOfficers);
        console.log('👥 Officers from alternative structure:', collectionOfficers.length);
      } else {
        console.log('⚠️ No officers data found in response');
        setOfficers([]);
      }
    } catch (error) {
      console.error('❌ Error fetching officers:', error);
      toast({
        title: "Error fetching officers",
        description: "Failed to load officer data",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
      setOfficers([]);
    } finally {
      setIsLoadingOfficers(false);
    }
  };

  useEffect(() => {
    async function fetchData() {
      axios.get("users/").then((response) => {
        if (response?.data) {
          setData(response?.data?.result);
          console.log(response?.data?.result);
          setFilteredData(response?.data?.result);
        }
        const sum = response.data.result.reduce((acc, item) => {
          return acc + (item.active_loan_id?.total_amount || 0);
        }, 0);
        setTotalLoanAmt(sum)
      });
    }
    fetchData();
    fetchOfficers(); // Fetch officers when component mounts
  }, []);

  useEffect(() => {
    let result = data;
    
    // Apply search filter
    if (searchTerm.trim() !== "") {
      result = data.filter(
        (user) =>
          user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.phone_number?.toString().includes(searchTerm)
      );
    }
    
    // Apply sorting
    if (sortBy) {
      result = [...result].sort((a, b) => {
        let aValue, bValue;
        
        switch (sortBy) {
          case "amount_high_to_low":
            aValue = a.active_loan_id?.loan_amount || 0;
            bValue = b.active_loan_id?.loan_amount || 0;
            return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
            
          case "amount_low_to_high":
            aValue = a.active_loan_id?.loan_amount || 0;
            bValue = b.active_loan_id?.loan_amount || 0;
            return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
            
          case "name_a_z":
            aValue = a.full_name?.toLowerCase() || "";
            bValue = b.full_name?.toLowerCase() || "";
            return sortOrder === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
            
          case "date_created":
            aValue = new Date(a.createdAt || a.active_loan_id?.created_on || 0);
            bValue = new Date(b.createdAt || b.active_loan_id?.created_on || 0);
            return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
            
          default:
            return 0;
        }
      });
    }
    
    setFilteredData(result);
    setCurrentPage(1);
  }, [searchTerm, data, sortBy, sortOrder]);

  const handleDelete = () => {
    axios
      .delete(`users/${newID}`)
      .then((res) => {
        if (res.data) {
          toast({
            title: `Success! User has been deleted successfully`,

            status: "success",
            duration: 4000,
            isClosable: true,
            position:"top"
          });
          // Update state without reload
          setData((prev) => prev.filter((item) => item._id !== newID));
          setFilteredData((prev) => prev.filter((item) => item._id !== newID));
          onClose(); // Close the alert dialog
        }
      })
      .catch((err) => {
        toast({
          title: `Something Went Wrong!`,
          
          status: "error",
          duration: 4000,
          isClosable: true,
        });
      });
  };

  const handleEditSave = async () => {
    try {
      // Validate required fields
      if (!editData?.full_name || !editData?.phone_number) {
        toast({
          title: "Validation Error",
          description: "Full name and phone number are required",
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
      const loanResponse = await axios.put(`admins/edit-loan-user/${editData._id}`, {
        ...userUpdateData,
        ...loanUpdateData
      });

      if (userResponse.data && loanResponse.data) {
        toast({
          title: `User and Loan details updated successfully`,
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
        title: `Update Failed`,
        description: err.response?.data?.message || "Failed to update user and loan details",
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

  // Handle sorting
  const handleSort = (sortType) => {
    if (sortBy === sortType) {
      // Toggle sort order if same sort type is clicked
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      // Set new sort type and default to ascending
      setSortBy(sortType);
      setSortOrder("asc");
    }
  };

  // Get display name for sort type
  const getSortDisplayName = (sortType) => {
    switch (sortType) {
      case "amount_high_to_low":
        return t('Amount High to Low');
      case "amount_low_to_high":
        return t('Amount Low to High');
      case "name_a_z":
        return t('Name A-Z');
      case "date_created":
        return t('Date Created');
      default:
        return '';
    }
  };

  // Function to quickly change officer
  const handleQuickOfficerChange = async (userId, newOfficerId) => {
    try {
      const response = await axios.put(`users/${userId}`, {
        officer_id: newOfficerId
      });

      if (response.data) {
        toast({
          title: "Officer changed successfully",
          description: "The loan account has been reassigned to a new officer",
          status: "success",
          duration: 4000,
          isClosable: true,
          position: "top"
        });

        // Update local state
        const updatedData = data.map((item) =>
          item._id === userId 
            ? { 
                ...item, 
                officer_id: officers.find(officer => officer._id === newOfficerId) 
              } 
            : item
        );
        
        setData(updatedData);
        setFilteredData(updatedData);
      }
    } catch (error) {
      console.error("Officer change error:", error);
      toast({
        title: "Failed to change officer",
        description: error.response?.data?.message || "Something went wrong",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    }
  };

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * usersPerPage;
    return filteredData.slice(startIndex, startIndex + usersPerPage);
  }, [filteredData, currentPage]);

  const totalPages = Math.ceil(filteredData.length / usersPerPage);

  const columns = React.useMemo(
    () => [
      {
        Header: t('Sr No.'),
        accessor: "srNo",
        Cell: ({ value, row: { index } }) => <Cell text={index + 1} />,
      },
      {
        Header: t('Name'),
        accessor: "full_name",
        Cell: ({ value, row: { original } }) => (
          <Cell text={`${original?.full_name}`} bold={"bold"} />
        ),
      },
      {
        Header: t('Officer Alloted'),
        accessor: "officer_name",
        Cell: ({ value, row: { original } }) => {
          const officer = original?.officer_id;
          if (!officer) {
            return (
              <div className="flex flex-col">
                <Cell text="No Officer" />
                <span className="text-xs text-red-500">Unassigned</span>
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
        Header: t('Loan Amount'),
        accessor: "loan_amount",
        Cell: ({ value, row: { original } }) => (
          <Cell text={`Rs. ${original?.active_loan_id?.loan_amount}`} />
        ),
      },
      {
        Header: t('Total Pay Amount'),
        accessor: "total_amount",
        Cell: ({ value, row: { original } }) => (
          <Cell text={`Rs. ${original?.active_loan_id?.total_amount}`} />
        ),
      },
      {
        Header: t('Total EMI/Day'),
        accessor: "emi_day",
        Cell: ({ value, row: { original } }) => <Cell text={`Rs. ${original?.active_loan_id?.emi_day}`} />,
      },
      {
        Header: t('Remaining Emi'),
        accessor: "remaining_emi",
        Cell: ({ value, row: { original } }) => <Cell text={`${Math.ceil(original?.active_loan_id?.total_due_amount / original?.active_loan_id?.emi_day)}`} />,
      },
      {
        Header: t('Total Due Amount'),
        accessor: "total_due_amount",
        Cell: ({ value, row: { original } }) => <Cell text={`Rs. ${original?.active_loan_id?.total_due_amount}`} />,
      },
      {
        Header: t('Start Date'),
        accessor: "created_on",
        Cell: ({ value, row: { original } }) => (
          <Cell text={dayjs(value).format("D MMM, YYYY h:mm A")} />
        ),
      },
      {
        Header: t('End Date'),
        accessor: "end_date",
        Cell: ({ value, row: { original } }) => (
          <Cell text={
            original?.active_loan_id?.end_date 
              ? dayjs(original?.active_loan_id?.end_date).format("D MMM, YYYY")
              : dayjs(original?.active_loan_id?.created_on).add(120, 'day').format("D MMM, YYYY")
          } />
        ),
      },
      {
        Header: t('Mobile Number'),
        accessor: "phone_number",
        Cell: ({ value, row: { original } }) => (
          <Cell text={`${Math.ceil(value)}`} />
        ),
      },
      {
        Header: t('Action'),
        accessor: "",
        Cell: ({ value, row: { original } }) => {
          return (
            <Menu>
              <MenuButton
                as={Button}
                className="bg-purple "
                colorScheme="bgBlue hover:bg-secondaryLight"
                onClick={() => setNewID(original._id)}
                p={2}   // padding 0
                m={0.5}   // margin 0
              >
                {t('Actions')}
              </MenuButton>
              <MenuList>
                <Link to={`/dash/view-loan-user/${original?.active_loan_id?.user_id}`}>
                  <MenuItem >
                    <HiStatusOnline className="mr-4" /> {t('View User')}
                  </MenuItem>
                </Link>
                <MenuItem onClick={() => { setEditData(original); setIsEditing(true); }}>
                  <MdEdit className="mr-4" /> {t('Edit')}
                </MenuItem>
                <MenuItem onClick={() => { 
                  setSelectedUserForOfficerChange(original); 
                  setNewOfficerId(original?.officer_id?._id || ""); 
                  setIsOfficerChangeModalOpen(true); 
                }}>
                  <HiStatusOnline className="mr-4" /> {t('Change Officer')}
                </MenuItem>
                <MenuItem onClick={() => { setNewID(original._id); onOpen(); }}>
                  <MdDelete className="mr-4" />
                  {t('Delete')}
                </MenuItem>
                {/* <MenuItem onClick={onOpen2}>
                  <HiStatusOnline className="mr-4" /> {t('Status')}
                </MenuItem> */}
              </MenuList>
            </Menu>
          );
        },
      },
    ],
    [data, currentPage]
  );

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
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <>
      <style>
        {`
          .loan-header-responsive {
            flex-direction: row;
            align-items: center;
          }
          
          @media (max-width: 1024px) {
            .loan-header-responsive {
              flex-direction: column;
              align-items: stretch;
              gap: 1rem;
            }
            
            .loan-header-responsive > div {
              width: 100%;
            }
            
            .loan-header-responsive .search-section {
              order: 2;
            }
            
            .loan-header-responsive .actions-section {
              order: 1;
            }
          }
          
          @media (max-width: 768px) {
            .loan-header-responsive .search-section {
              width: 100%;
            }
            
            .loan-header-responsive .stats-section {
              flex-direction: column;
              gap: 0.5rem;
            }
            
            .loan-header-responsive .stats-section > * {
              width: 100%;
            }
            
            .loan-header-responsive .actions-section {
              flex-direction: column;
              gap: 0.5rem;
            }
            
            .loan-header-responsive .actions-section > * {
              width: 100%;
            }
            
            .loan-header-responsive .actions-section Button,
            .loan-header-responsive .actions-section a {
              width: 100%;
              justify-content: center;
            }
          }
          
          @media (max-width: 480px) {
            .loan-header-responsive {
              padding: 0.5rem;
            }
            
            .loan-header-responsive .stats-section Button {
              font-size: 0.75rem;
              padding: 0.5rem 0.75rem;
            }
            
            .loan-header-responsive .actions-section Button {
              font-size: 0.75rem;
              padding: 0.5rem 0.75rem;
            }
            
            .loan-header-responsive .search-section {
              margin: 0.5rem 0;
            }
            
            .loan-header-responsive .search-section Input {
              font-size: 0.875rem;
            }
          }
          
          @media (max-width: 360px) {
            .loan-header-responsive {
              padding: 0.25rem;
            }
            
            .loan-header-responsive .stats-section Button,
            .loan-header-responsive .actions-section Button {
              font-size: 0.7rem;
              padding: 0.375rem 0.5rem;
            }
          }
        `}
      </style>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="min-h-screen bg-primaryBg flex flex-col pt-8"
      >
      {/* Fixed Header Section */}
      <motion.div
        variants={itemVariants}
        className="flex-shrink-0 pb-0 px-4 mb-0"
      >
        <section className="md:p-0">
          <div className="py-0">
                         <motion.div 
               variants={itemVariants}
               className="flex justify-between items-center mb-0 loan-header-responsive"
             >
                               {/* Search Section */}
                <motion.div
                  variants={itemVariants}
                  className="w-96 search-section"
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
                       <span className="hidden sm:inline">{t('Total Collection')} : ₹ {totalLoanAmt.toLocaleString()}</span>
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
                   <Link to="/dash/overdue-loans">
                     <Button
                       colorScheme="red"
                       className="bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
                       fontWeight={700}
                     >
                       <span className="hidden sm:inline">{t('Overdue Loans')} ⚠️</span>
                       <span className="sm:hidden">Overdue ⚠️</span>
                     </Button>
                   </Link>
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
                       className="bg-gray-600 hover:bg-gray-700 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
                     >
                       {sortBy ? `${t('Sort By', 'Sort By')}: ${getSortDisplayName(sortBy)} ${sortOrder === 'asc' ? '↑' : '↓'}` : t('Sort By', 'Sort By')}
                     </MenuButton>
                     <MenuList>
                       <MenuItem onClick={() => handleSort('amount_high_to_low')}>
                         {t('Amount High to Low')} {sortBy === 'amount_high_to_low' && (sortOrder === 'asc' ? '↑' : '↓')}
                       </MenuItem>
                       <MenuItem onClick={() => handleSort('amount_low_to_high')}>
                         {t('Amount Low to High')} {sortBy === 'amount_low_to_high' && (sortOrder === 'asc' ? '↑' : '↓')}
                       </MenuItem>
                       <MenuItem onClick={() => handleSort('name_a_z')}>
                         {t('Name A-Z')} {sortBy === 'name_a_z' && (sortOrder === 'asc' ? '↑' : '↓')}
                       </MenuItem>
                       <MenuItem onClick={() => handleSort('date_created')}>
                         {t('Date Created')} {sortBy === 'date_created' && (sortOrder === 'asc' ? '↑' : '↓')}
                       </MenuItem>
                       {sortBy && (
                         <MenuItem onClick={() => { setSortBy(''); setSortOrder('asc'); }}>
                           {t('Clear Sort', 'Clear Sort')}
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
                     colorScheme="gray"
                     className="bg-gray-500 hover:bg-gray-600 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
                     onClick={fetchOfficers}
                     isLoading={isLoadingOfficers}
                   >
                     <span className="hidden sm:inline">{t('Refresh Officers', 'Refresh Officers')}</span>
                     <span className="sm:hidden">Refresh</span>
                   </Button>
                 </motion.div>
             </motion.div>
          </div>
        </section>
      </motion.div>

      {/* Scrollable Table Section */}
      <motion.div
        variants={itemVariants}
        className="flex-1 px-4 pb-0 overflow-hidden mt-4"
      >
        <div className="bg-white rounded-xl shadow-lg h-full flex flex-col">
          
          {/* Only the table content scrolls */}
          <div className="flex-1 overflow-auto">
            <Table
              data={paginatedData}
              columns={columns}
            />
          </div>

          {/* Fixed Pagination */}
          <div className="flex-shrink-0 flex justify-center p-0 border-t gap-4 items-center bg-gray-50">
            <Button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              isDisabled={currentPage === 1}
              colorScheme="blue"
              variant="outline"
            >
              {t('Previous')}
            </Button>
            <span className="text-sm bg-primary text-white px-4 py-2 rounded-md font-medium">
              {currentPage} {t('of')} {totalPages}
            </span>
            <Button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              isDisabled={currentPage === totalPages}
              colorScheme="blue"
              variant="outline"
            >
              {t('Next')}
            </Button>
          </div>
        </div>
      </motion.div>

             {/* Drawers and Dialogs */}

      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
        isCentered
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              {t('Delete User', 'Delete User')}
            </AlertDialogHeader>
            <AlertDialogBody>
              {t('Are you sure you want to delete this user? This action cannot be undone.', 'Are you sure you want to delete this user? This action cannot be undone.')}
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose} variant="outline">
                {t('Cancel', 'Cancel')}
              </Button>
              <Button colorScheme="red" onClick={handleDelete} ml={3}>
                {t('Delete', 'Delete')}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      <Drawer isOpen={isEditing} placement="right" onClose={handleEditClose} size="lg">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>{t('Edit User & Loan Details', 'Edit User & Loan Details')}</DrawerHeader>
          <DrawerBody>
            <div className="space-y-6">
              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-purple">{t('Personal Information')}</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('Full Name')} *</label>
                    <Input
                      placeholder={t('Full Name', 'Full Name')}
                      value={editData?.full_name || ""}
                      onChange={(e) =>
                        setEditData({ ...editData, full_name: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('Phone Number')} *</label>
                    <Input
                      placeholder={t('Phone Number', 'Phone Number')}
                      value={editData?.phone_number || ""}
                      onChange={(e) =>
                        setEditData({ ...editData, phone_number: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('Email')}</label>
                    <Input
                      placeholder={t('Email', 'Email')}
                      value={editData?.email || ""}
                      onChange={(e) =>
                        setEditData({ ...editData, email: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('Address')}</label>
                    <Input
                      placeholder={t('Address', 'Address')}
                      value={editData?.address || ""}
                      onChange={(e) =>
                        setEditData({ ...editData, address: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Officer Selection */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-purple">{t('Officer Allocation')}</h3>
                                 <Select
                   placeholder={officers.length === 0 ? 'No officers available' : t('Select Officer', 'Select Officer')}
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
                   {officers.length === 0 ? (
                     <option value="" disabled>No officers available</option>
                   ) : (
                     officers.map((officer) => (
                       <option key={officer._id} value={officer._id}>
                         {officer.name || officer.full_name || 'Unknown Officer'} 
                         {officer.officer_code && ` (${officer.officer_code})`}
                       </option>
                     ))
                   )}
                 </Select>
                 {officers.length === 0 && (
                   <div className="text-sm text-red-500 mt-1">
                     No officers found. Please refresh or check officer data.
                   </div>
                 )}
              </div>

              {/* Loan Details */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-purple">{t('Loan Details')}</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('Loan Amount')} (₹)</label>
                    <Input
                      placeholder={t('Loan Amount', 'Loan Amount')}
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
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('Total Amount')} (₹)</label>
                    <Input
                      placeholder={t('Total Amount', 'Total Amount')}
                      type="number"
                      value={editData?.active_loan_id?.total_amount || ""}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          active_loan_id: {
                            ...editData.active_loan_id,
                            total_amount: Number(e.target.value)
                          }
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('Daily EMI')} (₹)</label>
                    <Input
                      placeholder={t('Daily EMI', 'Daily EMI')}
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
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('Total Due Amount')} (₹)</label>
                    <Input
                      placeholder={t('Total Due Amount', 'Total Due Amount')}
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
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('Interest Rate')} (%)</label>
                    <Input
                      placeholder={t('Interest Rate (%)', 'Interest Rate (%)')}
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
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('Principle Amount')} (₹)</label>
                    <Input
                      placeholder={t('Principle Amount', 'Principle Amount')}
                      type="number"
                      value={editData?.active_loan_id?.principle_amount || ""}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          active_loan_id: {
                            ...editData.active_loan_id,
                            principle_amount: Number(e.target.value)
                          }
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('Total Penalty Amount')} (₹)</label>
                    <Input
                      placeholder={t('Total Penalty Amount', 'Total Penalty Amount')}
                      type="number"
                      value={editData?.active_loan_id?.total_penalty_amount || ""}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          active_loan_id: {
                            ...editData.active_loan_id,
                            total_penalty_amount: Number(e.target.value)
                          }
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('Start Date')}</label>
                    <Input
                      placeholder={t('Start Date', 'Start Date')}
                      type="date"
                      value={editData?.active_loan_id?.created_on ? new Date(editData.active_loan_id.created_on).toISOString().split('T')[0] : ""}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          active_loan_id: {
                            ...editData.active_loan_id,
                            created_on: new Date(e.target.value)
                          }
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('End Date')}</label>
                    <Input
                      placeholder={t('End Date', 'End Date')}
                      type="date"
                      value={editData?.active_loan_id?.end_date ? new Date(editData.active_loan_id.end_date).toISOString().split('T')[0] : ""}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          active_loan_id: {
                            ...editData.active_loan_id,
                            end_date: new Date(e.target.value)
                          }
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </DrawerBody>
          <DrawerFooter>
            <Button variant="outline" mr={3} onClick={handleEditClose}>
              {t('Cancel', 'Cancel')}
            </Button>
            <Button colorScheme="blue" onClick={handleEditSave}>
              {t('Save Changes', 'Save Changes')}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* Quick Officer Change Modal */}
      <AlertDialog
        isOpen={isOfficerChangeModalOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => setIsOfficerChangeModalOpen(false)}
        isCentered
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              {t('Change Allotted Officer', 'Change Allotted Officer')}
            </AlertDialogHeader>
            <AlertDialogBody>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('Current Officer', 'Current Officer')}
                  </label>
                  <div className="p-3 bg-gray-100 rounded-md">
                    {selectedUserForOfficerChange?.officer_id?.name || t('No Officer Assigned', 'No Officer Assigned')}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('New Officer', 'New Officer')} *
                  </label>
                                     <Select
                     placeholder={officers.length === 0 ? 'No officers available' : t('Select New Officer', 'Select New Officer')}
                     value={newOfficerId}
                     onChange={(e) => setNewOfficerId(e.target.value)}
                     isDisabled={isLoadingOfficers || officers.length === 0}
                   >
                     {officers.length === 0 ? (
                       <option value="" disabled>No officers available</option>
                     ) : (
                       officers.map((officer) => (
                         <option key={officer._id} value={officer._id}>
                           {officer.name || officer.full_name || 'Unknown Officer'} 
                           {officer.officer_code && ` (${officer.officer_code})`}
                         </option>
                       ))
                     )}
                   </Select>
                   {officers.length === 0 && (
                     <div className="text-sm text-red-500 mt-1">
                       No officers found. Please refresh or check officer data.
                     </div>
                   )}
                </div>
                <div className="text-sm text-gray-600">
                  <p><strong>{t('User', 'User')}:</strong> {selectedUserForOfficerChange?.full_name}</p>
                  <p><strong>{t('Loan Amount', 'Loan Amount')}:</strong> ₹{selectedUserForOfficerChange?.active_loan_id?.loan_amount?.toLocaleString()}</p>
                </div>
              </div>
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button 
                ref={cancelRef} 
                onClick={() => setIsOfficerChangeModalOpen(false)} 
                variant="outline"
              >
                {t('Cancel', 'Cancel')}
              </Button>
              <Button 
                colorScheme="blue" 
                onClick={() => {
                  if (newOfficerId) {
                    handleQuickOfficerChange(selectedUserForOfficerChange._id, newOfficerId);
                    setIsOfficerChangeModalOpen(false);
                    setSelectedUserForOfficerChange(null);
                    setNewOfficerId("");
                  } else {
                    toast({
                      title: "Please select a new officer",
                      status: "warning",
                      duration: 3000,
                      isClosable: true,
                    });
                  }
                }} 
                ml={3}
              >
                {t('Change Officer', 'Change Officer')}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </motion.div>
    </>
  );
}

export default LoanAccount;
