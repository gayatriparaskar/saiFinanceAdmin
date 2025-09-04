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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const usersPerPage = 10;
  const toast = useToast()
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = React.useRef();

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

          // Calculate total safely
          const sum = (response.data.result?.saving_account_id?.total_amount || []).reduce((acc, item) => {
            return acc + (item.amount_to_be || 0);
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
            return acc + (item.amount_to_be || 0);
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
            const aEmiDays = a.saving_account_id?.emi_day || 0;
            const bEmiDays = b.saving_account_id?.emi_day || 0;
            const aCreatedOn = a.saving_account_id?.created_on;
            const bCreatedOn = b.saving_account_id?.created_on;
            
            if (!aCreatedOn || aEmiDays === 0) aValue = 0;
            else {
              const aCreatedDate = new Date(aCreatedOn);
              const aCurrentDate = new Date();
              const aDaysPassed = Math.floor((aCurrentDate - aCreatedDate) / (1000 * 60 * 60 * 24));
              aValue = Math.max(0, aEmiDays - aDaysPassed);
            }
            
            if (!bCreatedOn || bEmiDays === 0) bValue = 0;
            else {
              const bCreatedDate = new Date(bCreatedOn);
              const bCurrentDate = new Date();
              const bDaysPassed = Math.floor((bCurrentDate - bCreatedDate) / (1000 * 60 * 60 * 24));
              bValue = Math.max(0, bEmiDays - bDaysPassed);
            }
            
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
      const res = await axios.put(`users/${editData._id}`, editData);
      if (res.data) {
        toast({
          title: `Account updated successfully`,
          status: "success",
          duration: 4000,
          isClosable: true,
          position: "top"
        });
        setData((prev) =>
          prev.map((item) =>
            item._id === editData._id ? { ...item, ...editData } : item
          )
        );
        setFilteredData((prev) =>
          prev.map((item) =>
            item._id === editData._id ? { ...item, ...editData } : item
          )
        );
        setIsEditing(false);
      }
    } catch (err) {
      toast({
        title: `Update Failed`,
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
        Header: t('Remaining EMI'),
        accessor: "remaining_emi",
        Cell: ({ value, row: { original } }) => {
          const emiDays = original?.saving_account_id?.emi_day || 0;
          const createdOn = original?.saving_account_id?.created_on;
          
          if (!createdOn || emiDays === 0) return <Cell text="-" />;
          
          const createdDate = new Date(createdOn);
          const currentDate = new Date();
          const daysPassed = Math.floor((currentDate - createdDate) / (1000 * 60 * 60 * 24));
          const remainingDays = Math.max(0, emiDays - daysPassed);
          
          return <Cell text={`${remainingDays} days`} />;
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
        accessor: "total_amount",
        Cell: ({ value, row: { original } }) => <Cell text={original?.saving_account_id?.total_amount} />,

      },
      {
        Header: t('Status'),
        accessor: "status",
        Cell: ({ value, row: { original } }) => (
          <Cell text={t(original?.status || "Active")} />
        ),
      },
      {
        Header: t('Date Created', 'Date Created'),
        accessor: "created_on",
        Cell: ({ value, row: { original } }) => (
          <Cell text={dayjs(value).format("D MMM, YYYY h:mm A")} />
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
                    {t('Total Savings')} : ₹ {"64300"}
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
                className="w-96 search-section"
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
                    className="bg-gray-600 hover:bg-gray-700 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
                  >
                    {sortBy ? `${t('Sort By', 'Sort By')}: ${getSortDisplayName(sortBy)} ${sortOrder === 'asc' ? '↑' : '↓'}` : t('Sort By', 'Sort By')}
                  </MenuButton>
                  <MenuList>
                    <MenuItem onClick={() => handleSort('current_amount_high_to_low')}>
                      {t('Current Amount High to Low')} {sortBy === 'current_amount_high_to_low' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </MenuItem>
                    <MenuItem onClick={() => handleSort('current_amount_low_to_high')}>
                      {t('Current Amount Low to High')} {sortBy === 'current_amount_low_to_high' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </MenuItem>
                    <MenuItem onClick={() => handleSort('remaining_emi')}>
                      {t('Remaining EMI')} {sortBy === 'remaining_emi' && (sortOrder === 'asc' ? '↑' : '↓')}
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

      <Drawer isOpen={isEditing} placement="right" onClose={() => setIsEditing(false)}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>{t('Edit Account', 'Edit Account')}</DrawerHeader>
          <DrawerBody>
            <div className="space-y-4">
              <Input
                placeholder={t('Account Holder Name', 'Account Holder Name')}
                value={editData?.full_name || ""}
                onChange={(e) =>
                  setEditData({ ...editData, full_name: e.target.value })
                }
              />
              <Input
                placeholder={t('Phone Number', 'Phone Number')}
                value={editData?.phone_number || ""}
                onChange={(e) =>
                  setEditData({ ...editData, phone_number: e.target.value })
                }
              />
             
            </div>
          </DrawerBody>
          <DrawerFooter>
            <Button variant="outline" mr={3} onClick={() => setIsEditing(false)}>
              {t('Cancel', 'Cancel')}
            </Button>
            <Button colorScheme="blue" onClick={handleEditSave}>
              {t('Save', 'Save')}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </motion.div>
    </>
  );
}

export default SavingAccount;
