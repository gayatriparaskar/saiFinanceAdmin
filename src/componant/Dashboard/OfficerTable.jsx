import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaUsers, FaDownload, FaEllipsisV, FaEye, FaUserCheck, FaFlag, FaUniversity, FaSync, FaCalendarDay, FaCalendarWeek, FaCalendarAlt } from 'react-icons/fa';
import axios from '../../axios';
import { 
  Card, 
  CardBody, 
  Table, 
  Thead, 
  Tbody, 
  Tr, 
  Th, 
  Td, 
  TableContainer,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  HStack,
  VStack,
  Button,
  Badge,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Box,
  Text,
  Divider
} from '@chakra-ui/react';
import { SearchIcon, ViewIcon } from '@chakra-ui/icons';
import { useLocalTranslation } from '../../hooks/useLocalTranslation';
import { updateOfficerCollectionData } from '../../services/officerService';
import dayjs from 'dayjs';

const OfficerTable = ({ 
  officers = [], 
  loading = false,
  onAssignToClick,
  onStatusClick,
  onViewDetails,
  onPaymentProcess,
  onRefresh,
  activeOfficersCount = 0
}) => {
  const { t } = useLocalTranslation();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Collection data state
  const [collectionData, setCollectionData] = useState({
    daily: [],
    weekly: [],
    monthly: []
  });
  const [collectionLoading, setCollectionLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('daily');

  // Fetch officer collection data
  const fetchOfficerCollections = async (period) => {
    try {
      setCollectionLoading(true);
      console.log(`📊 Fetching ${period} officer collections...`);
      
      let endpoint = '';
      let params = {};
      
      if (period === 'daily') {
        endpoint = 'admins/officerWiseDailyCollections';
        params = { date: dayjs().format('YYYY-MM-DD') };
      } else if (period === 'weekly') {
        endpoint = 'admins/officerWiseWeeklyCollections';
      } else if (period === 'monthly') {
        endpoint = 'admins/officerWiseMonthlyCollections';
      }
      
      const response = await axios.get(endpoint, { params });
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
      
      console.log(`📊 ${period} officer collections:`, collections);
      console.log(`📊 ${period} collections count:`, collections.length);
      console.log(`📊 ${period} total amount:`, response.data.result?.totalAmount || 0);
      
      // Debug officer IDs in collections
      if (collections.length > 0) {
        console.log(`📊 Officer IDs in collections:`, collections.map(c => ({
          officer_id: c.officer_id,
          officer_name: c.officer_name,
          total_amount: c.total_amount
        })));
      } else {
        console.log(`📊 No collections found for ${period}`);
      }
      
      setCollectionData(prev => ({
        ...prev,
        [period]: collections
      }));
      
    } catch (error) {
      console.error(`❌ Error fetching ${period} officer collections:`, error);
      toast({
        title: t('Error'),
        description: t(`Failed to fetch ${period} collections`),
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setCollectionLoading(false);
    }
  };

  // Get collection amount for an officer
  const getOfficerCollectionAmount = (officerId, period) => {
    const collections = collectionData[period] || [];
    console.log(`🔍 Getting collection amount for officer ${officerId} (${period}):`, {
      collections: collections,
      officerId: officerId,
      period: period
    });
    
    // Try different ID matching strategies
    console.log(`🔍 Trying to match officer ID: ${officerId} (type: ${typeof officerId})`);
    console.log(`🔍 Available collection officer IDs:`, collections.map(c => ({
      officer_id: c.officer_id,
      officer_id_type: typeof c.officer_id,
      officer_name: c.officer_name
    })));
    
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
    
    const amount = officerCollection?.total_amount || 0;
    console.log(`🔍 Collection amount:`, amount);
    
    return amount;
  };

  // Fetch collections when component mounts or period changes
  useEffect(() => {
    fetchOfficerCollections(selectedPeriod);
  }, [selectedPeriod]);

  // Test backend endpoint on component mount
  useEffect(() => {
    const testBackendEndpoint = async () => {
      try {
        console.log('🧪 Testing backend endpoint...');
        console.log('🧪 Officers data:', officers);
        console.log('🧪 Officer IDs:', officers.map(o => ({ name: o.name, id: o._id, idType: typeof o._id })));
        
        const testResponse = await axios.get('admins/officerWiseDailyCollections', {
          params: { date: dayjs().format('YYYY-MM-DD') }
        });
        console.log('🧪 Backend test response:', testResponse.data);
        
        // Also test with a different date (yesterday)
        const yesterdayResponse = await axios.get('admins/officerWiseDailyCollections', {
          params: { date: dayjs().subtract(1, 'day').format('YYYY-MM-DD') }
        });
        console.log('🧪 Yesterday test response:', yesterdayResponse.data);
        
        // Test weekly endpoint
        const weeklyResponse = await axios.get('admins/officerWiseWeeklyCollections');
        console.log('🧪 Weekly test response:', weeklyResponse.data);
        
        // Test collections data endpoint
        const testDataResponse = await axios.get('admins/testCollectionsData');
        console.log('🧪 Test collections data response:', testDataResponse.data);
        
        // Test raw collections to see if they have collected_by field
        const rawCollectionsResponse = await axios.get('dailyCollections');
        console.log('🧪 Raw collections sample:', rawCollectionsResponse.data?.result?.slice(0, 3));
        
        // Test if basic admin endpoint works
        const basicTestResponse = await axios.get('admins/totalCollectionsToday');
        console.log('🧪 Basic admin endpoint test:', basicTestResponse.data);
        
        // Test simple endpoint without authentication
        const simpleTestResponse = await axios.get('admins/testSimple');
        console.log('🧪 Simple test endpoint:', simpleTestResponse.data);
        
      } catch (error) {
        console.error('🧪 Backend test error:', error);
      }
    };
    
    testBackendEndpoint();
  }, [officers]);

  // Handle status update
  const handleStatusUpdate = async (officerId, newStatus) => {
    try {
      console.log('🔄 Updating status for officer:', officerId, 'to:', newStatus);
      
      await updateOfficerCollectionData(officerId, {
        status: newStatus
      });
      
      console.log('✅ Status updated successfully');
      
      toast({
        title: t('Success'),
        description: t('Status updated successfully'),
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      // Refresh the data by calling the parent's refresh function if available
      if (onStatusClick) {
        onStatusClick(officerId, newStatus);
      }
    } catch (error) {
      console.error('❌ Error updating status:', error);
      toast({
        title: t('Error'),
        description: t('Failed to update status. Please try again.'),
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };
  const [selectedOfficer, setSelectedOfficer] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(null);
  const dropdownRef = useRef(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [assignFilter, setAssignFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const toggleDropdown = (officerId) => {
    setOpenDropdown(openDropdown === officerId ? null : officerId);
  };

  const closeDropdown = () => {
    setOpenDropdown(null);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        closeDropdown();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const formatCurrency = (amount) => {
    return `₹${(amount || 0).toLocaleString()}`;
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  // Filter officers
  const filteredOfficers = officers.filter(officer => {
    const matchesSearch = !searchTerm || 
      officer.officer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      officer.officer_code?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || officer.status === statusFilter;
    const matchesAssign = assignFilter === 'all' || officer.assignTo === assignFilter;
    return matchesSearch && matchesStatus && matchesAssign;
  });

  // Pagination
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedOfficers = filteredOfficers.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredOfficers.length / itemsPerPage);

  // Export data
  const exportData = () => {
    const currentDate = dayjs().format('DD/MM/YYYY HH:mm:ss');
    const totalOfficers = filteredOfficers.length;
    
    // Add metadata header
    const metadata = [
      ['Officer Data Export Report'],
      [`Generated on: ${currentDate}`],
      [`Total Records: ${totalOfficers}`],
      [`Filtered by: ${statusFilter === 'all' ? 'All Status' : statusFilter} | ${assignFilter === 'all' ? 'All Assignments' : assignFilter}`],
      [''], // Empty row for spacing
    ];

    // Headers with proper formatting
    const headers = [
      'Sr. No.',
      'Officer Name', 
      `${selectedPeriod === 'daily' ? 'Today\'s' : selectedPeriod === 'weekly' ? 'Weekly' : 'Monthly'} Collection (₹)`,
      'Paid Amount (₹)',
      'Remaining Amount (₹)',
      'Assigned To',
      'Status',
      'Created Date'
    ];

    // Data rows with proper formatting
    const dataRows = filteredOfficers.map((officer, index) => {
      const collectionAmount = getOfficerCollectionAmount(officer._id, selectedPeriod);
      return [
        index + 1, // Serial number
        `"${officer.name}"`, // Quoted to handle names with commas
        collectionAmount.toLocaleString('en-IN'),
        (officer.paidAmount || 0).toLocaleString('en-IN'),
        (officer.remainingAmount || 0).toLocaleString('en-IN'),
        officer.assignTo || 'Unassigned',
        officer.status,
        officer.created_on ? dayjs(officer.created_on).format('DD/MM/YYYY') : 'N/A'
      ];
    });

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
    a.download = `Officer_Data_Export_${timestamp}.csv`;
    
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast({
      title: t("Data exported successfully"),
      description: `${totalOfficers} records exported to CSV file`,
      status: "success",
      duration: 4000,
      isClosable: true,
    });
  };

  // Handle view details - use the prop function for redirect
  const handleViewDetails = (officer) => {
    console.log('🔍 OfficerTable - View Details clicked for officer:', officer);
    console.log('🔍 OfficerTable - Officer ID:', officer._id);
    console.log('🔍 OfficerTable - onViewDetails function:', onViewDetails);
    
    if (onViewDetails) {
      onViewDetails(officer);
    } else {
      // Fallback to modal if no prop function provided
      setSelectedOfficer(officer);
      onOpen();
    }
  };

  if (loading) {
    return (
      <Card>
        <CardBody>
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-64 mb-4"></div>
            <div className="space-y-4">
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardBody>
          <VStack spacing={6} align="stretch">
            {/* Header - Responsive */}
            <VStack spacing={4} align="stretch" className="sm:flex-row sm:justify-between sm:items-center">
              <HStack>
                <FaUsers className="text-purple-600" />
                <Text fontSize="lg sm:xl" fontWeight="semibold" color="gray.900">
                  {t("Officer Collection Overview")}
                </Text>
              </HStack>
              <HStack spacing={2} className="flex-wrap">
                <Select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  size="sm"
                  width="120px"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </Select>
                <Button
                  leftIcon={<FaUserCheck />}
                  colorScheme="purple"
                  variant="solid"
                  size="sm"
                  isDisabled
                  _disabled={{ opacity: 1, cursor: 'default' }}
                  className="hidden sm:flex"
                >
                  Active: {activeOfficersCount}
                </Button>
                <Button
                  leftIcon={<FaSync />}
                  colorScheme="green"
                  variant="outline"
                  size="sm"
                  onClick={onRefresh}
                  isLoading={loading}
                  loadingText={t("Refreshing...")}
                >
                  <span className="hidden sm:inline">{t("Refresh")}</span>
                  <span className="sm:hidden">↻</span>
                </Button>
                <Button
                  leftIcon={<FaDownload />}
                  colorScheme="blue"
                  variant="outline"
                  size="sm"
                  onClick={exportData}
                >
                  <span className="hidden sm:inline">{t("Export Data")}</span>
                  <span className="sm:hidden">↓</span>
                </Button>
              </HStack>
            </VStack>

            {/* Search and Filters - Responsive */}
            <VStack spacing={4} align="stretch">
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <SearchIcon color="gray.300" />
                </InputLeftElement>
                <Input
                  placeholder={t("Search officers by name or code...")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
              
              <HStack spacing={4} className="flex-wrap">
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  maxW="200px"
                  minW="150px"
                >
                  <option value="all">{t("All Status")}</option>
                  <option value="Pending">{t("Pending")}</option>
                  <option value="In Process">{t("In Process")}</option>
                  <option value="Complete">{t("Complete")}</option>
                </Select>
                
                <Select
                  value={assignFilter}
                  onChange={(e) => setAssignFilter(e.target.value)}
                  maxW="200px"
                  minW="150px"
                >
                  <option value="all">{t("All Assignments")}</option>
                  <option value="officer">{t("Officer")}</option>
                  <option value="accounter">{t("Accounter")}</option>
                  <option value="manager">{t("Manager")}</option>
                </Select>
              </HStack>
            </VStack>

            {/* Table - Responsive */}
            <TableContainer overflowX="auto" className="w-full">
              <Table variant="simple" size="sm" minW="800px">
                <Thead>
                  <Tr>
                    <Th minW="120px">{t("Officer Name")}</Th>
                    <Th minW="140px">
                      {t("Collection Amount")} 
                      <Text fontSize="xs" color="gray.500" mt={1}>
                        ({selectedPeriod === 'daily' ? 'Today' : selectedPeriod === 'weekly' ? 'This Week' : 'This Month'})
                      </Text>
                    </Th>
                    <Th minW="100px">{t("Paid Amount")}</Th>
                    <Th minW="120px">{t("Remaining Amount")}</Th>
                    <Th minW="150px">{t("Payment Process")}</Th>
                    <Th minW="100px">{t("Assigned To")}</Th>
                    <Th minW="100px">{t("Status")}</Th>
                    <Th minW="80px">{t("Actions")}</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {paginatedOfficers.map((officer, index) => {
                    console.log(`🔍 Processing officer ${index + 1}:`, {
                      name: officer.name,
                      id: officer._id,
                      period: selectedPeriod
                    });
                    const collectionAmount = getOfficerCollectionAmount(officer._id, selectedPeriod);
                    return (
                      <Tr key={index}>
                        <Td fontWeight="medium">
                          <Button
                            variant="link"
                            colorScheme="blue"
                            fontWeight="medium"
                            onClick={() => handleViewDetails(officer)}
                            _hover={{ textDecoration: "underline" }}
                            p={0}
                            h="auto"
                            textAlign="left"
                          >
                            {officer.name}
                          </Button>
                        </Td>
                        <Td>
                          <HStack>
                            <Text color="green.600" fontWeight="bold">
                              {formatCurrency(collectionAmount)}
                            </Text>
                            {collectionAmount > 0 && (
                              <Text fontSize="xs" color="green.500">
                                ✓
                              </Text>
                            )}
                          </HStack>
                        </Td>
                        <Td>
                          <Text color="purple.600" fontWeight="medium">
                            {formatCurrency(officer.paidAmount || 0)}
                          </Text>
                        </Td>
                      <Td>
                        <Text color="orange.600" fontWeight="medium">
                          {formatCurrency(officer.remainingAmount || 0)}
                        </Text>
                      </Td>
                      <Td>
                        <Select
                          value={officer.paymentProcess || 'officer'}
                          onChange={(e) => onPaymentProcess && onPaymentProcess(officer, e.target.value)}
                          size="sm"
                          width="150px"
                          minW="120px"
                        >
                          <option value="officer">Officer</option>
                          <option value="manager">Manager</option>
                          <option value="deposite to bank">Deposite to Bank</option>
                          <option value="accounter">Accounter</option>
                          <option value="process complete">Process Complete</option>
                        </Select>
                      </Td>
                      <Td>
                        <Button
                          size="sm"
                          colorScheme="blue"
                          variant="outline"
                          onClick={() => onAssignToClick(officer)}
                          className="w-full sm:w-auto"
                        >
                          <span className="hidden sm:inline">{officer.assignTo || t('Assign')}</span>
                          <span className="sm:hidden">Assign</span>
                        </Button>
                      </Td>
                      <Td>
                        <Select
                          value={officer.status || 'Pending'}
                          onChange={(e) => handleStatusUpdate(officer._id, e.target.value)}
                          size="sm"
                          variant="outline"
                          minW="120px"
                        >
                          <option value="Pending">Pending</option>
                          <option value="In Process">In Process</option>
                          <option value="Complete">Complete</option>
                        </Select>
                      </Td>
                      <Td>
                        <Button
                          size="sm"
                          colorScheme="purple"
                          onClick={() => handleViewDetails(officer)}
                          className="w-full sm:w-auto"
                        >
                          <span className="hidden sm:inline">{t('View')}</span>
                          <span className="sm:hidden">👁</span>
                        </Button>
                      </Td>
                    </Tr>
                  );
                  })}
                </Tbody>
              </Table>
            </TableContainer>

            {/* Pagination - Responsive */}
            {totalPages > 1 && (
              <HStack justify="center" spacing={2} className="flex-wrap">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  isDisabled={currentPage === 1}
                  className="w-full sm:w-auto"
                >
                  <span className="hidden sm:inline">{t('Previous')}</span>
                  <span className="sm:hidden">←</span>
                </Button>
                <Text fontSize="sm" className="text-center">
                  {t('Page')} {currentPage} {t('of')} {totalPages}
                </Text>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  isDisabled={currentPage === totalPages}
                  className="w-full sm:w-auto"
                >
                  <span className="hidden sm:inline">{t('Next')}</span>
                  <span className="sm:hidden">→</span>
                </Button>
              </HStack>
            )}

            {paginatedOfficers.length === 0 && (
              <Text textAlign="center" color="gray.500" py={8}>
                {t('No officers found')}
              </Text>
            )}
          </VStack>
        </CardBody>
      </Card>

      {/* Officer Details Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{t("Officer Details")}</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {selectedOfficer && (
              <VStack spacing={4} align="stretch">
                <Box>
                  <Text fontWeight="bold">{t("Officer Name")}:</Text>
                  <Text>{selectedOfficer.officer_name}</Text>
                </Box>
                {/* <Box>
                  <Text fontWeight="bold">{t("Today's Collection")}:</Text>
                  <Text color="blue.600" fontWeight="medium">
                    {formatCurrency(selectedOfficer.todayCollection || 0)}
                  </Text>
                </Box> */}
                <Box>
                  <Text fontWeight="bold">{t("Paid Amount")}:</Text>
                  <Text color="purple.600" fontWeight="medium">
                    {formatCurrency(selectedOfficer.paidAmount || 0)}
                  </Text>
                </Box>
                <Box>
                  <Text fontWeight="bold">{t("Remaining Amount")}:</Text>
                  <Text color="orange.600" fontWeight="medium">
                    {formatCurrency(selectedOfficer.remainingAmount || 0)}
                  </Text>
                </Box>
                <Box>
                  <Text fontWeight="bold">{t("Assigned To")}:</Text>
                  <Text>{selectedOfficer.assignTo || t('Unassigned')}</Text>
                </Box>
                <Box>
                  <Text fontWeight="bold">{t("Status")}:</Text>
                  <Badge
                    colorScheme={selectedOfficer.status === 'approved by manager' ? 'green' : 
                               selectedOfficer.status === 'approved by accounter' ? 'blue' : 
                               selectedOfficer.status === 'deposited to bank' ? 'purple' : 'gray'}
                  >
                    {selectedOfficer.status || t('No Status')}
                  </Badge>
                </Box>
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default OfficerTable;