import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Box, 
  Button, 
  useToast, 
  Modal, 
  ModalOverlay, 
  ModalContent, 
  ModalHeader, 
  ModalBody, 
  ModalFooter, 
  ModalCloseButton,
  Text,
  VStack,
  HStack,
  Badge,
  useDisclosure,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Input,
  Textarea,
  FormControl,
  FormLabel
} from '@chakra-ui/react';
import { FaUserTimes, FaUserCheck, FaEye, FaPause, FaPlay } from 'react-icons/fa';
import axios from '../../axios';
import { useLocalTranslation } from '../../hooks/useLocalTranslation';
import Table from '../../componant/Table/Table';
import Cell from '../../componant/Table/cell';
import dayjs from 'dayjs';
import NewNavbar from '../Dashboard/main/NewNavbar';

const InactiveUsers = () => {
  const { t } = useLocalTranslation();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isReactivateOpen, onOpen: onReactivateOpen, onClose: onReactivateClose } = useDisclosure();
  const { isOpen: isInactivateOpen, onOpen: onInactivateOpen, onClose: onInactivateClose } = useDisclosure();
  
  const [inactiveUsers, setInactiveUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [inactivationReason, setInactivationReason] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const usersPerPage = 10;

  // Fetch inactive users
  const fetchInactiveUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/admins/inactive-users');
      if (response.data) {
        setInactiveUsers(response.data.result.inactiveUsers || []);
        setFilteredData(response.data.result.inactiveUsers || []);
      }
    } catch (error) {
      console.error('Error fetching inactive users:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch inactive users',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInactiveUsers();
  }, []);

  // Filter users based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredData(inactiveUsers);
    } else {
      const filtered = inactiveUsers.filter(user => 
        user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone_number?.includes(searchTerm) ||
        user.inactivation_reason?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredData(filtered);
    }
    setCurrentPage(1);
  }, [searchTerm, inactiveUsers]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / usersPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  );

  // Inactivate user function
  const handleInactivateUser = async () => {
    if (!selectedUser || !inactivationReason.trim()) {
      toast({
        title: 'Error',
        description: 'Please provide a reason for inactivation',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
      return;
    }

    try {
      const response = await axios.post('/admins/inactivate-user', {
        userId: selectedUser._id,
        inactivationReason: inactivationReason.trim()
      });

      if (response.data) {
        toast({
          title: 'Success',
          description: `User ${selectedUser.full_name} has been inactivated`,
          status: 'success',
          duration: 4000,
          isClosable: true,
        });
        setInactivationReason('');
        setSelectedUser(null);
        onInactivateClose();
        fetchInactiveUsers();
      }
    } catch (error) {
      console.error('Error inactivating user:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to inactivate user',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    }
  };

  // Reactivate user function
  const handleReactivateUser = async () => {
    if (!selectedUser) return;

    try {
      const response = await axios.post('/admins/reactivate-user', {
        userId: selectedUser._id
      });

      if (response.data) {
        toast({
          title: 'Success',
          description: `User ${selectedUser.full_name} has been reactivated`,
          status: 'success',
          duration: 4000,
          isClosable: true,
        });
        setSelectedUser(null);
        onReactivateClose();
        fetchInactiveUsers();
      }
    } catch (error) {
      console.error('Error reactivating user:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to reactivate user',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    }
  };

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
        Header: t('User Name'),
        accessor: "full_name",
        Cell: ({ value, row: { original } }) => (
          <Cell text={`${original?.full_name || '-'}`} bold={"bold"} />
        ),
        minWidth: 150,
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
        Header: t('Account Type'),
        accessor: "account_type",
        Cell: ({ value, row: { original } }) => (
          <Cell text={`${original?.account_type || '-'}`} />
        ),
        minWidth: 120,
      },
      {
        Header: t('Inactivation Reason'),
        accessor: "inactivation_reason",
        Cell: ({ value, row: { original } }) => (
          <Cell text={`${original?.inactivation_reason || '-'}`} />
        ),
        minWidth: 200,
      },
      {
        Header: t('Inactivated By'),
        accessor: "inactivated_by",
        Cell: ({ value, row: { original } }) => (
          <Cell text={`${original?.inactivated_by?.name || '-'}`} />
        ),
        minWidth: 120,
      },
      {
        Header: t('Inactivated On'),
        accessor: "inactivated_on",
        Cell: ({ value, row: { original } }) => (
          <Cell text={original?.inactivated_on ? dayjs(original.inactivated_on).format("D MMM, YYYY h:mm A") : '-'} />
        ),
        minWidth: 150,
      },
      {
        Header: t('Status'),
        accessor: "is_inactive",
        Cell: ({ value, row: { original } }) => (
          <Badge colorScheme="orange" variant="solid">
            {t('Inactive')}
          </Badge>
        ),
        minWidth: 100,
      },
      {
        Header: t('Actions'),
        accessor: "actions",
        Cell: ({ value, row: { original } }) => (
          <HStack spacing={2}>
            <Button
              size="sm"
              colorScheme="green"
              leftIcon={<FaPlay />}
              onClick={() => {
                setSelectedUser(original);
                onReactivateOpen();
              }}
            >
              {t('Reactivate')}
            </Button>
          </HStack>
        ),
        minWidth: 120,
      },
    ],
    [t]
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
    <div className="min-h-screen bg-gray-50">
      <NewNavbar />
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="pt-16 sm:pt-20"
      >
        <motion.div variants={itemVariants} className="p-6">
          <Box className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <FaUserTimes className="text-orange-500" />
                  {t('Inactive Users')}
                </h1>
                <p className="text-gray-600 mt-1">
                  {t('Manage inactive users and their account restrictions')}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  colorScheme="orange"
                  leftIcon={<FaPause />}
                  onClick={() => {
                    setSelectedUser(null);
                    setInactivationReason('');
                    onInactivateOpen();
                  }}
                >
                  {t('Inactivate New User')}
                </Button>
              </div>
            </div>

            {/* Search and Stats */}
            <div className="mb-6">
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder={t('Search users...')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="text-sm text-gray-600">
                  {t('Total Inactive Users')}: <span className="font-semibold">{filteredData.length}</span>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-lg h-full flex flex-col">
              <div className="flex-1 overflow-auto">
                <div className="overflow-x-auto min-w-full">
                  <div className="min-w-[800px]">
                    <Table data={paginatedData} columns={columns} />
                  </div>
                </div>
              </div>

              {/* Pagination */}
              <div className="flex-shrink-0 flex flex-col sm:flex-row justify-center p-4 border-t gap-4 items-center bg-gray-50">
                <div className="flex gap-2">
                  <Button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    isDisabled={currentPage === 1}
                    colorScheme="blue"
                    variant="outline"
                    size="sm"
                  >
                    {t('Previous')}
                  </Button>
                  <span className="flex items-center px-3 py-1 text-sm text-gray-600">
                    {t('Page')} {currentPage} {t('of')} {totalPages}
                  </span>
                  <Button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    isDisabled={currentPage === totalPages}
                    colorScheme="blue"
                    variant="outline"
                    size="sm"
                  >
                    {t('Next')}
                  </Button>
                </div>
              </div>
            </div>
          </Box>
        </motion.div>
      </motion.div>

      {/* Inactivate User Modal */}
      <Modal isOpen={isInactivateOpen} onClose={onInactivateClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <HStack>
              <FaPause className="text-orange-500" />
              <Text>{t('Inactivate User')}</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <Text fontSize="sm" color="gray.600">
                {t('Enter the reason for inactivating this user. This will prevent them from creating new accounts.')}
              </Text>
              <FormControl>
                <FormLabel>{t('Inactivation Reason')}</FormLabel>
                <Textarea
                  value={inactivationReason}
                  onChange={(e) => setInactivationReason(e.target.value)}
                  placeholder={t('Enter reason for inactivation...')}
                  rows={4}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" mr={3} onClick={onInactivateClose}>
              {t('Cancel')}
            </Button>
            <Button colorScheme="orange" onClick={handleInactivateUser}>
              {t('Inactivate User')}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Reactivate User Confirmation */}
      <AlertDialog isOpen={isReactivateOpen} onClose={onReactivateClose}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              <HStack>
                <FaPlay className="text-green-500" />
                <Text>{t('Reactivate User')}</Text>
              </HStack>
            </AlertDialogHeader>
            <AlertDialogBody>
              {t('Are you sure you want to reactivate')} <strong>{selectedUser?.full_name}</strong>? 
              {t('This will allow them to create new accounts again.')}
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button onClick={onReactivateClose}>
                {t('Cancel')}
              </Button>
              <Button colorScheme="green" onClick={handleReactivateUser} ml={3}>
                {t('Reactivate')}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </div>
  );
};

export default InactiveUsers;
