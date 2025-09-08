import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaUsers, FaDownload } from 'react-icons/fa';
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
import dayjs from 'dayjs';

const OfficerTable = ({ 
  officers = [], 
  loading = false,
  onEditClick,
  onSaveEdit,
  onCancelEdit,
  onAssignToClick,
  onStatusClick,
  onViewDetails,
  editingOfficer,
  editingData,
  setEditingData
}) => {
  const { t } = useLocalTranslation();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedOfficer, setSelectedOfficer] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [assignFilter, setAssignFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

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
      'Officer Code',
      'Today\'s Collection (₹)',
      'Total Collection (₹)',
      'Paid Amount (₹)',
      'Remaining Amount (₹)',
      'Assigned To',
      'Status',
      'Created Date'
    ];

    // Data rows with proper formatting
    const dataRows = filteredOfficers.map((officer, index) => [
      index + 1, // Serial number
      `"${officer.officer_name || 'N/A'}"`, // Quoted to handle names with commas
      officer.officer_code || 'N/A',
      (officer.todayCollection || 0).toLocaleString('en-IN'),
      (officer.totalCollection || 0).toLocaleString('en-IN'),
      (officer.paidAmount || 0).toLocaleString('en-IN'),
      (officer.remainingAmount || 0).toLocaleString('en-IN'),
      officer.assignTo || 'Unassigned',
      officer.status || 'N/A',
      officer.created_on ? dayjs(officer.created_on).format('DD/MM/YYYY') : 'N/A'
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

  // Handle view details
  const handleViewDetails = (officer) => {
    setSelectedOfficer(officer);
    onOpen();
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
            {/* Header */}
            <HStack justify="space-between" align="center">
              <HStack>
                <FaUsers className="text-purple-600" />
                <Text fontSize="xl" fontWeight="semibold" color="gray.900">
                  {t("Officer Collection Overview")}
                </Text>
              </HStack>
              <Button
                leftIcon={<FaDownload />}
                colorScheme="blue"
                variant="outline"
                size="sm"
                onClick={exportData}
              >
                {t("Export Data")}
              </Button>
            </HStack>

            {/* Search and Filters */}
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
              
              <HStack spacing={4}>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  maxW="200px"
                >
                  <option value="all">{t("All Status")}</option>
                  <option value="approved by manager">{t("Approved by Manager")}</option>
                  <option value="approved by accounter">{t("Approved by Accounter")}</option>
                  <option value="deposited to bank">{t("Deposited to Bank")}</option>
                </Select>
                
                <Select
                  value={assignFilter}
                  onChange={(e) => setAssignFilter(e.target.value)}
                  maxW="200px"
                >
                  <option value="all">{t("All Assignments")}</option>
                  <option value="officer">{t("Officer")}</option>
                  <option value="accounter">{t("Accounter")}</option>
                  <option value="manager">{t("Manager")}</option>
                </Select>
              </HStack>
            </VStack>

            {/* Table */}
            <TableContainer>
              <Table variant="simple" size="sm">
                <Thead>
                  <Tr>
                    <Th>{t("Officer Name")}</Th>
                    <Th>{t("Officer Code")}</Th>
                    <Th>{t("Today's Collection")}</Th>
                    <Th>{t("Total Collection")}</Th>
                    <Th>{t("Paid Amount")}</Th>
                    <Th>{t("Remaining Amount")}</Th>
                    <Th>{t("Assigned To")}</Th>
                    <Th>{t("Status")}</Th>
                    <Th>{t("Actions")}</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {paginatedOfficers.map((officer, index) => (
                    <Tr key={index}>
                      <Td fontWeight="medium">{officer.officer_name}</Td>
                      <Td>{officer.officer_code}</Td>
                      <Td fontWeight="medium" color="blue.600">
                        {formatCurrency(officer.todayCollection || 0)}
                      </Td>
                      <Td fontWeight="medium" color="green.600">
                        {formatCurrency(officer.totalCollection || 0)}
                      </Td>
                      <Td>
                        {editingOfficer === officer.officer_id ? (
                          <Input
                            type="number"
                            value={editingData.paidAmount}
                            onChange={(e) => setEditingData({...editingData, paidAmount: parseFloat(e.target.value) || 0})}
                            size="sm"
                            width="100px"
                          />
                        ) : (
                          <Text color="purple.600" fontWeight="medium">
                            {formatCurrency(officer.paidAmount || 0)}
                          </Text>
                        )}
                      </Td>
                      <Td>
                        {editingOfficer === officer.officer_id ? (
                          <Input
                            type="number"
                            value={editingData.remainingAmount}
                            onChange={(e) => setEditingData({...editingData, remainingAmount: parseFloat(e.target.value) || 0})}
                            size="sm"
                            width="100px"
                          />
                        ) : (
                          <Text color="orange.600" fontWeight="medium">
                            {formatCurrency(officer.remainingAmount || 0)}
                          </Text>
                        )}
                      </Td>
                      <Td>
                        <Button
                          size="sm"
                          colorScheme="blue"
                          variant="outline"
                          onClick={() => onAssignToClick(officer)}
                        >
                          {officer.assignTo || t('Assign')}
                        </Button>
                      </Td>
                      <Td>
                        <Badge
                          colorScheme={officer.status === 'approved by manager' ? 'green' : 
                                     officer.status === 'approved by accounter' ? 'blue' : 
                                     officer.status === 'deposited to bank' ? 'purple' : 'gray'}
                        >
                          {officer.status || t('Set Status')}
                        </Badge>
                      </Td>
                      <Td>
                        <HStack spacing={2}>
                          {editingOfficer === officer.officer_id ? (
                            <>
                              <Button
                                size="sm"
                                colorScheme="green"
                                onClick={() => onSaveEdit(officer.officer_id)}
                              >
                                {t('Save')}
                              </Button>
                              <Button
                                size="sm"
                                colorScheme="gray"
                                onClick={() => onCancelEdit()}
                              >
                                {t('Cancel')}
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                size="sm"
                                colorScheme="blue"
                                onClick={() => onEditClick(officer)}
                              >
                                {t('Edit')}
                              </Button>
                              <Button
                                size="sm"
                                colorScheme="purple"
                                onClick={() => handleViewDetails(officer)}
                              >
                                {t('View')}
                              </Button>
                            </>
                          )}
                        </HStack>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>

            {/* Pagination */}
            {totalPages > 1 && (
              <HStack justify="center" spacing={2}>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  isDisabled={currentPage === 1}
                >
                  {t('Previous')}
                </Button>
                <Text fontSize="sm">
                  {t('Page')} {currentPage} {t('of')} {totalPages}
                </Text>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  isDisabled={currentPage === totalPages}
                >
                  {t('Next')}
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
                <Box>
                  <Text fontWeight="bold">{t("Officer Code")}:</Text>
                  <Text>{selectedOfficer.officer_code}</Text>
                </Box>
                <Box>
                  <Text fontWeight="bold">{t("Today's Collection")}:</Text>
                  <Text color="blue.600" fontWeight="medium">
                    {formatCurrency(selectedOfficer.todayCollection || 0)}
                  </Text>
                </Box>
                <Box>
                  <Text fontWeight="bold">{t("Total Collection")}:</Text>
                  <Text color="green.600" fontWeight="medium">
                    {formatCurrency(selectedOfficer.totalCollection || 0)}
                  </Text>
                </Box>
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