import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useLocalTranslation } from '../../hooks/useLocalTranslation';
import axios from '../../axios';
import dayjs from 'dayjs';
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Badge,
  Button,
  useToast,
  Select,
  Input,
  InputGroup,
  InputLeftElement,
  Box,
  Text,
  Flex,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Card,
  CardHeader,
  CardBody,
  Heading,
  HStack,
  VStack,
  IconButton,
  Tooltip,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  Divider
} from '@chakra-ui/react';
import { 
  SearchIcon, 
  ViewIcon, 
  EditIcon, 
  DeleteIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DownloadIcon
} from '@chakra-ui/icons';
import { FaSync } from 'react-icons/fa';

/**
 * UserDataTable Component
 * 
 * Displays comprehensive user data from separate API endpoints:
 * - users/ endpoint for loan and saving users
 * - officers/ endpoint for officers
 * 
 * Supports filtering by user type (loan, saving, both, officer, all)
 * Features: search, filter, pagination, status management, export
 * 
 * @param {string} userType - Type of users to display ('all', 'loan', 'saving', 'officer')
 */
const UserDataTable = ({ userType = 'all', onRefresh }) => {
  const { t } = useLocalTranslation();
  const navigate = useNavigate();
  const toast = useToast();
  
  // State management
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  
  // Modal state
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Fetch user data
  useEffect(() => {
    fetchUserData();
  }, [userType]);

  // Add state for collection data
  const [collectionData, setCollectionData] = useState({
    loanCollections: new Map(),
    savingCollections: new Map()
  });

  // Filter users based on search and filters
  useEffect(() => {
    console.log('🔍 Filtering users:', {
      totalUsers: users.length,
      searchTerm,
      statusFilter,
      typeFilter,
      usersByType: {
        loan: users.filter(u => u.user_type === 'loan').length,
        saving: users.filter(u => u.user_type === 'saving').length,
        both: users.filter(u => u.user_type === 'both').length,
        user: users.filter(u => u.user_type === 'user').length
      }
    });

    let filtered = users;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(user => {
        const searchLower = searchTerm.toLowerCase();
        return (
          user.name?.toLowerCase().includes(searchLower) ||
          user.displayName?.toLowerCase().includes(searchLower) ||
          user.phone_number?.includes(searchTerm) ||
          user.officer_name?.toLowerCase().includes(searchLower) ||
          user.full_name?.toLowerCase().includes(searchLower) ||
          user.first_name?.toLowerCase().includes(searchLower)
        );
      });
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => {
        return getUserStatus(user) === statusFilter;
      });
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(user => {
        return user.user_type === typeFilter;
      });
    }

    console.log('🔍 Filtered results:', {
      filteredCount: filtered.length,
      filteredByType: {
        loan: filtered.filter(u => u.user_type === 'loan').length,
        saving: filtered.filter(u => u.user_type === 'saving').length,
        user: filtered.filter(u => u.user_type === 'user').length
      }
    });

    setFilteredUsers(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [users, searchTerm, statusFilter, typeFilter]);

  // Fetch collection data for all users
  const fetchCollectionData = async () => {
    try {
      console.log('🔄 Fetching collection data...');
      
      // Fetch both loan and saving collections
      const [loanCollectionsResponse, savingCollectionsResponse] = await Promise.all([
        axios.get('dailyCollections'),
        axios.get('savingDailyCollections/getAllSavings')
      ]);
      
      const allLoanCollections = loanCollectionsResponse?.data?.result || [];
      const allSavingCollections = savingCollectionsResponse?.data?.result || [];
      
      // Create maps for quick lookup
      const loanCollectionMap = new Map();
      const savingCollectionMap = new Map();
      
      // Process loan collections
      allLoanCollections.forEach(collection => {
        const userId = collection.user_id;
        if (!loanCollectionMap.has(userId)) {
          loanCollectionMap.set(userId, 0);
        }
        loanCollectionMap.set(userId, loanCollectionMap.get(userId) + (collection.amount || 0));
      });
      
      // Process saving collections
      allSavingCollections.forEach(collection => {
        const userId = collection.user_id;
        if (!savingCollectionMap.has(userId)) {
          savingCollectionMap.set(userId, 0);
        }
        savingCollectionMap.set(userId, savingCollectionMap.get(userId) + (collection.deposit_amount || 0));
      });
      
      setCollectionData({
        loanCollections: loanCollectionMap,
        savingCollections: savingCollectionMap
      });
      
      console.log('📊 Collection data fetched:', {
        loanCollectionsCount: allLoanCollections.length,
        savingCollectionsCount: allSavingCollections.length,
        loanCollectionMapSize: loanCollectionMap.size,
        savingCollectionMapSize: savingCollectionMap.size
      });
      
    } catch (error) {
      console.warn('⚠️ Could not fetch collection data:', error);
      // Continue without collection data
      setCollectionData({
        loanCollections: new Map(),
        savingCollections: new Map()
      });
    }
  };

  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Fetching user data...');
      
      // Fetch collection data for all users
      await fetchCollectionData();
      
      // Fetch data based on userType parameter
      if (userType === 'loan') {
        // Fetch only loan users from users/ endpoint
        const usersResponse = await axios.get('users/');
        const allUsers = usersResponse.data?.result || [];
        console.log('🔍 All users for loan filter:', allUsers.length);
        const loanUsers = allUsers.filter(user => {
          const hasLoan = (
            (user.active_loan_id && user.active_loan_id !== null && user.active_loan_id !== undefined) ||
            (user.account_type === 'loan account' || user.account_type === 'loan')
          );
          console.log(`🔍 User ${user.name} has loan account:`, hasLoan, {
            active_loan_id: user.active_loan_id,
            account_type: user.account_type
          });
          return hasLoan;
        }).map(user => ({ 
          ...user, 
          user_type: 'loan',
          displayName: user.name || user.full_name || user.first_name || 'Unknown User'
        }));
        
        console.log('📊 Loan users found:', loanUsers.length);
        console.log('📊 Loan users data:', loanUsers);
        setUsers(loanUsers);
      } else if (userType === 'saving') {
        // Fetch saving users from account/ endpoint
        const accountResponse = await axios.get('account/');
        const savingUsers = accountResponse.data?.result || [];
        console.log('🔍 All saving accounts from account/ endpoint:', savingUsers.length);
        
        // Process saving accounts and add user_type
        const processedSavingUsers = savingUsers.map(user => ({ 
          ...user, 
          user_type: 'saving',
          displayName: user.name || user.full_name || user.first_name || 'Unknown User'
        }));
        
        console.log('💰 Saving users found:', processedSavingUsers.length);
        console.log('💰 Saving users data:', processedSavingUsers);
        setUsers(processedSavingUsers);
      } else if (userType === 'officer') {
        // Fetch only officers from officers/ endpoint
        const officersResponse = await axios.get('officers');
        const officers = officersResponse.data?.result || [];
        const processedOfficers = officers.map(user => ({ ...user, user_type: 'officer' }));
        console.log('👮 Officers:', processedOfficers.length);
        setUsers(processedOfficers);
      } else {
        // Fetch both loan users and saving users when userType is 'all'
        const [usersResponse, accountResponse] = await Promise.all([
          axios.get('users/'),
          axios.get('account/')
        ]);
        
        const loanUsers = usersResponse.data?.result || [];
        const savingUsers = accountResponse.data?.result || [];

        console.log('📊 Raw loan users data:', loanUsers, 'users');
        console.log('💰 Raw saving users data:', savingUsers, 'accounts');
        console.log('💰 Saving users count:', savingUsers.length);
        console.log('💰 First saving user structure:', savingUsers[0]);

        // Process loan users
        const processedLoanUsers = loanUsers.map(user => {
          console.log('🔍 Processing loan user:', {
            id: user._id,
            name: user.name,
            hasActiveLoan: !!user.active_loan_id,
            account_type: user.account_type
          });

          return { 
            ...user, 
            user_type: 'loan',
            displayName: user.name || user.full_name || user.first_name || 'Unknown User'
          };
        });

        // Process saving users
        const processedSavingUsers = savingUsers.map(user => {
          console.log('🔍 Processing saving user:', {
            id: user._id,
            name: user.name,
            hasSavingAccount: !!user.saving_account_id,
            account_type: user.account_type
          });

          return { 
            ...user, 
            user_type: 'saving',
            displayName: user.name || user.full_name || user.first_name || 'Unknown User'
          };
        });

        // Combine loan and saving users
        const combinedUsers = [...processedLoanUsers, ...processedSavingUsers];
        
        console.log('📈 Processed users by type:', {
          loan: combinedUsers.filter(u => u.user_type === 'loan').length,
          saving: combinedUsers.filter(u => u.user_type === 'saving').length,
          both: combinedUsers.filter(u => u.user_type === 'both').length,
          user: combinedUsers.filter(u => u.user_type === 'user').length,
          total: combinedUsers.length
        });

        console.log('📋 All combined users:', combinedUsers);
        console.log('💰 Saving users in combined array:', combinedUsers.filter(u => u.user_type === 'saving'));

        // Log sample data for debugging
        console.log('📋 Sample users by type:');
        console.log('Loan users:', combinedUsers.filter(u => u.user_type === 'loan').slice(0, 2));
        console.log('Saving users:', combinedUsers.filter(u => u.user_type === 'saving').slice(0, 2));
        console.log('Both users:', combinedUsers.filter(u => u.user_type === 'both').slice(0, 2));

        setUsers(combinedUsers);
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
      setError(err.response?.data?.message || 'Failed to fetch user data');
    } finally {
      setLoading(false);
    }
  };

  // Handle status change
  const handleStatusChange = async (userId, newStatus, userType) => {
    try {
      let endpoint;
      let updateData;

      // For all users (loan, saving, both), use users/ endpoint
      endpoint = `users/${userId}`;
      updateData = { status: newStatus };

      const response = await axios.put(endpoint, updateData);

      if (response.data) {
        toast({
          title: t("Status updated successfully"),
          status: "success",
          duration: 3000,
          isClosable: true,
          position: "top"
        });

        // Update local state
        setUsers(prevUsers =>
          prevUsers.map(user =>
            user._id === userId
              ? {
                  ...user,
                  active_loan_id: user.active_loan_id ? { ...user.active_loan_id, status: newStatus } : user.active_loan_id,
                  saving_account_id: user.saving_account_id ? { ...user.saving_account_id, status: newStatus } : user.saving_account_id,
                  status: newStatus
                }
              : user
          )
        );
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

  // Handle view user details - navigate to appropriate user detail page based on user type
  const handleViewDetails = (user) => {
    console.log('🔄 Navigating to user detail page for user:', user);
    console.log('🔄 User type:', user.user_type);
    
    // Navigate based on user type - use manager dashboard routes for consistency
    if (user.user_type === 'loan' || user.user_type === 'both') {
      // For loan users or users with both accounts, navigate to manager loan user page
      console.log('🔄 Navigating to manager loan user page:', `/manager-dashboard/view-loan-user/${user._id}`);
      navigate(`/manager-dashboard/view-loan-user/${user._id}`);
    } else if (user.user_type === 'saving') {
      // For saving users, navigate to manager saving user page
      console.log('🔄 Navigating to manager saving user page:', `/manager-dashboard/view-saving-user/${user._id}`);
      navigate(`/manager-dashboard/view-saving-user/${user._id}`);
    } else if (user.user_type === 'officer') {
      // For officers, navigate to officer view page
      console.log('🔄 Navigating to officer page:', `/manager-dashboard/view-officer/${user._id}`);
      navigate(`/manager-dashboard/view-officer/${user._id}`);
    } else {
      // Default fallback for other user types
      console.log('🔄 Navigating to default user page:', `/view-user/${user._id}`);
      navigate(`/view-user/${user._id}`);
    }
  };

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  // Get user status
  const getUserStatus = (user) => {
    if (user.user_type === 'officer') {
      return user.is_active ? 'active' : 'inactive';
    }
    return user.active_loan_id?.status || user.saving_account_id?.status || 'active';
  };

  // Helper functions to get amounts based on account type
  const getTotalAmount = (user) => {
    if (user.user_type === 'loan') {
      return user.active_loan_id?.total_amount || user.total_amount || 0;
    } else if (user.user_type === 'saving') {
      return user.saving_account_id?.total_amount || user.total_amount || 0;
    }
    return 0;
  };

  const getDueAmount = (user) => {
    if (user.user_type === 'loan') {
      // For loan users, show loan_amount and amount_to_be
      const loanAmount = user.active_loan_id?.loan_amount || user.loan_amount || 0;
      const amountToBe = user.active_loan_id?.amount_to_be || user.amount_to_be || 0;
      return loanAmount + amountToBe; // Sum of both fields
    } else if (user.user_type === 'saving') {
      // For saving users, show saving balance (current amount)
      return user.saving_account_id?.current_amount || user.current_amount || 0;
    }
    return 0;
  };

  const getCurrentAmount = (user) => {
    if (user.user_type === 'loan') {
      // For loan users, show total_amount - loan_amount (remaining amount)
      const totalAmount = user.active_loan_id?.total_amount || user.total_amount || 0;
      const loanAmount = user.active_loan_id?.loan_amount || user.loan_amount || 0;
      return Math.max(0, totalAmount - loanAmount);
    } else if (user.user_type === 'saving') {
      // For saving users, show current amount (same as saving balance)
      return user.saving_account_id?.current_amount || user.current_amount || 0;
    }
    return 0;
  };

  // Get user type badge
  const getUserTypeBadge = (user) => {
    const type = user.user_type || 'user';
    const colors = {
      loan: 'blue',
      saving: 'green',
      both: 'orange',
      officer: 'purple',
      user: 'gray'
    };
    return (
      <Badge colorScheme={colors[type]} variant="subtle">
        {t(type.charAt(0).toUpperCase() + type.slice(1))}
      </Badge>
    );
  };

  // Export data
  const exportData = () => {
    // Create a more professional CSV format
    const currentDate = dayjs().format('DD/MM/YYYY HH:mm:ss');
    const totalUsers = filteredUsers.length;
    
    // Add metadata header
    const metadata = [
      ['User Data Export Report'],
      [`Generated on: ${currentDate}`],
      [`Total Records: ${totalUsers}`],
      [`Filtered by: ${typeFilter === 'all' ? 'All Types' : typeFilter.charAt(0).toUpperCase() + typeFilter.slice(1)} | ${statusFilter === 'all' ? 'All Status' : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}`],
      [''], // Empty row for spacing
    ];

    // Headers with proper formatting
    const headers = [
      'Sr. No.',
      'User Name', 
      'Phone Number',
      'Account Type',
      'Officer Assigned',
      'Total Amount (₹)',
      'Loan/Saving', 
      'Current Amount',
      'Account Created Date',
      'Status',
      'Email',
      'Address'
    ];

    // Data rows with proper formatting
    const dataRows = filteredUsers.map((user, index) => [
      index + 1, // Serial number
      `"${user.displayName || user.name || 'N/A'}"`, // Quoted to handle names with commas
      user.phone_number || 'N/A',
      user.user_type || (user.active_loan_id ? 'Loan Account' : user.saving_account_id ? 'Saving Account' : 'Officer'),
      `"${user.officer_id?.name || user.officer_name || 'Unassigned'}"`, // Quoted for names with commas
      getTotalAmount(user).toLocaleString('en-IN'), // Indian number format
      getDueAmount(user).toLocaleString('en-IN'),
      getCurrentAmount(user).toLocaleString('en-IN'),
      dayjs(user.created_on || user.createdAt).format('DD/MM/YYYY'),
      getUserStatus(user).charAt(0).toUpperCase() + getUserStatus(user).slice(1), // Capitalize status
      user.email || 'N/A',
      `"${user.address || 'N/A'}"` // Quoted for addresses with commas
    ]);

    // Combine all data
    const csvData = [
      ...metadata,
      headers,
      ...dataRows
    ];

    // Create CSV string with proper formatting
    const csvString = csvData.map(row => row.join(',')).join('\n');
    
    // Add BOM for proper UTF-8 encoding in Excel
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvString], { type: 'text/csv;charset=utf-8;' });
    
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    
    // Better filename with timestamp
    const timestamp = dayjs().format('YYYY-MM-DD_HH-mm-ss');
    a.download = `User_Data_Export_${timestamp}.csv`;
    
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast({
      title: t("Data exported successfully"),
      description: `${totalUsers} records exported to CSV file`,
      status: "success",
      duration: 4000,
      isClosable: true,
    });
  };

  if (loading) {
    return (
      <Card>
        <CardBody>
          <Flex justify="center" align="center" h="200px">
            <VStack>
              <Spinner size="xl" color="primary" />
              <Text>{t("Loading user data...")}</Text>
            </VStack>
          </Flex>
        </CardBody>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardBody>
          <Alert status="error">
            <AlertIcon />
            <Box>
              <AlertTitle>{t("Error loading data!")}</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Box>
          </Alert>
        </CardBody>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
            <Heading size="md">{t("All User Data")}</Heading>
            <HStack spacing={2}>
              {onRefresh && (
                <Button
                  leftIcon={<FaSync />}
                  size="sm"
                  colorScheme="green"
                  variant="outline"
                  onClick={onRefresh}
                  isLoading={loading}
                  loadingText={t("Refreshing...")}
                >
                  {t("Refresh")}
                </Button>
              )}
              <Button
                leftIcon={<DownloadIcon />}
                size="sm"
                colorScheme="blue"
                variant="outline"
                onClick={exportData}
              >
                {t("Export")}
              </Button>
            </HStack>
          </Flex>
        </CardHeader>
        <CardBody>
          {/* Filters */}
          <VStack spacing={4} mb={6}>
            <HStack spacing={4} wrap="wrap" w="full">
              <InputGroup maxW="300px">
                <InputLeftElement pointerEvents="none">
                  <SearchIcon color="gray.300" />
                </InputLeftElement>
                <Input
                  placeholder={t("Search users...")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
              
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                maxW="150px"
              >
                <option value="all">{t("All Status")}</option>
                <option value="active">{t("Active")}</option>
                <option value="inactive">{t("Inactive")}</option>
              </Select>
              
              <Select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                maxW="150px"
              >
                <option value="all">{t("All Types")}</option>
                <option value="loan">{t("Loan")}</option>
                <option value="saving">{t("Saving")}</option>
              </Select>
            </HStack>
          </VStack>

          {/* Table */}
          <TableContainer>
            <Table variant="simple" size="sm">
              <Thead>
                <Tr>
                  <Th>{t("Name")}</Th>
                  <Th>{t("Phone")}</Th>
                  <Th>{t("Type")}</Th>
                  <Th>{t("Officer")}</Th>
                  <Th>{t("Total Amount")}</Th>
                  <Th>{t("Loan/Saving")}</Th>
                  <Th>{t("Current Amount")}</Th>
                  <Th>{t("Created Date")}</Th>
                  <Th>{t("Status")}</Th>
                  <Th>{t("Actions")}</Th>
                </Tr>
              </Thead>
              <Tbody>
                {currentUsers.map((user) => (
                  <Tr key={user._id}>
                    <Td fontWeight="medium">{user.displayName || user.name || '-'}</Td>
                    <Td>{user.phone_number || '-'}</Td>
                    <Td>{getUserTypeBadge(user)}</Td>
                    <Td>{user.officer_id?.name || user.officer_name || '-'}</Td>
                    <Td fontWeight="medium" color="blue.600">
                      ₹{getTotalAmount(user).toLocaleString()}
                    </Td>
                    <Td fontWeight="medium" color="red.600">
                      ₹{getDueAmount(user).toLocaleString()}
                    </Td>
                    <Td fontWeight="medium" color="green.600">
                      ₹{getCurrentAmount(user).toLocaleString()}
                    </Td>
                    <Td>{dayjs(user.created_on || user.createdAt).format('DD/MM/YYYY')}</Td>
                    <Td>
                      <Select
                        value={getUserStatus(user)}
                        onChange={(e) => handleStatusChange(user._id, e.target.value, user.user_type)}
                        size="sm"
                        width="120px"
                        bg="white"
                        color="gray.700"
                        borderColor="gray.300"
                        _hover={{ borderColor: "gray.400" }}
                        _focus={{ 
                          borderColor: getUserStatus(user) === 'active' ? "green.400" : "red.400",
                          boxShadow: `0 0 0 1px ${getUserStatus(user) === 'active' ? "#68D391" : "#FC8181"}`
                        }}
                        borderRadius="md"
                        fontSize="sm"
                        fontWeight="medium"
                        icon={<></>}
                      >
                        <option value="active">{t('Active')}</option>
                        <option value="inactive">{t('Inactive')}</option>
                      </Select>
                    </Td>
                    <Td>
                      <HStack spacing={2}>
                        <Tooltip label={t("View Details")}>
                          <IconButton
                            icon={<ViewIcon />}
                            size="sm"
                            variant="ghost"
                            colorScheme="blue"
                            onClick={() => handleViewDetails(user)}
                          />
                        </Tooltip>
                      </HStack>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          {totalPages > 1 && (
            <Flex justify="space-between" align="center" mt={4}>
              <Text fontSize="sm" color="gray.600">
                {t("Showing")} {startIndex + 1} {t("to")} {Math.min(endIndex, filteredUsers.length)} {t("of")} {filteredUsers.length} {t("users")}
              </Text>
              <HStack>
                <IconButton
                  icon={<ChevronLeftIcon />}
                  size="sm"
                  variant="outline"
                  isDisabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                />
                <Text fontSize="sm">
                  {t("Page")} {currentPage} {t("of")} {totalPages}
                </Text>
                <IconButton
                  icon={<ChevronRightIcon />}
                  size="sm"
                  variant="outline"
                  isDisabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                />
              </HStack>
            </Flex>
          )}
        </CardBody>
      </Card>

      {/* User Details Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{t("User Details")}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedUser && (
              <VStack spacing={4} align="stretch">
                <Box>
                  <Text fontWeight="bold">{t("Name")}:</Text>
                  <Text>{selectedUser.displayName || selectedUser.name || '-'}</Text>
                </Box>
                <Box>
                  <Text fontWeight="bold">{t("Phone")}:</Text>
                  <Text>{selectedUser.phone_number || '-'}</Text>
                </Box>
                <Box>
                  <Text fontWeight="bold">{t("Email")}:</Text>
                  <Text>{selectedUser.email || '-'}</Text>
                </Box>
                <Box>
                  <Text fontWeight="bold">{t("Type")}:</Text>
                  {getUserTypeBadge(selectedUser)}
                </Box>
                <Box>
                  <Text fontWeight="bold">{t("Status")}:</Text>
                  <Badge colorScheme={getUserStatus(selectedUser) === 'active' ? 'green' : 'red'}>
                    {t(getUserStatus(selectedUser))}
                  </Badge>
                </Box>
                <Box>
                  <Text fontWeight="bold">{t("Officer")}:</Text>
                  <Text>{selectedUser.officer_id?.name || selectedUser.officer_name || '-'}</Text>
                </Box>
                <Box>
                  <Text fontWeight="bold">{t("Created Date")}:</Text>
                  <Text>{dayjs(selectedUser.created_on || selectedUser.createdAt).format('DD/MM/YYYY HH:mm')}</Text>
                </Box>
                
                {/* Additional details based on user type */}
                {selectedUser.active_loan_id && (
                  <>
                    <Divider />
                    <Text fontWeight="bold" color="blue.600">{t("Loan Details")}</Text>
                    <Box>
                      <Text fontWeight="bold">{t("Loan Amount")}:</Text>
                      <Text>₹{(selectedUser.active_loan_id.loan_amount || 0).toLocaleString()}</Text>
                    </Box>
                    <Box>
                      <Text fontWeight="bold">{t("Total Amount")}:</Text>
                      <Text>₹{(selectedUser.active_loan_id.total_amount || 0).toLocaleString()}</Text>
                    </Box>
                    <Box>
                      <Text fontWeight="bold">{t("Total Due Amount")}:</Text>
                      <Text>₹{(selectedUser.active_loan_id.total_due_amount || 0).toLocaleString()}</Text>
                    </Box>
                    <Box>
                      <Text fontWeight="bold">{t("Daily EMI")}:</Text>
                      <Text>₹{selectedUser.active_loan_id.emi_day || 0}</Text>
                    </Box>
                    <Box>
                      <Text fontWeight="bold">{t("Status")}:</Text>
                      <Badge colorScheme={selectedUser.active_loan_id.status === 'active' ? 'green' : 'red'}>
                        {t(selectedUser.active_loan_id.status)}
                      </Badge>
                    </Box>
                  </>
                )}
                
                {selectedUser.saving_account_id && (
                  <>
                    <Divider />
                    <Text fontWeight="bold" color="green.600">{t("Saving Details")}</Text>
                    <Box>
                      <Text fontWeight="bold">{t("Account Number")}:</Text>
                      <Text>{selectedUser.saving_account_id.account_number || '-'}</Text>
                    </Box>
                    <Box>
                      <Text fontWeight="bold">{t("Current Amount")}:</Text>
                      <Text>₹{(selectedUser.saving_account_id.current_amount || 0).toLocaleString()}</Text>
                    </Box>
                    <Box>
                      <Text fontWeight="bold">{t("Total Amount")}:</Text>
                      <Text>₹{(selectedUser.saving_account_id.total_amount || 0).toLocaleString()}</Text>
                    </Box>
                    <Box>
                      <Text fontWeight="bold">{t("Interest Rate")}:</Text>
                      <Text>{selectedUser.saving_account_id.interest_rate || 0}%</Text>
                    </Box>
                    <Box>
                      <Text fontWeight="bold">{t("Daily EMI")}:</Text>
                      <Text>₹{selectedUser.saving_account_id.emi_day || 0}</Text>
                    </Box>
                  </>
                )}
                
                {selectedUser.user_type === 'officer' && (
                  <>
                    <Divider />
                    <Text fontWeight="bold" color="purple.600">{t("Officer Details")}</Text>
                    <Box>
                      <Text fontWeight="bold">{t("Officer Code")}:</Text>
                      <Text>{selectedUser.officer_code || '-'}</Text>
                    </Box>
                  </>
                )}
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose}>{t("Close")}</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default UserDataTable;
