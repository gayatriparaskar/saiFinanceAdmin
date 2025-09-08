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
  const [isEditing, setIsEditing] = useState(false);
  const usersPerPage = 10;
  const toast = useToast();
  
     const { isOpen, onOpen, onClose } = useDisclosure();
   const cancelRef = React.useRef();

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

  useEffect(() => {
    let result = data;

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

    setFilteredData(result);
    setCurrentPage(1);
  }, [searchTerm, statusFilter, data]);

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

  const handleSort = (field) => {
    const sortedData = [...filteredData].sort((a, b) => {
      if (field === 'name') {
        return (a.name || '').localeCompare(b.name || '');
      } else if (field === 'officer_type') {
        return (a.officer_type || '').localeCompare(b.officer_type || '');
      } else if (field === 'created_on') {
        return new Date(b.created_on || 0) - new Date(a.created_on || 0);
             } else if (field === 'isActive') {
         const aStatus = a.isActive || a.is_active;
         const bStatus = b.isActive || b.is_active;
         return (bStatus ? 1 : 0) - (aStatus ? 1 : 0);
       }
      return 0;
    });
    setFilteredData(sortedData);
    setCurrentPage(1);
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
      },
      {
        Header: t('Officer Name'),
        accessor: "name",
        Cell: ({ value, row: { original } }) => (
          <Cell text={`${original?.name || '-'}`} bold={"bold"} />
        ),
      },
      {
        Header: t('Officer Type'),
        accessor: "officer_type",
        Cell: ({ value, row: { original } }) => (
          <Cell text={`${original?.officer_type ? original.officer_type.replace('_', ' ').toUpperCase() : '-'}`} />
        ),
      },
      {
        Header: t('Officer Code'),
        accessor: "officer_code",
        Cell: ({ value, row: { original } }) => (
          <Cell text={`${original?.officer_code || '-'}`} />
        ),
      },
      {
        Header: t('Phone Number'),
        accessor: "phone_number",
        Cell: ({ value, row: { original } }) => (
          <Cell text={`${original?.phone_number || '-'}`} />
        ),
      },
             {
         Header: t('Status'),
         accessor: "isActive",
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
        Cell: ({ value, row: { original } }) => {
          return (
            <Menu>
              <MenuButton
                as={Button}
                className="bg-purple"
                colorScheme="bgBlue hover:bg-secondaryLight"
                onClick={() => setNewID(original._id)}
                p={2}   // padding 0
                m={0.5}   // margin 0
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
                   className="min-h-screen bg-primaryBg flex flex-col pt-24 sm:pt-28"
       >
             {/* Fixed Header Section */}
       <motion.div 
         variants={itemVariants}
         className="flex-shrink-0 pb-0 px-4"
       >
                   <section className="md:p-0 mt-0">
           <div className="py-0">
                         <motion.div 
               variants={itemVariants}
               className="flex justify-between items-center mb-0 officer-header-responsive"
             >
               {/* Stats Section */}
               <motion.div
                 variants={itemVariants}
                 className="flex gap-2"
               >
                <Menu>
                  <MenuButton
                    as={Button}
                    colorScheme="blue"
                    className="bg-primary hover:bg-primaryDark text-white text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
                    fontWeight={700}
                  >
                    {t('Total Officers')} : {data.length}
                  </MenuButton>
                </Menu>
                
              </motion.div>

                             {/* Search & Filters Section */}
               <motion.div 
                 variants={itemVariants}
                 className="flex gap-2 search-section"
               >
                 {/* Search Input */}
                 <div className="w-80">
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
                </div>

                                 {/* Status Filter */}
                 <div className="w-48">
                  <select
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-primary sm:text-sm p-2 border"
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
                    className="text-gray-600 hover:text-gray-800 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
                  >
                    {t('Clear Filters')}
                  </Button>
                )}
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
                    {t('Sort By', 'Sort By')}
                  </MenuButton>
                  <MenuList>
                    <MenuItem onClick={() => handleSort('name')}>{t('Name A-Z')}</MenuItem>
                    <MenuItem onClick={() => handleSort('officer_type')}>{t('Officer Type')}</MenuItem>
                    <MenuItem onClick={() => handleSort('created_on')}>{t('Join Date')}</MenuItem>
                    <MenuItem onClick={() => handleSort('isActive')}>{t('Status')}</MenuItem>
                  </MenuList>
                </Menu>

                <Menu>
                  <MenuButton
                    as={Button}
                    colorScheme="orange"
                    className="bg-orange-500 hover:bg-orange-600 text-white text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
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

                <Menu>
                  <Link to={`/dash/create-officer`}>
                    <MenuButton
                      as={Button}
                      colorScheme="blue"
                      className="bg-primary hover:bg-primaryDark text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
                    >
                      {t('Add New Officer', 'Add New Officer')}
                    </MenuButton>
                  </Link>
                </Menu>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </motion.div>

             {/* Scrollable Table Section */}
       <motion.div 
         variants={itemVariants}
         className="flex-1 px-4 pb-4 overflow-hidden mt-4"
       >
        <div className="bg-white rounded-xl shadow-lg h-full flex flex-col">
          {/* Only the table content scrolls */}
          <div className="flex-1 overflow-auto">
            <Table data={paginatedData} columns={columns} />
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

