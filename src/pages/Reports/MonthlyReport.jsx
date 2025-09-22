import React, { useState, useEffect } from 'react';
import {
  Box,
  Text,
  VStack,
  HStack,
  Button,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Badge,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Flex,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useToast,
  Select,
  Input,
  InputGroup,
  InputLeftElement,
  SimpleGrid,
  useColorModeValue,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer
} from '@chakra-ui/react';
import { FiSearch, FiDownload, FiRefreshCw, FiCalendar, FiBarChart2, FiDollarSign, FiUsers, FiTrendingUp } from 'react-icons/fi';
import { motion } from 'framer-motion';
import axios from '../../axios';
import dayjs from 'dayjs';

const MotionBox = motion(Box);

const MonthlyReport = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(dayjs().format('YYYY-MM'));
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredReports, setFilteredReports] = useState([]);
  const toast = useToast();

  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');

  useEffect(() => {
    fetchMonthlyReports();
  }, [selectedMonth]);

  useEffect(() => {
    filterReports();
  }, [reports, searchTerm]);

  const fetchMonthlyReports = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use existing admin endpoint for monthly collections
      const response = await axios.get(`admins/totalCollectionsMonthly`);
      setReports(response.data.result || []);
    } catch (err) {
      console.error('Error fetching monthly reports:', err);
      setError('Failed to fetch monthly reports');
      toast({
        title: 'Error',
        description: 'Failed to fetch monthly reports',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const filterReports = () => {
    if (!searchTerm) {
      setFilteredReports(Array.isArray(reports) ? reports : []);
      return;
    }

    const filtered = (Array.isArray(reports) ? reports : []).filter(report =>
      report.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.officer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.transaction_type?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredReports(filtered);
  };

  const exportToCSV = () => {
    const safeFilteredReports = Array.isArray(filteredReports) ? filteredReports : [];
    if (safeFilteredReports.length === 0) return;

    const headers = ['Date', 'Customer', 'Officer', 'Type', 'Amount'];
    const csvContent = [
      headers.join(','),
      ...safeFilteredReports.map(report => [
        dayjs(report.created_at).format('YYYY-MM-DD'),
        report.customer_name || 'N/A',
        report.officer_name || 'N/A',
        report.transaction_type || 'N/A',
        report.amount || 0
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `monthly-report-${selectedMonth}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getTransactionTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'deposit': return 'blue';
      case 'withdrawal': return 'red';
      case 'loan_payment': return 'green';
      case 'saving_payment': return 'purple';
      default: return 'gray';
    }
  };

  const getTransactionTypeLabel = (type) => {
    switch (type?.toLowerCase()) {
      case 'deposit': return 'Deposit';
      case 'withdrawal': return 'Withdrawal';
      case 'loan_payment': return 'Loan Payment';
      case 'saving_payment': return 'Saving Payment';
      default: return type || 'Unknown';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minH="400px">
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" />
          <Text>Loading monthly reports...</Text>
        </VStack>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={8}>
        <Alert status="error">
          <AlertIcon />
          <AlertTitle>Error!</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </Box>
    );
  }

  return (
    <Box p={8}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <MotionBox
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card bg={cardBg} shadow="lg">
            <CardHeader>
              <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
                <VStack align="start" spacing={2}>
                  <Heading size="lg" color="purple.600">
                    <HStack>
                      <FiCalendar />
                      <Text>Monthly Report</Text>
                    </HStack>
                  </Heading>
                  <Text color="gray.600">
                    Report for {dayjs(selectedMonth).format('MMMM YYYY')}
                  </Text>
                </VStack>
                
                <VStack spacing={3} align="stretch" w="full" sm={{ w: "auto" }}>
                  <HStack spacing={2} wrap="wrap">
                    <Input
                      type="month"
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      size={{ base: "sm", md: "md" }}
                      minW={{ base: "150px", sm: "200px" }}
                    />
                    <Button
                      leftIcon={<FiRefreshCw />}
                      onClick={fetchMonthlyReports}
                      colorScheme="purple"
                      variant="outline"
                      size={{ base: "sm", md: "md" }}
                      flex={{ base: "1", sm: "0" }}
                    >
                      Refresh
                    </Button>
                  </HStack>
                  <Button
                    leftIcon={<FiDownload />}
                    onClick={exportToCSV}
                    colorScheme="green"
                    size={{ base: "sm", md: "md" }}
                    isDisabled={filteredReports.length === 0}
                    w="full"
                    sm={{ w: "auto" }}
                  >
                    Export CSV
                  </Button>
                </VStack>
              </Flex>
            </CardHeader>
          </Card>
        </MotionBox>

        {/* Search and Filters */}
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card bg={cardBg} shadow="md">
            <CardBody>
              <VStack spacing={4} align="stretch">
                <InputGroup maxW={{ base: "100%", sm: "300px" }}>
                  <InputLeftElement>
                    <FiSearch color="gray.300" />
                  </InputLeftElement>
                  <Input
                    placeholder="Search by customer, officer, or type..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    size={{ base: "sm", md: "md" }}
                  />
                </InputGroup>
                
                <Text fontSize="sm" color="gray.600" textAlign={{ base: "center", sm: "left" }}>
                  Showing {filteredReports.length} of {reports.length} transactions
                </Text>
              </VStack>
            </CardBody>
          </Card>
        </MotionBox>

        {/* Transactions Table */}
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Card bg={cardBg} shadow="lg">
            <CardHeader>
              <Heading size="md">Transaction Details</Heading>
            </CardHeader>
            <CardBody>
              {filteredReports.length === 0 ? (
                <Box textAlign="center" py={8}>
                  <Text color="gray.500" fontSize="lg">
                    No transactions found for the selected month
                  </Text>
                </Box>
              ) : (
                <TableContainer overflowX="auto">
                  <Table variant="simple" size={{ base: "sm", md: "md" }} minW="600px">
                    <Thead>
                      <Tr>
                        <Th fontSize={{ base: "xs", md: "sm" }}>Date</Th>
                        <Th fontSize={{ base: "xs", md: "sm" }}>Customer</Th>
                        <Th fontSize={{ base: "xs", md: "sm" }} display={{ base: "none", md: "table-cell" }}>Officer</Th>
                        <Th fontSize={{ base: "xs", md: "sm" }}>Type</Th>
                        <Th isNumeric fontSize={{ base: "xs", md: "sm" }}>Amount</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {(Array.isArray(filteredReports) ? filteredReports : []).map((report, index) => (
                        <Tr key={index}>
                          <Td>
                            <Text fontSize={{ base: "xs", md: "sm" }}>
                              {dayjs(report.created_at).format('MMM DD, YYYY')}
                            </Text>
                          </Td>
                          <Td>
                            <Text fontWeight="medium" fontSize={{ base: "xs", md: "sm" }}>
                              {report.customer_name || 'N/A'}
                            </Text>
                          </Td>
                          <Td display={{ base: "none", md: "table-cell" }}>
                            <Text fontSize={{ base: "xs", md: "sm" }} color="gray.600">
                              {report.officer_name || 'N/A'}
                            </Text>
                          </Td>
                          <Td>
                            <Badge
                              colorScheme={getTransactionTypeColor(report.transaction_type)}
                              variant="subtle"
                              fontSize={{ base: "xs", md: "sm" }}
                            >
                              {getTransactionTypeLabel(report.transaction_type)}
                            </Badge>
                          </Td>
                          <Td isNumeric>
                            <Text fontWeight="bold" color="green.600" fontSize={{ base: "xs", md: "sm" }}>
                              ₹{parseFloat(report.amount || 0).toLocaleString()}
                            </Text>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </TableContainer>
              )}
            </CardBody>
          </Card>
        </MotionBox>
      </VStack>
    </Box>
  );
};

export default MonthlyReport;
