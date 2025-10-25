import React, { useState, useEffect } from 'react';
// import { motion } from 'framer-motion';
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
  // Divider
} from '@chakra-ui/react';
import { 
  SearchIcon, 
  ViewIcon, 
  // EditIcon, 
  // DeleteIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  // DownloadIcon
} from '@chakra-ui/icons';
import { FaSync } from 'react-icons/fa';

/**
 * CustomerTable Component
 * 
 * Displays only customer data (loan and saving users) with time period filtering
 */
const CustomerTable = ({ timePeriod = 'all' }) => {
  const { t } = useLocalTranslation();
  // const navigate = useNavigate();
  // const toast = useToast();
  
  // State management
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  
  // Modal state
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Fetch customer data
  useEffect(() => {
    fetchCustomerData();
  }, [timePeriod]);

  // Filter customers based on search and filters
  useEffect(() => {
    let filtered = customers;

    // Time period filter
    if (timePeriod !== 'all') {
      const now = dayjs();
      let startDate;
      
      switch (timePeriod) {
        case 'daily':
          startDate = now.startOf('day');
          break;
        case 'weekly':
          startDate = now.startOf('week');
          break;
        case 'monthly':
          startDate = now.startOf('month');
          break;
        default:
          startDate = null;
      }
      
      if (startDate) {
        filtered = filtered.filter(customer => {
          const customerDate = dayjs(customer.created_on || customer.createdAt);
          return customerDate.isAfter(startDate) || customerDate.isSame(startDate, 'day');
        });
      }
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(customer => {
        const searchLower = searchTerm.toLowerCase();
        return (
          customer.name?.toLowerCase().includes(searchLower) ||
          customer.displayName?.toLowerCase().includes(searchLower) ||
          customer.phone_number?.includes(searchTerm) ||
          customer.officer_name?.toLowerCase().includes(searchLower) ||
          customer.full_name?.toLowerCase().includes(searchLower) ||
          customer.first_name?.toLowerCase().includes(searchLower)
        );
      });
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(customer => {
        return getCustomerStatus(customer) === statusFilter;
      });
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(customer => {
        return customer.user_type === typeFilter;
      });
    }

    setFilteredCustomers(filtered);
    setCurrentPage(1);
  }, [customers, searchTerm, statusFilter, typeFilter, timePeriod]);

  const fetchCustomerData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Fetching customer data...');
      
      // Fetch both loan users and saving users
      const [usersResponse, accountResponse] = await Promise.all([
        axios.get('users/'),
        axios.get('account/')
      ]);
      
      const loanUsers = usersResponse.data?.result || [];
      const savingUsers = accountResponse.data?.result || [];

      // Process loan users
      const processedLoanUsers = loanUsers.map(user => ({
        ...user, 
        user_type: 'loan',
        displayName: user.name || user.full_name || user.first_name || 'Unknown User'
      }));

      // Process saving users
      const processedSavingUsers = savingUsers.map(user => ({
        ...user, 
        user_type: 'saving',
        displayName: user.name || user.full_name || user.first_name || 'Unknown User'
      }));

      // Combine loan and saving users
      const combinedCustomers = [...processedLoanUsers, ...processedSavingUsers];
      
      console.log('📊 Customers found:', combinedCustomers.length);
      setCustomers(combinedCustomers);
      
    } catch (err) {
      console.error('Error fetching customer data:', err);
      setError(err.response?.data?.message || 'Failed to fetch customer data');
    } finally {
      setLoading(false);
    }
  };

  // Handle view customer details
  const handleViewDetails = (customer) => {
    console.log('🔄 Viewing customer details:', customer);
    setSelectedCustomer(customer);
    onOpen();
  };

  // Pagination
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCustomers = filteredCustomers.slice(startIndex, endIndex);

  // Get customer status
  const getCustomerStatus = (customer) => {
    return customer.active_loan_id?.status || customer.saving_account_id?.status || 'active';
  };

  // Get customer type badge
  const getCustomerTypeBadge = (customer) => {
    const type = customer.user_type || 'user';
    const colors = {
      loan: 'blue',
      saving: 'green',
      both: 'orange',
      user: 'gray'
    };
    return (
      <Badge colorScheme={colors[type]} variant="subtle">
        {t(type.charAt(0).toUpperCase() + type.slice(1))}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardBody>
          <Flex justify="center" align="center" h="200px">
            <VStack>
              <Spinner size="xl" color="primary" />
              <Text>{t("Loading customers...")}</Text>
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
            <Heading size="md">
              {t("Customer Data")}
              {timePeriod !== 'all' && (
                <Text as="span" fontSize="sm" color="gray.600" ml={2}>
                  ({timePeriod === 'daily' && 'Today'}
                  {timePeriod === 'weekly' && 'This Week'}
                  {timePeriod === 'monthly' && 'This Month'})
                </Text>
              )}
            </Heading>
            <HStack spacing={2}>
              <Button
                leftIcon={<FaSync />}
                size="sm"
                colorScheme="green"
                variant="outline"
                onClick={fetchCustomerData}
                isLoading={loading}
                loadingText={t("Refreshing...")}
              >
                {t("Refresh")}
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
                  placeholder={t("Search customers...")}
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
                  <Th>{t("Amount")}</Th>
                  <Th>{t("Created Date")}</Th>
                  <Th>{t("Status")}</Th>
                  <Th>{t("Actions")}</Th>
                </Tr>
              </Thead>
              <Tbody>
                {currentCustomers.map((customer) => (
                  <Tr key={customer._id}>
                    <Td fontWeight="medium">{customer.displayName || customer.name || '-'}</Td>
                    <Td>{customer.phone_number || '-'}</Td>
                    <Td>{getCustomerTypeBadge(customer)}</Td>
                    <Td>{customer.officer_id?.name || customer.officer_name || '-'}</Td>
                    <Td fontWeight="medium" color="blue.600">
                      ₹{(customer.active_loan_id?.total_amount || customer.saving_account_id?.total_amount || 0).toLocaleString()}
                    </Td>
                    <Td>{dayjs(customer.created_on || customer.createdAt).format('DD/MM/YYYY')}</Td>
                    <Td>
                      <Badge colorScheme={getCustomerStatus(customer) === 'active' ? 'green' : 'red'}>
                        {t(getCustomerStatus(customer))}
                      </Badge>
                    </Td>
                    <Td>
                      <HStack spacing={2}>
                        <Tooltip label={t("View Details")}>
                          <IconButton
                            icon={<ViewIcon />}
                            size="sm"
                            variant="ghost"
                            colorScheme="blue"
                            onClick={() => handleViewDetails(customer)}
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
                {t("Showing")} {startIndex + 1} {t("to")} {Math.min(endIndex, filteredCustomers.length)} {t("of")} {filteredCustomers.length} {t("customers")}
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

      {/* Customer Details Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{t("Customer Details")}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedCustomer && (
              <VStack spacing={4} align="stretch">
                <Box>
                  <Text fontWeight="bold">{t("Name")}:</Text>
                  <Text>{selectedCustomer.displayName || selectedCustomer.name || '-'}</Text>
                </Box>
                <Box>
                  <Text fontWeight="bold">{t("Phone")}:</Text>
                  <Text>{selectedCustomer.phone_number || '-'}</Text>
                </Box>
                <Box>
                  <Text fontWeight="bold">{t("Type")}:</Text>
                  {getCustomerTypeBadge(selectedCustomer)}
                </Box>
                <Box>
                  <Text fontWeight="bold">{t("Status")}:</Text>
                  <Badge colorScheme={getCustomerStatus(selectedCustomer) === 'active' ? 'green' : 'red'}>
                    {t(getCustomerStatus(selectedCustomer))}
                  </Badge>
                </Box>
                <Box>
                  <Text fontWeight="bold">{t("Officer")}:</Text>
                  <Text>{selectedCustomer.officer_id?.name || selectedCustomer.officer_name || '-'}</Text>
                </Box>
                <Box>
                  <Text fontWeight="bold">{t("Created Date")}:</Text>
                  <Text>{dayjs(selectedCustomer.created_on || selectedCustomer.createdAt).format('DD/MM/YYYY HH:mm')}</Text>
                </Box>
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

export default CustomerTable;




