import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import OfficerNavbar from '../../components/OfficerNavbar';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Badge,
  Spinner,
  Center,
  Alert,
  AlertIcon,
  useToast,
  Flex,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Divider,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Grid,
  GridItem,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  IconButton,
  Tooltip
} from '@chakra-ui/react';
import { 
  FiArrowLeft, 
  FiUser, 
  FiPhone, 
  FiMail, 
  FiMapPin, 
  FiCalendar, 
  FiDollarSign, 
  FiTrendingUp,
  FiDownload,
  FiRefreshCw,
  FiSearch,
  FiFilter
} from 'react-icons/fi';
import { 
  getUserById,
  getActiveLoanDetails
} from '../../services/userService';
import axios from '../../axios';
import dayjs from 'dayjs';

const UserDetailPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [dailyCollections, setDailyCollections] = useState([]);
  const [savingCollections, setSavingCollections] = useState([]);
  const [allCollections, setAllCollections] = useState([]);
  const [loanDetails, setLoanDetails] = useState([]);
  const [savingDetails, setSavingDetails] = useState([]);
  const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [dateFilter, setDateFilter] = useState('all'); // 'all', 'today', 'custom'
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (userId) {
      fetchUserDetails();
    }
  }, [userId, selectedDate, dateFilter]);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch complete user details
      const userData = await getUserById(userId);

      // Initialize collections arrays
      let loanCollections = [];
      let savingCollections = [];
      let loanDetails = [];
      let savingDetails = [];

      // Check user type and fetch appropriate details
      const userType = userData.account_type || userData.user_type || userData.type; // Check all possible field names
      console.log('🔍 User Type:', userType, '| Active Loan ID:', userData.active_loan_id, '| Saving ID:', userData.saving_id);
      
      if (userType === 'loan account' || userType === 'loan' || userType === 'loan_user') {
        // User is a loan user - use embedded loan data from user response
        const activeLoanId = userData.active_loan_id;
        if (activeLoanId) {
          // Check if activeLoanId is already an embedded object
          if (typeof activeLoanId === 'object' && activeLoanId._id) {
            console.log('✅ Using embedded loan data from user response');
            loanDetails = [activeLoanId];
          } else {
            // Fallback: try to fetch loan details separately (if route exists)
            try {
              console.log('🔄 Fetching loan details for ID:', activeLoanId);
              const loanData = await getActiveLoanDetails(activeLoanId);
              if (loanData) {
                loanDetails = [loanData];
                console.log('✅ Loan details fetched:', loanData);
              }
            } catch (loanError) {
              console.warn('Could not fetch loan details:', loanError);
            }
          }
        } else {
          console.warn('User is loan type but no active_loan_id found');
        }
      } else if (userType === 'saving account' || userType === 'saving' || userType === 'saving_user') {
        // User is a saving user - saving account details will come from savingDailyCollections API
        console.log('✅ Saving user detected - will get details from savingDailyCollections API');
      } else {
        // Fallback: try both if user type is not specified or unknown
        console.warn('User type not specified, trying both loan and saving...');
        
        // Try loan first
        const activeLoanId = userData.active_loan_id;
        if (activeLoanId) {
          // Check if activeLoanId is already an embedded object
          if (typeof activeLoanId === 'object' && activeLoanId._id) {
            console.log('✅ Fallback: Using embedded loan data from user response');
            loanDetails = [activeLoanId];
          } else {
            try {
              console.log('🔄 Fallback: Fetching loan details for ID:', activeLoanId);
              const loanData = await getActiveLoanDetails(activeLoanId);
              loanDetails = [loanData];
            } catch (loanError) {
              console.warn('Fallback: Could not fetch loan details:', loanError);
            }
          }
        }
        
        // Saving details will be extracted from savingDailyCollections API in the collections section below
      }

      // Fetch collections based on user type
      let allCollections = [];
      
      if (userType === 'loan account' || userType === 'loan' || userType === 'loan_user') {
        // For loan users, use dailyCollections API
        try {
          console.log('🔄 Fetching loan collections for user:', userData._id);
          const collectionsResponse = await axios.get(`dailyCollections/${userData._id}`);
          if (collectionsResponse.data && collectionsResponse.data.result) {
            allCollections = collectionsResponse.data.result;
            console.log('✅ Loan collections fetched:', allCollections);
          }
        } catch (collectionsError) {
          console.warn('Could not fetch loan collections:', collectionsError);
        }
      } else if (userType === 'saving account' || userType === 'saving' || userType === 'saving_user') {
        // For saving users, use savingDailyCollections API with user ID
        try {
          console.log('🔄 Fetching saving collections for user:', userData._id);
          const savingCollectionsResponse = await axios.get(`savingDailyCollections/${userData._id}`);
          if (savingCollectionsResponse.data && savingCollectionsResponse.data.result) {
            // Extract collections from the response
            allCollections = savingCollectionsResponse.data.result.collections || [];
            console.log('✅ Saving collections fetched:', allCollections);
            
            // Extract saving account details from the response
            if (savingCollectionsResponse.data.result.saving_account) {
              savingDetails = [savingCollectionsResponse.data.result.saving_account];
              // Also update the user data to include saving account for display
              userData.saving_account = savingCollectionsResponse.data.result.saving_account;
              console.log('✅ Saving account details extracted from collections API:', savingCollectionsResponse.data.result.saving_account);
            }
          }
        } catch (savingCollectionsError) {
          console.warn('Could not fetch saving collections:', savingCollectionsError);
        }
      } else {
        // Fallback: try both APIs
        try {
          console.log('🔄 Fallback: Fetching loan collections for user:', userData._id);
          const loanCollectionsResponse = await axios.get(`dailyCollections/${userData._id}`);
          if (loanCollectionsResponse.data && loanCollectionsResponse.data.result) {
            allCollections = [...allCollections, ...loanCollectionsResponse.data.result];
            console.log('✅ Fallback: Loan collections fetched:', loanCollectionsResponse.data.result);
          }
        } catch (loanError) {
          console.warn('Fallback: Could not fetch loan collections:', loanError);
        }
        
        try {
          console.log('🔄 Fallback: Fetching saving collections for user:', userData._id);
          const savingCollectionsResponse = await axios.get(`savingDailyCollections/${userData._id}`);
          if (savingCollectionsResponse.data && savingCollectionsResponse.data.result) {
            // Extract collections from the response
            const savingCollections = savingCollectionsResponse.data.result.collections || [];
            allCollections = [...allCollections, ...savingCollections];
            console.log('✅ Fallback: Saving collections fetched:', savingCollections);
            
            // Extract saving account details from the response
            if (savingCollectionsResponse.data.result.saving_account) {
              savingDetails = [savingCollectionsResponse.data.result.saving_account];
              // Also update the user data to include saving account for display
              userData.saving_account = savingCollectionsResponse.data.result.saving_account;
              console.log('✅ Fallback: Saving account details extracted from collections API:', savingCollectionsResponse.data.result.saving_account);
            }
          }
        } catch (savingError) {
          console.warn('Fallback: Could not fetch saving collections:', savingError);
        }
      }

      // Filter collections based on date filter
      let filteredLoanCollections = loanCollections;
      let filteredSavingCollections = savingCollections;
      let filteredAllCollections = allCollections;

      if (dateFilter === 'today') {
        const today = dayjs().format('YYYY-MM-DD');
        filteredLoanCollections = loanCollections.filter(collection => 
          dayjs(collection.created_on).format('YYYY-MM-DD') === today
        );
        filteredSavingCollections = savingCollections.filter(collection => 
          dayjs(collection.created_on).format('YYYY-MM-DD') === today
        );
        filteredAllCollections = allCollections.filter(collection => 
          dayjs(collection.created_on).format('YYYY-MM-DD') === today
        );
      } else if (dateFilter === 'custom') {
        filteredLoanCollections = loanCollections.filter(collection => 
          dayjs(collection.created_on).format('YYYY-MM-DD') === selectedDate
        );
        filteredSavingCollections = savingCollections.filter(collection => 
          dayjs(collection.created_on).format('YYYY-MM-DD') === selectedDate
        );
        filteredAllCollections = allCollections.filter(collection => 
          dayjs(collection.created_on).format('YYYY-MM-DD') === selectedDate
        );
      }

      setDailyCollections(filteredLoanCollections);
      setSavingCollections(filteredSavingCollections);
      setLoanDetails(loanDetails);
      setSavingDetails(savingDetails);
      setAllCollections(filteredAllCollections);
      
      // Set user data (including any updated saving account info)
      setUser(userData);

    } catch (error) {
      console.error('Error fetching user details:', error);
      setError('Failed to fetch user details');
      toast({
        title: 'Error',
        description: 'Failed to fetch user details',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    return dayjs(date).format('DD MMM, YYYY');
  };

  const formatTime = (date) => {
    return dayjs(date).format('h:mm A');
  };

  const handleDateFilterChange = (filter) => {
    setDateFilter(filter);
    if (filter === 'today') {
      setSelectedDate(dayjs().format('YYYY-MM-DD'));
    }
    // The useEffect will automatically trigger fetchUserDetails when dateFilter changes
  };

  const handleExport = () => {
    const allCollections = [...dailyCollections, ...savingCollections];
    
    if (allCollections.length === 0) {
      toast({
        title: 'No Data',
        description: 'No collections to export',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Create CSV data
    const csvData = allCollections.map((collection, index) => ({
      'Sr. No.': index + 1,
      'Collection ID': collection._id || 'N/A',
      'Account Type': collection.account_type || (collection.deposit_amount ? 'Saving' : 'Loan'),
      'Amount': collection.amount || collection.deposit_amount || 0,
      'Collection Date': formatDate(collection.created_on),
      'Collection Time': formatTime(collection.created_on),
      'Status': collection.status || 'Completed',
      'Collected By': collection.collected_by?.name || 'N/A'
    }));

    // Convert to CSV
    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `user-collections-${user?.full_name || 'user'}-${dayjs().format('YYYY-MM-DD')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: 'Export Successful',
      description: 'User collections exported successfully',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  if (loading) {
    return (
      <Center h="50vh">
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" />
          <Text>Loading user details...</Text>
        </VStack>
      </Center>
    );
  }

  if (error) {
    return (
      <Center h="50vh">
        <Alert status="error" maxW="md">
          <AlertIcon />
          {error}
        </Alert>
      </Center>
    );
  }

  if (!user) {
    return (
      <Center h="50vh">
        <Alert status="warning" maxW="md">
          <AlertIcon />
          User not found
        </Alert>
      </Center>
    );
  }

  const totalLoanAmount = dailyCollections.reduce((sum, collection) => sum + (collection.amount || 0), 0);
  const totalSavingAmount = savingCollections.reduce((sum, collection) => sum + (collection.deposit_amount || 0), 0);
  const totalCollections = allCollections.length;

  // Get officer info for navbar
  const getOfficerType = () => {
    return localStorage.getItem('officerType') || 'user';
  };

  const getOfficerName = () => {
    return localStorage.getItem('officerName') || 'User';
  };

  return (
    <>
      <OfficerNavbar 
        officerType={getOfficerType()} 
        officerName={getOfficerName()} 
        pageName="User Details" 
      />
      <div className="min-h-screen bg-primaryBg py-4 pt-20 px-2 sm:px-4 lg:px-6">
        <Box p={6} maxW="1400px" mx="auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
        {/* Header */}
        <VStack spacing={4} align="stretch" mb={8}>
          <HStack justify="space-between" align="center">
            <HStack spacing={4}>
              <Button
                leftIcon={<FiArrowLeft />}
                variant="outline"
                onClick={() => navigate(-1)}
              >
                Back
              </Button>
              <VStack align="start" spacing={1}>
                <Heading size="lg" color="blue.600" display="flex" alignItems="center" gap={2}>
                  <FiUser />
                  User Details
                </Heading>
                <Text color="gray.600">
                  Complete user information and collection history
                </Text>
              </VStack>
            </HStack>
            <HStack spacing={3}>
              <Button
                leftIcon={<FiRefreshCw />}
                onClick={fetchUserDetails}
                size="sm"
                variant="outline"
              >
                Refresh
              </Button>
              <Button
                leftIcon={<FiDownload />}
                onClick={handleExport}
                size="sm"
                colorScheme="green"
                isDisabled={totalCollections === 0}
              >
                Export CSV
              </Button>
            </HStack>
          </HStack>
        </VStack>

        {/* User Information Card */}
        <Card mb={8}>
          <CardHeader>
            <Heading size="md" color="gray.700">
              Personal Information
            </Heading>
          </CardHeader>
          <CardBody>
            <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap={6}>
              <VStack align="start" spacing={2}>
                <HStack>
                  <FiUser color="gray.500" />
                  <Text fontWeight="semibold">Full Name:</Text>
                </HStack>
        <HStack spacing={2}>
          <Text color="gray.700">{user.full_name || 'N/A'}</Text>
          {user?.account_type ? (
            <Badge 
              colorScheme={user?.account_type === 'loan account' ? 'blue' : 'green'} 
              fontSize="xs" 
              px={2} 
              py={1} 
              borderRadius="full"
            >
              {user?.account_type === 'loan account' ? 'Loan User' : 'Saving User'}
            </Badge>
          ) : (user?.user_type || user?.type) ? (
            <Badge 
              colorScheme={user?.user_type === 'loan' || user?.type === 'loan' ? 'blue' : 'green'} 
              fontSize="xs" 
              px={2} 
              py={1} 
              borderRadius="full"
            >
              {user?.user_type === 'loan' || user?.type === 'loan' ? 'Loan User' : 'Saving User'}
            </Badge>
          ) : null}
        </HStack>
              </VStack>
              
              <VStack align="start" spacing={2}>
                <HStack>
                  <FiPhone color="gray.500" />
                  <Text fontWeight="semibold">Phone:</Text>
                </HStack>
                <Text color="gray.700">{user.phone_number || 'N/A'}</Text>
              </VStack>
              
              <VStack align="start" spacing={2}>
                <HStack>
                  <FiMail color="gray.500" />
                  <Text fontWeight="semibold">Email:</Text>
                </HStack>
                <Text color="gray.700">{user.email || 'N/A'}</Text>
              </VStack>
              
              <VStack align="start" spacing={2}>
                <HStack>
                  <FiMapPin color="gray.500" />
                  <Text fontWeight="semibold">Address:</Text>
                </HStack>
                <Text color="gray.700">{user.address || 'N/A'}</Text>
              </VStack>
              
              <VStack align="start" spacing={2}>
                <HStack>
                  <FiCalendar color="gray.500" />
                  <Text fontWeight="semibold">Member Since:</Text>
                </HStack>
                <Text color="gray.700">{formatDate(user.created_on)}</Text>
              </VStack>
              
            </Grid>
          </CardBody>
        </Card>

        {/* User Details Section - Matching saiFinanceWeb Officer Panel */}
        <Card mb={6}>
          <CardHeader>
            <Heading size="lg" color="blue.600">
              User Details
            </Heading>
          </CardHeader>
          <CardBody>
            {/* User Details Grid - Matching saiFinanceWeb Layout */}
            <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6} mb={6}>
              <GridItem>
                <Text fontSize="lg" fontWeight="semibold" color="gray.800" mb={2}>
                  Name:
                </Text>
                <Text color="gray.600" fontSize="md">
                  {user?.full_name || user?.name || 'N/A'}
                </Text>
              </GridItem>

              <GridItem>
                <Text fontSize="lg" fontWeight="semibold" color="gray.800" mb={2}>
                  Date:
                </Text>
                <Text color="gray.600" fontSize="md">
                  {user?.created_at ? formatDate(user.created_at) : 'N/A'}
                </Text>
              </GridItem>

              <GridItem>
                <Text fontSize="lg" fontWeight="semibold" color="gray.800" mb={2}>
                  Mobile:
                </Text>
                <Text color="gray.600" fontSize="md">
                  {user?.phone_number || 'N/A'}
                </Text>
              </GridItem>

              <GridItem>
                <Text fontSize="lg" fontWeight="semibold" color="gray.800" mb={2}>
                  {user?.account_type === 'saving account' ? 'Saving Amount:' : 'Loan:'}
                </Text>
                <Text color="gray.600" fontSize="md">
                  {user?.account_type === 'saving account' ? 
                    (user?.saving_account?.amount_to_be ? formatCurrency(user.saving_account.amount_to_be) : 'N/A') :
                    (user?.active_loan_id?.loan_amount ? formatCurrency(user.active_loan_id.loan_amount) : 
                     loanDetails.length > 0 ? formatCurrency(loanDetails[0]?.loan_amount || 0) : 'N/A')
                  }
                </Text>
              </GridItem>

              <GridItem>
                <Text fontSize="lg" fontWeight="semibold" color="gray.800" mb={2}>
                  EMI:
                </Text>
                <Text color="gray.600" fontSize="md">
                  {user?.account_type === 'saving account' ? 
                    (user?.saving_account?.emi_amount ? formatCurrency(user.saving_account.emi_amount) : 'N/A') :
                    (user?.active_loan_id?.emi_day ? formatCurrency(user.active_loan_id.emi_day) : 
                     loanDetails.length > 0 ? formatCurrency(loanDetails[0]?.emi_amount || 0) : 'N/A')
                  }
                </Text>
              </GridItem>


              <GridItem>
                <Text fontSize="lg" fontWeight="semibold" color="gray.800" mb={2}>
                  {user?.account_type === 'saving account' ? 'Current Amount:' : 'Due:'}
                </Text>
                <Text color="gray.600" fontSize="md">
                  {user?.account_type === 'saving account' ? 
                    (user?.saving_account?.current_amount ? formatCurrency(user.saving_account.current_amount) : 'N/A') :
                    (user?.active_loan_id?.total_due_amount ? formatCurrency(user.active_loan_id.total_due_amount) : 
                     loanDetails.length > 0 ? formatCurrency((loanDetails[0]?.loan_amount || 0) - totalLoanAmount) : 'N/A')
                  }
                </Text>
              </GridItem>

              <GridItem>
                <Text fontSize="lg" fontWeight="semibold" color="gray.800" mb={2}>
                  Penalty:
                </Text>
                <Text color="gray.600" fontSize="md">
                  {user?.active_loan_id?.total_penalty_amount ? formatCurrency(user.active_loan_id.total_penalty_amount) : '₹0'}
                </Text>
              </GridItem>

              <GridItem>
                <Text fontSize="lg" fontWeight="semibold" color="gray.800" mb={2}>
                  Interest Rate:
                </Text>
                <Text color="gray.600" fontSize="md">
                  {user?.account_type === 'saving account' ? 
                    (user?.saving_account?.interest_rate ? `${user.saving_account.interest_rate}%` : 'N/A') :
                    (user?.active_loan_id?.interest_rate ? `${user.active_loan_id.interest_rate}%` : 'N/A')
                  }
                </Text>
              </GridItem>

              <GridItem>
                <Text fontSize="lg" fontWeight="semibold" color="gray.800" mb={2}>
                  {user?.account_type === 'saving account' ? 'Account Number:' : 'Duration:'}
                </Text>
                <Text color="gray.600" fontSize="md">
                  {user?.account_type === 'saving account' ? 
                    (user?.saving_account?.account_number || 'N/A') :
                    (user?.active_loan_id?.duration_months ? `${user.active_loan_id.duration_months} months` : 'N/A')
                  }
                </Text>
              </GridItem>

              <GridItem>
                <Text fontSize="lg" fontWeight="semibold" color="gray.800" mb={2}>
                  End Date:
                </Text>
                <Text color="gray.600" fontSize="md">
                  {user?.account_type === 'saving account' ? 
                    (user?.saving_account?.end_date ? formatDate(user.saving_account.end_date) : 'N/A') :
                    (user?.active_loan_id?.end_date ? formatDate(user.active_loan_id.end_date) : 'N/A')
                  }
                </Text>
              </GridItem>
            </Grid>

            {/* Collection History Table */}
            <Box>
              <Heading size="md" color="gray.700" mb={4}>
                Collection History
              </Heading>
              <TableContainer>
                <Table variant="simple" size="sm">
                  <Thead>
                    <Tr>
                      <Th>SR NO.</Th>
                      <Th>USER NAME</Th>
                      <Th>PHONE NUMBER</Th>
                      <Th>COLLECTION AMOUNT</Th>
                      <Th>PENALTY</Th>
                      <Th>COLLECTION DATE</Th>
                      <Th>TYPE</Th>
                      <Th>STATUS</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {allCollections.length > 0 ? (
                      allCollections
                        .filter(collection => 
                          !searchTerm || 
                          (collection.amount || collection.deposit_amount || 0).toString().includes(searchTerm) ||
                          (collection.collected_by?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
                        )
                        .map((collection, index) => (
                        <motion.tr
                          key={collection._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                          <Td fontWeight="medium">{index + 1}</Td>
                          <Td fontWeight="medium">{user?.full_name || user?.name || 'N/A'}</Td>
                          <Td>{user?.phone_number || 'N/A'}</Td>
                        <Td fontWeight="semibold" color="green.600">
                          {formatCurrency(collection.amount || collection.deposit_amount || collection.withdraw_amount || 0)}
                        </Td>
                          <Td fontWeight="semibold" color="red.600">₹0</Td>
                          <Td>
                            <Text fontSize="sm" color="gray.600">
                              {formatDate(collection.created_on)}
                            </Text>
                          </Td>
                          <Td>
                            <Badge
                              colorScheme={collection.amount ? 'blue' : 'green'}
                              fontSize="xs"
                              px={2}
                              py={1}
                            >
                              {collection.amount ? 'Loan' : (collection.deposit_amount || collection.withdraw_amount) ? 'Saving' : 'Unknown'}
                            </Badge>
                          </Td>
                          <Td>
                            <Badge colorScheme="green" fontSize="xs" px={2} py={1}>
                              Active
                            </Badge>
                          </Td>
                        </motion.tr>
                      ))
                    ) : (
                      <Tr>
                        <Td colSpan={8} textAlign="center" py={8}>
                          <Text color="gray.500" fontSize="md">
                            No collection history found
                          </Text>
                        </Td>
                      </Tr>
                    )}
                  </Tbody>
                </Table>
              </TableContainer>
            </Box>
          </CardBody>
        </Card>

          </motion.div>
        </Box>
      </div>
    </>
  );
};

export default UserDetailPage;
