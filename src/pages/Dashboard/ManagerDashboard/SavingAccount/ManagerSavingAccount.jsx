import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import axios from '../../../../axios';
import { FaPlus, FaSearch, FaEye, FaEdit, FaFilter, FaPiggyBank } from 'react-icons/fa';
import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  InputGroup,
  InputLeftElement,
  Input,
  InputRightAddon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  FormControl,
  FormLabel,
  Select,
  useToast,
} from "@chakra-ui/react";
import { useLocalTranslation } from '../../../../hooks/useLocalTranslation';
import Table from '../../../../componant/Table/Table';
import Cell from '../../../../componant/Table/cell';
import dayjs from 'dayjs';
import { MdEdit } from "react-icons/md";
import { HiStatusOnline } from "react-icons/hi";

const ManagerSavingAccount = () => {
  const navigate = useNavigate();
  const { t } = useLocalTranslation();
  const toast = useToast();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredData, setFilteredData] = useState([]);
  const [sortBy, setSortBy] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [totalSavings, setTotalSavings] = useState(0);
  const [totalActiveUsers, setTotalActiveUsers] = useState(0);
  const [editData, setEditData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoadingOfficers, setIsLoadingOfficers] = useState(false);
  const [officers, setOfficers] = useState([]);
  const usersPerPage = 10;

  useEffect(() => {
    fetchData();
    fetchOfficers(); // Fetch officers when component mounts
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('account/');
      if (response?.data?.result) {
        setData(response.data.result);
        setFilteredData(response.data.result);
        
        // Calculate total savings
        const sum = response.data.result.reduce((acc, item) => {
          return acc + (item?.saving_account_id?.current_amount || 0);
        }, 0);
        setTotalSavings(sum);
        setTotalActiveUsers(response.data.result.length);
      }
    } catch (error) {
      console.error('Error fetching savings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let result = data;
    
    // Apply search filter
    if (searchTerm) {
      result = result.filter(account =>
        account.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        account.saving_account_id?.account_number?.toString().includes(searchTerm) ||
        account.saving_account_id?.current_amount?.toString().includes(searchTerm)
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
            
          case "name_a_z":
            aValue = a.full_name?.toLowerCase() || "";
            bValue = b.full_name?.toLowerCase() || "";
            return sortOrder === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
            
          case "date_created":
            aValue = new Date(a.saving_account_id?.created_on || a.createdAt || 0);
            bValue = new Date(b.saving_account_id?.created_on || b.createdAt || 0);
            return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
            
          default:
            return 0;
        }
      });
    }
    
    setFilteredData(result);
  }, [data, searchTerm, sortBy, sortOrder]);

  const totalPages = Math.ceil(filteredData.length / usersPerPage);
  const startIndex = (currentPage - 1) * usersPerPage;
  const endIndex = startIndex + usersPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  // Sort functions
  const getSortDisplayName = (sortKey) => {
    const sortNames = {
      'current_amount_high_to_low': 'Amount (High to Low)',
      'current_amount_low_to_high': 'Amount (Low to High)',
      'name_a_z': 'Name (A to Z)',
      'date_created': 'Date (Newest)',
    };
    return sortNames[sortKey] || sortKey;
  };

  const handleSort = (sortKey) => {
    setSortBy(sortKey);
    
    let sortedData = [...filteredData];
    
    switch (sortKey) {
      case 'current_amount_high_to_low':
        sortedData.sort((a, b) => (b.saving_account_id?.current_amount || 0) - (a.saving_account_id?.current_amount || 0));
        break;
      case 'current_amount_low_to_high':
        sortedData.sort((a, b) => (a.saving_account_id?.current_amount || 0) - (b.saving_account_id?.current_amount || 0));
        break;
      case 'name_a_z':
        sortedData.sort((a, b) => (a.full_name || '').localeCompare(b.full_name || ''));
        break;
      case 'date_created':
        sortedData.sort((a, b) => new Date(b.saving_account_id?.created_on || 0) - new Date(a.saving_account_id?.created_on || 0));
        break;
      default:
        break;
    }
    
    setFilteredData(sortedData);
  };

  const handleViewSaving = (accountId) => {
    navigate(`/manager-dashboard/view-saving-user/${accountId}`);
  };

  const handleEditSaving = (accountId) => {
    navigate(`/manager-dashboard/add-saving-collection/${accountId}`);
  };

  const handleEditSavingAccount = (user) => {
    setEditData(user);
    setIsEditing(true);
  };

  // Fetch officers for edit form
  const fetchOfficers = async () => {
    try {
      setIsLoadingOfficers(true);
      const response = await axios.get("officers");
      if (response?.data?.result) {
        setOfficers(response.data.result);
      }
    } catch (error) {
      console.error("Error fetching officers:", error);
      setOfficers([]);
    } finally {
      setIsLoadingOfficers(false);
    }
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
          title: t("Account updated successfully"),
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
        title: t("Update Failed"),
        description: err.response?.data?.message || t("Failed to update account information"),
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
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
      Header: t('CURRENT AMOUNT'),
      accessor: "current_amount",
      Cell: ({ value, row: { original } }) => (
        <Cell text={`Rs. ${original?.saving_account_id?.current_amount?.toLocaleString() || 0}`} />
      ),
    },
    {
      Header: t('TOTAL AMOUNT'),
      accessor: "total_amount",
      Cell: ({ value, row: { original } }) => (
        <Cell text={`Rs. ${original?.saving_account_id?.amount_to_be?.toLocaleString() || 0}`} />
      ),
    },
    {
      Header: t('EMI DAY'),
      accessor: "emi_day",
      Cell: ({ value, row: { original } }) => (
        <Cell text={original?.saving_account_id?.emi_day || t('N/A')} />
      ),
    },
    {
      Header: t('REMAINING EMI DAYS'),
      accessor: "remaining_emi_days",
      Cell: ({ value, row: { original } }) => {
        const remainingDays = original?.saving_account_id?.remaining_emi_days;
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
        <Cell text={`Rs. ${original?.saving_account_id?.total_amount?.toLocaleString() || 0}`} />
      ),
    },
    {
      Header: t('DATE CREATED'),
      accessor: "created_on",
      Cell: ({ value, row: { original } }) => (
        <Cell text={original?.saving_account_id?.created_on ? dayjs(original.saving_account_id.created_on).format('DD MMM, YYYY h:mm A') : t('N/A')} />
      ),
    },
    {
      Header: t('END DATE'),
      accessor: "end_date",
      Cell: ({ value, row: { original } }) => (
        <Cell text={original?.saving_account_id?.end_date ? dayjs(original.saving_account_id.end_date).format('DD MMM, YYYY') : t('N/A')} />
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
        // For saving accounts, check if user has a saving account and if it's active
        const hasSavingAccount = original?.saving_account_id && original.saving_account_id !== null;
        const isAccountActive = original?.saving_account_id?.is_active === true || original?.saving_account_id?.is_active === 'true';
        const isActive = hasSavingAccount && isAccountActive;
        
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
            onClick={() => handleViewSaving(original._id)}
            className="text-primary hover:text-primaryDark p-1"
            title="View Details"
          >
            <HiStatusOnline />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleEditSaving(original._id)}
            className="text-secondary hover:text-secondaryDark p-1"
            title="Add Collection"
          >
            <FaPlus />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleEditSavingAccount(original)}
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
              <MenuItem onClick={() => console.log('More actions')}>
                {t('More Actions')}
              </MenuItem>
            </MenuList>
          </Menu>
        </div>
      ),
    },
  ], [data, currentPage, startIndex, t]);

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
            .saving-header-responsive {
              padding: 0.5rem;
            }
            
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
            
            .saving-header-responsive .stats-section {
              flex-direction: column;
              gap: 0.5rem;
            }
            
            .saving-header-responsive .stats-section > * {
              width: 100%;
            }
          }
          
          @media (max-width: 480px) {
            .saving-header-responsive {
              padding: 0.25rem;
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
            
            .saving-header-responsive .stats-section Button {
              font-size: 0.75rem;
              padding: 0.5rem 0.75rem;
            }
          }
          
          @media (max-width: 360px) {
            .saving-header-responsive {
              padding: 0.125rem;
            }
            
            .saving-header-responsive .actions-section Button {
              font-size: 0.7rem;
              padding: 0.375rem 0.5rem;
            }
            
            .saving-header-responsive .stats-section Button {
              font-size: 0.7rem;
              padding: 0.375rem 0.5rem;
            }
          }
          
          /* Table responsive styles */
          @media (max-width: 768px) {
            .table-container {
              overflow-x: auto;
            }
            
            .table-container table {
              min-width: 800px;
            }
          }
        `}
      </style>
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
              className="flex justify-between items-center mb-0 saving-header-responsive"
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
                    <span className="hidden sm:inline">{t('Total Savings Outgoing')} : ₹ {totalSavings.toLocaleString()}</span>
                    <span className="sm:hidden">Total: ₹{totalSavings.toLocaleString()}</span>
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
                      onClick={() => handleSort('current_amount_high_to_low')}
                      className="hover:bg-blue-50 px-4 py-2 text-sm"
                    >
                      <span className="flex items-center justify-between w-full">
                        <span>💰 {t('Amount High to Low')}</span>
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
                        <span>💰 {t('Amount Low to High')}</span>
                        {sortBy === 'current_amount_low_to_high' && (
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

                <Link to={`/manager-dashboard/create-saving-user`} onClick={() => console.log('🔄 Navigating to create saving user...')}>
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
        className="max-w-7xl mx-auto px-2 sm:px-4 pb-6"
      >
        <div className="bg-white rounded-lg shadow-lg overflow-hidden table-container">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              <span className="ml-3 text-gray-600">{t('Loading savings...')}</span>
            </div>
          ) : (
            <Table
              data={paginatedData}
              columns={columns}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </div>
      </motion.div>

      {/* Edit Saving Account Drawer */}
      <Drawer isOpen={isEditing} placement="right" onClose={handleEditClose} size="lg">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>{t('Edit User & Saving Account Details')}</DrawerHeader>
          <DrawerBody>
            {editData && (
              <div className="space-y-6">
                {/* Personal Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-purple">{t('Personal Information')}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormControl>
                      <FormLabel>{t('Full Name')} *</FormLabel>
                      <Input
                        placeholder={t('Full Name')}
                        value={editData?.full_name || ""}
                        onChange={(e) =>
                          setEditData({ ...editData, full_name: e.target.value })
                        }
                        size="md"
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
                        size="md"
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
                        size="md"
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
                        size="md"
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
                      size="md"
                    >
                      {officers.map((officer) => (
                        <option key={officer._id} value={officer._id}>
                          {officer.name}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                </div>

                {/* Saving Account Details */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-purple">{t('Saving Account Details')}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormControl>
                      <FormLabel>{t('Account Number')}</FormLabel>
                      <Input
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
                    </FormControl>
                    <FormControl>
                      <FormLabel>{t('Current Amount')}</FormLabel>
                      <Input
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
                    </FormControl>
                    <FormControl>
                      <FormLabel>{t('Interest Rate')}</FormLabel>
                      <Input
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
                    </FormControl>
                    <FormControl>
                      <FormLabel>{t('EMI Day')}</FormLabel>
                      <Input
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
    </>
  );
};

export default ManagerSavingAccount;