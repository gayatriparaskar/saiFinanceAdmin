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
import { createTimeoutAwareCall } from "../../utils/retryHelper";
import ApiLoader from "../../components/LoadingStates/ApiLoader";
import ApiErrorHandler from "../../components/ErrorBoundary/ApiErrorHandler";
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
  Text,
  Select,
} from "@chakra-ui/react";

import { MdEdit, MdDelete } from "react-icons/md";
import { HiStatusOnline } from "react-icons/hi";

function SavingAccount() {
  const { t } = useLocalTranslation();
  const [data, setData] = useState([]);
  const [newID, setNewID] = useState(null);
  const [totalSavingAmt, setTotalSavingAmt] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editData, setEditData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [officers, setOfficers] = useState([]);
  const [isLoadingOfficers, setIsLoadingOfficers] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const usersPerPage = 10;
  const toast = useToast()
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = React.useRef();

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
            title: "No collection officers found",
            description: "No officers with officer_type='collection_officer' found. Please check officer data.",
            status: "warning",
            duration: 5000,
            isClosable: true,
          });
        }
      } else if (response?.data?.officers) {
        // Alternative data structure - only collection officers
        const collectionOfficers = response.data.officers.filter(officer => {
          // Check officer_type field specifically (from backend model)
          const officerType = officer.officer_type;
          
          // Only include officers with collection_officer type specifically
          return officerType === "collection_officer";
        });
        setOfficers(collectionOfficers);
        console.log('👥 Collection officers from alternative structure:', collectionOfficers.length);
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

  // Refresh function that can be called from the refresh button
  const handleRefresh = async () => {
    console.log('🔄 Refreshing saving accounts data...');
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get("account/");
      if (response?.data) {
        setData(response?.data?.result || []);
        setFilteredData(response?.data?.result || []);

        const sum = (response.data.result || []).reduce((acc, item) => {
          return acc + (item?.saving_account_id?.current_amount || 0);
        }, 0);
        setTotalSavingAmt(sum);
        
        toast({
          title: "Data refreshed successfully",
          status: "success",
          duration: 2000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Failed to refresh savings accounts:', error);
      setError(error);
      setData([]);
      setFilteredData([]);
      setTotalSavingAmt(0);
      
      toast({
        title: "Failed to refresh data",
        description: "Please check your connection and try again.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = createTimeoutAwareCall(
      () => axios.get("account/"),
      {
        maxRetries: 3,
        showToast: toast,
        fallbackData: { result: [] },
        errorMessage: "Failed to load savings accounts. Please check your connection and try again."
      }
    );

    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetchData();
        if (response?.data) {
          setData(response?.data?.result || []);
          console.log(response.data.result);
          setFilteredData(response?.data?.result || []);

          // Calculate total current amount from all users
          const sum = (response.data.result || []).reduce((acc, item) => {
            return acc + (item?.saving_account_id?.current_amount || 0);
          }, 0);
          setTotalSavingAmt(sum);
        }
      } catch (error) {
        console.error('Failed to load savings accounts:', error);

        // Check if it's an authentication error
        if (error.response?.status === 401 || error.isAuthError) {
          console.warn("Authentication failed - redirecting to login");
          localStorage.removeItem('token');
          window.location.href = '/login';
          return;
        }

        setError(error);
        // Fallback data
        setData([]);
        setFilteredData([]);
        setTotalSavingAmt(0);
      } finally {
        setLoading(false);
      }
    };

    loadData();
    fetchOfficers(); // Fetch collection officers when component mounts
  }, []);

  // Retry function for error recovery
  const handleRetry = () => {
    const fetchData = createTimeoutAwareCall(
      () => axios.get("account/"),
      {
        maxRetries: 3,
        showToast: toast,
        fallbackData: { result: [] },
        errorMessage: "Failed to load savings accounts. Please check your connection and try again."
      }
    );

    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetchData();
        if (response?.data) {
          setData(response?.data?.result || []);
          setFilteredData(response?.data?.result || []);

          const sum = (response.data.result || []).reduce((acc, item) => {
            return acc + (item?.saving_account_id?.current_amount || 0);
          }, 0);
          setTotalSavingAmt(sum);
        }
      } catch (error) {
        setError(error);
        setData([]);
        setFilteredData([]);
        setTotalSavingAmt(0);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  };


  useEffect(() => {
    let result = data;
    
    // Apply search filter
    if (searchTerm.trim() !== "") {
      result = data.filter(
        (user) =>
          user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.saving_account_id?.account_number?.toString().includes(searchTerm)
      );
    }
    
    // Apply sorting
    if (sortBy) {
      result = [...result].sort((a, b) => {
        let aValue, bValue;
        
        switch (sortBy) {
          case "current_amount_high_to_low":
            aValue = a.saving_account_id?.current_amount || 0;
            bValue = b.saving_account_id?.current_amount || 0;
            return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
            
          case "current_amount_low_to_high":
            aValue = a.saving_account_id?.current_amount || 0;
            bValue = b.saving_account_id?.current_amount || 0;
            return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
            
          case "remaining_emi":
            aValue = a.saving_account_id?.remaining_emi_days || 0;
            bValue = b.saving_account_id?.remaining_emi_days || 0;
            
            return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
            
          case "name_a_z":
            aValue = a.full_name?.toLowerCase() || "";
            bValue = b.full_name?.toLowerCase() || "";
            return sortOrder === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
            
          case "date_created":
            aValue = new Date(a.createdAt || a.saving_account_id?.created_on || 0);
            bValue = new Date(b.createdAt || b.saving_account_id?.created_on || 0);
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
            title: `Success! Account has been deleted successfully`,
            status: "success",
            duration: 4000,
            isClosable: true,
            position: "top"
          });
          setData((prev) => prev.filter((item) => item._id !== newID));
          setFilteredData((prev) => prev.filter((item) => item._id !== newID));
          onClose();
        }
      })
      .catch((err) => {
        toast({
          title: `Delete Failed!`,
          description: err.response?.data?.message || "Something went wrong while deleting the account",
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

      // Update saving account details
      const savingUpdateData = {
        account_number: editData.saving_account_id?.account_number || "",
        current_amount: editData.saving_account_id?.current_amount || 0,
        interest_rate: editData.saving_account_id?.interest_rate || 0,
        emi_day: editData.saving_account_id?.emi_day || 0,
        created_on: editData.saving_account_id?.created_on || new Date(),
        last_interest_applied_on: editData.saving_account_id?.last_interest_applied_on || new Date()
      };

      // Update user details
      const userResponse = await axios.put(`users/${editData._id}`, userUpdateData);
      
      // Update saving account details using admin route
      const savingResponse = await axios.put(`users/${editData._id}`, {
        ...userUpdateData,
        ...savingUpdateData
      });

      if (userResponse.data && savingResponse.data) {
        toast({
          title: `Account updated successfully`,
          status: "success",
          duration: 4000,
          isClosable: true,
          position: "top"
        });
        
        // Update local state with all changes
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
        description: err.response?.data?.message || "Failed to update account information",
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

  // Function to handle status change
  const handleStatusChange = async (userId, newStatus) => {
    try {
      const response = await axios.put(`users/${userId}`, {
        status: newStatus
      });

      if (response.data) {
        toast({
          title: t("Status updated successfully"),
          status: "success",
          duration: 3000,
          isClosable: true,
          position: "top"
        });
        
        // Update the local state
        const updatedData = data.map((item) =>
          item._id === userId 
            ? { 
                ...item, 
                saving_account_id: { 
                  ...item.saving_account_id, 
                  status: newStatus 
                } 
              } 
            : item
        );
        
        setData(updatedData);
        setFilteredData(updatedData);
      }
    } catch (error) {
      console.error("Status change error:", error);
      toast({
        title: t("Failed to update status"),
        description: error.response?.data?.message || t("Something went wrong"),
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    }
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
      case "current_amount_high_to_low":
        return t('Current Amount High to Low');
      case "current_amount_low_to_high":
        return t('Current Amount Low to High');
      case "remaining_emi":
        return t('Remaining EMI');
      case "name_a_z":
        return t('Name A-Z');
      case "date_created":
        return t('Date Created');
      default:
        return '';
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

        Header: t('Account Holder'),
        accessor: "full_name",



        Cell: ({ value, row: { original } }) => (
          <>
            <Cell text={`${original?.full_name}`} bold={"bold"} />
          </>
        ),
      },
      {
        Header: t('Account Number'),
        accessor: "account_number",
        Cell: ({ value, row: { original } }) => (
          <>
            <Cell text={`${original?.saving_account_id?.account_number}`} />
          </>
        ),
      },
      {

        Header: t('Current Amount'),
        accessor: "current_amount",

        Cell: ({ value, row: { original } }) => (
          <>
            <Cell text={`₹ ${original?.saving_account_id?.current_amount?.toLocaleString() || 0}`} />
          </>
        ),
      },
      {
        Header: t('Daily EMI Amount'),
        accessor: "daily_emi_amount",
        Cell: ({ value, row: { original } }) => (
          <>
            <Cell text={`₹ ${original?.saving_account_id?.emi_day || 0}`} />
          </>
        ),
      },
      {
        Header: t('Remaining EMI Days'),
        accessor: "remaining_emi_days",
        Cell: ({ value, row: { original } }) => {
          const remainingEmiDays = original?.saving_account_id?.remaining_emi_days || 0;
          
          if (remainingEmiDays === 0) return <Cell text="-" />;
          
          return <Cell text={`${remainingEmiDays} days`} />;
        },
      },
      {
        Header: t('Officer Alloted'),
        accessor: "officer_name",
        Cell: ({ value, row: { original } }) => (
          <>
            <Cell text={original?.officer_id?.name || '-'} />
          </>
        ),
      },
      {

        Header: t('Total Amount'),
        accessor: "amount_to_be",
        Cell: ({ value, row: { original } }) => <Cell text={original?.saving_account_id?.amount_to_be} />,

      },
      {

        Header: t('Total Due Amount'),
        accessor: "total_amount",
        Cell: ({ value, row: { original } }) => <Cell text={original?.saving_account_id?.total_amount} />,

      },
      {
        Header: t('Status'),
        accessor: "status",
        Cell: ({ value, row: { original } }) => {
          const currentStatus = original?.saving_account_id?.status || original?.status || 'active';
          return (
            <Select
              value={currentStatus}
              onChange={(e) => handleStatusChange(original._id, e.target.value)}
              size="sm"
              width="120px"
              bg="white"
              color="gray.700"
              borderColor="gray.300"
              _hover={{ borderColor: "gray.400" }}
              _focus={{ 
                borderColor: currentStatus === 'active' ? "green.400" : "red.400",
                boxShadow: `0 0 0 1px ${currentStatus === 'active' ? "#68D391" : "#FC8181"}`
              }}
              borderRadius="md"
              fontSize="sm"
              fontWeight="medium"
              icon={<></>}
            >
              <option value="active">{t('Active')}</option>
              <option value="inactive">{t('Inactive')}</option>
            </Select>
          );
        },
      },
      {
        Header: t('Date Created', 'Date Created'),
        accessor: "created_on",
        Cell: ({ value, row: { original } }) => (
          <Cell text={dayjs(value).format("D MMM, YYYY h:mm A")} />
        ),
      },
      {
        Header: t('End Date', 'End Date'),
        accessor: "end_date",
        Cell: ({ value, row: { original } }) => (
          <Cell text={original?.saving_account_id?.end_date ? dayjs(original.saving_account_id.end_date).format("D MMM, YYYY") : 'N/A'} />
        ),
      },
      {
        Header: t('Phone', 'Phone'),
        accessor: "phone_number",
        Cell: ({ value, row: { original } }) => (
          <Cell text={`${original?.phone_number || '-'}`} />
        ),
      },
      {
        Header: t('Action'),
        accessor: "",
        Cell: ({ value, row: { original } }) => {
          return (
            <>
              <Menu>
                <MenuButton
                  as={Button}
                  className="bg-secondary hover:bg-secondaryDark"
                  colorScheme="purple"
                  onClick={() => setNewID(original._id)}
                  p={2}   // padding 0
                  m={0.5}   // margin 0
                >
                  {t('Actions')}
                </MenuButton>
                <MenuList>
                  <MenuItem as={Link} to={`/dash/view-savingUser-details/${original?._id}`} onClick={() => console.log('🔄 Navigating to view saving user:', original?._id)}>
                    <HiStatusOnline className="mr-4" /> {t('View Account')}
                  </MenuItem>
                  <MenuItem onClick={() => { setEditData(original); setIsEditing(true); }}>
                    <MdEdit className="mr-4" /> {t('Edit')}
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
            </>
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
          .saving-header-responsive {
            flex-direction: row;
            align-items: center;
          }
          
          @media (max-width: 1024px) {
            .saving-header-responsive {
              flex-direction: column;
              align-items: stretch;
              gap: 1rem;
            }
            
            .saving-header-responsive > div {
              width: 100%;
            }
            
            .saving-header-responsive .search-section {
              order: 2;
            }
            
            .saving-header-responsive .actions-section {
              order: 1;
            }
          }
          
          @media (max-width: 768px) {
            .saving-header-responsive .search-section {
              width: 100%;
            }
            
            .saving-header-responsive .actions-section {
              flex-direction: column;
              gap: 0.5rem;
            }
            
            .saving-header-responsive .actions-section > * {
              width: 100%;
            }
            
            .saving-header-responsive .actions-section Button,
            .saving-header-responsive .actions-section a {
              width: 100%;
              justify-content: center;
            }
          }
          
          @media (max-width: 480px) {
            .saving-header-responsive {
              padding: 0.5rem;
            }
            
            .saving-header-responsive .actions-section Button {
              font-size: 0.75rem;
              padding: 0.5rem 0.75rem;
            }
            
            .saving-header-responsive .search-section {
              margin: 0.5rem 0;
            }
            
            .saving-header-responsive .search-section Input {
              font-size: 0.875rem;
            }
          }
          
          @media (max-width: 360px) {
            .saving-header-responsive {
              padding: 0.25rem;
            }
            
            .saving-header-responsive .actions-section Button {
              font-size: 0.7rem;
              padding: 0.375rem 0.5rem;
            }
          }
          
          /* Responsive dropdown styles */
          .chakra-select__wrapper {
            width: 100% !important;
            max-width: 100% !important;
          }
          
          .chakra-select {
            width: 100% !important;
            max-width: 100% !important;
          }
          
          /* Mobile dropdown adjustments */
          @media (max-width: 768px) {
            .chakra-select {
              font-size: 14px !important;
              padding: 8px 12px !important;
            }
            
            .chakra-select__icon-wrapper {
              right: 8px !important;
            }
          }
          
          /* Tablet dropdown adjustments */
          @media (min-width: 769px) and (max-width: 1024px) {
            .chakra-select {
              font-size: 15px !important;
              padding: 10px 14px !important;
            }
          }
          
          /* Drawer responsive adjustments */
          @media (max-width: 768px) {
            .chakra-drawer__content {
              width: 100% !important;
              max-width: 100% !important;
            }
          }
          
          @media (min-width: 769px) {
            .chakra-drawer__content {
              width: 600px !important;
              max-width: 90vw !important;
            }
          }
          
          /* Fix dropdown overflow issues */
          .chakra-drawer__content {
            overflow: visible !important;
            position: relative !important;
            z-index: 1000 !important;
          }
          
          .chakra-drawer__body {
            overflow: visible !important;
            position: relative !important;
            z-index: 1000 !important;
          }
          
          .chakra-select__menu {
            z-index: 9999 !important;
            position: fixed !important;
            max-height: 200px !important;
            overflow-y: auto !important;
          }
          
          .chakra-select__menu-list {
            max-height: 200px !important;
            overflow-y: auto !important;
          }
          
          /* Ensure dropdown stays within viewport */
          .chakra-select__menu-portal {
            z-index: 9999 !important;
          }
          
          /* Mobile dropdown positioning */
          @media (max-width: 768px) {
            .chakra-select__menu {
              max-height: 150px !important;
              width: calc(100vw - 32px) !important;
              left: 16px !important;
              right: 16px !important;
            }
          }
          
          /* Additional dropdown overflow fixes */
          .chakra-select__field {
            position: relative !important;
            z-index: 1 !important;
          }
          
          .chakra-select__menu {
            position: absolute !important;
            top: 100% !important;
            left: 0 !important;
            right: 0 !important;
            z-index: 9999 !important;
            background: white !important;
            border: 1px solid #e2e8f0 !important;
            border-radius: 6px !important;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1) !important;
            max-height: 200px !important;
            overflow-y: auto !important;
          }
          
          /* Ensure dropdown doesn't go outside viewport */
          .chakra-select__menu[data-popper-placement^="bottom"] {
            transform: translateY(4px) !important;
          }
          
          .chakra-select__menu[data-popper-placement^="top"] {
            transform: translateY(-4px) !important;
          }
        `}
      </style>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="min-h-screen bg-primaryBg flex flex-col pt-24 sm:pt-28"
      >
      {/* Fixed Header Section */}
      <motion.div
        variants={itemVariants}
        className="flex-shrink-0 pb-0 px-4"
      >
        <section className="md:p-0">
          <div className="py-0">
            <motion.div
              variants={itemVariants}
              className="flex justify-between items-center mb-0 saving-header-responsive"
            >
              {/* Stats Section */}
              <motion.div
                variants={itemVariants}
                className="flex gap-2"
              >
                <Menu>
                  <MenuButton
                    as={Button}
                    colorScheme="purple"
                    className="bg-secondary hover:bg-secondaryDark text-white text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
                    fontWeight={700}
                  >
                    {t('Total Savings')} : ₹ {loading ? '...' : totalSavingAmt.toLocaleString()}
                  </MenuButton>
                </Menu>
                <Menu>
                  <MenuButton
                    as={Button}
                    colorScheme="blue"
                    className="bg-primary hover:bg-primaryDark text-white text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
                    fontWeight={700}
                  >
                    {t('Total Active Users')} : {data.length}
                  </MenuButton>
                </Menu>
              </motion.div>

              {/* Search Section */}
              <motion.div
                variants={itemVariants}
                className="w-84 search-section"
              >
                <InputGroup borderRadius={5} size="sm">
                  <InputLeftElement
                    pointerEvents="none"
                  />
                  <Input
                    type="text"
                    placeholder={t('Search accounts...')}
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
                      onClick={() => handleSort('current_amount_high_to_low')}
                      className="hover:bg-blue-50 px-4 py-2 text-sm"
                    >
                      <span className="flex items-center justify-between w-full">
                        <span>💰 {t('Current Amount High to Low')}</span>
                        {sortBy === 'current_amount_high_to_low' && (
                          <span className="text-blue-600 font-bold">
                            {sortOrder === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </span>
                    </MenuItem>
                    <MenuItem 
                      onClick={() => handleSort('current_amount_low_to_high')}
                      className="hover:bg-blue-50 px-4 py-2 text-sm"
                    >
                      <span className="flex items-center justify-between w-full">
                        <span>💰 {t('Current Amount Low to High')}</span>
                        {sortBy === 'current_amount_low_to_high' && (
                          <span className="text-blue-600 font-bold">
                            {sortOrder === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </span>
                    </MenuItem>
                    <MenuItem 
                      onClick={() => handleSort('remaining_emi')}
                      className="hover:bg-blue-50 px-4 py-2 text-sm"
                    >
                      <span className="flex items-center justify-between w-full">
                        <span>📊 {t('Remaining EMI')}</span>
                        {sortBy === 'remaining_emi' && (
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

                <Button
                  colorScheme="green"
                  className="bg-green-600 hover:bg-green-700 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
                  onClick={handleRefresh}
                  isLoading={loading}
                  loadingText={t('Refreshing...', 'Refreshing...')}
                  leftIcon={<span>🔄</span>}
                >
                  {t('Refresh', 'Refresh')}
                </Button>

                <Link to={`/dash/create-saving-user`} onClick={() => console.log('🔄 Navigating to create saving user...')}>
                  <Button
                    colorScheme="blue"
                    className="bg-primary hover:bg-primaryDark text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
                  >
                    {t('Add New Account', 'Add New Account')}
                  </Button>
                </Link>
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

        <div className="bg-white rounded-xl shadow-lg h-full flex flex-col mt-0">
          

          {/* Only the table content scrolls */}
          <div className="flex-1 overflow-auto">
            {loading ? (
              <ApiLoader
                message="Loading savings accounts..."
                size="lg"
              />
            ) : error ? (
              <ApiErrorHandler
                error={error}
                onRetry={handleRetry}
                message="Failed to load savings accounts"
              />
            ) : (
              <Table data={paginatedData} columns={columns} />
            )}
          </div>

          {/* Fixed Pagination */}
          <div className="flex-shrink-0 flex justify-center p-4 border-t gap-4 items-center bg-gray-50">
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
              {t('Delete Account', 'Delete Account')}
            </AlertDialogHeader>

            <AlertDialogBody>
              {t('Are you sure you want to delete this saving account? This action cannot be undone.', 'Are you sure you want to delete this saving account? This action cannot be undone.')}
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
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
          <DrawerHeader>{t('Edit User & Saving Account Details', 'Edit User & Saving Account Details')}</DrawerHeader>
          <DrawerBody>
            <div className="space-y-6">
              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-purple">{t('Personal Information')}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('Full Name')} *</label>
                    <Input
                      placeholder={t('Full Name', 'Full Name')}
                      value={editData?.full_name || ""}
                      onChange={(e) =>
                        setEditData({ ...editData, full_name: e.target.value })
                      }
                      size="md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('Phone Number')} *</label>
                    <Input
                      placeholder={t('Phone Number', 'Phone Number')}
                      value={editData?.phone_number || ""}
                      onChange={(e) =>
                        setEditData({ ...editData, phone_number: e.target.value })
                      }
                      size="md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('Email')}</label>
                    <Input
                      placeholder={t('Email', 'Email')}
                      value={editData?.email || ""}
                      onChange={(e) =>
                        setEditData({ ...editData, email: e.target.value })
                      }
                      size="md"
                    />
                  </div>
                                   {/* Officer Selection */}
               <div>
                 <h3 className="text-lg font-semibold mb-3 text-purple">{t('Officer Allocation')}</h3>
                 <div className="w-full">
                   <Select
                     placeholder={officers.length === 0 ? 'No collection officers available' : t('Select Collection Officer', 'Select Collection Officer')}
                     value={editData?.officer_id?._id || ''}
                     onChange={(e) =>
                       setEditData({
                         ...editData,
                         officer_id: officers.find(officer => officer._id === e.target.value) || null
                       })
                     }
                     isLoading={isLoadingOfficers}
                     isDisabled={isLoadingOfficers || officers.length === 0}
                     size="md"
                     className="w-full"
                     maxW="100%"
                   >
                     {officers.length === 0 ? (
                       <option value="" disabled>No collection officers available</option>
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
                       No collection officers found. Please check officer_type='collection_officer' or refresh the page.
                     </div>
                   )}
                 </div>
               </div>
                </div>
              </div>

              {/* Saving Account Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-purple">{t('Saving Account Information')}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('Account Number')}</label>
                    <Input
                      placeholder={t('Account Number', 'Account Number')}
                      value={editData?.saving_account_id?.account_number || ""}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          saving_account_id: {
                            ...editData.saving_account_id,
                            account_number: e.target.value
                          }
                        })
                      }
                      size="md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('Current Amount')} (₹)</label>
                    <Input
                      placeholder={t('Current Amount', 'Current Amount')}
                      type="number"
                      value={editData?.saving_account_id?.current_amount || ""}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          saving_account_id: {
                            ...editData.saving_account_id,
                            current_amount: Number(e.target.value)
                          }
                        })
                      }
                      size="md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('Interest Rate')} (%)</label>
                    <Input
                      placeholder={t('Interest Rate (%)', 'Interest Rate (%)')}
                      type="number"
                      value={editData?.saving_account_id?.interest_rate || ""}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          saving_account_id: {
                            ...editData.saving_account_id,
                            interest_rate: Number(e.target.value)
                          }
                        })
                      }
                      size="md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('Daily EMI')} (₹)</label>
                    <Input
                      placeholder={t('Daily EMI', 'Daily EMI')}
                      type="number"
                      value={editData?.saving_account_id?.emi_day || ""}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          saving_account_id: {
                            ...editData.saving_account_id,
                            emi_day: Number(e.target.value)
                          }
                        })
                      }
                      size="md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('Account Created Date')}</label>
                    <Input
                      placeholder={t('Start Date', 'Start Date')}
                      type="date"
                      value={editData?.saving_account_id?.created_on ? new Date(editData.saving_account_id.created_on).toISOString().split('T')[0] : ""}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          saving_account_id: {
                            ...editData.saving_account_id,
                            created_on: new Date(e.target.value)
                          }
                        })
                      }
                      size="md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('Last Interest Applied')}</label>
                    <Input
                      placeholder={t('Last Interest Date', 'Last Interest Date')}
                      type="date"
                      value={editData?.saving_account_id?.last_interest_applied_on ? new Date(editData.saving_account_id.last_interest_applied_on).toISOString().split('T')[0] : ""}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          saving_account_id: {
                            ...editData.saving_account_id,
                            last_interest_applied_on: new Date(e.target.value)
                          }
                        })
                      }
                      size="md"
                    />
                  </div>
                </div>
              </div>
            </div>
          </DrawerBody>
          <DrawerFooter className="flex flex-col sm:flex-row gap-3 sm:gap-0">
            <Button 
              variant="outline" 
              onClick={handleEditClose}
              className="w-full sm:w-auto sm:mr-3"
              size="md"
            >
              {t('Cancel', 'Cancel')}
            </Button>
            <Button 
              colorScheme="blue" 
              onClick={handleEditSave}
              className="w-full sm:w-auto"
              size="md"
            >
              {t('Save Changes', 'Save Changes')}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </motion.div>
    </>
  );
}

export default SavingAccount;
