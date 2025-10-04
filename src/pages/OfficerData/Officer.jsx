import React from "react";
import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { Link, useNavigate } from "react-router-dom";
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
  MenuItemOption,
  MenuGroup,
  MenuOptionGroup,
  MenuDivider,
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
  useToast,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  Select,
} from "@chakra-ui/react";

import { MdEdit, MdDelete } from "react-icons/md";
import { HiStatusOnline } from "react-icons/hi";
import { GrOverview } from "react-icons/gr";

function Officer() {
  const { t } = useLocalTranslation();
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [newID, setNewID] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [editData, setEditData] = useState(null);
  const [collectionData, setCollectionData] = useState({});
  const [reportType, setReportType] = useState('daily');
  const [isEditing, setIsEditing] = useState(false);
  const [sortBy, setSortBy] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const usersPerPage = 10;
  const toast = useToast();
  
     const { isOpen, onOpen, onClose } = useDisclosure();
   const cancelRef = React.useRef();

  // Function to fetch collection data
  const fetchCollectionData = async (period) => {
    try {
      let endpoint = '';
      let queryParams = {};
      
      if (period === 'daily') {
        endpoint = 'admins/officerWiseDailyCollections';
        // For daily, we need to pass today's date
        const today = new Date().toISOString().split('T')[0];
        queryParams = { date: today };
      } else if (period === 'weekly') {
        endpoint = 'admins/officerWiseWeeklyCollections';
      } else if (period === 'monthly') {
        endpoint = 'admins/officerWiseMonthlyCollections';
      }

      const response = await axios.get(endpoint, { params: queryParams });
      console.log(`📊 ${period} officer collections response:`, response.data);
      
      // Handle different response structures from backend
      let collections = [];
      if (response.data.result) {
        if (response.data.result.collections) {
          collections = response.data.result.collections;
        } else if (Array.isArray(response.data.result)) {
          collections = response.data.result;
        }
      }
      
      console.log(`📊 Processed ${period} collections:`, collections);
      setCollectionData(prev => ({
        ...prev,
        [period]: collections
      }));
    } catch (error) {
      console.error(`Error fetching ${period} collection data:`, error);
      // Set empty array on error to prevent undefined issues
      setCollectionData(prev => ({
        ...prev,
        [period]: []
      }));
    }
  };

  // Function to get collection amount for an officer
  const getOfficerCollectionAmount = (officerId, period) => {
    const collections = collectionData[period] || [];
    console.log(`🔍 Getting collection amount for officer ${officerId} (${period}):`, {
      collections: collections,
      officerId: officerId,
      period: period
    });
    
    // Try different ID matching strategies
    let officerCollection = collections.find(c => c.officer_id === officerId);
    if (!officerCollection) {
      // Try string comparison
      officerCollection = collections.find(c => String(c.officer_id) === String(officerId));
    }
    if (!officerCollection) {
      // Try with _id field
      officerCollection = collections.find(c => c._id === officerId);
    }
    if (!officerCollection) {
      // Try with ObjectId comparison
      officerCollection = collections.find(c => c.officer_id?.toString() === officerId?.toString());
    }
    
    console.log(`🔍 Found officer collection:`, officerCollection);
    
    const amount = officerCollection ? (officerCollection.total_amount || 0) : 0;
    console.log(`🔍 Collection amount:`, amount);
    
    return amount;
  };

  useEffect(() => {
    async function fetchData() {
      try {
        console.log("Fetching officers data...");
        console.log("Current token:", localStorage.getItem("token"));
        
        const response = await axios.get("officers");
        console.log("Officers API response:", response);
        
        if (response?.data) {
          console.log("Fetched officers data:", response.data);
          
          setData(response?.data?.result || []);
          setFilteredData(response?.data?.result || []);
        }
      } catch (error) {
        console.error("Error fetching officers:", error);
        console.error("Error response:", error.response);
        console.error("Error status:", error.response?.status);
        console.error("Error data:", error.response?.data);
        
        toast({
          title: "Error fetching officers",
          description: error.response?.data?.message || error.message,
          status: "error",
          duration: 4000,
          isClosable: true,
        });
      }
    }
    fetchData();
  }, [toast]);

  // Fetch collection data when report type changes
  useEffect(() => {
    fetchCollectionData(reportType);
  }, [reportType]);

  useEffect(() => {
    let result = data.map(officer => ({
      ...officer,
      total_collection: getOfficerCollectionAmount(officer._id, reportType)
    }));

    // Apply search filter
    if (searchTerm.trim() !== "") {
      result = result.filter(
        (officer) =>
          officer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          officer._id?.toString().includes(searchTerm) ||
          officer.officer_type?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

         // Apply status filter
     if (statusFilter !== "all") {
       result = result.filter((officer) => {
         const isActive = officer.isActive || officer.is_active;
         if (statusFilter === "active") {
           return isActive === true;
         } else if (statusFilter === "inactive") {
           return isActive === false;
         }
         return true;
       });
     }

    // Apply sorting
    if (sortBy) {
      result = result.sort((a, b) => {
        let comparison = 0;
        
        if (sortBy === 'name_asc' || sortBy === 'name_desc') {
          comparison = (a.name || '').localeCompare(b.name || '');
        }
        
        return sortOrder === 'asc' ? comparison : -comparison;
      });
    }

    setFilteredData(result);
    setCurrentPage(1);
  }, [searchTerm, statusFilter, data, sortBy, sortOrder, collectionData, reportType]);

  const handleDelete = () => {
    axios
             .delete(`officers/${newID}`)
      .then((res) => {
        if (res.data) {
          toast({
            title: `Success! Officer has been deleted successfully`,
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
          description: err.response?.data?.message || "Something went wrong while deleting the officer",
          status: "error",
          duration: 4000,
          isClosable: true,
        });
      });
  };

  const handleSort = (sortType) => {
    setSortBy(sortType);
    setSortOrder(sortType.includes('_desc') ? 'desc' : 'asc');
  };

  // Get display name for sort type
  const getSortDisplayName = (sortType) => {
    switch (sortType) {
      case "name_asc":
        return t('Name A-Z');
      case "name_desc":
        return t('Name Z-A');
      default:
        return '';
    }
  };

  const handleBulkStatusChange = async (newStatus) => {
    try {
      // Show confirmation dialog
      if (!window.confirm(t(`Are you sure you want to ${newStatus ? 'activate' : 'deactivate'} all officers?`))) {
        return;
      }

             // Update all officers in the current filtered data
            const updatePromises = filteredData.map(officer => 
           axios.put(`officers/${officer._id}`, { is_active: newStatus })
         );

      await Promise.all(updatePromises);

      toast({
        title: t("Bulk Status Update"),
        description: t(`All officers ${newStatus ? 'activated' : 'deactivated'} successfully`),
        status: "success",
        duration: 4000,
        isClosable: true,
        position: "top"
      });

             // Update local state
       setData((prev) =>
         prev.map((item) => ({
           ...item,
           isActive: newStatus,
           is_active: newStatus
         }))
       );
       setFilteredData((prev) =>
         prev.map((item) => ({
           ...item,
           isActive: newStatus,
           is_active: newStatus
         }))
       );
    } catch (err) {
      console.error("Bulk status update error:", err);
      toast({
        title: t("Bulk Update Failed"),
        description: t("Some officers could not be updated"),
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    }
  };

  const handleToggleStatus = async (officer) => {
    try {
      const currentStatus = officer.isActive || officer.is_active;
      const newStatus = !currentStatus;
                           const res = await axios.put(`users/${officer._id}`, {
          is_active: newStatus  // Use backend field name
        });
      
      if (res.data) {
        toast({
          title: t("Status Updated"),
          description: t(`Officer ${newStatus ? 'activated' : 'deactivated'} successfully`),
          status: "success",
          duration: 4000,
          isClosable: true,
          position: "top"
        });
        
                 // Update local state
         setData((prev) =>
           prev.map((item) =>
             item._id === officer._id ? { ...item, isActive: newStatus, is_active: newStatus } : item
           )
         );
         setFilteredData((prev) =>
           prev.map((item) =>
             item._id === officer._id ? { ...item, isActive: newStatus, is_active: newStatus } : item
           )
         );
      }
    } catch (err) {
      console.error("Status update error:", err);
      toast({
        title: t("Status Update Failed"),
        description: err.response?.data?.message || t("Something went wrong"),
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    }
  };

  // Function to handle status change from dropdown
  const handleStatusChange = async (officerId, newStatus) => {
    try {
      const res = await axios.put(`officers/${officerId}`, {
        is_active: newStatus
      });
      
      if (res.data) {
        toast({
          title: t("Status updated successfully"),
          status: "success",
          duration: 3000,
          isClosable: true,
          position: "top"
        });
        
        // Update local state
        setData((prev) =>
          prev.map((item) =>
            item._id === officerId ? { ...item, isActive: newStatus, is_active: newStatus } : item
          )
        );
        setFilteredData((prev) =>
          prev.map((item) =>
            item._id === officerId ? { ...item, isActive: newStatus, is_active: newStatus } : item
          )
        );
      }
    } catch (err) {
      console.error("Status change error:", err);
      toast({
        title: t("Failed to update status"),
        description: err.response?.data?.message || t("Something went wrong"),
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    }
  };

  const handleEditSave = async () => {
    try {
      // Comprehensive form validation
      const errors = [];

      // Officer Type validation
      if (!editData.officer_type) {
        errors.push(t("Officer Type is required"));
      }

      // Officer Code validation - only required for collection_officer
      if (editData.officer_type === "collection_officer") {
        if (!editData.officer_code || editData.officer_code.toString().trim() === "") {
          errors.push(t("Officer Code is required for Collection Officers"));
        } else if (isNaN(editData.officer_code) || parseInt(editData.officer_code) <= 0) {
          errors.push(t("Officer Code must be a positive number"));
        }
      }

      // Name validation
      if (!editData.name?.trim()) {
        errors.push(t("Name is required"));
      } else if (editData.name.trim().length < 2) {
        errors.push(t("Name must be at least 2 characters"));
      }

      // Phone number validation (10 digits only)
      const phoneRegex = /^[0-9]{10}$/;
      if (!editData.phone_number) {
        errors.push(t("Phone Number is required"));
      } else if (!phoneRegex.test(editData.phone_number)) {
        errors.push(t("Phone Number must be exactly 10 digits"));
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!editData.email) {
        errors.push(t("Email is required"));
      } else if (!emailRegex.test(editData.email)) {
        errors.push(t("Please enter a valid email address"));
      }

      // PAN Number validation (10 characters, alphanumeric)
      const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
      if (!editData.pan) {
        errors.push(t("PAN Number is required"));
      } else if (!panRegex.test(editData.pan.toUpperCase())) {
        errors.push(t("PAN Number must be in correct format (e.g., ABCDE1234F)"));
      }

      // Aadhar Number validation (12 digits)
      const aadharRegex = /^[0-9]{12}$/;
      if (!editData.aadhar) {
        errors.push(t("Aadhar Number is required"));
      } else if (!aadharRegex.test(editData.aadhar)) {
        errors.push(t("Aadhar Number must be exactly 12 digits"));
      }

      // Date of Birth validation
      if (!editData.dob) {
        errors.push(t("Date of Birth is required"));
      } else {
        const dob = new Date(editData.dob);
        const today = new Date();
        const age = today.getFullYear() - dob.getFullYear();
        if (age < 18 || age > 100) {
          errors.push(t("Age must be between 18 and 100 years"));
        }
      }

      // Show all validation errors
      if (errors.length > 0) {
        toast({
          title: t("Validation Errors"),
          description: errors.join(", "),
          status: "error",
          duration: 6000,
          isClosable: true,
          position: "top",
        });
        return;
      }

             // Prepare data with proper formatting
       const submitData = {
         ...editData,
         name: editData.name.trim(),
         email: editData.email.toLowerCase(),
         pan: editData.pan.toUpperCase(),
         officer_type: editData.officer_type, // Ensure officer_type is included
         is_active: editData.isActive, // Convert to backend field name
       };

             // Handle officer_code based on officer_type
       if (editData.officer_type === "collection_officer") {
         if (editData.officer_code && editData.officer_code.toString().trim() !== "") {
           submitData.officer_code = editData.officer_code.toString().trim();
         } else {
           submitData.officer_code = null;
         }
       } else {
         // For non-collection officers, completely exclude officer_code field
         delete submitData.officer_code;
       }

               console.log("Submitting officer update data:", submitData);
               const res = await axios.put(`users/${editData._id}`, submitData);
      if (res.data) {
        toast({
          title: t("Officer updated successfully"),
          status: "success",
          duration: 4000,
          isClosable: true,
          position: "top"
        });
                 // Prepare the updated item with both field names for frontend compatibility
         const updatedItem = {
           ...submitData,
           isActive: submitData.is_active, // Ensure frontend field is also updated
         };
         
         setData((prev) =>
           prev.map((item) =>
             item._id === editData._id ? updatedItem : item
           )
         );
         setFilteredData((prev) =>
           prev.map((item) =>
             item._id === editData._id ? updatedItem : item
           )
         );
        setIsEditing(false);
      }
    } catch (err) {
      console.error("Update error:", err);
      toast({
        title: t("Update Failed"),
        description: err.response?.data?.message || t("Something went wrong"),
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
        minWidth: 60,
        width: 60,
      },
      {
        Header: t('Officer Name'),
        accessor: "name",
        Cell: ({ value, row: { original } }) => (
          <Cell text={`${original?.name || '-'}`} bold={"bold"} />
        ),
        minWidth: 120,
      },
      {
        Header: t('Officer Type'),
        accessor: "officer_type",
        Cell: ({ value, row: { original } }) => (
          <Cell text={`${original?.officer_type ? original.officer_type.replace('_', ' ').toUpperCase() : '-'}`} />
        ),
        minWidth: 140,
      },
      {
        Header: t('Officer Code'),
        accessor: "officer_code",
        Cell: ({ value, row: { original } }) => (
          <Cell text={`${original?.officer_code || '-'}`} />
        ),
        minWidth: 100,
      },
      {
        Header: t('Phone Number'),
        accessor: "phone_number",
        Cell: ({ value, row: { original } }) => (
          <Cell text={`${original?.phone_number || '-'}`} />
        ),
        minWidth: 120,
      },
      {
        Header: t('Total Collection'),
        accessor: "total_collection",
        Cell: ({ value, row: { original } }) => (
          <Cell text={`₹${original?.total_collection?.toLocaleString() || '0'}`} />
        ),
        minWidth: 140,
      },
             {
         Header: t('Status'),
         accessor: "isActive",
         minWidth: 120,
         Cell: ({ value, row: { original } }) => {
           const currentStatus = original?.isActive || original?.is_active;
           return (
             <Select
               value={currentStatus ? 'active' : 'inactive'}
               onChange={(e) => handleStatusChange(original._id, e.target.value === 'active')}
               size="sm"
               width="120px"
               bg="white"
               color="gray.700"
               borderColor="gray.300"
               _hover={{ borderColor: "gray.400" }}
               _focus={{ 
                 borderColor: currentStatus ? "green.400" : "red.400",
                 boxShadow: `0 0 0 1px ${currentStatus ? "#68D391" : "#FC8181"}`
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
        Header: t('Action'),
        accessor: "",
        minWidth: 100,
        Cell: ({ value, row: { original } }) => {
          return (
            <Menu>
              <MenuButton
                as={Button}
                size="sm"
                className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-md shadow-sm font-medium"
                onClick={() => setNewID(original._id)}
              >
                {t('Actions')}
              </MenuButton>
                <MenuList>
                  <MenuItem 
                    onClick={() => {
                      console.log('Navigating to:', `/dash/view-officer/${original?._id}`);
                      navigate(`/dash/view-officer/${original?._id}`);
                    }}
                  >
                    <GrOverview className="mr-4" /> {t('View Officer')}
                  </MenuItem>
                        <MenuItem onClick={() => { 
                     console.log("Opening edit form for officer:", original);
                     // Ensure we have both field names for compatibility
                     const editOfficer = {
                       ...original,
                       isActive: original.isActive || original.is_active
                     };
                     setEditData(editOfficer); 
                     setIsEditing(true); 
                   }}>
                     <MdEdit className="mr-4" /> {t('Edit')}
                   </MenuItem>
                   <MenuItem onClick={() => handleToggleStatus(original)}>
                     <HiStatusOnline className="mr-4" />
                     {original?.isActive ? t('Deactivate') : t('Activate')}
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
           .officer-header-responsive {
             flex-direction: row;
             align-items: center;
           }
           
           @media (max-width: 1024px) {
             .officer-header-responsive {
               flex-direction: column;
               align-items: stretch;
               gap: 1rem;
             }
             
             .officer-header-responsive > div {
               width: 100%;
             }
             
             .officer-header-responsive .search-section {
               order: 2;
             }
             
             .officer-header-responsive .actions-section {
               order: 1;
             }
           }
           
           @media (max-width: 768px) {
             .officer-header-responsive .search-section {
               flex-direction: column;
               gap: 0.5rem;
             }
             
             .officer-header-responsive .search-section > div {
               width: 100%;
             }
           }
         `}
       </style>
       <motion.div
         initial="hidden"
           animate="visible"
           variants={containerVariants}
                className="min-h-screen bg-primaryBg flex flex-col pt-10 sm:pt-20"
         >
             {/* Fixed Header Section */}
       <motion.div 
         variants={itemVariants}
         className="flex-shrink-0 pb-0 px-4"
       >
                   <section className="md:p-0 mt-0">
           <div className="py-0 pt-2">
                         <motion.div 
               variants={itemVariants}
               className="space-y-4 mb-0 officer-header-responsive"
             >
               {/* First Row - Total Officers and Action Buttons */}
               <motion.div
                 variants={itemVariants}
                 className="flex flex-wrap gap-4 items-center justify-between"
               >
                 {/* Total Officers */}
                 <div className="flex gap-2">
                   <Menu>
                     <MenuButton
                       as={Button}
                       mt={6}
                       colorScheme="blue"
                       size="sm"
                       className="bg-primary hover:bg-primaryDark text-white px-4 py-2 font-medium rounded-md shadow-sm"
                     >
                       {t('Total Officers')} : {data.length}
                     </MenuButton>
                   </Menu>
                 </div>

                 {/* Action Buttons */}
                 <div className="flex flex-wrap gap-3">
                   <Menu>
                     <MenuButton
                       as={Button}
                       colorScheme="gray"
                    size="sm"
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md shadow-sm font-medium min-w-[120px]"
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
                      onClick={() => handleSort('name_asc')}
                      className="hover:bg-blue-50 px-4 py-2 text-sm"
                    >
                      <span className="flex items-center justify-between w-full">
                        <span>👤 {t('Name A-Z')}</span>
                        {sortBy === 'name_asc' && (
                          <span className="text-blue-600 font-bold">↑</span>
                        )}
                      </span>
                    </MenuItem>
                    <MenuItem 
                      onClick={() => handleSort('name_desc')}
                      className="hover:bg-blue-50 px-4 py-2 text-sm"
                    >
                      <span className="flex items-center justify-between w-full">
                        <span>👤 {t('Name Z-A')}</span>
                        {sortBy === 'name_desc' && (
                          <span className="text-blue-600 font-bold">↓</span>
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

                <Menu>
                  <MenuButton
                    as={Button}
                    colorScheme="orange"
                    size="sm"
                    className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md shadow-sm font-medium min-w-[120px]"
                  >
                    {t('Bulk Actions')}
                  </MenuButton>
                  <MenuList>
                    <MenuItem onClick={() => handleBulkStatusChange(true)}>
                      {t('Activate All')}
                    </MenuItem>
                                         <MenuItem onClick={() => handleBulkStatusChange(false)}>
                       {t('Deactivate All')}
                     </MenuItem>
                  </MenuList>
                </Menu>

                <Link to={`/dash/create-officer`}>
                  <Button
                    colorScheme="blue"
                    size="sm"
                    className="bg-primary hover:bg-primaryDark text-white px-4 py-2 rounded-md shadow-sm font-medium min-w-[140px]"
                  >
                    {t('Add New Officer', 'Add New Officer')}
                  </Button>
                </Link>
                 </div>
               </motion.div>

               {/* Second Row - Search and Status Filter */}
               <motion.div 
                 variants={itemVariants}
                 className="flex flex-wrap gap-4 items-center justify-between"
               >
                 {/* Left Side - Search and Status */}
                 <div className="flex flex-wrap gap-4 items-center">
                   {/* Search Input */}
                   <div className="w-full sm:w-80">
                     <InputGroup borderRadius={5} size="sm">
                       <InputLeftElement
                         pointerEvents="none"
                       />
                       <Input
                         type="text"
                         placeholder={t('Search officers...')}
                         focusBorderColor="blue.500"
                         border="1px solid #949494"
                         value={searchTerm}
                         onChange={(e) => setSearchTerm(e.target.value)}
                       />
                       <InputRightAddon p={0} border="none">
                         <Button
                           className="bg-primary hover:bg-primaryDark text-white px-4 py-2 font-medium"
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
                   </div>

                   {/* Status Filter */}
                   <div className="w-full sm:w-48">
                     <select
                       className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-primary text-sm p-2 border"
                       value={statusFilter}
                       onChange={(e) => setStatusFilter(e.target.value)}
                     >
                       <option value="all">{t('All Status')}</option>
                       <option value="active">{t('Active Only')}</option>
                       <option value="inactive">{t('Inactive Only')}</option>
                     </select>
                   </div>

                   {/* Clear Filters Button */}
                   {(searchTerm || statusFilter !== "all") && (
                     <Button
                       size="sm"
                       variant="outline"
                       onClick={() => {
                         setSearchTerm("");
                         setStatusFilter("all");
                       }}
                       className="text-gray-600 hover:text-gray-800 px-4 py-2 rounded-md border-gray-300 hover:border-gray-400 font-medium min-w-[120px]"
                     >
                       {t('Clear Filters')}
                     </Button>
                   )}
                 </div>

                 {/* Right Side - Report Type */}
                 <div className="w-full sm:w-48">
                   <Select
                     value={reportType}
                     onChange={(e) => setReportType(e.target.value)}
                     size="sm"
                     border="1px solid #949494"
                     focusBorderColor="blue.500"
                   >
                     <option value="daily">{t('Daily')}</option>
                     <option value="weekly">{t('Weekly')}</option>
                     <option value="monthly">{t('Monthly')}</option>
                   </Select>
                 </div>
               </motion.div>
            </motion.div>
          </div>
        </section>
      </motion.div>

             {/* Scrollable Table Section */}
       <motion.div 
         variants={itemVariants}
         className="flex-1 px-2 sm:px-4 pb-4 overflow-hidden mt-4"
       >
        <div className="bg-white rounded-xl shadow-lg h-full flex flex-col">
          {/* Only the table content scrolls */}
          <div className="flex-1 overflow-auto">
            <div className="overflow-x-auto min-w-full">
              <div className="min-w-[800px]">
                <Table data={paginatedData} columns={columns} />
              </div>
            </div>
          </div>

          {/* Fixed Pagination */}
          <div className="flex-shrink-0 flex flex-col sm:flex-row justify-center p-4 border-t gap-4 items-center bg-gray-50">
            <div className="flex gap-2">
              <Button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                isDisabled={currentPage === 1}
                colorScheme="blue"
                variant="outline"
                size="sm"
                className="w-full sm:w-auto px-4 py-2 rounded-md font-medium"
              >
                {t('Previous')}
              </Button>
              <span className="text-sm bg-primary text-white px-4 py-2 rounded-md font-medium flex items-center min-w-[80px] justify-center">
                {currentPage} {t('of')} {totalPages}
              </span>
              <Button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                isDisabled={currentPage === totalPages}
                colorScheme="blue"
                variant="outline"
                size="sm"
                className="w-full sm:w-auto px-4 py-2 rounded-md font-medium"
              >
                {t('Next')}
              </Button>
            </div>
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
              {t('Delete Officer', 'Delete Officer')}
            </AlertDialogHeader>

            <AlertDialogBody>
              {t('Are you sure you want to delete this officer? This action cannot be undone.', 'Are you sure you want to delete this officer? This action cannot be undone.')}
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

      <Drawer isOpen={isEditing} placement="right" onClose={() => {
        setIsEditing(false);
        setEditData(null);
      }} size="lg">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>{t('Edit Officer', 'Edit Officer')}</DrawerHeader>
          <DrawerBody>
            <div className="space-y-4 pt-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('Name')} *
                </label>
                <Input
                  placeholder={t('Enter officer name')}
                  value={editData?.name || ""}
                  onChange={(e) =>
                    setEditData({ ...editData, name: e.target.value })
                  }
                />
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('Phone Number')} *
                </label>
                <Input
                  placeholder={t('Enter 10-digit phone number')}
                  value={editData?.phone_number || ""}
                  maxLength={10}
                  onChange={(e) =>
                    setEditData({ ...editData, phone_number: e.target.value })
                  }
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('Email')} *
                </label>
                <Input
                  placeholder={t('Enter email address')}
                  type="email"
                  value={editData?.email || ""}
                  onChange={(e) =>
                    setEditData({ ...editData, email: e.target.value })
                  }
                />
              </div>

              {/* PAN Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('PAN Number')} *
                </label>
                <Input
                  placeholder={t('Enter PAN Number')}
                  value={editData?.pan || ""}
                  maxLength={10}
                  onChange={(e) =>
                    setEditData({ ...editData, pan: e.target.value })
                  }
                />
              </div>

              {/* Aadhar Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('Aadhar Number')} *
                </label>
                <Input
                  placeholder={t('Enter Aadhar Number')}
                  value={editData?.aadhar || ""}
                  maxLength={12}
                  onChange={(e) =>
                    setEditData({ ...editData, aadhar: e.target.value })
                  }
                />
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('Date of Birth')} *
                </label>
                <Input
                  type="date"
                  value={editData?.dob || ""}
                  onChange={(e) =>
                    setEditData({ ...editData, dob: e.target.value })
                  }
                />
              </div>

              {/* Officer Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('Officer Type')} *
                </label>
                <select
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-primary sm:text-sm p-2 border"
                  value={editData?.officer_type || "manager"}
                                                                               onChange={(e) => {
                        const newType = e.target.value;
                        console.log("Changing officer type to:", newType);
                        setEditData({ 
                          ...editData, 
                          officer_type: newType,
                          // Clear officer_code if changing to non-collection_officer
                          ...(newType !== "collection_officer" && { officer_code: null })
                        });
                      }}
                >
                  <option value="collection_officer">{t('Collection Officer')}</option>
                  <option value="manager">{t('Manager')}</option>
                  <option value="admin">{t('Admin')}</option>
                  <option value="accounter">{t('Accounter')}</option>
                </select>
              </div>

              {/* Officer Code - Only show for collection_officer */}
              {(editData?.officer_type === "collection_officer") && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('Officer Code')} *
                  </label>
                  <Input
                    placeholder={t('Enter officer code')}
                    type="number"
                    value={editData?.officer_code || ""}
                    onChange={(e) =>
                      setEditData({ ...editData, officer_code: e.target.value || null })
                    }
                  />
                </div>
              )}

                             {/* Is Active */}
               <div className="flex items-center">
                 <label className="block text-sm font-medium text-gray-700 mr-2">
                   {t('Is Active')}
                 </label>
                 <input
                   type="checkbox"
                   checked={editData?.isActive || false}
                   onChange={(e) =>
                     setEditData({ ...editData, isActive: e.target.checked })
                   }
                   className="accent-primary focus:ring-primary h-4 w-4 border-none rounded"
                 />
                 <span className="ml-2 text-sm text-gray-600">
                   {editData?.isActive ? t('Officer is currently active') : t('Officer is currently inactive')}
                 </span>
               </div>
            </div>
          </DrawerBody>
          <DrawerFooter>
            <Button variant="outline" mr={3} onClick={() => {
              setIsEditing(false);
              setEditData(null);
            }}>
              {t('Cancel', 'Cancel')}
            </Button>
            <Button colorScheme="blue" onClick={handleEditSave}>
              {t('Save Changes', 'Save Changes')}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </motion.div>
    </>
  );
}

export default Officer;

